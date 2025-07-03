# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application (this generates the proto files)
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy the protos directory (contains generated proto files for product-svc)
COPY --from=builder /app/src/protos ./src/protos

# Copy Prisma schema (needed for database operations)
COPY --from=builder /app/prisma ./prisma

# Copy proto files from node_modules (needed at runtime for gRPC)
COPY --from=builder /app/node_modules/grpc-nest-proto ./node_modules/grpc-nest-proto

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 50053

# Use direct node command for better performance
CMD ["node", "dist/main"]
