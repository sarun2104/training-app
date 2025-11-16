# Docker Deployment Guide (Using External Databases)

Complete Docker setup for the Learning Management System that connects to your existing PostgreSQL and FalkorDB instances.

## 📦 What's Included

This configuration runs the **frontend** and **backend** in Docker containers while connecting to your **existing databases** on the host machine.

### Docker Services (2 containers)
- **Backend API** - FastAPI application (port 8000)
- **Frontend** - React application (port 80 or 3000)

### External Services (on host machine)
- **PostgreSQL** - Your existing PostgreSQL on localhost:5432
- **FalkorDB** - Your existing FalkorDB on localhost:6379

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- **PostgreSQL** running on localhost:5432
- **FalkorDB** running on localhost:6379

### Verify Database Connectivity

Before starting, ensure your databases are running:

```bash
# Check PostgreSQL
psql -h localhost -p 5432 -U postgres -d training_db -c "SELECT 1"

# Check FalkorDB (Redis)
redis-cli -h localhost -p 6379 ping
# Should return: PONG
```

### Start Application

```bash
# Using the helper script (recommended)
./docker-start.sh

# Or manually
docker-compose up -d
```

**Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Stop Application

```bash
# Using helper script
./docker-stop.sh

# Or manually
docker-compose down
```

## 🔧 How It Works

### Container to Host Communication

The Docker containers connect to your host machine databases using `host.docker.internal`:

```yaml
environment:
  POSTGRES_HOST: host.docker.internal
  POSTGRES_PORT: 5432
  FALKORDB_HOST: host.docker.internal
  FALKORDB_PORT: 6379
```

This special DNS name resolves to the host machine's IP address, allowing containers to access services running on the host.

### Architecture

```
┌─────────────────────────────────┐
│       Your Host Machine         │
│                                 │
│  ┌──────────────────────────┐  │
│  │  PostgreSQL :5432        │  │
│  │  FalkorDB   :6379        │  │
│  └──────────────────────────┘  │
│              ↑ ↑                │
│              │ │                │
│  ┌───────────┴─┴─────────────┐ │
│  │   Docker Containers       │ │
│  │                           │ │
│  │  Backend  :8000 ←──→ DB  │ │
│  │  Frontend :80            │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

## ⚙️ Configuration

### Environment Variables

The backend container is configured to connect to your host databases:

**docker-compose.yml:**
```yaml
backend:
  environment:
    POSTGRES_HOST: host.docker.internal
    POSTGRES_PORT: 5432
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres  # Update with your password
    POSTGRES_DB: training_db

    FALKORDB_HOST: host.docker.internal
    FALKORDB_PORT: 6379
    FALKORDB_PASSWORD: Default  # Update if you set a password
    FALKORDB_GRAPH_NAME: lms_graph
```

### Update Database Credentials

Edit `docker-compose.yml` to match your database configuration:

1. **PostgreSQL Password:**
   ```yaml
   POSTGRES_PASSWORD: your-actual-password
   ```

2. **FalkorDB Password (if set):**
   ```yaml
   FALKORDB_PASSWORD: your-falkordb-password
   ```

3. **Database Name (if different):**
   ```yaml
   POSTGRES_DB: your_database_name
   ```

## 📝 Common Commands

### Service Management

```bash
# Start both containers
docker-compose up -d

# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# Rebuild and restart
docker-compose up -d --build

# View status
docker-compose ps
```

### Logs and Monitoring

```bash
# View all logs
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend

# Frontend logs only
docker-compose logs -f frontend
```

### Debugging

```bash
# Access backend shell
docker-compose exec backend bash

# Check backend environment variables
docker-compose exec backend env | grep POSTGRES

