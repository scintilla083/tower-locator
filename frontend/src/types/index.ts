// frontend/src/types/index.ts
export interface Tower {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  signal_strength: number;
  tower_type: string;
  is_active: boolean;
  distance_km?: number;
}

export interface TowerCreate {
  name: string;
  latitude: number;
  longitude: number;
  signal_strength?: number;
  tower_type?: string;
  is_active?: boolean;
}

export interface LocationQuery {
  latitude: number;
  longitude: number;
  max_distance_km?: number;
}

export interface NearestTowerResponse {
  tower: Tower;
  distance_km: number;
  user_location: LocationQuery;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapPosition {
  lat: number;
  lng: number;
}