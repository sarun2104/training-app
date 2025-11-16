# API Documentation

Complete API reference for the Learning Management System.

## Base URL
```
http://localhost:8000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Get Token
**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "username": "admin@company.com",
  "password": "admin123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

## Admin Endpoints

### 1. Create Track
**Endpoint**: `POST /api/admin/tracks`
**Auth**: Admin required

**Request**:
```json
{
  "track_id": "T001",
  "track_name": "Data Science"
}
```

**Response**:
```json
{
  "track_id": "T001",
  "track_name": "Data Science"
}
```

### 2. Create SubTrack
**Endpoint**: `POST /api/admin/subtracks`
**Auth**: Admin required

**Request**:
```json
{
  "subtrack_id": "ST001",
  "subtrack_name": "Machine Learning",
  "track_id": "T001"
}
```

**Response**:
```json
{
  "subtrack_id": "ST001",
  "subtrack_name": "Machine Learning",
  "track_id": "T001"
}
```

### 3. Create Course
**Endpoint**: `POST /api/admin/courses`
**Auth**: Admin required

**Request**:
```json
{
  "course_id": "C001",
  "course_name": "Exploratory Data Analysis",
  "parent_type": "subtrack",
  "parent_id": "ST001"
}
```

**parent_type** options: `"track"`, `"subtrack"`, `"course"`

**Response**:
```json
{
  "course_id": "C001",
  "course_name": "Exploratory Data Analysis"
}
```

### 4. Add Link to Course
**Endpoint**: `POST /api/admin/links`
**Auth**: Admin required

**Request**:
```json
{
  "link_id": "L001",
  "link_url": "https://www.kaggle.com/learn/pandas",
  "course_id": "C001"
}
```

**Response**:
```json
{
  "link_id": "L001",
  "link_url": "https://www.kaggle.com/learn/pandas"
}
```

### 5. Create Question
**Endpoint**: `POST /api/admin/questions`
**Auth**: Admin required

**Request**:
```json
{
  "question_id": "Q001",
  "question_text": "What is Exploratory Data Analysis?",
  "option_a": "A method to clean data",
  "option_b": "A method to understand data through visualizations",
  "option_c": "A method to build models",
  "option_d": "A method to deploy models",
  "correct_answer": "B"
}
```

**Response**:
```json
{
  "question_id": "Q001",
  "question_text": "What is Exploratory Data Analysis?",
  "option_a": "A method to clean data",
  "option_b": "A method to understand data through visualizations",
  "option_c": "A method to build models",
  "option_d": "A method to deploy models",
  "correct_answer": "B"
}
```

### 6. Assign Question to Course
**Endpoint**: `POST /api/admin/courses/{course_id}/questions/{question_id}`
**Auth**: Admin required

**Response**:
```json
{
  "message": "Question Q001 assigned to course C001"
}
```

### 7. Create Employee
**Endpoint**: `POST /api/admin/employees`
**Auth**: Admin required

**Request**:
```json
{
  "employee_id": "EMP002",
  "employee_name": "Jane Smith",
  "email": "jane.smith@company.com",
  "department": "Data Science",
  "role": "employee",
  "password": "secure_password123"
}
```

**Response**:
```json
{
  "employee_id": "EMP002",
  "employee_name": "Jane Smith",
  "email": "jane.smith@company.com",
  "department": "Data Science",
  "role": "employee",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

### 8. Assign Employee
**Endpoint**: `POST /api/admin/assignments`
**Auth**: Admin required

**Request**:
```json
{
  "employee_id": "EMP001",
  "assignment_type": "track",
  "assignment_id": "T001"
}
```

**assignment_type** options: `"track"`, `"subtrack"`, `"course"`

**Response**:
```json
{
  "employee_id": "EMP001",
  "assignment_type": "track",
  "assignment_id": "T001",
  "message": "Employee assigned successfully to 5 courses"
}
```

### 9. Employee Progress Report
**Endpoint**: `GET /api/admin/reports/employee/{employee_id}`
**Auth**: Admin required

**Response**:
```json
{
  "employee_id": "EMP001",
  "employee_name": "John Doe",
  "email": "john.doe@company.com",
  "department": "Engineering",
  "total_courses_assigned": 5,
  "courses_completed": 2,
  "courses_in_progress": 2,
  "courses_not_started": 1,
  "completion_rate": 40.00,
  "avg_time_minutes": 45.50
}
```

### 10. Course Statistics
**Endpoint**: `GET /api/admin/reports/course/{course_id}`
**Auth**: Admin required

**Response**:
```json
{
  "course_id": "C001",
  "course_name": "Exploratory Data Analysis",
  "total_employees_assigned": 10,
  "employees_completed": 7,
  "employees_in_progress": 2,
  "employees_failed": 1,
  "avg_quiz_score": 82.50,
  "avg_time_minutes": 50.00
}
```

---

## Employee Endpoints

### 1. Get My Courses
**Endpoint**: `GET /api/employee/courses`
**Auth**: Employee required

**Response**:
```json
[
  {
    "progress_id": 1,
    "course_id": "C001",
    "course_name": "Exploratory Data Analysis",
    "assignment_type": "track",
    "assignment_id": "T001",
    "status": "in_progress",
    "started_at": "2024-01-15T10:00:00",
    "completed_at": null,
    "time_taken_minutes": null
  }
]
```

**Status values**: `"assigned"`, `"in_progress"`, `"completed"`, `"failed"`

### 2. Get Course Detail
**Endpoint**: `GET /api/employee/courses/{course_id}`
**Auth**: Employee required

**Response**:
```json
{
  "course_id": "C001",
  "course_name": "Exploratory Data Analysis",
  "links": [
    "https://www.kaggle.com/learn/pandas",
    "https://www.statology.org/eda/"
  ],
  "questions": ["Q001", "Q002"]
}
```

### 3. Start Course
**Endpoint**: `POST /api/employee/courses/{course_id}/start`
**Auth**: Employee required

**Response**:
```json
{
  "message": "Course started successfully"
}
```

### 4. Get Quiz Questions
**Endpoint**: `GET /api/employee/courses/{course_id}/quiz`
**Auth**: Employee required

**Response**:
```json
[
  {
    "question_id": "Q001",
    "question_text": "What is Exploratory Data Analysis?",
    "option_a": "A method to clean data",
    "option_b": "A method to understand data through visualizations",
    "option_c": "A method to build models",
    "option_d": "A method to deploy models"
  }
]
```

**Note**: Correct answers are NOT included in this response

### 5. Submit Quiz
**Endpoint**: `POST /api/employee/courses/{course_id}/quiz`
**Auth**: Employee required

**Request**:
```json
{
  "course_id": "C001",
  "answers": [
    {
      "question_id": "Q001",
      "selected_answer": "B"
    }
  ]
}
```

**Response**:
```json
{
  "attempt_id": 1,
  "course_id": "C001",
  "attempt_number": 1,
  "score": 100.00,
  "total_questions": 1,
  "correct_answers": 1,
  "passed": true,
  "passing_score": 70.00,
  "attempted_at": "2024-01-15T11:00:00",
  "incorrect_questions": []
}
```

**Incorrect Questions Format** (if any):
```json
{
  "incorrect_questions": [
    {
      "question_id": "Q002",
      "question_text": "What does PCA stand for?",
      "selected_answer": "A",
      "correct_answer": "B",
      "options": {
        "A": "Primary Component Analysis",
        "B": "Principal Component Analysis",
        "C": "Primary Calculation Algorithm",
        "D": "Principal Calculation Analysis"
      }
    }
  ]
}
```

### 6. Get My Profile
**Endpoint**: `GET /api/employee/profile`
**Auth**: Employee required

**Response**:
```json
{
  "employee_id": "EMP001",
  "employee_name": "John Doe",
  "email": "john.doe@company.com",
  "department": "Engineering",
  "total_courses_assigned": 5,
  "courses_completed": 2,
  "courses_in_progress": 2,
  "courses_not_started": 1,
  "completion_rate": 40.00,
  "avg_time_minutes": 45.50
}
```

### 7. Get Notifications
**Endpoint**: `GET /api/employee/notifications`
**Auth**: Employee required

**Response**:
```json
[
  {
    "notification_id": 1,
    "notification_type": "course_assigned",
    "title": "New Course Assigned",
    "message": "You have been assigned to: T001",
    "course_id": "T001",
    "is_read": false,
    "created_at": "2024-01-15T09:00:00"
  }
]
```

### 8. Mark Notification as Read
**Endpoint**: `PUT /api/employee/notifications/{notification_id}/read`
**Auth**: Employee required

**Response**:
```json
{
  "message": "Notification marked as read"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Admin access required"
}
```

### 404 Not Found
```json
{
  "detail": "Employee not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Database connection failed"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Testing with cURL

### Login
```bash
TOKEN=$(curl -s -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@company.com&password=admin123" \
  | jq -r '.access_token')
```

### Use Token
```bash
curl -X GET "http://localhost:8000/api/employee/courses" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Interactive Documentation

Visit http://localhost:8000/docs for interactive Swagger UI documentation where you can test all endpoints directly from your browser.
