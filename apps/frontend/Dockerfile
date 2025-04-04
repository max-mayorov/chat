FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency installation
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY libs/domain/package.json ./libs/domain/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the app
RUN npm install -g nx
RUN nx build frontend

# Production stage with Nginx
FROM nginx:alpine AS runner

# Copy built app from builder stage
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy custom nginx config
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
