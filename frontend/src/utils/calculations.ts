// frontend/src/utils/calculations.ts
import { EARTH_RADIUS_METERS, COVERAGE_CONFIG } from '../config/constants';
import { MapPosition, MapBounds } from '../types';




/**
 * Generate accurate circle points using geodesic calculations
 */
export function generateCirclePoints(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  numPoints: number = 64
): [number, number][] {
  const points: [number, number][] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 360) / numPoints;
    const angleRad = (angle * Math.PI) / 180;
    const centerLatRad = (centerLat * Math.PI) / 180;
    const centerLngRad = (centerLng * Math.PI) / 180;
    const angularDistance = radiusMeters / EARTH_RADIUS_METERS;

    const pointLatRad = Math.asin(
      Math.sin(centerLatRad) * Math.cos(angularDistance) +
      Math.cos(centerLatRad) * Math.sin(angularDistance) * Math.cos(angleRad)
    );

    const pointLngRad = centerLngRad + Math.atan2(
      Math.sin(angleRad) * Math.sin(angularDistance) * Math.cos(centerLatRad),
      Math.cos(angularDistance) - Math.sin(centerLatRad) * Math.sin(pointLatRad)
    );

    const pointLat = (pointLatRad * 180) / Math.PI;
    const pointLng = (pointLngRad * 180) / Math.PI;

    points.push([pointLat, pointLng]);
  }

  return points;
}




/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  const meters = distanceKm * 1000;
  if (meters < 1000) {
    return `${meters.toFixed(0)}m`;
  }
  return `${distanceKm.toFixed(2)}km`;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number, precision: number = 6): string {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
}