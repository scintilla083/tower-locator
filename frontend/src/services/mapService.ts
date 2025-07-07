import { MapBounds, MapPosition } from '../types';

export class MapService {
  static calculateDistance(pos1: MapPosition, pos2: MapPosition): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(pos2.lat - pos1.lat);
    const dLon = this.toRadians(pos2.lng - pos1.lng);

    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(pos1.lat)) * Math.cos(this.toRadians(pos2.lat)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static createBoundsFromCenter(center: MapPosition, radiusKm: number): MapBounds {
    const latDelta = radiusKm / 111.32;
    const lonDelta = radiusKm / (111.32 * Math.cos(this.toRadians(center.lat)));

    return {
      north: center.lat + latDelta,
      south: center.lat - latDelta,
      east: center.lng + lonDelta,
      west: center.lng - lonDelta
    };
  }

  static isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}
