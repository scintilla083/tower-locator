# backend/app/repositories/tower_repository.py - Add get_all_active_towers method
from typing import List, Optional
import random
import json
from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2 import functions
from geoalchemy2.functions import ST_AsGeoJSON
from .base_repository import BaseRepository
from ..models.tower import Tower
from ..schemas.location import MapBounds


class TowerRepository(BaseRepository[Tower]):
    def __init__(self, db: Session):
        super().__init__(db, Tower)

    def _extract_boundary_points(self, tower: Tower) -> List[List[float]]:
        """Extract boundary points from PostGIS polygon geometry"""
        if not tower.coverage_boundary:
            return []

        try:
            # Get GeoJSON representation of the boundary
            geojson_result = self.db.query(
                ST_AsGeoJSON(tower.coverage_boundary)
            ).scalar()

            if geojson_result:
                geojson = json.loads(geojson_result)
                if geojson.get('type') == 'Polygon' and geojson.get('coordinates'):
                    # Extract exterior ring coordinates and convert [lon, lat] to [lat, lon]
                    coords = geojson['coordinates'][0]
                    return [[coord[1], coord[0]] for coord in coords]
        except Exception as e:
            print(f"Error extracting boundary points for tower {tower.id}: {e}")

        return []

    def get_all_active_towers(self) -> List[Tower]:
        """Get all active towers with their boundary data"""
        towers = self.db.query(Tower).filter(Tower.is_active == True).all()

        # Extract boundary points for all towers
        for tower in towers:
            tower.coverage_boundary_points = self._extract_boundary_points(tower)

        print(f"Found {len(towers)} active towers in database")
        return towers

    def find_nearest_tower(self, lat: float, lon: float, max_distance_km: float = 50.0) -> Optional[Tower]:
        user_point = func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326)

        query = self.db.query(
            Tower,
            functions.ST_Distance(
                functions.ST_Transform(Tower.location, 3857),
                functions.ST_Transform(user_point, 3857)
            ).label('distance')
        ).filter(
            Tower.is_active == True,
            functions.ST_DWithin(
                functions.ST_Transform(Tower.location, 3857),
                functions.ST_Transform(user_point, 3857),
                max_distance_km * 1000
            )
        ).order_by('distance').first()

        if query:
            tower, distance = query
            tower.distance_km = distance / 1000

            # Check coverage using the actual boundary polygon if available
            if tower.coverage_boundary:
                is_in_coverage = self.db.query(
                    functions.ST_Within(user_point, tower.coverage_boundary)
                ).scalar()
                tower.is_in_coverage = bool(is_in_coverage)
            else:
                # Fallback to radius-based calculation
                coverage_radius_m = tower.coverage_radius_km * 1000
                tolerance_m = max(150.0, coverage_radius_m * 0.15)
                tower.is_in_coverage = distance <= (coverage_radius_m + tolerance_m)

            # Extract boundary points for frontend
            tower.coverage_boundary_points = self._extract_boundary_points(tower)

            print(f"=== COVERAGE BOUNDARY DEBUG ===")
            print(f"Tower: {tower.name}")
            print(f"Distance: {distance:.1f}m")
            print(f"In coverage (boundary): {tower.is_in_coverage}")
            print(f"Boundary points count: {len(tower.coverage_boundary_points)}")
            print(f"=====================================")

            return tower
        return None

    def get_towers_in_bounds(self, bounds: MapBounds) -> List[Tower]:
        bbox = func.ST_MakeEnvelope(bounds.west, bounds.south, bounds.east, bounds.north, 4326)
        towers = self.db.query(Tower).filter(
            Tower.is_active == True,
            functions.ST_Within(Tower.location, bbox)
        ).all()

        # Extract boundary points for all towers
        for tower in towers:
            tower.coverage_boundary_points = self._extract_boundary_points(tower)

        print(f"Found {len(towers)} towers in bounds with boundary data")
        return towers

    def generate_random_towers(self, count: int, bounds: MapBounds) -> List[Tower]:
        towers = []
        print(f"Generating {count} towers with geodesic boundaries...")

        for i in range(count):
            lat = bounds.south + (bounds.north - bounds.south) * random.random()
            lon = bounds.west + (bounds.east - bounds.west) * random.random()
            signal_strength = 75.0 + 25.0 * random.random()
            coverage_radius = 1

            tower_data = {
                'name': f'Tower_{i + 1}',
                'latitude': lat,
                'longitude': lon,
                'signal_strength': signal_strength,
                'tower_type': '4G',
                'coverage_radius_km': coverage_radius,
                'location': func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326)
            }

            tower = self.create(tower_data)

            # Refresh to get the auto-generated coverage_boundary from the event listener
            self.db.refresh(tower)

            # Extract boundary points
            tower.coverage_boundary_points = self._extract_boundary_points(tower)
            towers.append(tower)

            print(f"Generated {tower.name}: {len(tower.coverage_boundary_points)} boundary points")

        return towers

    def delete_all_towers(self) -> int:
        """Delete all towers and return count of deleted towers"""
        count = self.db.query(Tower).count()
        print(f"Deleting {count} towers from database")
        self.db.query(Tower).delete()
        self.db.commit()
        return count