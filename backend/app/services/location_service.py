import math
from typing import Tuple
from ..schemas.location import LocationQuery


class LocationService:
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        R = 6371  # Earth's radius in kilometers

        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)

        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon / 2) ** 2)

        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    @staticmethod
    def validate_coordinates(lat: float, lon: float) -> bool:
        return -90 <= lat <= 90 and -180 <= lon <= 180

    @staticmethod
    def create_bounds_around_point(lat: float, lon: float, radius_km: float) -> Tuple[float, float, float, float]:
        """Create bounding box around a point with given radius"""
        lat_delta = radius_km / 111.32  # Roughly 111.32 km per degree latitude
        lon_delta = radius_km / (111.32 * math.cos(math.radians(lat)))

        return (
            lat - lat_delta,  # south
            lat + lat_delta,  # north
            lon - lon_delta,  # west
            lon + lon_delta  # east
        )