# Database Schema Documentation

## Overview

The Learning Management System uses two databases:
1. **PostgreSQL**: Relational data (employees, questions, progress)
2. **FalkorDB**: Graph data (hierarchical learning structure)

---

## PostgreSQL Schema

### employees
Master employee information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| employee_id | VARCHAR(50) | PRIMARY KEY | Unique employee identifier |
| employee_name | VARCHAR(255) | NOT NULL | Employee full name |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address (used for login) |
| department | VARCHAR(100) | - | Department name |
| role | VARCHAR(50) | NOT NULL, CHECK | User role ('admin' or 'employee') |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes**: email, role

---

### question_master
Question bank with multiple choice options

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| question_id | VARCHAR(50) | PRIMARY KEY | Unique question identifier |
| question_text | TEXT | NOT NULL | Question text |
| option_a | TEXT | NOT NULL | Option A text |
| option_b | TEXT | NOT NULL | Option B text |
| option_c | TEXT | NOT NULL | Option C text |
| option_d | TEXT | NOT NULL | Option D text |
| correct_answer | CHAR(1) | NOT NULL, CHECK | Correct answer ('A', 'B', 'C', or 'D') |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes**: question_id

---

### employee_course_progress
Track employee progress on courses

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| progress_id | SERIAL | PRIMARY KEY | Auto-increment ID |
| employee_id | VARCHAR(50) | FK → employees, NOT NULL | Employee reference |
| course_id | VARCHAR(50) | NOT NULL | Course identifier (from FalkorDB) |
| assignment_type | VARCHAR(20) | NOT NULL, CHECK | 'track', 'subtrack', or 'course' |
| assignment_id | VARCHAR(50) | NOT NULL | track_id, subtrack_id, or course_id |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'assigned', CHECK | 'assigned', 'in_progress', 'completed', 'failed' |
| started_at | TIMESTAMP | - | When employee started the course |
| completed_at | TIMESTAMP | - | When employee completed the course |
| time_taken_minutes | INTEGER | - | Total time to complete course and quiz |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes**: employee_id, course_id, status
**Unique Constraint**: (employee_id, course_id)

---

### quiz_attempts
Track quiz attempts and scores

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| attempt_id | SERIAL | PRIMARY KEY | Auto-increment ID |
| employee_id | VARCHAR(50) | FK → employees, NOT NULL | Employee reference |
| course_id | VARCHAR(50) | NOT NULL | Course identifier |
| attempt_number | INTEGER | NOT NULL, DEFAULT 1 | Attempt sequence number |
| score | DECIMAL(5,2) | NOT NULL | Score as percentage (0-100) |
| total_questions | INTEGER | NOT NULL | Total questions in quiz |
| correct_answers | INTEGER | NOT NULL | Number of correct answers |
| passed | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether quiz was passed |
| passing_score | DECIMAL(5,2) | NOT NULL, DEFAULT 70.00 | Minimum score to pass (%) |
| attempted_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When quiz was attempted |

**Indexes**: employee_id, course_id, passed
**Unique Constraint**: (employee_id, course_id, attempt_number)

---

### quiz_responses
Individual question responses for each quiz attempt

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| response_id | SERIAL | PRIMARY KEY | Auto-increment ID |
| attempt_id | INTEGER | FK → quiz_attempts, NOT NULL | Quiz attempt reference |
| question_id | VARCHAR(50) | NOT NULL | Question identifier |
| selected_answer | CHAR(1) | NOT NULL, CHECK | Selected answer ('A', 'B', 'C', or 'D') |
| is_correct | BOOLEAN | NOT NULL | Whether answer was correct |
| answered_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When question was answered |

**Indexes**: attempt_id, question_id

---

### notifications
Push notifications for course assignments and reminders

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| notification_id | SERIAL | PRIMARY KEY | Auto-increment ID |
| employee_id | VARCHAR(50) | FK → employees, NOT NULL | Employee reference |
| notification_type | VARCHAR(50) | NOT NULL, CHECK | 'course_assigned', 'reminder', 'deadline' |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| course_id | VARCHAR(50) | - | Related course (optional) |
| is_read | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When notification was created |

**Indexes**: employee_id, is_read, created_at

---

## PostgreSQL Views

### v_employee_progress_summary
Employee progress summary for reporting

```sql
SELECT
    e.employee_id,
    e.employee_name,
    e.email,
    e.department,
    COUNT(DISTINCT ecp.course_id) as total_courses_assigned,
    COUNT(DISTINCT CASE WHEN ecp.status = 'completed' THEN ecp.course_id END) as courses_completed,
    COUNT(DISTINCT CASE WHEN ecp.status = 'in_progress' THEN ecp.course_id END) as courses_in_progress,
    COUNT(DISTINCT CASE WHEN ecp.status = 'assigned' THEN ecp.course_id END) as courses_not_started,
    completion_rate,
    avg_time_minutes
FROM employees e
LEFT JOIN employee_course_progress ecp ON e.employee_id = ecp.employee_id
GROUP BY e.employee_id
```

