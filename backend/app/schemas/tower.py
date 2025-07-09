# backend/app/schemas/tower.py - Updated with coverage boundary points
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


class TowerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    signal_strength: float = Field(default=100.0, ge=0, le=100)
    tower_type: str = Field(default="4G")
    is_active: bool = Field(default=True)
    coverage_radius_km: float = Field(default=1.0, ge=0.1, le=5.0)


class TowerCreate(TowerBase):
    pass


class TowerResponse(TowerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    distance_km: Optional[float] = None
    is_in_coverage: Optional[bool] = None
    # NEW: Coverage boundary points for accurate frontend rendering
    coverage_boundary_points: Optional[List[List[float]]] = None  # [[lat, lon], [lat, lon], ...]