# Learning Management System (LMS)

A complete, production-ready learning platform with hierarchical course structure, employee management, quiz system, and comprehensive tracking capabilities.

## ✨ Complete System Features

### 🎯 **Full-Stack Application**
- ✅ **Backend API** - FastAPI with 30+ endpoints
- ✅ **Frontend UI** - React + TypeScript with 35+ components
- ✅ **Database** - PostgreSQL + FalkorDB (Graph DB)
- ✅ **E2E Tests** - 65+ comprehensive tests
- ✅ **Docker** - Production & development containers

### 👨‍💼 **Admin Portal**
- Content management (Tracks → SubTracks → Courses)
- Question bank with quiz builder
- Employee management and assignments
- Study resource library (external links)
- Progress reports and analytics
- Dashboard with real-time statistics

### 👨‍🎓 **Employee Portal**
- Course catalog with progress tracking
- Interactive quiz system (70% pass threshold)
- Unlimited quiz retakes
- Study resource access
- Personal training profile
- Notifications management

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Start Everything in 2 Commands

```bash
# Start all services (frontend, backend, databases)
./docker-start.sh

# Or manually
docker-compose up -d
```

**Access the application:**
- 🌐 Frontend: http://localhost
- 🔧 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs

**Login:**
- Admin: `admin` / `admin123`
- Employee: `employee` / `employee123`

That's it! The entire system is running.

### Stop Services

```bash
./docker-stop.sh

# Or manually
docker-compose down
```

