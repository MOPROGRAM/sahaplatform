# Cloudflare Pages Deployment Script
# This script builds and deploys the frontend to Cloudflare Pages

Write-Host "🚀 Cloudflare Pages Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
Write-Host "1️⃣ Checking Wrangler CLI..." -ForegroundColor Cyan
$wranglerInstalled = Get-Command wrangler -ErrorAction SilentlyContinue

if (-not $wranglerInstalled) {
    Write-Host "⚠️  Wrangler CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g wrangler
    Write-Host "✅ Wrangler installed" -ForegroundColor Green
}
else {
    Write-Host "✅ Wrangler CLI found" -ForegroundColor Green
}
Write-Host ""

# Navigate to client directory
Write-Host "2️⃣ Navigating to client directory..." -ForegroundColor Cyan
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\client"
Write-Host "✅ In client directory" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "3️⃣ Installing dependencies..." -ForegroundColor Cyan
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Build the project
Write-Host "4️⃣ Building Next.js project..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Check if out directory exists
if (-not (Test-Path "out")) {
    Write-Host "❌ Error: 'out' directory not found!" -ForegroundColor Red
    Write-Host "Make sure next.config.js has: output: 'export'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Output directory found" -ForegroundColor Green
Write-Host ""

# Deploy to Cloudflare Pages
Write-Host "5️⃣ Deploying to Cloudflare Pages..." -ForegroundColor Cyan
Write-Host ""

$projectName = Read-Host "Enter your Cloudflare Pages project name (default: saha-platform)"
if ([string]::IsNullOrWhiteSpace($projectName)) {
    $projectName = "saha-platform"
}

Write-Host ""
Write-Host "Deploying to project: $projectName" -ForegroundColor Yellow
Write-Host ""

wrangler pages deploy out --project-name=$projectName

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're logged in: wrangler login" -ForegroundColor White
    Write-Host "2. Check if the project exists in Cloudflare Dashboard" -ForegroundColor White
    Write-Host "3. Try creating the project first via Dashboard" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit Cloudflare Dashboard to see your deployment" -ForegroundColor White
Write-Host "2. Configure environment variables if needed" -ForegroundColor White
Write-Host "3. Set up custom domain (optional)" -ForegroundColor White
Write-Host ""
Write-Host "Your site should be live at:" -ForegroundColor Cyan
Write-Host "https://$projectName.pages.dev" -ForegroundColor Green
Write-Host ""
