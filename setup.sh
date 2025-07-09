#!/bin/bash

echo "🏗️ Setting up Tower Locator Application..."

# Create project structure
echo "📁 Creating project structure..."
mkdir -p tower-locator/{frontend/src/{components/Map,hooks,services,types},backend/app/{api/v1/endpoints,core,models,repositories,schemas,services}}

cd tower-locator

# Create all the files
echo "📄 Creating frontend files..."

# Frontend package.json
cat > frontend/package.json << 'EOF'
{
  "name": "tower-locator-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/leaflet": "^1.9.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
EOF

# Frontend Dockerfile
cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN mkdir -p src/types src/components/Map src/hooks src/services

EXPOSE 3000

ENV NODE_ENV=development

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
EOF

# Backend requirements.txt
cat > backend/requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.13.1
psycopg2-binary==2.9.9
geoalchemy2==0.14.2
pydantic==2.5.0
pytest==7.4.3
pytest-asyncio==0.21.1
python-multipart==0.0.6
pydantic-settings
EOF

echo "🐳 Creating Docker Compose file..."

# Docker compose
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  db:
    image: postgis/postgis:13-3.1
    environment:
      POSTGRES_DB: tower_locator
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d tower_locator"]
      interval: 10s
      timeout: 5s
      retries: 5
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/tower_locator
    volumes:
      - ./backend:/app
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true
      - VITE_API_URL=http://localhost:8000/api/v1
    restart: unless-stopped

volumes:
  postgres_data:
EOF

echo "🚀 Starting services..."
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔧 Setting up PostGIS extension..."
docker-compose exec db psql -U postgres -d tower_locator -c "CREATE EXTENSION IF NOT EXISTS postgis;"

echo "✅ Setup complete!"
echo ""
echo "🌐 Your application is running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 To test the application:"
echo "   1. Visit http://localhost:3000"
echo "   2. Click 'Generate Random Towers'"
echo "   3. Click anywhere on the map to find the nearest tower"
echo ""
echo "🛑 To stop the application:"
echo "   docker-compose down"