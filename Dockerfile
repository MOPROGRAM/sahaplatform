# Multi-stage build for Saha Platform
# Stage 1: Build the frontend
FROM node:18-slim AS frontend-builder

# Install build dependencies (needed for some node modules)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies (ignoring scripts to avoid optional dep failures)
RUN npm install --ignore-scripts

# Copy source code
COPY client/ .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build the frontend
RUN npm run build

# Stage 2: Setup the production environment
FROM node:18-slim AS production

# Install runtime dependencies (openssl for Prisma, postgresql-client for DB operations)
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files for server
COPY server/package*.json ./

# Install production dependencies only
RUN npm install --production && npm cache clean --force

# Copy server source code
COPY server/ .

# Set default Env for Prisma (can be overridden by environment variables)
ENV DATABASE_URL="file:/app/prisma/dev.db"

# Generate Prisma client for linux (debian)
RUN npx prisma generate

# Copy built frontend from the builder stage
COPY --from=frontend-builder /app/client/out ./public

# Create entrypoint script
COPY --chmod=755 <<EOF /app/entrypoint.sh
#!/bin/sh
echo "🚀 Starting Saha Platform..."

# Check if using PostgreSQL (Supabase) or SQLite
if echo "\$DATABASE_URL" | grep -q "postgresql://"; then
  echo "📊 Using PostgreSQL (Supabase) database..."
  echo "🔄 Running database migrations..."
  npx prisma db push --accept-data-loss
  echo "🌱 Seeding database with initial data..."
  npx prisma db seed
else
  echo "📊 Using SQLite database..."
  # Ensure database directory exists for SQLite
  mkdir -p /app/prisma
  echo "🔄 Setting up database..."
  npx prisma db push --accept-data-loss
  echo "🌱 Seeding database with initial data..."
  npx prisma db seed
fi

echo "✅ Database ready!"
echo "🌐 Starting application..."
exec "\$@"
EOF

# Create non-root user (optional, but good practice. For simplicity in debugging failures, we can run as root or ensure perms are perfect)
# Giving full permissions to current user for sqlite file handling
RUN chmod -R 777 /app

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "src/index.js"]