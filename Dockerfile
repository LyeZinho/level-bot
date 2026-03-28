# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install build dependencies for sharp (native module)
RUN apk add --no-cache --virtual .build-deps \
  build-base python3 pkgconfig vips-dev libjpeg-turbo-dev libpng-dev fftw-dev

# Install dependencies
RUN npm ci

# Cleanup build deps
RUN apk del .build-deps

# Copy source code
COPY . .

# Build NestJS application
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Install runtime dependencies for sharp (native libraries)
RUN apk add --no-cache vips-dev libjpeg-turbo-dev libpng-dev

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Start application
CMD ["node", "dist/main.js"]
