"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Literal
from datetime import datetime
from decimal import Decimal


# ============================================================================
# AUTHENTICATION MODELS
# ============================================================================

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    employee_id: Optional[str] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ============================================================================
# EMPLOYEE MODELS
# ============================================================================

class EmployeeBase(BaseModel):
    employee_name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    department: Optional[str] = Field(None, max_length=100)
    role: Literal["admin", "employee"] = "employee"


class EmployeeCreate(EmployeeBase):
    employee_id: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=6)


class EmployeeUpdate(BaseModel):
    employee_name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    department: Optional[str] = Field(None, max_length=100)


class EmployeeResponse(EmployeeBase):
    employee_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# TRACK MODELS
# ============================================================================

class TrackCreate(BaseModel):
    track_id: str = Field(..., min_length=1, max_length=50)
    track_name: str = Field(..., min_length=1, max_length=255)


class TrackResponse(BaseModel):
    track_id: str
    track_name: str


# ============================================================================
# SUBTRACK MODELS
# ============================================================================

class SubTrackCreate(BaseModel):
    subtrack_id: str = Field(..., min_length=1, max_length=50)
    subtrack_name: str = Field(..., min_length=1, max_length=255)
    track_id: str = Field(..., min_length=1, max_length=50)


class SubTrackResponse(BaseModel):
    subtrack_id: str
    subtrack_name: str
    track_id: str


# ============================================================================
# COURSE MODELS
# ============================================================================

class CourseCreate(BaseModel):
    course_id: str = Field(..., min_length=1, max_length=50)
    course_name: str = Field(..., min_length=1, max_length=255)
    parent_type: Literal["track", "subtrack", "course"]
    parent_id: str = Field(..., min_length=1, max_length=50)


class CourseResponse(BaseModel):
    course_id: str
    course_name: str


class CourseDetail(CourseResponse):
    links: List[str] = []
    questions: List[str] = []


# ============================================================================
# LINK MODELS
# ============================================================================

class LinkCreate(BaseModel):
    link_id: str = Field(..., min_length=1, max_length=50)
    link_url: str = Field(..., min_length=1)
    course_id: str = Field(..., min_length=1, max_length=50)


class LinkResponse(BaseModel):
    link_id: str
    link_url: str


# ============================================================================
# QUESTION MODELS
# ============================================================================

class QuestionCreate(BaseModel):
    question_id: str = Field(..., min_length=1, max_length=50)
    question_text: str = Field(..., min_length=1)
    option_a: str = Field(..., min_length=1)
    option_b: str = Field(..., min_length=1)
    option_c: str = Field(..., min_length=1)
    option_d: str = Field(..., min_length=1)
    correct_answer: Literal["A", "B", "C", "D"]


class QuestionResponse(BaseModel):
    question_id: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

    class Config:
        from_attributes = True


class QuestionWithAnswer(QuestionResponse):
    correct_answer: Literal["A", "B", "C", "D"]

    class Config:
        from_attributes = True


# ============================================================================
# ASSIGNMENT MODELS
# ============================================================================

class AssignmentCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50)
    assignment_type: Literal["track", "subtrack", "course"]
    assignment_id: str = Field(..., min_length=1, max_length=50)


class AssignmentResponse(BaseModel):
    employee_id: str
    assignment_type: str
    assignment_id: str
    message: str


# ============================================================================
# QUIZ MODELS
# ============================================================================

class QuizAnswer(BaseModel):
    question_id: str
    selected_answer: Literal["A", "B", "C", "D"]


class QuizSubmission(BaseModel):
    course_id: str
    answers: List[QuizAnswer]


class QuizResult(BaseModel):
    attempt_id: int
    course_id: str
    attempt_number: int
    score: Decimal
    total_questions: int
    correct_answers: int
    passed: bool
    passing_score: Decimal
    attempted_at: datetime
    incorrect_questions: List[dict] = []

    class Config:
        from_attributes = True


# ============================================================================
# PROGRESS MODELS
# ============================================================================

class CourseProgress(BaseModel):
    progress_id: int
    course_id: str
    course_name: Optional[str] = None
    assignment_type: str
    assignment_id: str
    status: Literal["assigned", "in_progress", "completed", "failed"]
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    time_taken_minutes: Optional[int] = None

    class Config:
        from_attributes = True


class EmployeeProgressReport(BaseModel):
    employee_id: str
    employee_name: str
    email: str
    department: Optional[str] = None
    total_courses_assigned: int
    courses_completed: int
    courses_in_progress: int
    courses_not_started: int
    completion_rate: Optional[Decimal] = None
    avg_time_minutes: Optional[Decimal] = None


class CourseStatistics(BaseModel):
    course_id: str
    course_name: Optional[str] = None
    total_employees_assigned: int
    employees_completed: int
    employees_in_progress: int
    employees_failed: int
    avg_quiz_score: Optional[Decimal] = None
    avg_time_minutes: Optional[Decimal] = None


# ============================================================================
# NOTIFICATION MODELS
# ============================================================================

class NotificationCreate(BaseModel):
    employee_id: str
    notification_type: Literal["course_assigned", "reminder", "deadline"]
    title: str
    message: str
    course_id: Optional[str] = None


class NotificationResponse(BaseModel):
    notification_id: int
    notification_type: str
    title: str
    message: str
    course_id: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
