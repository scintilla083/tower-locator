# backend/app/services/tower_service.py
from typing import List, Optional
from sqlalchemy import func
from ..repositories.tower_repository import TowerRepository
from ..schemas.tower import TowerCreate, TowerResponse
from ..schemas.location import LocationQuery, NearestTowerResponse, MapBounds
from ..models.tower import Tower


class TowerService:
    def __init__(self, tower_repository: TowerRepository):
        self.tower_repository = tower_repository

    def create_tower(self, tower_data: TowerCreate) -> TowerResponse:
        tower_dict = tower_data.model_dump()
        tower_dict['location'] = func.ST_SetSRID(func.ST_MakePoint(tower_data.longitude, tower_data.latitude), 4326)

        tower = self.tower_repository.create(tower_dict)
        return TowerResponse.model_validate(tower)

    def find_nearest_tower(self, location: LocationQuery) -> Optional[NearestTowerResponse]:
        tower = self.tower_repository.find_nearest_tower(
            location.latitude,
            location.longitude,
            location.max_distance_km
        )

        if tower:
            tower_response = TowerResponse.model_validate(tower)
            tower_response.distance_km = tower.distance_km
            tower_response.is_in_coverage = getattr(tower, 'is_in_coverage', False)

            return NearestTowerResponse(
                tower=tower_response,
                distance_km=tower.distance_km,
                user_location=location
            )
        return None

    def get_towers_in_area(self, bounds: MapBounds) -> List[TowerResponse]:
        towers = self.tower_repository.get_towers_in_bounds(bounds)
        return [TowerResponse.model_validate(tower) for tower in towers]

    def initialize_random_towers(self, count: int, bounds: MapBounds) -> List[TowerResponse]:
        towers = self.tower_repository.generate_random_towers(count, bounds)
        return [TowerResponse.model_validate(tower) for tower in towers]

    def clear_all_towers(self) -> int:
        """Delete all towers and return count of deleted towers"""
        return self.tower_repository.delete_all_towers()