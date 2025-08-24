# ---- Build stage -------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (use the lockfile you actually have)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; fi

# Copy source and build
COPY . .
# Pass DEMO flag to Vite (optional). You can override at build time: --build-arg VITE_DEMO=true
ARG VITE_DEMO=true
ENV VITE_DEMO=$VITE_DEMO
RUN npm run build

# ---- Runtime stage -----------------------------------------------------------
FROM nginx:1.27-alpine
# SPA config: serve index.html for unknown routes
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# Static assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1
