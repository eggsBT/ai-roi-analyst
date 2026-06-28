# syntax=docker/dockerfile:1

# ---- Build stage: install everything and produce dist/ (client + server) ----
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime stage: lean image with only production deps + built output ----
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist

# Cloud Run injects PORT (default 8080); server.ts reads process.env.PORT
# and binds 0.0.0.0. NODE_ENV=production makes it serve the built SPA.
EXPOSE 8080
CMD ["node", "dist/server.cjs"]
