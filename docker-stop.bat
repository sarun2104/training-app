@echo off
REM Stop script for Docker deployment (Windows)

echo Stopping Training App...
echo.

REM Ask user for cleanup level
echo Select stop mode:
echo 1^) Stop containers ^(keep data^)
echo 2^) Stop and remove containers ^(keep data^)
echo 3^) Stop, remove containers and volumes ^(DELETE ALL DATA^)
set /p mode="Enter choice [1-3]: "

REM Detect which compose file to use
docker ps | findstr "training-app-backend-dev" >nul 2>nul
if %errorlevel% equ 0 (
    set COMPOSE_FILE=docker-compose.dev.yml
    echo Using DEVELOPMENT configuration
) else (
    set COMPOSE_FILE=docker-compose.yml
    echo Using PRODUCTION configuration
)

echo.

if "%mode%"=="3" (
    echo WARNING: This will DELETE ALL DATA including databases!
    set /p confirm="Are you sure? (yes/no): "
    if "!confirm!"=="yes" (
        echo Stopping and removing containers and volumes...
        docker-compose -f %COMPOSE_FILE% down -v
        echo All containers and data removed
    ) else (
        echo Cancelled
        pause
        exit /b 0
    )
) else if "%mode%"=="2" (
    echo Stopping and removing containers ^(keeping data^)...
    docker-compose -f %COMPOSE_FILE% down
    echo Containers removed, data preserved
) else (
    echo Stopping containers ^(keeping everything^)...
    docker-compose -f %COMPOSE_FILE% stop
    echo Containers stopped, data preserved
)

echo.
echo ============================================================
echo Training App stopped successfully!
echo ============================================================
echo.
echo To start again: docker-start.bat
echo.
pause