📖 **Detailed Docker guide**: [DOCKER_README.md](DOCKER_README.md)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  User Browser                       │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │   Frontend (React)   │
         │   - TypeScript       │
         │   - Tailwind CSS     │
         │   - Vite            │
         └───────────┬──────────┘
                     │ API Calls
         ┌───────────▼──────────┐
         │   Backend (FastAPI)  │
         │   - JWT Auth         │
         │   - REST API         │
         └─────┬──────────┬─────┘
               │          │
       ┌───────▼──┐   ┌──▼──────┐
       │PostgreSQL│   │FalkorDB │
       │(User Data│   │(Graph)  │
       └──────────┘   └─────────┘
```

### Tech Stack

**Backend:**
- FastAPI 0.104.1 (Python)
- PostgreSQL 15 (Relational DB)
- FalkorDB (Graph DB)
- JWT Authentication
- bcrypt Password Hashing

**Frontend:**
- React 18.2
- TypeScript 5.2
- Tailwind CSS 3.3
- Vite 5.0
- React Router 6
- Axios

**Testing:**
- pytest 7.4.3
- pytest-asyncio
- httpx
- 65+ E2E tests

**Deployment:**
- Docker & Docker Compose
- Multi-stage builds
- Production optimized
- Health checks

## 📦 Installation Options

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd training-app

# Start everything
./docker-start.sh
# Select production (option 1) or development (option 2)
```

### Option 2: Manual Setup

#### Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Setup databases (PostgreSQL + FalkorDB)
# See DOCKER_README.md for database setup

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start server
uvicorn backend.main:app --reload
```

#### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:8000

# Start development server
npm run dev
```

## 🎯 Features Overview

### Admin Dashboard
- **System Overview** - Statistics and quick access
- **Track Management** - Create learning paths
- **Course Management** - Build course catalog
- **Study Resources** - Add external links (docs, videos)
- **Question Bank** - Create quiz questions (A/B/C/D)
- **Employee Management** - User accounts and assignments
- **Assignments** - Link employees to tracks/courses
- **Reports** - Progress and completion analytics

### Employee Dashboard
- **Course Catalog** - All assigned courses
- **Course Details** - Study materials and resources
- **Quiz System** - Interactive assessments
- **Results** - Instant scoring with pass/fail
- **Progress Tracking** - Visual completion status
- **Profile** - Training overview and statistics
- **Notifications** - System messages

### Quiz System
- Multiple choice questions (A/B/C/D)
- Configurable passing score (default 70%)
- Unlimited retakes allowed
- Attempt tracking
- Instant results
- Score history

## 📚 Documentation

- **[COMPLETE_PROJECT_SUMMARY.md](COMPLETE_PROJECT_SUMMARY.md)** - Full project overview
- **[DOCKER_README.md](DOCKER_README.md)** - Complete Docker guide
- **[DOCKER_SUMMARY.md](DOCKER_SUMMARY.md)** - Docker quick reference
- **[FRONTEND_SUMMARY.md](FRONTEND_SUMMARY.md)** - Frontend architecture
- **[E2E_TESTS_SUMMARY.md](E2E_TESTS_SUMMARY.md)** - Testing guide
- **[frontend/README.md](frontend/README.md)** - Frontend setup
- **[tests/README.md](tests/README.md)** - Test documentation

## 🧪 Testing

### Run E2E Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=backend --cov-report=html

# Specific categories
pytest -m auth        # Authentication tests
pytest -m admin       # Admin tests
pytest -m employee    # Employee tests
pytest -m integration # Integration tests

# Verbose output
pytest -v
```

### Test Coverage
- **65+ test methods**
- **100% endpoint coverage**
- Complete user journey tests
- Integration tests
- Concurrent operation tests

## 🔐 Security

- ✅ JWT token authentication
- ✅ bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ CORS configuration
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Security headers (nginx)
- ✅ Environment-based secrets

## 📊 Database Schema

### PostgreSQL Tables
- `users` - Employee and admin accounts
- `courses` - Course metadata
- `enrollments` - Course assignments
- `quiz_attempts` - Quiz history and scores
- `notifications` - System notifications

### FalkorDB (Graph)
```
Track → SubTrack → Course → Questions
  └─── Employee Assignments
```

## 🌐 API Endpoints

### Authentication (3 endpoints)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Admin (15+ endpoints)
- Track/SubTrack/Course CRUD
- Question management
- Employee management
- Assignment operations
- Progress reports

### Employee (7+ endpoints)
- View courses
- Access study materials
- Take quizzes
- View progress
- Manage notifications

**Interactive API Docs:** http://localhost:8000/docs

## 🚀 Deployment

### Docker Deployment (Production)

```bash
# 1. Clone repository
git clone <your-repo>
cd training-app

# 2. Update environment variables
# Edit docker-compose.yml:
# - Change SECRET_KEY
# - Change JWT_SECRET_KEY
# - Change POSTGRES_PASSWORD
# - Update ALLOWED_ORIGINS

# 3. Start services
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f

# Access at http://your-server
```

### Cloud Deployment

Works with:
- AWS ECS / Fargate
- Google Cloud Run
- Azure Container Instances
- DigitalOcean Apps
- Heroku
- Any VPS with Docker

See [DOCKER_README.md](DOCKER_README.md) for detailed deployment guides.

## 🔧 Configuration

### Environment Variables

Key variables (in `docker-compose.yml` or `.env`):

```bash
# Security (CHANGE IN PRODUCTION!)
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# Database
POSTGRES_HOST=postgres
POSTGRES_PASSWORD=postgres
FALKORDB_HOST=falkordb

# CORS (add your domain)
ALLOWED_ORIGINS=http://localhost,https://yourdomain.com

# Quiz
QUIZ_PASSING_SCORE=70.0
```

Generate secure keys:
```bash
openssl rand -hex 32  # For SECRET_KEY
openssl rand -hex 32  # For JWT_SECRET_KEY
```

## 📁 Project Structure

```
training-app/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry
│   ├── config.py           # Settings
│   ├── routers/            # API endpoints
│   ├── models/             # Pydantic schemas
│   ├── database/           # DB connections
│   └── utils/              # Helpers
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   └── types/          # TypeScript types
│   └── package.json
├── tests/                  # E2E tests
│   ├── conftest.py         # Test fixtures
│   └── test_*.py           # Test files
├── Dockerfile.backend      # Backend container
├── Dockerfile.frontend     # Frontend container
├── docker-compose.yml      # Production orchestration
├── docker-compose.dev.yml  # Development orchestration
├── docker-start.sh         # Start script
├── docker-stop.sh          # Stop script
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 📈 Development

### Development Mode (with hot reload)

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Frontend: http://localhost:3000 (HMR enabled)
# Backend: http://localhost:8000 (auto-reload)

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop
docker-compose -f docker-compose.dev.yml down
```

### Code Changes
- **Backend**: Changes auto-reload (dev mode)
- **Frontend**: Hot Module Replacement (HMR)
- **Database**: Volume persistence

## 🎨 User Interface

### Admin Screens
1. Dashboard - System overview
2. Tracks - Learning path management
3. Courses - Course catalog
4. Employees - User management
5. Questions - Quiz builder
6. Reports - Analytics

### Employee Screens
1. Dashboard - Personal overview
2. Courses - Course catalog
3. Course Detail - Study materials
4. Quiz - Interactive assessment
5. Profile - Progress tracking

## 🔍 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Frontend (nginx)
curl http://localhost/

# Database (PostgreSQL)
docker-compose exec postgres pg_isready

# FalkorDB
docker-compose exec falkordb redis-cli ping
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

## 🛠️ Troubleshooting

### Common Issues

**Port already in use:**
```bash
sudo lsof -i :8000  # Backend
sudo lsof -i :80    # Frontend
```

**Database connection failed:**
```bash
docker-compose logs postgres
docker-compose restart postgres
```

**Frontend not loading:**
```bash
docker-compose logs frontend
docker-compose build frontend
docker-compose up -d frontend
```

See [DOCKER_README.md](DOCKER_README.md) for detailed troubleshooting.

## 📊 Statistics

- **Total Files**: 80+ files
- **Lines of Code**: 10,000+ lines
- **API Endpoints**: 30+
- **E2E Tests**: 65+ tests
- **UI Components**: 12+ reusable components
- **Pages**: 10+ complete pages
- **Docker Services**: 4 containers

## 🎯 Roadmap

### ✅ Completed
- Backend API (FastAPI)
- Frontend UI (React + TypeScript)
- Authentication & Authorization
- Quiz system
- Progress tracking
- E2E testing suite
- Docker containerization
- Production deployment

### 🔄 Future Enhancements
- Real-time notifications (WebSockets)
- Email notifications
- Course deadlines
- Certificate generation
- Advanced analytics
- Mobile app (React Native)
- Video integration
- File uploads
- Dark mode
- i18n support

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 💬 Support

For help and questions:
- 📖 Check documentation files
- 🐛 Create an issue on GitHub
- 📧 Contact the team

## 🙏 Acknowledgments

- FastAPI team
- React community
- FalkorDB developers
- PostgreSQL community
- Docker team
- All contributors

---

## 🎊 Quick Command Reference

```bash
# Start (Production)
./docker-start.sh              # Interactive
docker-compose up -d           # Manual

# Start (Development)
docker-compose -f docker-compose.dev.yml up -d

# Stop
./docker-stop.sh               # Interactive
docker-compose down            # Manual

# Logs
docker-compose logs -f

# Database
docker-compose exec postgres psql -U postgres
docker-compose exec falkordb redis-cli

# Rebuild
docker-compose build
docker-compose up -d --build

# Tests
pytest                         # All tests
pytest -v                      # Verbose
pytest -m admin               # Admin tests only
pytest --cov=backend          # With coverage

# Cleanup
docker-compose down -v        # Remove everything
docker system prune -a        # Clean Docker
```

---

**Built with ❤️ for effective learning management**

**Status:** ✅ Production Ready | 🚀 Fully Deployed | 📦 Dockerized | 🧪 Tested | 📚 Documented
