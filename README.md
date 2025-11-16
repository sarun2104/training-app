# Learning Management System (LMS)

A comprehensive track-based learning platform with hierarchical course structure, employee assignments, and progress tracking.

## 🚀 Features

### **Admin Capabilities**
- **Content Management**: Create and manage Tracks, SubTracks, and Courses
- **Question Bank**: Build and maintain quiz questions with multiple choice options
- **Employee Management**: Create employees and assign them to learning paths
- **Flexible Assignments**: Assign employees at Track, SubTrack, or Course level
- **Comprehensive Reporting**: View progress by employee, course, or track
- **Push Notifications**: Automated notifications for course assignments

### **Employee Capabilities**
- **Course Access**: View all assigned courses based on Track/SubTrack/Course assignments
- **Study Resources**: Access curated learning materials (URLs) for each course
- **Interactive Quizzes**: Take assessments with instant feedback
- **Unlimited Retakes**: Retake failed quizzes with attempt tracking
- **Progress Tracking**: Monitor completion status and scores
- **Training Profile**: View overall progress and achievements

## 🏗️ Architecture

### **Tech Stack**
- **Backend**: FastAPI (Python)
- **Graph Database**: FalkorDB (Redis Graph) - Hierarchical learning structure
- **Relational Database**: PostgreSQL - Employee data, questions, and progress
- **Authentication**: JWT tokens with bcrypt password hashing

### **Database Design**

#### **FalkorDB (Graph Database)**
Stores hierarchical learning structure:
```
Track → SubTrack → Course → Course (child) → Links/Questions

Employees → [assigned_track/assigned_subtrack/assigned_course]
```

#### **PostgreSQL (Relational Database)**
Stores:
- Employee information and credentials
- Question bank with answers
- Course progress tracking
- Quiz attempts and responses
- Notifications

## 📋 Prerequisites

- **Python 3.9+**
- **PostgreSQL 12+** (running on localhost:5432)
- **FalkorDB** (or RedisGraph) (running on localhost:6379)
- **pip** (Python package manager)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd training-app
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env and update database credentials if needed
```

**Important environment variables:**
- `SECRET_KEY`: Application secret (change in production)
- `JWT_SECRET_KEY`: JWT signing key (change in production)
- `POSTGRES_*`: PostgreSQL connection settings
- `FALKORDB_*`: FalkorDB connection settings

### 5. Start Database Services

**PostgreSQL:**
```bash
# Make sure PostgreSQL is running
sudo systemctl start postgresql
# Or using Docker:
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:15
```

**FalkorDB:**
```bash
# Using Docker (recommended):
docker run -d --name falkordb \
  -p 6379:6379 \
  falkordb/falkordb:latest
```

### 6. Initialize Databases
```bash
python scripts/setup_database.py
```

This script will:
- Create PostgreSQL database and tables
- Insert sample data (admin user, questions)
- Initialize FalkorDB graph structure
- Create sample learning hierarchy

### 7. Start the Server
```bash
python scripts/run_server.py
```

The API will be available at:
- **API Server**: http://localhost:8000
- **Interactive API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 🔐 Default Credentials

### Admin User
- **Email**: admin@company.com
- **Password**: admin123

### Employee User
- **Email**: john.doe@company.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change these passwords in production!

## 📚 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### **Admin Endpoints**
- `POST /api/admin/tracks` - Create Track
- `POST /api/admin/subtracks` - Create SubTrack
- `POST /api/admin/courses` - Create Course
- `POST /api/admin/links` - Add link to course
- `POST /api/admin/questions` - Create question
- `POST /api/admin/courses/{course_id}/questions/{question_id}` - Assign question to course
- `POST /api/admin/employees` - Create employee
- `POST /api/admin/assignments` - Assign employee to Track/SubTrack/Course
- `GET /api/admin/reports/employee/{employee_id}` - Employee progress report
- `GET /api/admin/reports/course/{course_id}` - Course statistics

### **Employee Endpoints**
- `GET /api/employee/courses` - Get all assigned courses
- `GET /api/employee/courses/{course_id}` - Get course details
- `POST /api/employee/courses/{course_id}/start` - Start a course
- `GET /api/employee/courses/{course_id}/quiz` - Get quiz questions
- `POST /api/employee/courses/{course_id}/quiz` - Submit quiz answers
- `GET /api/employee/profile` - Get training profile
- `GET /api/employee/notifications` - Get notifications
- `PUT /api/employee/notifications/{id}/read` - Mark notification as read

## 🎯 Usage Examples

### 1. **Admin Login**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@company.com&password=admin123"
```

