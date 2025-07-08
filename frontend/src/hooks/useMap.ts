// frontend/src/hooks/useMap.ts
import { useState, useCallback, useRef } from 'react';
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

  // Use ref to prevent duplicate requests
  const loadingRef = useRef(false);

  const setUserPosition = useCallback((position: MapPosition) => {
    console.log('Setting user position:', position);
    setUserPositionState(position);
    setNearestTower(null);
    setError(null);
  }, []);

  const findNearestTower = useCallback(async (position: MapPosition) => {
    if (loadingRef.current) {
      console.log('Request already in progress, skipping...');
      return;
    }

    console.log('Finding nearest tower for position:', position);
    setIsLoading(true);
    loadingRef.current = true;
    setError(null);

    try {
      const query: LocationQuery = {
        latitude: position.lat,
        longitude: position.lng,
        max_distance_km: 50
      };

      const result = await ApiService.findNearestTower(query);
      console.log('Nearest tower found:', result);
      setNearestTower(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find nearest tower';
      console.error('Error finding nearest tower:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const loadTowersInArea = useCallback(async (bounds: any) => {
    if (loadingRef.current) return;

    console.log('Loading towers in area:', bounds);
    setIsLoading(true);
    loadingRef.current = true;
    setError(null);

    try {
      const mapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };

      const towersData = await ApiService.getTowersInBounds(mapBounds);
      console.log('Towers loaded:', towersData);
      setTowers(towersData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load towers';
      console.error('Error loading towers:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const generateRandomTowers = useCallback(async (count: number, bounds: any) => {
    if (loadingRef.current) {
      console.log('Request already in progress, skipping generate towers...');
      return;
    }

    console.log('Generating random towers:', { count, bounds });
    setIsLoading(true);
    loadingRef.current = true;
    setError(null);

    try {
      const mapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      };

      console.log('Sending request with bounds:', mapBounds);
      const newTowers = await ApiService.generateRandomTowers(count, mapBounds);
      console.log('Generated towers response:', newTowers);

      if (Array.isArray(newTowers) && newTowers.length > 0) {
        setTowers(prev => {
          const updated = [...prev, ...newTowers];
          console.log('Updated towers state:', updated);
          return updated;
        });
        console.log(`Successfully generated ${newTowers.length} towers`);
      } else {
        console.warn('No towers were generated or invalid response:', newTowers);
        setError('No towers were generated. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate towers';
      console.error('Error generating towers:', err);
      setError(errorMessage);
    } finally {
      console.log('Generate towers completed, setting loading to false');
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const clearAllTowers = useCallback(async () => {
    if (loadingRef.current) return;

    console.log('Clearing all towers...');
    setIsLoading(true);
    loadingRef.current = true;
    setError(null);

    try {
      await ApiService.clearAllTowers();
      setTowers([]);
      setNearestTower(null);
      setUserPositionState(null);

      console.log('Successfully cleared all towers');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear towers';
      console.error('Error clearing towers:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
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