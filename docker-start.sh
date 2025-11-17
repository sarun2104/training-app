#!/bin/bash
# Quick start script for Docker deployment

set -e

echo "🚀 Starting Training App with Docker..."
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Ask user for mode
echo "Select deployment mode:"
echo "1) Production (default)"
echo "2) Development (with hot reload)"
read -p "Enter choice [1-2]: " mode

case $mode in
    2)
        echo ""
        echo "📦 Starting in DEVELOPMENT mode..."
        COMPOSE_FILE="docker-compose.dev.yml"
        ;;
    *)
        echo ""
        echo "📦 Starting in PRODUCTION mode..."
        COMPOSE_FILE="docker-compose.yml"
        ;;
esac

# Build images
echo ""
echo "🔨 Building Docker images..."
docker-compose -f $COMPOSE_FILE build

# Start services
echo ""
echo "🚀 Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service health
echo ""
echo "🔍 Checking service health..."

# Check Backend
sleep 3
if curl -s http://localhost:8000/health &> /dev/null; then
    echo "✅ Backend API is ready"
else
    echo "⚠️  Backend API is not ready yet (may take a few more seconds)"
fi

# Display access information
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Training App is starting up!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$COMPOSE_FILE" = "docker-compose.dev.yml" ]; then
    echo "🌐 Frontend:   http://localhost:3000"
else
    echo "🌐 Frontend:   http://localhost"
fi

echo "🔧 Backend:    http://localhost:8000"
echo "📚 API Docs:   http://localhost:8000/docs"
echo ""
echo "📊 Database (using host machine services):"
echo "   PostgreSQL: localhost:5432 (must be running)"
echo "   FalkorDB:   localhost:6379 (must be running)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Useful commands:"
echo "   View logs:  docker-compose -f $COMPOSE_FILE logs -f"
echo "   Stop:       docker-compose -f $COMPOSE_FILE down"
echo "   Restart:    docker-compose -f $COMPOSE_FILE restart"
echo ""
echo "👤 Login credentials:"
echo "   Admin:      admin / admin123"
echo "   Employee:   employee / employee123"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
