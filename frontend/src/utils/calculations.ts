// frontend/src/utils/calculations.ts
import { EARTH_RADIUS_METERS, COVERAGE_CONFIG } from '../config/constants';
import { MapPosition, MapBounds } from '../types';

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return EARTH_RADIUS_METERS * c;
}

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
 * Check if coordinates are valid
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Create bounding box around a point with given radius
 */
export function createBoundsFromCenter(center: MapPosition, radiusKm: number): MapBounds {
  const latDelta = radiusKm / 111.32;
  const lonDelta = radiusKm / (111.32 * Math.cos((center.lat * Math.PI) / 180));

  return {
    north: center.lat + latDelta,
    south: center.lat - latDelta,
    east: center.lng + lonDelta,
    west: center.lng - lonDelta
  };
}

/**
 * Calculate coverage tolerance
 */
export function calculateCoverageTolerance(coverageRadiusMeters: number): number {
  return Math.max(
    COVERAGE_CONFIG.MIN_TOLERANCE_METERS,
    coverageRadiusMeters * COVERAGE_CONFIG.TOLERANCE_PERCENTAGE
  );
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