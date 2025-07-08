# frontend/Dockerfile
FROM node:18-alpine

# Install dependencies for node-gyp if needed
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Create all necessary directories
RUN mkdir -p src/types src/components/Map src/hooks src/services

# Set permissions
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start with verbose logging
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]