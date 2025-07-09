
FROM node:18-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app


COPY package*.json ./

RUN npm cache clean --force
RUN npm install --legacy-peer-deps


COPY . .


RUN mkdir -p src/types src/components/Map src/hooks src/services


RUN chown -R node:node /app
USER node


EXPOSE 3000

ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true


HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1


CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]