# backend/app/models/tower.py
from sqlalchemy import Column, String, Float, Boolean
from geoalchemy2 import Geometry
from .base import BaseModel


class Tower(BaseModel):
    __tablename__ = "towers"

    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    signal_strength = Column(Float, default=100.0)
    is_active = Column(Boolean, default=True)
    tower_type = Column(String(50), default="4G")
    coverage_radius_km = Column(Float, default=1.0)  # Reduced from 5.0 to 1.0
    location = Column(Geometry('POINT', srid=4326), nullable=False)