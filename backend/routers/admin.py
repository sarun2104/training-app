"""
Admin Router
Endpoints for content management, assignments, and reporting
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging

from backend.models.schemas import (
    TrackCreate, TrackResponse,
    SubTrackCreate, SubTrackResponse,
    CourseCreate, CourseResponse,
    LinkCreate, LinkResponse,
    QuestionCreate, QuestionWithAnswer,
    AssignmentCreate, AssignmentResponse,
    EmployeeCreate, EmployeeResponse,
    EmployeeProgressReport, CourseStatistics
)
from backend.utils.auth import get_current_admin_user, get_password_hash
from backend.database import get_postgres_db, get_falkor_db
from backend.database.init_falkordb import GraphInitializer

logger = logging.getLogger(__name__)
router = APIRouter()


# ============================================================================
# TRACK MANAGEMENT
# ============================================================================

@router.post("/tracks", response_model=TrackResponse)
async def create_track(
    track: TrackCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new Track"""
    falkor_db = get_falkor_db()
    initializer = GraphInitializer(falkor_db)

    try:
        initializer.create_track(track.track_id, track.track_name)
        return TrackResponse(track_id=track.track_id, track_name=track.track_name)
    except Exception as e:
        logger.error(f"Failed to create track: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tracks", response_model=List[TrackResponse])
