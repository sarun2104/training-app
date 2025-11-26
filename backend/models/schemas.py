"""
Pydantic models for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Literal, Union
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


class EmployeeResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: str
    department: Optional[str] = None
    role: Literal["admin", "employee"]
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================================================
# TRACK MODELS
# ============================================================================

class TrackCreate(BaseModel):
    track_name: str = Field(..., min_length=1, max_length=255)


class TrackResponse(BaseModel):
    track_id: str
    track_name: str


# ============================================================================
# SUBTRACK MODELS
# ============================================================================

class SubTrackCreate(BaseModel):
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
    course_name: str = Field(..., min_length=1, max_length=255)
    parent_type: Literal["track", "subtrack", "course"]
    parent_id: str = Field(..., min_length=1, max_length=50)
    course_id: Optional[str] = None  # Auto-generated if not provided


class CourseUpdate(BaseModel):
    course_name: str = Field(..., min_length=1, max_length=255)


class CourseResponse(BaseModel):
    course_id: str
    course_name: str


class CourseDetail(CourseResponse):
    links: List[dict] = []
    questions: List[str] = []
    status: Optional[Literal["assigned", "in_progress", "completed", "failed"]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


# ============================================================================
# LINK MODELS
# ============================================================================

class LinkCreate(BaseModel):
    link_id: str = Field(..., min_length=1, max_length=50)
    link_url: str = Field(..., min_length=1)
    course_id: str = Field(..., min_length=1, max_length=50)


class LinkAddRequest(BaseModel):
    link_label: str = Field(..., min_length=1, max_length=255)
    link_url: str = Field(..., min_length=1)


class LinkUpdateRequest(BaseModel):
    link_label: str = Field(..., min_length=1, max_length=255)
    link_url: str = Field(..., min_length=1)


class LinkResponse(BaseModel):
    link_id: str
    link_url: str


class LinkDetailResponse(BaseModel):
    link_id: str
    link: str
    link_label: str


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
# MCQ MODELS
# ============================================================================

class MCQCreate(BaseModel):
    question_text: str = Field(..., min_length=1)
    option_a: str = Field(..., min_length=1)
    option_b: str = Field(..., min_length=1)
    option_c: str = Field(..., min_length=1)
    option_d: str = Field(..., min_length=1)
    correct_answers: List[Literal["A", "B", "C", "D"]] = Field(..., min_items=1, max_items=4)
    multiple_answer_flag: bool = False


class MCQUpdate(BaseModel):
    question_text: str = Field(..., min_length=1)
    option_a: str = Field(..., min_length=1)
    option_b: str = Field(..., min_length=1)
    option_c: str = Field(..., min_length=1)
    option_d: str = Field(..., min_length=1)
    correct_answers: List[Literal["A", "B", "C", "D"]] = Field(..., min_items=1, max_items=4)
    multiple_answer_flag: bool = False


class MCQResponse(BaseModel):
    question_id: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answers: List[str]
    multiple_answer_flag: bool
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class MCQWithoutAnswers(BaseModel):
    question_id: str
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    multiple_answer_flag: bool

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
    selected_answer: Union[Literal["A", "B", "C", "D"], List[Literal["A", "B", "C", "D"]]]


class QuizSubmission(BaseModel):
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
    due_date: Optional[str] = None

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


# ============================================================================
# EMPLOYEE PROFILE MODELS
# ============================================================================

class EmployeeProfileUpdate(BaseModel):
    brief_profile: Optional[str] = None
    primary_skills: Optional[List[str]] = None
    secondary_skills: Optional[List[str]] = None
    past_projects: Optional[List[str]] = None
    certifications: Optional[List[str]] = None


class EmployeeProfileResponse(BaseModel):
    employee_id: str
    brief_profile: Optional[str] = None
    primary_skills: List[str] = []
    secondary_skills: List[str] = []
    past_projects: List[str] = []
    certifications: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================================
# CAPSTONE MODELS
# ============================================================================

class WeeklyPlanItem(BaseModel):
    week: int
    title: str
    topics: List[str]
    tasks: List[str]
    deliverables: List[str]


class Resource(BaseModel):
    title: str
    url: str
    type: str  # "dataset", "documentation", "tutorial", etc.


class FinalDeliverable(BaseModel):
    title: str
    description: str
    requirements: List[str]


class CapstoneGuidelines(BaseModel):
    description: str
    objectives: List[str]
    weekly_plan: List[WeeklyPlanItem]
    final_deliverable: FinalDeliverable
    resources: List[Resource]


class CapstoneListItem(BaseModel):
    """Capstone summary for list view"""
    capstone_id: str
    capstone_name: str
    tags: List[str]
    duration_weeks: int

    class Config:
        from_attributes = True


class CapstoneDetail(BaseModel):
    """Full capstone details including guidelines"""
    capstone_id: str
    capstone_name: str
    tags: List[str]
    duration_weeks: int
    dataset_link: Optional[str] = None
    guidelines: CapstoneGuidelines
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
