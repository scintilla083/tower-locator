from pydantic import BaseModel, Field
from typing import List

from ..schemas.tower import TowerResponse


class LocationQuery(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    max_distance_km: float = Field(default=50.0, ge=0.1, le=500)

class NearestTowerResponse(BaseModel):
    tower: TowerResponse
    distance_km: float
    user_location: LocationQuery

class MapBounds(BaseModel):
    north: float
    south: float
    east: float
    west: float