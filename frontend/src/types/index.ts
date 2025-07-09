// frontend/src/types/index.ts - Consolidated and optimized
export interface Tower {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  signal_strength: number;
  tower_type: string;
  is_active: boolean;
  coverage_radius_km: number;
  distance_km?: number;
  is_in_coverage?: boolean;
}

export interface TowerCreate {
  name: string;
  latitude: number;
  longitude: number;
  signal_strength?: number;
  tower_type?: string;
  is_active?: boolean;
  coverage_radius_km?: number;
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

// UI component props
export interface InfoPanelProps {
  towers: Tower[];
  nearestTower: NearestTowerResponse | null;
  userPosition: MapPosition | null;
  isLoading: boolean;
  error: string | null;
  isSelectingBounds: boolean;
  selectionStep: 'none' | 'first' | 'second';
  onGenerateTowers: () => void;
  onSelectBounds: () => void;
  onClearTowers: () => void;
}