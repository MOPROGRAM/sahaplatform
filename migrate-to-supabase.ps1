# Supabase Migration Script for Saha Platform (Windows PowerShell)
# This script helps you migrate from SQLite to Supabase PostgreSQL

Write-Host "🚀 Saha Platform - Supabase Migration Tool" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL environment variable is not set" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set DATABASE_URL to your Supabase connection string:" -ForegroundColor Yellow
    Write-Host '$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"' -ForegroundColor Yellow
    exit 1
}

# Check if it's a PostgreSQL URL
if (-not $env:DATABASE_URL.StartsWith("postgresql://")) {
    Write-Host "⚠️  Warning: DATABASE_URL does not appear to be a PostgreSQL connection string" -ForegroundColor Yellow
    Write-Host "Current DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Do you want to continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

Write-Host "📊 Database URL detected:" -ForegroundColor Green
# Hide password in output
$maskedUrl = $env:DATABASE_URL -replace ':[^:@]*@', ':***@'
Write-Host $maskedUrl -ForegroundColor Gray
Write-Host ""

# Navigate to server directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\server"

Write-Host "1️⃣ Installing dependencies..." -ForegroundColor Cyan
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣ Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
Write-Host "✅ Prisma Client generated" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣ Pushing database schema to Supabase..." -ForegroundColor Cyan
npx prisma db push
Write-Host "✅ Database schema created" -ForegroundColor Green
Write-Host ""

Write-Host "4️⃣ Seeding database with initial data..." -ForegroundColor Cyan
npx prisma db seed
Write-Host "✅ Database seeded" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Migration completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update your Render environment variables with the Supabase DATABASE_URL"
Write-Host "2. Redeploy your application on Render"
Write-Host "3. Your data will now persist across deployments!"
Write-Host ""
Write-Host "For more information, see SUPABASE_SETUP.md" -ForegroundColor Cyan
