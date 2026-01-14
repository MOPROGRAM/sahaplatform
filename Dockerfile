# Multi-stage build for Saha Platform
# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies
# Install dependencies
RUN npm install

# Copy source code
COPY client/ .

# Build the frontend
RUN npm run build

# Stage 2: Setup the production environment
FROM node:18-alpine AS production

# Install dumb-init and sqlite dependencies
RUN apk add --no-cache dumb-init sqlite

# Create app directory
WORKDIR /app

# Copy package files for server
COPY server/package*.json ./

# Install production dependencies only
RUN npm install --production && npm cache clean --force

# Copy server source code
COPY server/ .

# Ensure prisma directory exists and copy it specifically if needed (though COPY server/ . covers it)
# Generate Prisma client
RUN npx prisma generate

# Copy built frontend from the builder stage
COPY --from=frontend-builder /app/client/out ./public

# Create entrypoint script with proper multi-line handling
COPY --chmod=755 <<EOF /app/entrypoint.sh
#!/bin/sh
echo "🚀 Starting Saha Platform..."
echo "📊 Running database migrations... (if schema changes)"
# Using push instead of migrate deploy for SQLite ensures dev.db is created/updated
npx prisma db push
echo "🌱 Seeding database..."
npx prisma db seed
echo "✅ Database ready!"
echo "🌐 Starting application..."
exec "\$@"
EOF

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S saha -u 1001

# Change ownership of the app directory to allow writing to the database
RUN chown -R saha:nodejs /app && chmod 777 /app
USER saha

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["dumb-init", "--", "node", "src/index.js"]