-- ============================================================================
-- Learning Management System - PostgreSQL Schema
-- ============================================================================

-- Drop tables if exist (for clean setup)
DROP TABLE IF EXISTS quiz_responses CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS employee_course_progress CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS question_master CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- ============================================================================
-- EMPLOYEES TABLE
-- ============================================================================
CREATE TABLE employees (
    employee_id VARCHAR(50) PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'employee')),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_role ON employees(role);

-- ============================================================================
-- QUESTION MASTER TABLE
-- ============================================================================
CREATE TABLE question_master (
    question_id VARCHAR(50) PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_question_master_id ON question_master(question_id);

-- ============================================================================
-- EMPLOYEE COURSE PROGRESS TABLE
-- ============================================================================
CREATE TABLE employee_course_progress (
    progress_id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL,
    assignment_type VARCHAR(20) NOT NULL CHECK (assignment_type IN ('track', 'subtrack', 'course')),
    assignment_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'failed')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    time_taken_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, course_id)
);

CREATE INDEX idx_progress_employee ON employee_course_progress(employee_id);
CREATE INDEX idx_progress_course ON employee_course_progress(course_id);
CREATE INDEX idx_progress_status ON employee_course_progress(status);

-- Add comment
COMMENT ON COLUMN employee_course_progress.time_taken_minutes IS 'Total time to complete course and quiz';
COMMENT ON COLUMN employee_course_progress.assignment_id IS 'track_id, subtrack_id, or course_id';

-- ============================================================================
-- QUIZ ATTEMPTS TABLE
-- ============================================================================
CREATE TABLE quiz_attempts (
    attempt_id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    score DECIMAL(5,2) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    passing_score DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, course_id, attempt_number)
);

CREATE INDEX idx_quiz_employee ON quiz_attempts(employee_id);
CREATE INDEX idx_quiz_course ON quiz_attempts(course_id);
CREATE INDEX idx_quiz_passed ON quiz_attempts(passed);

COMMENT ON COLUMN quiz_attempts.score IS 'Score as percentage (0-100)';
COMMENT ON COLUMN quiz_attempts.passing_score IS 'Minimum score to pass (%)';

-- ============================================================================
-- QUIZ RESPONSES TABLE
-- ============================================================================
CREATE TABLE quiz_responses (
    response_id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,
    question_id VARCHAR(50) NOT NULL,
    selected_answer CHAR(1) NOT NULL CHECK (selected_answer IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_responses_attempt ON quiz_responses(attempt_id);
CREATE INDEX idx_responses_question ON quiz_responses(question_id);

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('course_assigned', 'reminder', 'deadline')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    course_id VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_employee ON notifications(employee_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for employees table
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for question_master table
CREATE TRIGGER update_question_master_updated_at
    BEFORE UPDATE ON question_master
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for employee_course_progress table
CREATE TRIGGER update_progress_updated_at
    BEFORE UPDATE ON employee_course_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR REPORTING
-- ============================================================================

-- View: Employee Progress Summary
CREATE OR REPLACE VIEW v_employee_progress_summary AS
SELECT
    e.employee_id,
    e.employee_name,
    e.email,
    e.department,
    COUNT(DISTINCT ecp.course_id) as total_courses_assigned,
    COUNT(DISTINCT CASE WHEN ecp.status = 'completed' THEN ecp.course_id END) as courses_completed,
    COUNT(DISTINCT CASE WHEN ecp.status = 'in_progress' THEN ecp.course_id END) as courses_in_progress,
    COUNT(DISTINCT CASE WHEN ecp.status = 'assigned' THEN ecp.course_id END) as courses_not_started,
    ROUND(
        CAST(COUNT(DISTINCT CASE WHEN ecp.status = 'completed' THEN ecp.course_id END) AS DECIMAL) /
        NULLIF(COUNT(DISTINCT ecp.course_id), 0) * 100,
        2
    ) as completion_rate,
    AVG(ecp.time_taken_minutes) as avg_time_minutes
FROM employees e
LEFT JOIN employee_course_progress ecp ON e.employee_id = ecp.employee_id
GROUP BY e.employee_id, e.employee_name, e.email, e.department;

-- View: Course Completion Statistics
CREATE OR REPLACE VIEW v_course_statistics AS
SELECT
    ecp.course_id,
    COUNT(DISTINCT ecp.employee_id) as total_employees_assigned,
    COUNT(DISTINCT CASE WHEN ecp.status = 'completed' THEN ecp.employee_id END) as employees_completed,
    COUNT(DISTINCT CASE WHEN ecp.status = 'in_progress' THEN ecp.employee_id END) as employees_in_progress,
    COUNT(DISTINCT CASE WHEN ecp.status = 'failed' THEN ecp.employee_id END) as employees_failed,
    ROUND(
        AVG(CASE WHEN qa.passed = TRUE THEN qa.score END),
        2
    ) as avg_quiz_score,
    AVG(ecp.time_taken_minutes) as avg_time_minutes
FROM employee_course_progress ecp
LEFT JOIN quiz_attempts qa ON ecp.employee_id = qa.employee_id AND ecp.course_id = qa.course_id
GROUP BY ecp.course_id;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION)
-- Password hash generated using bcrypt
INSERT INTO employees (employee_id, employee_name, email, department, role, password_hash)
VALUES
    ('ADMIN001', 'System Admin', 'admin@company.com', 'IT', 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJw5rKL8K'),
    ('EMP001', 'John Doe', 'john.doe@company.com', 'Engineering', 'employee', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqJw5rKL8K')
ON CONFLICT (employee_id) DO NOTHING;

-- Insert sample questions
INSERT INTO question_master (question_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
VALUES
    ('Q001', 'What is Exploratory Data Analysis?',
     'A method to clean data',
     'A method to understand data through visualizations',
     'A method to build models',
     'A method to deploy models',
     'B'),
    ('Q002', 'What does PCA stand for?',
     'Primary Component Analysis',
     'Principal Component Analysis',
     'Primary Calculation Algorithm',
     'Principal Calculation Analysis',
     'B'),
    ('Q003', 'Which of the following is NOT a Python data type?',
     'Integer',
     'String',
     'Character',
     'List',
     'C')
ON CONFLICT (question_id) DO NOTHING;
