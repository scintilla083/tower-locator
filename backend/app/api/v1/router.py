from fastapi import APIRouter
from .endpoints import towers

api_router = APIRouter()
api_router.include_router(towers.router, prefix="/towers", tags=["towers"])