async def get_all_tracks(current_user: dict = Depends(get_current_admin_user)):
    """Get all tracks"""
    falkor_db = get_falkor_db()

    try:
        query = "MATCH (t:Track) RETURN t.track_id AS track_id, t.track_name AS track_name"
        result = falkor_db.execute_query(query)
        # Parse results (implementation depends on FalkorDB response format)
        # This is a placeholder - adjust based on actual response
        return []
    except Exception as e:
        logger.error(f"Failed to get tracks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# SUBTRACK MANAGEMENT
# ============================================================================

@router.post("/subtracks", response_model=SubTrackResponse)
async def create_subtrack(
    subtrack: SubTrackCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new SubTrack"""
    falkor_db = get_falkor_db()
    initializer = GraphInitializer(falkor_db)

    try:
        initializer.create_subtrack(
            subtrack.subtrack_id,
            subtrack.subtrack_name,
            subtrack.track_id
        )
        return SubTrackResponse(
            subtrack_id=subtrack.subtrack_id,
            subtrack_name=subtrack.subtrack_name,
            track_id=subtrack.track_id
        )
    except Exception as e:
        logger.error(f"Failed to create subtrack: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# COURSE MANAGEMENT
# ============================================================================

@router.post("/courses", response_model=CourseResponse)
async def create_course(
    course: CourseCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new Course"""
    falkor_db = get_falkor_db()
    initializer = GraphInitializer(falkor_db)

    try:
        initializer.create_course(
            course.course_id,
            course.course_name,
            course.parent_id,
            course.parent_type
        )
        return CourseResponse(course_id=course.course_id, course_name=course.course_name)
    except Exception as e:
        logger.error(f"Failed to create course: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# LINK MANAGEMENT
# ============================================================================

@router.post("/links", response_model=LinkResponse)
async def add_link_to_course(
    link: LinkCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Add a study resource link to a course"""
    falkor_db = get_falkor_db()
    initializer = GraphInitializer(falkor_db)

    try:
        initializer.add_link(link.link_id, link.link_url, link.course_id)
        return LinkResponse(link_id=link.link_id, link_url=link.link_url)
    except Exception as e:
        logger.error(f"Failed to add link: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# QUESTION MANAGEMENT
# ============================================================================

@router.post("/questions", response_model=QuestionWithAnswer)
async def create_question(
    question: QuestionCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new question in the question bank"""
    postgres_db = get_postgres_db()

    try:
        query = """
        INSERT INTO question_master
        (question_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        postgres_db.execute_query(query, (
            question.question_id,
            question.question_text,
            question.option_a,
            question.option_b,
            question.option_c,
            question.option_d,
            question.correct_answer
        ))

        return question
    except Exception as e:
        logger.error(f"Failed to create question: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/courses/{course_id}/questions/{question_id}")
async def assign_question_to_course(
    course_id: str,
    question_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Assign a question to a course"""
    falkor_db = get_falkor_db()
    initializer = GraphInitializer(falkor_db)

    try:
        initializer.add_question(question_id, course_id)
        return {"message": f"Question {question_id} assigned to course {course_id}"}
    except Exception as e:
        logger.error(f"Failed to assign question: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# EMPLOYEE MANAGEMENT
# ============================================================================

@router.post("/employees", response_model=EmployeeResponse)
async def create_employee(
    employee: EmployeeCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new employee"""
    postgres_db = get_postgres_db()

    try:
        password_hash = get_password_hash(employee.password)

        query = """
        INSERT INTO employees (employee_id, employee_name, email, department, role, password_hash)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING employee_id, employee_name, email, department, role, created_at, updated_at
        """
        result = postgres_db.execute_query(query, (
            employee.employee_id,
            employee.employee_name,
            employee.email,
            employee.department,
            employee.role,
            password_hash
        ), fetch=True)

        return dict(result[0])
    except Exception as e:
        logger.error(f"Failed to create employee: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# ASSIGNMENT MANAGEMENT
# ============================================================================

@router.post("/assignments", response_model=AssignmentResponse)
async def assign_employee(
    assignment: AssignmentCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Assign employee to Track, SubTrack, or Course"""
    postgres_db = get_postgres_db()
    falkor_db = get_falkor_db()
    initializer = GraphInitializer(falkor_db)

    try:
        # Create assignment in FalkorDB
        initializer.assign_employee(
            assignment.employee_id,
            assignment.assignment_type,
            assignment.assignment_id
        )

        # Get all courses accessible by this assignment
        courses = _get_accessible_courses(
            assignment.assignment_type,
            assignment.assignment_id
        )

        # Create records in employee_course_progress for each course
        for course_id in courses:
            query = """
            INSERT INTO employee_course_progress
            (employee_id, course_id, assignment_type, assignment_id, status)
            VALUES (%s, %s, %s, %s, 'assigned')
            ON CONFLICT (employee_id, course_id) DO NOTHING
            """
            postgres_db.execute_query(query, (
                assignment.employee_id,
                course_id,
                assignment.assignment_type,
                assignment.assignment_id
            ))

        # Send notification (placeholder - implement notification service)
        _send_assignment_notification(assignment.employee_id, assignment.assignment_id)

        return AssignmentResponse(
            employee_id=assignment.employee_id,
            assignment_type=assignment.assignment_type,
            assignment_id=assignment.assignment_id,
            message=f"Employee assigned successfully to {len(courses)} courses"
        )
    except Exception as e:
        logger.error(f"Failed to create assignment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _get_accessible_courses(assignment_type: str, assignment_id: str) -> List[str]:
    """Get all courses accessible by an assignment"""
    falkor_db = get_falkor_db()

    try:
        if assignment_type == "track":
            # Get all courses under track and its subtracks
            query = f"""
            MATCH (t:Track {{track_id: '{assignment_id}'}})-[:has_subtrack*0..1]->(st)
            -[:has_course*1..]->(c:Course)
            RETURN DISTINCT c.course_id AS course_id
            """
        elif assignment_type == "subtrack":
            # Get all courses under subtrack
            query = f"""
            MATCH (st:SubTrack {{subtrack_id: '{assignment_id}'}})-[:has_course*1..]->(c:Course)
            RETURN DISTINCT c.course_id AS course_id
            """
        else:  # course
            # Get course and child courses
            query = f"""
            MATCH (c:Course {{course_id: '{assignment_id}'}})-[:has_course*0..]->(child:Course)
            RETURN DISTINCT child.course_id AS course_id
            """

        result = falkor_db.execute_query(query)
        # Parse result - adjust based on actual FalkorDB response format
        # This is a placeholder
        return [assignment_id]  # Simplified for now
    except Exception as e:
        logger.error(f"Failed to get accessible courses: {e}")
        return [assignment_id]


def _send_assignment_notification(employee_id: str, assignment_id: str):
    """Send notification to employee about new assignment"""
    postgres_db = get_postgres_db()

    try:
        query = """
        INSERT INTO notifications
        (employee_id, notification_type, title, message, course_id)
        VALUES (%s, 'course_assigned', %s, %s, %s)
        """
        postgres_db.execute_query(query, (
            employee_id,
            "New Course Assigned",
            f"You have been assigned to: {assignment_id}",
            assignment_id
        ))
    except Exception as e:
        logger.error(f"Failed to send notification: {e}")


# ============================================================================
# REPORTING
# ============================================================================

@router.get("/reports/employee/{employee_id}", response_model=EmployeeProgressReport)
async def get_employee_progress_report(
    employee_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get progress report for a specific employee"""
    postgres_db = get_postgres_db()

    try:
        query = "SELECT * FROM v_employee_progress_summary WHERE employee_id = %s"
        result = postgres_db.execute_query(query, (employee_id,), fetch=True)

        if not result:
            raise HTTPException(status_code=404, detail="Employee not found")

        return dict(result[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get employee report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reports/course/{course_id}", response_model=CourseStatistics)
async def get_course_statistics(
    course_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Get statistics for a specific course"""
    postgres_db = get_postgres_db()

    try:
        query = "SELECT * FROM v_course_statistics WHERE course_id = %s"
        result = postgres_db.execute_query(query, (course_id,), fetch=True)

        if not result:
            raise HTTPException(status_code=404, detail="Course not found")

        return dict(result[0])
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get course statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))
