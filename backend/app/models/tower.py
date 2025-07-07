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
    location = Column(Geometry('POINT', srid=4326), nullable=False)