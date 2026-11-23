FROM node:24-bookworm-slim AS frontend
WORKDIR /app
COPY altave-frontend/package*.json ./
RUN npm ci
COPY altave-frontend/ ./
RUN VITE_API_URL=/api npm run build

FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --chown=node:node backend/package*.json ./
COPY --chown=node:node backend/prisma ./prisma
RUN npm ci --include=dev
COPY --chown=node:node backend/ ./
COPY --from=frontend --chown=node:node /app/dist ./public
USER node
EXPOSE 3001
CMD ["sh", "-c", "node staging/prepare.js && exec node server.js"]
