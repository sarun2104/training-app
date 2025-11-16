"""
Employee Router
Endpoints for viewing courses, taking quizzes, and managing profile
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
import logging

from backend.models.schemas import (
    CourseProgress,
    CourseDetail,
    QuestionResponse,
    QuizSubmission,
    QuizResult,
    EmployeeProgressReport,
    NotificationResponse
)
from backend.utils.auth import get_current_user
from backend.database import get_postgres_db, get_falkor_db
from backend.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


# ============================================================================
# COURSE ACCESS
# ============================================================================

@router.get("/courses", response_model=List[CourseProgress])
async def get_my_courses(current_user: dict = Depends(get_current_user)):
    """Get all courses assigned to the current employee"""
    postgres_db = get_postgres_db()

    try:
        query = """
        SELECT progress_id, course_id, assignment_type, assignment_id,
               status, started_at, completed_at, time_taken_minutes
        FROM employee_course_progress
        WHERE employee_id = %s
        ORDER BY created_at DESC
        """
        result = postgres_db.execute_query(query, (current_user["employee_id"],), fetch=True)

        courses = []
        for row in result:
            course_dict = dict(row)
            # Get course name from FalkorDB
            course_name = _get_course_name(course_dict["course_id"])
            course_dict["course_name"] = course_name
            courses.append(course_dict)

        return courses
    except Exception as e:
        logger.error(f"Failed to get courses: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/courses/{course_id}", response_model=CourseDetail)
async def get_course_detail(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed information about a specific course"""
    postgres_db = get_postgres_db()
    falkor_db = get_falkor_db()

    # Verify employee has access to this course
    query = """
    SELECT 1 FROM employee_course_progress
    WHERE employee_id = %s AND course_id = %s
    """
    result = postgres_db.execute_query(query, (current_user["employee_id"], course_id), fetch=True)

    if not result:
        raise HTTPException(status_code=403, detail="Access denied to this course")

    try:
        # Get course name and links from FalkorDB
        course_name = _get_course_name(course_id)
        links = _get_course_links(course_id)
        questions = _get_course_questions(course_id)

        return CourseDetail(
            course_id=course_id,
            course_name=course_name,
            links=links,
            questions=questions
        )
    except Exception as e:
        logger.error(f"Failed to get course detail: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/courses/{course_id}/start")
