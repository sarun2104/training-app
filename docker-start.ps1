# PowerShell script for Docker deployment (Windows)
# Usage: .\docker-start.ps1

Write-Host "🚀 Starting Training App with Docker..." -ForegroundColor Green
Write-Host ""

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Docker Compose is installed
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Ask user for mode
Write-Host "Select deployment mode:"
Write-Host "1) Production (default)"
Write-Host "2) Development (with hot reload)"
$mode = Read-Host "Enter choice [1-2]"

if ($mode -eq "2") {
    Write-Host ""
    Write-Host "📦 Starting in DEVELOPMENT mode..." -ForegroundColor Cyan
    $COMPOSE_FILE = "docker-compose.dev.yml"
} else {
    Write-Host ""
    Write-Host "📦 Starting in PRODUCTION mode..." -ForegroundColor Cyan
    $COMPOSE_FILE = "docker-compose.yml"
}

# Build images
Write-Host ""
Write-Host "🔨 Building Docker images..." -ForegroundColor Yellow
docker-compose -f $COMPOSE_FILE build

# Start services
Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Green
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be ready
Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check service health
Write-Host ""
Write-Host "🔍 Checking service health..." -ForegroundColor Cyan

# Check Backend
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend API is ready" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend API is not ready yet (may take a few more seconds)" -ForegroundColor Yellow
}

# Display access information
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Training App is starting up!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($COMPOSE_FILE -eq "docker-compose.dev.yml") {
    Write-Host "🌐 Frontend:   http://localhost:5173" -ForegroundColor White
} else {
    Write-Host "🌐 Frontend:   http://localhost" -ForegroundColor White
}

Write-Host "🔧 Backend:    http://localhost:8000" -ForegroundColor White
Write-Host "📚 API Docs:   http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "📊 Database (using host machine services):" -ForegroundColor Magenta
Write-Host "   PostgreSQL: localhost:5432 (must be running)" -ForegroundColor White
Write-Host "   FalkorDB:   localhost:6379 (must be running)" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Yellow
Write-Host "   View logs:  docker-compose -f $COMPOSE_FILE logs -f"
Write-Host "   Stop:       docker-compose -f $COMPOSE_FILE down"
Write-Host "   Restart:    docker-compose -f $COMPOSE_FILE restart"
Write-Host ""
Write-Host "👤 Login credentials:" -ForegroundColor Yellow
Write-Host "   Admin:      admin / admin123"
Write-Host "   Employee:   employee / employee123"
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
