# PowerShell stop script for Docker deployment (Windows)
# Usage: .\docker-stop.ps1

Write-Host "🛑 Stopping Training App..." -ForegroundColor Yellow
Write-Host ""

# Ask user for cleanup level
Write-Host "Select stop mode:"
Write-Host "1) Stop containers (keep data)"
Write-Host "2) Stop and remove containers (keep data)"
Write-Host "3) Stop, remove containers and volumes (DELETE ALL DATA)"
$mode = Read-Host "Enter choice [1-3]"

# Detect which compose file to use
$dockerPs = docker ps | Select-String "training-app-backend-dev"
if ($dockerPs) {
    $COMPOSE_FILE = "docker-compose.dev.yml"
    Write-Host "📦 Using DEVELOPMENT configuration" -ForegroundColor Cyan
} else {
    $COMPOSE_FILE = "docker-compose.yml"
    Write-Host "📦 Using PRODUCTION configuration" -ForegroundColor Cyan
}

Write-Host ""

switch ($mode) {
    "3" {
        Write-Host "⚠️  WARNING: This will DELETE ALL DATA including databases!" -ForegroundColor Red
        $confirm = Read-Host "Are you sure? (yes/no)"
        if ($confirm -eq "yes") {
            Write-Host "🗑️  Stopping and removing containers and volumes..." -ForegroundColor Yellow
            docker-compose -f $COMPOSE_FILE down -v
            Write-Host "✅ All containers and data removed" -ForegroundColor Green
        } else {
            Write-Host "❌ Cancelled" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 0
        }
    }
    "2" {
        Write-Host "🗑️  Stopping and removing containers (keeping data)..." -ForegroundColor Yellow
        docker-compose -f $COMPOSE_FILE down
        Write-Host "✅ Containers removed, data preserved" -ForegroundColor Green
    }
    default {
        Write-Host "⏸️  Stopping containers (keeping everything)..." -ForegroundColor Yellow
        docker-compose -f $COMPOSE_FILE stop
        Write-Host "✅ Containers stopped, data preserved" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Training App stopped successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start again: .\docker-start.ps1" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
