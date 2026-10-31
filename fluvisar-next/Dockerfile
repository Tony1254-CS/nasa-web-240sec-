# ==========================================
# FluviSAR Multi-Stage Production Dockerfile
# ==========================================

# Stage 1: Build Frontend SPA
FROM node:20-alpine AS web-builder
WORKDIR /app
COPY apps/web/package*.json ./
RUN npm install
COPY apps/web/ ./
COPY packages/contracts/ ./packages/contracts/
RUN npm run build

# Stage 2: Web Server (Nginx)
FROM nginx:alpine AS web
COPY --from=web-builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Stage 3: Python Backend API
FROM python:3.11-slim AS api
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY pipeline/ ./pipeline/
COPY services/api/ ./services/api/
COPY packages/contracts/ ./packages/contracts/
COPY configs/ ./configs/

ENV PYTHONPATH=/app/pipeline:/app/services/api:/app/packages/contracts
EXPOSE 8000

CMD ["uvicorn", "services.api.app.main:app", "--host", "0.0.0.0", "--port", "8000"]

