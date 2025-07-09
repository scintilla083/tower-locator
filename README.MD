## Quick Start with Docker

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd tower-locator
```

### 2. Start the application
```bash
docker-compose up --build
```

## API Endpoints

- `GET /` - API status
- `GET /health` - Health check
- `GET /api/v1/towers/` - Get all towers
- `POST /api/v1/towers/nearest` - Find nearest tower
- `POST /api/v1/towers/generate-random/{count}` - Generate random towers
- `DELETE /api/v1/towers/clear-all` - Clear all towers



### Rebuild after changes
```bash
docker-compose up --build
```

### Reset database
```bash
docker-compose down -v
docker-compose up --build
```


### Database connection issues
```bash
# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```
