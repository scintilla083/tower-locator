# Tower Locator - Setup and Run Guide

## Quick Start (Docker - Recommended)

### 1. Create Project Structure
```bash
mkdir tower-locator
cd tower-locator
```

## Running the Application

### Method 1: Docker (Recommended)
```bash
# Clone or create the project structure above
cd tower-locator

# Start all services
docker-compose up --build

# Wait for services to start, then visit:
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Method 2: Manual Setup

#### Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tower_locator"

# Start PostgreSQL with PostGIS (separate terminal)
docker run -d -p 5432:5432 -e POSTGRES_DB=tower_locator -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres postgis/postgis:13-3.1

# Start Redis (separate terminal)
docker run -d -p 6379:6379 redis:7-alpine

# Run backend
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Testing the Application

### 1. API Testing
```bash
# Test health endpoint
curl http://localhost:8000/health

# Generate random towers
curl -X POST http://localhost:8000/api/v1/towers/generate-random/10 \
  -H "Content-Type: application/json" \
  -d '{"north": 50.5, "south": 50.4, "east": 30.6, "west": 30.4}'

# Find nearest tower
curl -X POST http://localhost:8000/api/v1/towers/nearest \
  -H "Content-Type: application/json" \
  -d '{"latitude": 50.4501, "longitude": 30.5234}'
```

### 2. Frontend Testing
1. Visit http://localhost:3000
2. Click "Generate Random Towers" button
3. Click anywhere on the map
4. See the nearest tower highlighted with distance

### 3. Database Testing
```bash
# Connect to PostgreSQL
docker exec -it <postgres_container_id> psql -U postgres -d tower_locator

# Check tables
\dt

# Check towers
SELECT id, name, latitude, longitude, ST_AsText(location) FROM towers;
```

## Troubleshooting

### Common Issues:

1. **PostGIS Extension Error**
   ```bash
   # Connect to database and create extension
   docker exec -it <postgres_container> psql -U postgres -d tower_locator
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Frontend Build Issues**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **CORS Issues**
   - Check that frontend is running on port 3000
   - Verify CORS settings in backend/app/main.py

4. **Database Connection**
   ```bash
   # Test connection
   docker exec -it <postgres_container> pg_isready -h localhost -p 5432
   ```

## Next Steps

1. **Add Authentication**: Implement JWT tokens
2. **Add Caching**: Redis integration for tower queries
3. **Add Real-time Updates**: WebSocket connections
4. **Add Tests**: Unit and integration tests
5. **Add Monitoring**: Logging and metrics
6. **Add CI/CD**: GitHub Actions or similar

## API Documentation

Once running, visit http://localhost:8000/docs for interactive API documentation.