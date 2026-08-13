# syntax=docker/dockerfile:1

############################################
# Base
############################################
FROM node:20-alpine AS base

WORKDIR /app

############################################
# Dependencies
############################################
FROM base AS deps

# Root workspace files
COPY package*.json ./

# Workspace package manifests
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages ./packages

RUN npm ci

############################################
# Build
############################################
FROM deps AS build

# Copy complete source
COPY . .

WORKDIR /app/apps/auth-service

RUN npm run build

############################################
# Production
############################################
FROM node:20-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production

# Root package files
COPY package*.json ./

# Workspace manifest
COPY apps/auth-service/package.json ./apps/auth-service/

# Install production dependencies only
RUN npm ci --omit=dev

# Built application
COPY --from=build /app/apps/auth-service/dist ./apps/auth-service/dist

WORKDIR /app/apps/auth-service

EXPOSE 4001

CMD ["node", "dist/index.js"]

############################################
# Development
############################################
FROM deps AS dev

COPY . .

WORKDIR /app/apps/auth-service

EXPOSE 4001

CMD ["npm", "run", "dev"]