# backend/app/models/tower.py
from sqlalchemy import Column, String, Float, Boolean, event
from geoalchemy2 import Geometry
from geoalchemy2.functions import ST_SetSRID, ST_MakePoint, ST_Transform, ST_Buffer
from .base import BaseModel


class Tower(BaseModel):
    __tablename__ = "towers"

    name = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    signal_strength = Column(Float, default=100.0)
    is_active = Column(Boolean, default=True)
    tower_type = Column(String(50), default="4G")
    coverage_radius_km = Column(Float, default=1.0)
    location = Column(Geometry('POINT', srid=4326), nullable=False)
    # NEW: Store the actual coverage boundary as a polygon
    coverage_boundary = Column(Geometry('POLYGON', srid=4326), nullable=True)


# Event listener to automatically generate coverage boundary when tower is created/updated
@event.listens_for(Tower, 'before_insert')
@event.listens_for(Tower, 'before_update')
def generate_coverage_boundary(mapper, connection, target):
    """Automatically generate coverage boundary when tower is saved"""
    if target.latitude and target.longitude and target.coverage_radius_km:
        # Generate geodesic circle using PostGIS
        radius_meters = target.coverage_radius_km * 1000

        # Create the boundary using PostGIS buffer in Web Mercator projection
        point_geom = ST_SetSRID(ST_MakePoint(target.longitude, target.latitude), 4326)
        boundary_geom = ST_Transform(
            ST_Buffer(
                ST_Transform(point_geom, 3857),
                radius_meters
            ),
            4326
        )

        target.coverage_boundary = boundary_geom
        target.location = point_geom