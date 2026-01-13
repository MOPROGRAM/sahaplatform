# Multi-stage build for Saha Platform
# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY client/ .

# Build the frontend
RUN npm run build

# Stage 2: Setup the production environment
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files for server
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy server source code
COPY server/ .

# Generate Prisma client
RUN npx prisma generate

# Copy built frontend from the builder stage
COPY --from=frontend-builder /app/client/out ./public

# Create entrypoint script
RUN echo '#!/bin/sh\n\
    echo "🚀 Starting Saha Platform..."\n\
    echo "📊 Running database migrations..."\n\
    npx prisma migrate deploy --schema=./prisma/schema.prisma\n\
    echo "🌱 Seeding database..."\n\
    npx prisma db seed\n\
    echo "✅ Database ready!"\n\
    echo "🌐 Starting application..."\n\
    exec "$@"' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S saha -u 1001

# Change ownership
RUN chown -R saha:nodejs /app
USER saha

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["dumb-init", "--", "node", "src/index.js"]