async def start_course(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark course as started (in_progress)"""
    postgres_db = get_postgres_db()

    try:
        query = """
        UPDATE employee_course_progress
        SET status = 'in_progress',
            started_at = COALESCE(started_at, CURRENT_TIMESTAMP)
        WHERE employee_id = %s AND course_id = %s
        RETURNING progress_id
        """
        result = postgres_db.execute_query(query, (current_user["employee_id"], course_id), fetch=True)

        if not result:
            raise HTTPException(status_code=404, detail="Course assignment not found")

        return {"message": "Course started successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to start course: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# QUIZ
# ============================================================================

@router.get("/courses/{course_id}/quiz", response_model=List[QuestionResponse])
async def get_quiz_questions(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get quiz questions for a course (without correct answers)"""
    postgres_db = get_postgres_db()

    # Verify access
    query = """
    SELECT 1 FROM employee_course_progress
    WHERE employee_id = %s AND course_id = %s
    """
    result = postgres_db.execute_query(query, (current_user["employee_id"], course_id), fetch=True)

    if not result:
        raise HTTPException(status_code=403, detail="Access denied to this course")

    try:
        # Get question IDs from FalkorDB
        question_ids = _get_course_questions(course_id)

        if not question_ids:
            raise HTTPException(status_code=404, detail="No questions found for this course")

        # Get question details from PostgreSQL (without correct answers)
        placeholders = ",".join(["%s"] * len(question_ids))
        query = f"""
        SELECT question_id, question_text, option_a, option_b, option_c, option_d
        FROM question_master
        WHERE question_id IN ({placeholders})
        """
        result = postgres_db.execute_query(query, tuple(question_ids), fetch=True)

        return [dict(row) for row in result]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get quiz questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/courses/{course_id}/quiz", response_model=QuizResult)
async def submit_quiz(
    course_id: str,
    submission: QuizSubmission,
    current_user: dict = Depends(get_current_user)
):
    """Submit quiz answers and get results"""
    postgres_db = get_postgres_db()

    # Verify access
    query = """
    SELECT 1 FROM employee_course_progress
    WHERE employee_id = %s AND course_id = %s
    """
    result = postgres_db.execute_query(query, (current_user["employee_id"], course_id), fetch=True)

    if not result:
        raise HTTPException(status_code=403, detail="Access denied to this course")

    try:
        # Get correct answers from PostgreSQL
        question_ids = [answer.question_id for answer in submission.answers]
        placeholders = ",".join(["%s"] * len(question_ids))
        query = f"""
        SELECT question_id, correct_answer, question_text, option_a, option_b, option_c, option_d
        FROM question_master
        WHERE question_id IN ({placeholders})
        """
        correct_answers_result = postgres_db.execute_query(query, tuple(question_ids), fetch=True)
        correct_answers_map = {row["question_id"]: dict(row) for row in correct_answers_result}

        # Calculate score
        total_questions = len(submission.answers)
        correct_count = 0
        incorrect_questions = []

        for answer in submission.answers:
            is_correct = (
                answer.selected_answer == correct_answers_map[answer.question_id]["correct_answer"]
            )
            if is_correct:
                correct_count += 1
            else:
                incorrect_questions.append({
                    "question_id": answer.question_id,
                    "question_text": correct_answers_map[answer.question_id]["question_text"],
                    "selected_answer": answer.selected_answer,
                    "correct_answer": correct_answers_map[answer.question_id]["correct_answer"],
                    "options": {
                        "A": correct_answers_map[answer.question_id]["option_a"],
                        "B": correct_answers_map[answer.question_id]["option_b"],
                        "C": correct_answers_map[answer.question_id]["option_c"],
                        "D": correct_answers_map[answer.question_id]["option_d"]
                    }
                })

        score = (correct_count / total_questions) * 100
        passed = score >= settings.QUIZ_PASSING_SCORE

        # Get attempt number
        query = """
        SELECT COALESCE(MAX(attempt_number), 0) + 1 AS next_attempt
        FROM quiz_attempts
        WHERE employee_id = %s AND course_id = %s
        """
        result = postgres_db.execute_query(query, (current_user["employee_id"], course_id), fetch=True)
        attempt_number = result[0]["next_attempt"]

        # Insert quiz attempt
        query = """
        INSERT INTO quiz_attempts
        (employee_id, course_id, attempt_number, score, total_questions, correct_answers, passed, passing_score)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING attempt_id, attempted_at
        """
        result = postgres_db.execute_query(query, (
            current_user["employee_id"],
            course_id,
            attempt_number,
            score,
            total_questions,
            correct_count,
            passed,
            settings.QUIZ_PASSING_SCORE
        ), fetch=True)

        attempt_id = result[0]["attempt_id"]
        attempted_at = result[0]["attempted_at"]

        # Insert quiz responses
        for answer in submission.answers:
            is_correct = (
                answer.selected_answer == correct_answers_map[answer.question_id]["correct_answer"]
            )
            query = """
            INSERT INTO quiz_responses
            (attempt_id, question_id, selected_answer, is_correct)
            VALUES (%s, %s, %s, %s)
            """
            postgres_db.execute_query(query, (
                attempt_id,
                answer.question_id,
                answer.selected_answer,
                is_correct
            ))

        # Update course progress
        if passed:
            query = """
            UPDATE employee_course_progress
            SET status = 'completed',
                completed_at = CURRENT_TIMESTAMP,
                time_taken_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) / 60
            WHERE employee_id = %s AND course_id = %s
            """
        else:
            query = """
            UPDATE employee_course_progress
            SET status = 'failed'
            WHERE employee_id = %s AND course_id = %s
            """
        postgres_db.execute_query(query, (current_user["employee_id"], course_id))

        return QuizResult(
            attempt_id=attempt_id,
            course_id=course_id,
            attempt_number=attempt_number,
            score=score,
            total_questions=total_questions,
            correct_answers=correct_count,
            passed=passed,
            passing_score=settings.QUIZ_PASSING_SCORE,
            attempted_at=attempted_at,
            incorrect_questions=incorrect_questions
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to submit quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# PROFILE
# ============================================================================

@router.get("/profile", response_model=EmployeeProgressReport)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Get employee training profile and progress summary"""
    postgres_db = get_postgres_db()

    try:
        query = "SELECT * FROM v_employee_progress_summary WHERE employee_id = %s"
        result = postgres_db.execute_query(query, (current_user["employee_id"],), fetch=True)

        if not result:
            # Return empty profile if no data
            return EmployeeProgressReport(
                employee_id=current_user["employee_id"],
                employee_name=current_user["employee_name"],
                email=current_user["email"],
                department=current_user.get("department"),
                total_courses_assigned=0,
                courses_completed=0,
                courses_in_progress=0,
                courses_not_started=0,
                completion_rate=None,
                avg_time_minutes=None
            )

        return dict(result[0])
    except Exception as e:
        logger.error(f"Failed to get profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# NOTIFICATIONS
# ============================================================================

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_my_notifications(current_user: dict = Depends(get_current_user)):
    """Get all notifications for the current employee"""
    postgres_db = get_postgres_db()

    try:
        query = """
        SELECT notification_id, notification_type, title, message, course_id, is_read, created_at
        FROM notifications
        WHERE employee_id = %s
        ORDER BY created_at DESC
        LIMIT 50
        """
        result = postgres_db.execute_query(query, (current_user["employee_id"],), fetch=True)

        return [dict(row) for row in result]
    except Exception as e:
        logger.error(f"Failed to get notifications: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read"""
    postgres_db = get_postgres_db()

    try:
        query = """
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = %s AND employee_id = %s
        RETURNING notification_id
        """
        result = postgres_db.execute_query(query, (notification_id, current_user["employee_id"]), fetch=True)

        if not result:
            raise HTTPException(status_code=404, detail="Notification not found")

        return {"message": "Notification marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to mark notification as read: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _get_course_name(course_id: str) -> str:
    """Get course name from FalkorDB"""
    falkor_db = get_falkor_db()
    try:
        query = f"MATCH (c:Course {{course_id: '{course_id}'}}) RETURN c.course_name AS course_name"
        result = falkor_db.execute_query(query)
        # Parse result - adjust based on actual FalkorDB response format
        return course_id  # Simplified for now
    except Exception as e:
        logger.error(f"Failed to get course name: {e}")
        return course_id


def _get_course_links(course_id: str) -> List[str]:
    """Get all links for a course from FalkorDB"""
    falkor_db = get_falkor_db()
    try:
        query = f"""
        MATCH (c:Course {{course_id: '{course_id}'}})-[:has_links]->(l:Links)
        RETURN l.link AS link
        """
        result = falkor_db.execute_query(query)
        # Parse result - adjust based on actual FalkorDB response format
        return []  # Simplified for now
    except Exception as e:
        logger.error(f"Failed to get course links: {e}")
        return []


def _get_course_questions(course_id: str) -> List[str]:
    """Get all question IDs for a course from FalkorDB"""
    falkor_db = get_falkor_db()
    try:
        query = f"""
        MATCH (c:Course {{course_id: '{course_id}'}})-[:has_question]->(q:Question)
        RETURN q.question_id AS question_id
        """
        result = falkor_db.execute_query(query)
        # Parse result - adjust based on actual FalkorDB response format
        return []  # Simplified for now
    except Exception as e:
        logger.error(f"Failed to get course questions: {e}")
        return []
