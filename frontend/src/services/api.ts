import axios from 'axios';
import { Tower, TowerCreate, LocationQuery, NearestTowerResponse, MapBounds } from '../types';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000/api/v1') {
    this.baseURL = baseURL;
  }

  async createTower(tower: TowerCreate): Promise<Tower> {
    const response = await axios.post(`${this.baseURL}/towers/`, tower);
    return response.data;
  }

  async findNearestTower(location: LocationQuery): Promise<NearestTowerResponse> {
    const response = await axios.post(`${this.baseURL}/towers/nearest`, location);
    return response.data;
  }

  async getTowersInBounds(bounds: MapBounds): Promise<Tower[]> {
    const response = await axios.post(`${this.baseURL}/towers/in-bounds`, bounds);
    return response.data;
  }

  async generateRandomTowers(count: number, bounds: MapBounds): Promise<Tower[]> {
    const response = await axios.post(`${this.baseURL}/towers/generate-random/${count}`, bounds);
    return response.data;
  }
}

export default new ApiService();