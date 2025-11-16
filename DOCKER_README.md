# Docker Deployment Guide

Complete Docker setup for the Learning Management System with production and development configurations.

## 📦 What's Included

### Docker Files
- **Dockerfile.backend** - Production backend image
- **Dockerfile.frontend** - Production frontend image (with nginx)
- **Dockerfile.backend.dev** - Development backend with hot reload
- **Dockerfile.frontend.dev** - Development frontend with hot reload
- **docker-compose.yml** - Production orchestration
- **docker-compose.dev.yml** - Development orchestration
- **.dockerignore** - Ignore patterns for Docker builds

### Services
1. **PostgreSQL** - Relational database (port 5432)
2. **FalkorDB** - Graph database (port 6379)
3. **Backend API** - FastAPI application (port 8000)
4. **Frontend** - React application (port 80 or 3000)

## 🚀 Quick Start

### Production Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

**Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Development Mode

```bash
# Build and start development services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

**Access the application:**
- Frontend: http://localhost:3000 (with hot reload)
- Backend API: http://localhost:8000 (with hot reload)
- API Docs: http://localhost:8000/docs

## 📋 Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- At least 2GB free RAM
- At least 5GB free disk space

### Install Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**macOS:**
```bash
brew install docker docker-compose
```

**Windows:**
Download Docker Desktop from https://www.docker.com/products/docker-desktop

## 🔧 Configuration

### Environment Variables

**Production** (`docker-compose.yml`):

Edit the environment variables in `docker-compose.yml`:

```yaml
environment:
  # IMPORTANT: Change these for production!
  SECRET_KEY: your-production-secret-key-change-me
  JWT_SECRET_KEY: your-jwt-secret-key-change-me

  # Database (using service names)
  POSTGRES_HOST: postgres
  POSTGRES_PORT: 5432
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres  # Change in production!
  POSTGRES_DB: training_db

  # FalkorDB
  FALKORDB_HOST: falkordb
  FALKORDB_PORT: 6379

  # CORS (add your domains)
  ALLOWED_ORIGINS: http://localhost,http://yourdomain.com
```

**Development** (`docker-compose.dev.yml`):

Development uses default values suitable for local development.

## 🏗️ Architecture

### Production Setup

```
┌─────────────────────────────────────────────────┐
│                  Client Browser                 │
└────────────────────┬────────────────────────────┘
                     │ HTTP (Port 80)
                     ▼
┌─────────────────────────────────────────────────┐
│     Frontend Container (Nginx + React)          │
│  - Serves static files                          │
│  - Proxies /api to backend                      │
└────────────────────┬────────────────────────────┘
                     │ HTTP (Port 8000)
                     ▼
┌─────────────────────────────────────────────────┐
│        Backend Container (FastAPI)              │
│  - REST API endpoints                           │
│  - Business logic                               │
└───────────┬─────────────────┬───────────────────┘
            │                 │
            │                 │
            ▼                 ▼
┌───────────────────┐  ┌──────────────────┐
│    PostgreSQL     │  │    FalkorDB      │
│   (Port 5432)     │  │   (Port 6379)    │
│  - User data      │  │  - Graph data    │
│  - Courses        │  │  - Relationships │
└───────────────────┘  └──────────────────┘
```

### Container Communication

- All containers are on the same `training-network` bridge network
- Containers communicate using service names (e.g., `postgres`, `falkordb`)
- Only necessary ports are exposed to the host

## 📝 Common Commands

### Build and Run

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend

# Start services in background
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# Start specific service
docker-compose up -d backend
```

### View and Monitor

```bash
# View all running containers
docker-compose ps

# View logs (all services)
docker-compose logs

# View logs (specific service)
docker-compose logs backend

# Follow logs (real-time)
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100
```

### Execute Commands

```bash
# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec postgres psql -U postgres -d training_db

# Run Django/FastAPI commands
docker-compose exec backend python backend/database/migrations.py

# Access frontend shell
docker-compose exec frontend sh
```

### Database Operations

```bash
# Create database backup
docker-compose exec postgres pg_dump -U postgres training_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres training_db < backup.sql

# Access PostgreSQL
docker-compose exec postgres psql -U postgres

# Access FalkorDB (Redis)
docker-compose exec falkordb redis-cli
```

### Cleanup

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes data!)
docker-compose down -v

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Complete cleanup
docker system prune -a --volumes
```

## 🔍 Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Check if port is already in use
sudo lsof -i :8000  # Backend
sudo lsof -i :80    # Frontend
sudo lsof -i :5432  # PostgreSQL

# Remove and recreate
docker-compose down
docker-compose up -d --force-recreate
```

