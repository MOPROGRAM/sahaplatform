#!/bin/bash

# Supabase Migration Script for Saha Platform
# This script helps you migrate from SQLite to Supabase PostgreSQL

echo "🚀 Saha Platform - Supabase Migration Tool"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set DATABASE_URL to your Supabase connection string:"
    echo "export DATABASE_URL='postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres'"
    exit 1
fi

# Check if it's a PostgreSQL URL
if [[ $DATABASE_URL != postgresql://* ]]; then
    echo "⚠️  Warning: DATABASE_URL does not appear to be a PostgreSQL connection string"
    echo "Current DATABASE_URL: $DATABASE_URL"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📊 Database URL detected:"
echo "$DATABASE_URL" | sed 's/:[^:@]*@/:***@/g'  # Hide password
echo ""

# Navigate to server directory
cd "$(dirname "$0")/server" || exit 1

echo "1️⃣ Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

echo "2️⃣ Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

echo "3️⃣ Pushing database schema to Supabase..."
npx prisma db push
echo "✅ Database schema created"
echo ""

echo "4️⃣ Seeding database with initial data..."
npx prisma db seed
echo "✅ Database seeded"
echo ""

echo "🎉 Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update your Render environment variables with the Supabase DATABASE_URL"
echo "2. Redeploy your application on Render"
echo "3. Your data will now persist across deployments!"
echo ""
echo "For more information, see SUPABASE_SETUP.md"
