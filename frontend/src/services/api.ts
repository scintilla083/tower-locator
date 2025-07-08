// frontend/src/services/api.ts
import axios, { AxiosResponse, AxiosError } from 'axios';
import { Tower, TowerCreate, LocationQuery, NearestTowerResponse, MapBounds } from '../types';

class ApiService {
  private baseURL: string;
  private timeout: number = 10000; // 10 seconds

  constructor(baseURL: string = 'http://localhost:8000/api/v1') {
    this.baseURL = baseURL;
    console.log('API Service initialized with baseURL:', this.baseURL);
  }

  private handleError(error: AxiosError): never {
    console.error('API Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        method: error.config?.method,
        url: error.config?.url,
        data: error.config?.data
      }
    });

    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || error.response.statusText || 'Server error';
      throw new Error(`${error.response.status}: ${message}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: Unable to connect to server. Check if backend is running.');
    } else {
      // Something else happened
      throw new Error(error.message || 'Unknown error occurred');
    }
  }

  async createTower(tower: TowerCreate): Promise<Tower> {
    try {
      console.log('Creating tower:', tower);
      const response = await axios.post(`${this.baseURL}/towers/`, tower, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Tower created successfully:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async findNearestTower(location: LocationQuery): Promise<NearestTowerResponse> {
    try {
      console.log('Finding nearest tower for location:', location);
      const response = await axios.post(`${this.baseURL}/towers/nearest`, location, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Nearest tower found:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async getTowersInBounds(bounds: MapBounds): Promise<Tower[]> {
    try {
      console.log('Getting towers in bounds:', bounds);
      const response = await axios.post(`${this.baseURL}/towers/in-bounds`, bounds, {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Towers in bounds response:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async generateRandomTowers(count: number, bounds: MapBounds): Promise<Tower[]> {
    try {
      console.log('Generating random towers:', { count, bounds });
      const url = `${this.baseURL}/towers/generate-random/${count}`;
      console.log('Request URL:', url);

      const response = await axios.post(url, bounds, {
        timeout: this.timeout * 2, // Double timeout for generation
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Generate towers response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        dataType: typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array'
      });

      if (!Array.isArray(response.data)) {
        console.error('Expected array but got:', typeof response.data, response.data);
        throw new Error('Invalid response format: expected array of towers');
      }

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  async clearAllTowers(): Promise<{ message: string }> {
    try {
      console.log('Clearing all towers...');
      const response = await axios.delete(`${this.baseURL}/towers/clear-all`, {
        timeout: this.timeout,
      });
      console.log('Clear towers response:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string }> {
    try {
      console.log('Performing health check...');
      const response = await axios.get(`${this.baseURL.replace('/api/v1', '')}/health`, {
        timeout: 5000,
      });
      console.log('Health check response:', response.data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
    }
  }
}

export default new ApiService();