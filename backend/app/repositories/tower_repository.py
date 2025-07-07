from typing import List, Optional
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
            tower.distance_km = distance / 1000  # Convert to km
            return tower
        return None

    def get_towers_in_bounds(self, bounds: MapBounds) -> List[Tower]:
        bbox = func.ST_MakeEnvelope(bounds.west, bounds.south, bounds.east, bounds.north, 4326)
        return self.db.query(Tower).filter(
            Tower.is_active == True,
            functions.ST_Within(Tower.location, bbox)
        ).all()

    def generate_random_towers(self, count: int, bounds: MapBounds) -> List[Tower]:
        towers = []
        for i in range(count):
            # Random coordinates within bounds
            lat = bounds.south + (bounds.north - bounds.south) * func.random()
            lon = bounds.west + (bounds.east - bounds.west) * func.random()

            tower_data = {
                'name': f'Tower_{i + 1}',
                'latitude': lat,
                'longitude': lon,
                'signal_strength': 75.0 + 25.0 * func.random(),
                'tower_type': '4G',
                'location': func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326)
            }
            towers.append(self.create(tower_data))
        return towers