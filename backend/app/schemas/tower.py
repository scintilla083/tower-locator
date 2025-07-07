from pydantic import BaseModel, Field
from typing import Optional


class TowerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    signal_strength: float = Field(default=100.0, ge=0, le=100)
    tower_type: str = Field(default="4G")
    is_active: bool = Field(default=True)


class TowerCreate(TowerBase):
    pass


class TowerResponse(TowerBase):
    id: int
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True
