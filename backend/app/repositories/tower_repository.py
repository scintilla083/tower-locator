# backend/app/repositories/tower_repository.py - Debug version
from typing import List, Optional
import random
from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2 import functions
from .base_repository import BaseRepository
from ..models.tower import Tower
from ..schemas.location import MapBounds


class TowerRepository(BaseRepository[Tower]):
    def __init__(self, db: Session):
        super().__init__(db, Tower)

    def find_nearest_tower(self, lat: float, lon: float, max_distance_km: float = 50.0) -> Optional[Tower]:
        user_point = func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326)

        # ENHANCED DEBUG: Get more information about the calculation
        query = self.db.query(
            Tower,
            functions.ST_Distance(
                functions.ST_Transform(Tower.location, 3857),
                functions.ST_Transform(user_point, 3857)
            ).label('distance'),
            # Add spherical distance for comparison
            functions.ST_Distance(
                Tower.location,
                user_point
            ).label('spherical_distance'),
            # Get transformed coordinates
            functions.ST_X(functions.ST_Transform(Tower.location, 3857)).label('tower_x_3857'),
            functions.ST_Y(functions.ST_Transform(Tower.location, 3857)).label('tower_y_3857'),
            functions.ST_X(functions.ST_Transform(user_point, 3857)).label('user_x_3857'),
            functions.ST_Y(functions.ST_Transform(user_point, 3857)).label('user_y_3857')
        ).filter(
            Tower.is_active == True,
            functions.ST_DWithin(
                functions.ST_Transform(Tower.location, 3857),
                functions.ST_Transform(user_point, 3857),
                max_distance_km * 1000
            )
        ).order_by('distance').first()

        if query:
            tower, distance, spherical_distance, tower_x, tower_y, user_x, user_y = query
            tower.distance_km = distance / 1000  # Convert to km

            # Enhanced tolerance calculation
            coverage_radius_km = tower.coverage_radius_km
            coverage_radius_m = coverage_radius_km * 1000
            distance_m = distance

            # Use 15% tolerance or minimum 150m for better coverage detection
            tolerance_m = max(150.0, coverage_radius_m * 0.15)

            is_in_coverage = distance_m <= (coverage_radius_m + tolerance_m)
            tower.is_in_coverage = is_in_coverage

            print(f"=== ENHANCED COVERAGE DEBUG ===")
            print(f"Tower: {tower.name}")
            print(f"Tower WGS84: lat={tower.latitude:.8f}, lon={tower.longitude:.8f}")
            print(f"User WGS84: lat={lat:.8f}, lon={lon:.8f}")
            print(f"Tower Web Mercator: x={tower_x:.2f}, y={tower_y:.2f}")
            print(f"User Web Mercator: x={user_x:.2f}, y={user_y:.2f}")
            print(f"")
            print(f"PostGIS distances:")
            print(f"  - Projected (3857): {distance_m:.1f} meters")
            print(f"  - Spherical (4326): {spherical_distance:.8f} degrees = {spherical_distance * 111320:.1f} meters")
            print(f"")
            print(f"Coverage analysis:")
            print(f"  - Coverage radius: {coverage_radius_m:.1f} meters")
            print(f"  - Tolerance (15% or 150m): {tolerance_m:.1f} meters")
            print(f"  - Total coverage: {coverage_radius_m + tolerance_m:.1f} meters")
            print(f"  - Distance vs coverage: {distance_m:.1f}m vs {coverage_radius_m + tolerance_m:.1f}m")
            print(f"  - Is in coverage: {is_in_coverage}")
            print(f"  - Coverage without tolerance: {distance_m <= coverage_radius_m}")
            print(f"")

            # Calculate simple Euclidean distance for comparison
            dx = user_x - tower_x
            dy = user_y - tower_y
            euclidean_distance = (dx * dx + dy * dy) ** 0.5
            print(f"Simple Euclidean (Web Mercator): {euclidean_distance:.1f} meters")

            # Estimate what frontend Haversine should show
            import math
            R = 6371000  # Earth radius in meters
            lat1_rad = math.radians(tower.latitude)
            lat2_rad = math.radians(lat)
            dlat_rad = math.radians(lat - tower.latitude)
            dlon_rad = math.radians(lon - tower.longitude)

            a = (math.sin(dlat_rad / 2) ** 2 +
                 math.cos(lat1_rad) * math.cos(lat2_rad) *
                 math.sin(dlon_rad / 2) ** 2)
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            haversine_distance = R * c

            print(f"Backend Haversine calculation: {haversine_distance:.1f} meters")
            print(f"Difference (PostGIS vs Haversine): {abs(distance_m - haversine_distance):.1f} meters")
            print(f"=====================================")

            return tower
        return None

    def get_towers_in_bounds(self, bounds: MapBounds) -> List[Tower]:
        bbox = func.ST_MakeEnvelope(bounds.west, bounds.south, bounds.east, bounds.north, 4326)
        towers = self.db.query(Tower).filter(
            Tower.is_active == True,
            functions.ST_Within(Tower.location, bbox)
        ).all()

        print(f"Found {len(towers)} towers in bounds:")
        for tower in towers:
            print(
                f"  - {tower.name}: coverage={tower.coverage_radius_km:.3f}km at ({tower.latitude:.6f}, {tower.longitude:.6f})")

        return towers

    def generate_random_towers(self, count: int, bounds: MapBounds) -> List[Tower]:
        towers = []
        print(
            f"Generating {count} towers in bounds: N={bounds.north:.6f}, S={bounds.south:.6f}, E={bounds.east:.6f}, W={bounds.west:.6f}")

        for i in range(count):
            lat = bounds.south + (bounds.north - bounds.south) * random.random()
            lon = bounds.west + (bounds.east - bounds.west) * random.random()
            signal_strength = 75.0 + 25.0 * random.random()
            # Generate smaller coverage radius for testing: 0.3-1.5 km
            coverage_radius = 0.3 + 1.2 * random.random()

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
            towers.append(tower)

            print(f"Generated Tower_{i + 1}: coverage={coverage_radius:.3f}km at ({lat:.6f}, {lon:.6f})")

        return towers

    def delete_all_towers(self) -> int:
        """Delete all towers and return count of deleted towers"""
        count = self.db.query(Tower).count()
        print(f"Deleting {count} towers from database")
        self.db.query(Tower).delete()
        self.db.commit()
        return count