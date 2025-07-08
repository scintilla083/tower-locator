import { useState, useCallback } from 'react';
import { Tower, LocationQuery, NearestTowerResponse, MapPosition } from '../types';
import ApiService from '../services/api';

export interface UseMapReturn {
  towers: Tower[];
  userPosition: MapPosition | null;
  nearestTower: NearestTowerResponse | null;
  isLoading: boolean;
  error: string | null;

  setUserPosition: (position: MapPosition) => void;
  findNearestTower: (position: MapPosition) => Promise<void>;
  loadTowersInArea: (bounds: any) => Promise<void>;
  generateRandomTowers: (count: number, bounds: any) => Promise<void>;
  clearAllTowers: () => Promise<void>;
  clearError: () => void;
}

export const useMap = (): UseMapReturn => {
  const [towers, setTowers] = useState<Tower[]>([]);
  const [userPosition, setUserPositionState] = useState<MapPosition | null>(null);
  const [nearestTower, setNearestTower] = useState<NearestTowerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setUserPosition = useCallback((position: MapPosition) => {
    setUserPositionState(position);
    setNearestTower(null);
  }, []);

  const findNearestTower = useCallback(async (position: MapPosition) => {
    setIsLoading(true);
    setError(null);

    try {
      const query: LocationQuery = {
        latitude: position.lat,
        longitude: position.lng,
        max_distance_km: 50
      };

      const result = await ApiService.findNearestTower(query);
      setNearestTower(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find nearest tower');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTowersInArea = useCallback(async (bounds: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const mapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };

      const towersData = await ApiService.getTowersInBounds(mapBounds);
      setTowers(towersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load towers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateRandomTowers = useCallback(async (count: number, bounds: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const mapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };

      const newTowers = await ApiService.generateRandomTowers(count, mapBounds);
      setTowers(prev => [...prev, ...newTowers]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate towers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAllTowers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await ApiService.clearAllTowers();
      setTowers([]);
      setNearestTower(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear towers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    towers,
    userPosition,
    nearestTower,
    isLoading,
    error,
    setUserPosition,
    findNearestTower,
    loadTowersInArea,
    generateRandomTowers,
    clearAllTowers,
    clearError
  };
};