### v_course_statistics
Course completion statistics

```sql
SELECT
    ecp.course_id,
    COUNT(DISTINCT ecp.employee_id) as total_employees_assigned,
    COUNT(DISTINCT CASE WHEN ecp.status = 'completed' THEN ecp.employee_id END) as employees_completed,
    COUNT(DISTINCT CASE WHEN ecp.status = 'in_progress' THEN ecp.employee_id END) as employees_in_progress,
    COUNT(DISTINCT CASE WHEN ecp.status = 'failed' THEN ecp.employee_id END) as employees_failed,
    avg_quiz_score,
    avg_time_minutes
FROM employee_course_progress ecp
LEFT JOIN quiz_attempts qa ON ecp.employee_id = qa.employee_id
GROUP BY ecp.course_id
```

---

## FalkorDB Graph Schema

### Node Types

#### Track
Top-level learning domains
- Properties: `track_id`, `track_name`
- Example: "Data Science", "Foundational Skills"

#### SubTrack
Specialized areas within a Track
- Properties: `subtrack_id`, `subtrack_name`
- Must be connected to a Track
- Example: "Machine Learning", "Deep Learning"

#### Course
Individual learning modules
- Properties: `course_id`, `course_name`
- Can be connected to Track, SubTrack, or parent Course
- Example: "EDA", "PCA", "Python"

#### Links
Study resource URLs
- Properties: `link_id`, `link`
- Must be connected to a Course
- Example: "https://www.kaggle.com/learn/pandas"

#### Question
Assessment questions
- Properties: `question_id`
- Must be connected to a Course
- Question details stored in PostgreSQL

#### Employees
Employee assignment tracking
- Properties: `employee_id`
- Synced from PostgreSQL when assigned
- Example: "EMP001"

---

### Relationships

| From | Relationship | To | Description |
|------|--------------|-----|-------------|
| Track | has_subtrack | SubTrack | Track contains SubTracks |
| Track | has_course | Course | Track contains direct Courses |
| SubTrack | has_course | Course | SubTrack contains Courses |
| Course | has_course | Course | Course contains child Courses |
| Course | has_links | Links | Course has study resource links |
| Course | has_question | Question | Course has quiz questions |
| Employees | assigned_track | Track | Employee assigned to Track |
| Employees | assigned_subtrack | SubTrack | Employee assigned to SubTrack |
| Employees | assigned_course | Course | Employee assigned to Course |

---

### Graph Structure Example

```
(Track: Data Science)
    -[:has_subtrack]-> (SubTrack: Machine Learning)
        -[:has_course]-> (Course: EDA)
            -[:has_links]-> (Links: kaggle.com/eda)
            -[:has_question]-> (Question: Q001)
            -[:has_course]-> (Course: Univariate Analysis)
                -[:has_links]-> (Links: statology.com/univariate)
        -[:has_course]-> (Course: PCA)
    -[:has_subtrack]-> (SubTrack: Deep Learning)

(Employees: EMP001)
    -[:assigned_track]-> (Track: Data Science)
```

---

## Data Flow

### 1. Admin Creates Content
```
1. Admin creates Track in FalkorDB
2. Admin creates SubTrack in FalkorDB (linked to Track)
3. Admin creates Course in FalkorDB (linked to SubTrack)
4. Admin adds Links to Course in FalkorDB
5. Admin creates Questions in PostgreSQL
6. Admin links Questions to Course in FalkorDB
```

### 2. Admin Assigns Employee
```
1. Admin assigns Employee to Track/SubTrack/Course
2. Employee node created in FalkorDB (if not exists)
3. Assignment relationship created in FalkorDB
4. Records created in employee_course_progress (PostgreSQL)
5. Notification created in notifications (PostgreSQL)
```

### 3. Employee Takes Quiz
```
1. Employee requests quiz questions
2. Question IDs fetched from FalkorDB
3. Question details fetched from PostgreSQL
4. Employee submits answers
5. Answers compared with correct_answer in PostgreSQL
6. Score calculated
7. Record created in quiz_attempts (PostgreSQL)
8. Records created in quiz_responses (PostgreSQL)
9. employee_course_progress updated (PostgreSQL)
```

---

## Backup and Maintenance

### PostgreSQL Backup
```bash
pg_dump -h localhost -U postgres training_db > backup.sql
```

### FalkorDB Backup
```bash
redis-cli --rdb /path/to/backup.rdb
```

### Restore PostgreSQL
```bash
psql -h localhost -U postgres training_db < backup.sql
```

### Restore FalkorDB
```bash
redis-cli --rdb /path/to/backup.rdb
```
