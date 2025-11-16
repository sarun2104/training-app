#!/bin/bash
# Stop script for Docker deployment

set -e

echo "🛑 Stopping Training App..."
echo ""

# Ask user for cleanup level
echo "Select stop mode:"
echo "1) Stop containers (keep data)"
echo "2) Stop and remove containers (keep data)"
echo "3) Stop, remove containers and volumes (DELETE ALL DATA)"
read -p "Enter choice [1-3]: " mode

# Detect which compose file to use
if docker ps | grep -q "training-app-backend-dev"; then
    COMPOSE_FILE="docker-compose.dev.yml"
    echo "📦 Using DEVELOPMENT configuration"
else
    COMPOSE_FILE="docker-compose.yml"
    echo "📦 Using PRODUCTION configuration"
fi

echo ""

case $mode in
    3)
        echo "⚠️  WARNING: This will DELETE ALL DATA including databases!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "🗑️  Stopping and removing containers and volumes..."
            docker-compose -f $COMPOSE_FILE down -v
            echo "✅ All containers and data removed"
        else
            echo "❌ Cancelled"
            exit 0
        fi
        ;;
    2)
        echo "🗑️  Stopping and removing containers (keeping data)..."
        docker-compose -f $COMPOSE_FILE down
        echo "✅ Containers removed, data preserved"
        ;;
    *)
        echo "⏸️  Stopping containers (keeping everything)..."
        docker-compose -f $COMPOSE_FILE stop
        echo "✅ Containers stopped, data preserved"
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Training App stopped successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To start again: ./docker-start.sh"
echo ""
