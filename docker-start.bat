@echo off
REM Quick start script for Docker deployment (Windows)

echo Starting Training App with Docker...
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Ask user for mode
echo Select deployment mode:
echo 1^) Production ^(default^)
echo 2^) Development ^(with hot reload^)
set /p mode="Enter choice [1-2]: "

if "%mode%"=="2" (
    echo.
    echo Starting in DEVELOPMENT mode...
    set COMPOSE_FILE=docker-compose.dev.yml
) else (
    echo.
    echo Starting in PRODUCTION mode...
    set COMPOSE_FILE=docker-compose.yml
)

REM Build images
echo.
echo Building Docker images...
docker-compose -f %COMPOSE_FILE% build

REM Start services
echo.
echo Starting services...
docker-compose -f %COMPOSE_FILE% up -d

REM Wait for services to be ready
echo.
echo Waiting for services to be ready...
timeout /t 5 /nobreak >nul

REM Check service health
echo.
echo Checking service health...

REM Check Backend
timeout /t 3 /nobreak >nul
curl -s http://localhost:8000/health >nul 2>nul
if %errorlevel% equ 0 (
    echo Backend API is ready
) else (
    echo Backend API is not ready yet ^(may take a few more seconds^)
)

REM Display access information
echo.
echo ============================================================
echo Training App is starting up!
echo ============================================================
echo.

if "%COMPOSE_FILE%"=="docker-compose.dev.yml" (
    echo Frontend:   http://localhost:3000
) else (
    echo Frontend:   http://localhost
)

echo Backend:    http://localhost:8000
echo API Docs:   http://localhost:8000/docs
echo.
echo Database ^(using host machine services^):
echo    PostgreSQL: localhost:5432 ^(must be running^)
echo    FalkorDB:   localhost:6379 ^(must be running^)
echo.
echo ============================================================
echo.
echo Useful commands:
echo    View logs:  docker-compose -f %COMPOSE_FILE% logs -f
echo    Stop:       docker-compose -f %COMPOSE_FILE% down
echo    Restart:    docker-compose -f %COMPOSE_FILE% restart
echo.
echo Login credentials:
echo    Admin:      admin / admin123
echo    Employee:   employee / employee123
echo.
echo ============================================================
echo.
pause