### 2. **Create a Track**
```bash
curl -X POST "http://localhost:8000/api/admin/tracks" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"track_id": "T003", "track_name": "Cloud Computing"}'
```

### 3. **Assign Employee to Track**
```bash
curl -X POST "http://localhost:8000/api/admin/assignments" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "assignment_type": "track",
    "assignment_id": "T001"
  }'
```

### 4. **Employee Views Assigned Courses**
```bash
curl -X GET "http://localhost:8000/api/employee/courses" \
  -H "Authorization: Bearer <employee-token>"
```

### 5. **Take a Quiz**
```bash
curl -X POST "http://localhost:8000/api/employee/courses/C001/quiz" \
  -H "Authorization: Bearer <employee-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "C001",
    "answers": [
      {"question_id": "Q001", "selected_answer": "B"}
    ]
  }'
```

## 📊 Sample Data Structure

The setup script creates the following sample hierarchy:

```
Track: Data Science (T001)
├── SubTrack: Machine Learning (ST001)
│   ├── Course: EDA (C001)
│   │   ├── Child: Univariate Analysis (C004)
│   │   └── Child: Multivariate Analysis (C005)
│   └── Course: PCA (C002)
└── SubTrack: Deep Learning (ST002)
    └── Course: Neural Networks (C006)

Track: Foundational Skills (T002)
└── Course: Python Programming (C003)
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password storage
- **Role-Based Access Control**: Separate admin and employee permissions
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Configurable allowed origins

## 🧪 Testing

### Run Tests
```bash
pytest
```

### Test Coverage
```bash
pytest --cov=backend --cov-report=html
```

## 📁 Project Structure

```
training-app/
├── backend/
│   ├── config.py              # Application configuration
│   ├── main.py                # FastAPI application
│   ├── database/
│   │   ├── postgres.py        # PostgreSQL connection
│   │   ├── falkordb.py        # FalkorDB connection
│   │   ├── schema.sql         # PostgreSQL schema
│   │   ├── migrations.py      # Migration utilities
│   │   └── init_falkordb.py   # FalkorDB initialization
│   ├── models/
│   │   └── schemas.py         # Pydantic models
│   ├── routers/
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── admin.py           # Admin endpoints
│   │   └── employee.py        # Employee endpoints
│   └── utils/
│       └── auth.py            # Auth utilities
├── scripts/
│   ├── setup_database.py      # Database setup script
│   └── run_server.py          # Server runner
├── requirements.txt           # Python dependencies
├── .env.example               # Environment template
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | Learning Management System |
| `DEBUG` | Debug mode | True |
| `SECRET_KEY` | Application secret | (required) |
| `JWT_SECRET_KEY` | JWT signing key | (required) |
| `POSTGRES_HOST` | PostgreSQL host | localhost |
| `POSTGRES_PORT` | PostgreSQL port | 5432 |
| `POSTGRES_DB` | Database name | training_db |
| `FALKORDB_HOST` | FalkorDB host | localhost |
| `FALKORDB_PORT` | FalkorDB port | 6379 |
| `QUIZ_PASSING_SCORE` | Minimum quiz score | 70.0 |

## 🚀 Deployment

### Production Checklist

- [ ] Change default passwords
- [ ] Update `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Set `DEBUG=False`
- [ ] Configure production database credentials
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS for production domains
- [ ] Set up database backups
- [ ] Configure logging to file
- [ ] Set up monitoring and alerting

### Docker Deployment (Coming Soon)
```bash
docker-compose up -d
```

## 📈 Roadmap

### Phase 1: Core Setup ✅
- [x] Database schemas (PostgreSQL & FalkorDB)
- [x] Authentication and authorization
- [x] Basic API structure

### Phase 2: Admin Features ✅
- [x] Track/SubTrack/Course management
- [x] Question bank management
- [x] Employee assignment
- [x] Reporting endpoints

### Phase 3: Employee Features ✅
- [x] Course viewing
- [x] Quiz taking
- [x] Progress tracking
- [x] Profile view

### Phase 4: Enhancements (Planned)
- [ ] Frontend (React/Next.js)
- [ ] Real-time notifications (WebSocket)
- [ ] Email notifications
- [ ] Course deadlines
- [ ] Certificate generation
- [ ] Advanced analytics dashboard
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 💬 Support

For issues and questions:
- Create an issue on GitHub
- Contact: admin@company.com

## 🙏 Acknowledgments

- FastAPI framework
- FalkorDB team
- PostgreSQL community

---

**Built with ❤️ for effective learning management**
