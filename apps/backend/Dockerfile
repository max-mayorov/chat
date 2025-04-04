FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json files for dependency installation
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
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
RUN nx build backend

# Production stage
FROM base AS runner

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy built app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
