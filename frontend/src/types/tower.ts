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