### Database Connection Issues

```bash
# Check if PostgreSQL is ready
docker-compose exec postgres pg_isready

# Check database exists
docker-compose exec postgres psql -U postgres -l

# Recreate database
docker-compose down -v
docker-compose up -d
```

### Frontend Not Loading

```bash
# Check nginx logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Check if backend is accessible
curl http://localhost:8000/health
```

### Backend API Errors

```bash
# Check backend logs
docker-compose logs backend

# Check environment variables
docker-compose exec backend env

# Restart backend
docker-compose restart backend
```

### Permission Issues

```bash
# Fix ownership (Linux)
sudo chown -R $USER:$USER .

# Run with sudo (not recommended)
sudo docker-compose up -d
```

## 🚀 Production Deployment

### Step 1: Prepare Environment

```bash
# Clone repository
git clone <your-repo>
cd training-app

# Update environment variables in docker-compose.yml
# IMPORTANT: Change SECRET_KEY, JWT_SECRET_KEY, and passwords!
```

### Step 2: Build and Deploy

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 3: Initialize Database

```bash
# Run migrations (if needed)
docker-compose exec backend python backend/database/migrations.py

# Create admin user (if needed)
docker-compose exec backend python backend/database/init_admin.py
```

### Step 4: Verify Deployment

```bash
# Check health
curl http://localhost:8000/health

# Check frontend
curl http://localhost

# Access application
open http://localhost
```

## 🔒 Security Best Practices

### 1. Change Default Credentials

```yaml
# In docker-compose.yml
environment:
  SECRET_KEY: $(openssl rand -hex 32)
  JWT_SECRET_KEY: $(openssl rand -hex 32)
  POSTGRES_PASSWORD: $(openssl rand -base64 32)
```

### 2. Use Docker Secrets (Production)

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

### 3. Enable HTTPS

Use a reverse proxy like Traefik or nginx with SSL certificates.

### 4. Limit Container Resources

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### 5. Use Non-Root Users

Already implemented in Dockerfiles with appropriate users.

## 📊 Performance Tuning

### Backend Optimization

```yaml
backend:
  environment:
    WORKERS: 4  # Number of uvicorn workers
    POOL_SIZE: 20  # Database connection pool
```

### Database Tuning

```yaml
postgres:
  environment:
    POSTGRES_INITDB_ARGS: "-E UTF8 --locale=C"
  command: postgres -c shared_buffers=256MB -c max_connections=200
```

### Frontend Caching

Already configured in `nginx.conf` with:
- Gzip compression
- Static asset caching (1 year)
- Browser caching headers

## 🔄 Updates and Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f
```

### Update Dependencies

```bash
# Backend
# Update requirements.txt
docker-compose build backend
docker-compose up -d backend

# Frontend
# Update package.json
docker-compose build frontend
docker-compose up -d frontend
```

### Database Migrations

```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Or custom migration script
docker-compose exec backend python migrate.py
```

## 📈 Monitoring

### Container Stats

```bash
# Real-time stats
docker stats

# Specific container
docker stats training-app-backend
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Database health
docker-compose exec postgres pg_isready

# FalkorDB health
docker-compose exec falkordb redis-cli ping
```

### Logs Management

```bash
# Export logs
docker-compose logs > app-logs.txt

# Rotate logs
docker-compose logs --since 24h > logs-$(date +%Y%m%d).txt
```

## 🌐 Cloud Deployment

### AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <ecr-url>
docker-compose build
docker-compose push
```

### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/<project-id>/training-app-backend
gcloud run deploy --image gcr.io/<project-id>/training-app-backend
```

### Azure Container Instances

```bash
# Build and push to ACR
az acr build --registry <registry> --image training-app-backend .
```

### DigitalOcean

```bash
# Use Docker Compose on Droplet
doctl compute droplet create --image docker-20-04 ...
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker Deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [React Docker Deployment](https://create-react-app.dev/docs/deployment/)

## 🆘 Support

For issues or questions:

1. Check logs: `docker-compose logs`
2. Verify configuration: `docker-compose config`
3. Check container status: `docker-compose ps`
4. Review this documentation
5. Create an issue in the repository

## 📄 License

Same as the main project.

---

**Quick Reference Commands:**

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Clean slate
docker-compose down -v && docker-compose up -d
```
