from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.database import engine
from .models.base import Base
from .api.v1.router import api_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tower Locator API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Tower Locator API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}