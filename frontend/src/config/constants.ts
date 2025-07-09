// frontend/src/config/constants.ts
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: 10000,
  HEALTH_CHECK_TIMEOUT: 5000,
} as const;

export const MAP_CONFIG = {
  DEFAULT_CENTER: [50.4501, 30.5234] as [number, number], // Kyiv
  DEFAULT_ZOOM: 12,
  DEFAULT_BOUNDS_OFFSET: {
    LAT: 0.025,
    LNG: 0.035,
  },
  MAX_TOWERS_GENERATE: 1000,
  DEFAULT_TOWER_COUNT: 20,
} as const;

export const COVERAGE_CONFIG = {
  DEFAULT_RADIUS_KM: 1.0,
  MIN_RADIUS_KM: 0.1,
  MAX_RADIUS_KM: 5.0,

} as const;


export const EARTH_RADIUS_KM = 6371;
export const EARTH_RADIUS_METERS = 6371000;