# Test database connection from container
docker-compose exec backend python -c "
import psycopg2
conn = psycopg2.connect(
    host='host.docker.internal',
    port=5432,
    user='postgres',
    password='postgres',
    database='training_db'
)
print('PostgreSQL connection successful!')
conn.close()
"
```

## 🔍 Troubleshooting

### Backend Can't Connect to PostgreSQL

**Issue:** Backend logs show connection errors to PostgreSQL

**Solutions:**

1. **Check PostgreSQL is running:**
   ```bash
   pg_isready -h localhost -p 5432
   ```

2. **Verify PostgreSQL accepts connections from Docker:**

   Edit `postgresql.conf`:
   ```
   listen_addresses = '*'
   ```

   Edit `pg_hba.conf`:
   ```
   host    all             all             172.0.0.0/8            md5
   ```

   Restart PostgreSQL:
   ```bash
   sudo systemctl restart postgresql
   ```

3. **Check firewall:**
   ```bash
   sudo ufw allow 5432
   ```

4. **Test connection:**
   ```bash
   docker-compose exec backend nc -zv host.docker.internal 5432
   ```

### Backend Can't Connect to FalkorDB

**Issue:** Backend logs show Redis connection errors

**Solutions:**

1. **Check FalkorDB is running:**
   ```bash
   redis-cli ping
   ```

2. **Verify FalkorDB binding:**

   Check if FalkorDB/Redis is bound to all interfaces:
   ```bash
   redis-cli CONFIG GET bind
   ```

   If it returns `127.0.0.1`, update redis.conf:
   ```
   bind 0.0.0.0
   ```

3. **Check if protected mode is off:**
   ```bash
   redis-cli CONFIG GET protected-mode
   ```

   If `yes`, disable it:
   ```bash
   redis-cli CONFIG SET protected-mode no
   ```

4. **Test connection:**
   ```bash
   docker-compose exec backend nc -zv host.docker.internal 6379
   ```

### host.docker.internal Not Working

**Issue:** DNS name doesn't resolve (Linux systems)

**Solutions:**

1. **Use host IP directly:**

   Find your host IP:
   ```bash
   ip addr show docker0 | grep inet
   ```

   Update docker-compose.yml:
   ```yaml
   POSTGRES_HOST: 172.17.0.1  # Your actual docker0 IP
   FALKORDB_HOST: 172.17.0.1
   ```

2. **Or use network mode host (not recommended for production):**
   ```yaml
   backend:
     network_mode: host
   ```

### Database Already Exists Errors

**Issue:** Migrations fail because tables already exist

**Solution:**

Your databases are already set up! The backend should work with existing data. No migrations needed.

## 🚀 Production Deployment

### Step 1: Update Configuration

Edit `docker-compose.yml`:

```yaml
environment:
  # CHANGE THESE!
  SECRET_KEY: $(openssl rand -hex 32)
  JWT_SECRET_KEY: $(openssl rand -hex 32)

  # Your actual database password
  POSTGRES_PASSWORD: your-secure-password

  # Your domain
  ALLOWED_ORIGINS: https://yourdomain.com
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

### Step 3: Set Up Reverse Proxy (Optional)

For HTTPS, use nginx or Traefik:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔒 Security Considerations

### Database Security

1. **Use strong passwords:**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

2. **Restrict PostgreSQL access:**
   ```
   # pg_hba.conf
   host    training_db    postgres    172.17.0.0/16    md5
   ```

3. **Use FalkorDB password:**
   ```bash
   # In redis.conf
   requirepass your-secure-password
   ```

### Application Security

1. **Change default secrets:**
   - Update SECRET_KEY
   - Update JWT_SECRET_KEY
   - Change default user passwords

2. **Set DEBUG=False in production**

3. **Configure CORS properly:**
   ```yaml
   ALLOWED_ORIGINS: https://yourdomain.com,https://www.yourdomain.com
   ```

## 📊 Performance Considerations

### Database Connection Pooling

The backend uses connection pooling by default. You can tune it:

```python
# In backend/database/postgres.py
pool = SimpleConnectionPool(
    minconn=5,    # Minimum connections
    maxconn=20,   # Maximum connections
    ...
)
```

### Container Resources

Limit container resources if needed:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

## 🧪 Testing Connection

### Test Script

Create `test-db-connection.py`:

```python
import psycopg2
import redis

# Test PostgreSQL
try:
    conn = psycopg2.connect(
        host='localhost',
        port=5432,
        user='postgres',
        password='postgres',
        database='training_db'
    )
    print("✅ PostgreSQL connection successful!")
    conn.close()
except Exception as e:
    print(f"❌ PostgreSQL connection failed: {e}")

# Test FalkorDB/Redis
try:
    r = redis.Redis(
        host='localhost',
        port=6379,
        password='Default',
        decode_responses=True
    )
    r.ping()
    print("✅ FalkorDB connection successful!")
except Exception as e:
    print(f"❌ FalkorDB connection failed: {e}")
```

Run it:
```bash
python test-db-connection.py
```

## 📈 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Frontend
curl http://localhost/

# Container stats
docker stats
```

### Database Monitoring

```bash
# PostgreSQL connections
docker-compose exec backend bash -c "
psql -h host.docker.internal -U postgres -d training_db -c \
'SELECT count(*) FROM pg_stat_activity;'
"

# FalkorDB info
redis-cli INFO stats
```

## 🎯 Development Mode

For development with hot reload:

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Frontend: http://localhost:3000 (HMR)
# Backend: http://localhost:8000 (auto-reload)

# Code changes are reflected immediately
```

## 📚 Additional Resources

- [Docker Networking](https://docs.docker.com/network/)
- [PostgreSQL Docker Guide](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [Redis Networking](https://redis.io/docs/management/security/)

## 💬 Support

For issues:
1. Check database connectivity
2. Verify Docker network settings
3. Review container logs: `docker-compose logs`
4. Check database logs

---

**Quick Reference:**

```bash
# Start
./docker-start.sh

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Rebuild
docker-compose build
docker-compose up -d

# Test databases
psql -h localhost -U postgres -d training_db
redis-cli ping
```
