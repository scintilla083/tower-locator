// frontend/src/services/api.ts - Add getAllTowers method
import axios, { AxiosError } from 'axios';
import { API_CONFIG } from '../config/constants';
import { Tower, TowerCreate, LocationQuery, NearestTowerResponse, MapBounds } from '../types';

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      const message = error.response.data?.detail || error.response.statusText || 'Server error';
      throw new Error(`${error.response.status}: ${message}`);
    } else if (error.request) {
      throw new Error('Network error: Unable to connect to server. Check if backend is running.');
    } else {
      throw new Error(error.message || 'Unknown error occurred');
    }
  }

  async getAllTowers(): Promise<Tower[]> {
    try {
      const response = await axios.get(`${this.baseURL}/towers/`, {
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async createTower(tower: TowerCreate): Promise<Tower> {
    try {
      const response = await axios.post(`${this.baseURL}/towers/`, tower, {
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async findNearestTower(location: LocationQuery): Promise<NearestTowerResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/towers/nearest`, location, {
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getTowersInBounds(bounds: MapBounds): Promise<Tower[]> {
    try {
      const response = await axios.post(`${this.baseURL}/towers/in-bounds`, bounds, {
        timeout: this.timeout,
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async generateRandomTowers(count: number, bounds: MapBounds): Promise<Tower[]> {
    try {
      const response = await axios.post(`${this.baseURL}/towers/generate-random/${count}`, bounds, {
        timeout: this.timeout * 2,
        headers: { 'Content-Type': 'application/json' },
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format: expected array of towers');
      }

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async clearAllTowers(): Promise<{ message: string }> {
    try {
      const response = await axios.delete(`${this.baseURL}/towers/clear-all`, {
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await axios.get(`${this.baseURL.replace('/api/v1', '')}/health`, {
        timeout: API_CONFIG.HEALTH_CHECK_TIMEOUT,
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }
}

export default new ApiService();