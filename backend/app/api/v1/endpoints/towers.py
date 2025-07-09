
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ...deps import get_db
from ....repositories.tower_repository import TowerRepository
from ....services.tower_service import TowerService
from ....schemas.tower import TowerCreate, TowerResponse
from ....schemas.location import LocationQuery, NearestTowerResponse, MapBounds

router = APIRouter()

def get_tower_service(db: Session = Depends(get_db)) -> TowerService:
    tower_repository = TowerRepository(db)
    return TowerService(tower_repository)

@router.get("/", response_model=List[TowerResponse])
def get_all_towers(
    tower_service: TowerService = Depends(get_tower_service)
):
    """Get all active towers with their boundary data"""
    return tower_service.get_all_towers()

@router.post("/", response_model=TowerResponse)
def create_tower(
    tower: TowerCreate,
    tower_service: TowerService = Depends(get_tower_service)
):
    return tower_service.create_tower(tower)

@router.post("/nearest", response_model=NearestTowerResponse)
def find_nearest_tower(
    location: LocationQuery,
    tower_service: TowerService = Depends(get_tower_service)
):
    result = tower_service.find_nearest_tower(location)
    if not result:
        raise HTTPException(status_code=404, detail="No towers found within range")
    return result

@router.post("/in-bounds", response_model=List[TowerResponse])
def get_towers_in_bounds(
    bounds: MapBounds,
    tower_service: TowerService = Depends(get_tower_service)
):
    return tower_service.get_towers_in_area(bounds)

@router.post("/generate-random/{count}", response_model=List[TowerResponse])
def generate_random_towers(
    count: int,
    bounds: MapBounds,
    tower_service: TowerService = Depends(get_tower_service)
):
    if count > 1000:
        raise HTTPException(status_code=400, detail="Maximum 1000 towers allowed")
    return tower_service.initialize_random_towers(count, bounds)

@router.delete("/clear-all")
def clear_all_towers(
    tower_service: TowerService = Depends(get_tower_service)
):
    """Delete all towers from the database"""
    count = tower_service.clear_all_towers()
    return {"message": f"Successfully deleted {count} towers"}