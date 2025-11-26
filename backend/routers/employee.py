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
    NotificationResponse,
    EmployeeProfileResponse,
    EmployeeProfileUpdate
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
    falkor_db = get_falkor_db()

    try:
        # Get all courses assigned to this employee from FalkorDB (source of truth for assignments)
        falkor_query = """
        MATCH (e:Employee {employee_id: $employee_id})-[r:assigned_to]->(c:Course)
        RETURN c.course_id as course_id, c.course_name as course_name, r.due_date as due_date
        ORDER BY c.course_name
        """
        falkor_result = falkor_db.execute_query(falkor_query, {"employee_id": current_user["employee_id"]})

        courses = []
        for row in falkor_result:
            course_id = row[0]
            course_name = row[1]
            due_date = row[2] if row[2] else None

            # Get progress/status from PostgreSQL
            pg_query = """
            SELECT progress_id, assignment_type, assignment_id,
                   status, started_at, completed_at, time_taken_minutes
            FROM employee_course_progress
            WHERE employee_id = %s AND course_id = %s
            """
            pg_result = postgres_db.execute_query(pg_query, (current_user["employee_id"], course_id), fetch=True)

            # Default values if no progress record exists yet
            progress_id = None
            assignment_type = "course"
            assignment_id = course_id
            status = "assigned"
            started_at = None
            completed_at = None
            time_taken_minutes = None

            if pg_result and len(pg_result) > 0:
                progress_row = pg_result[0]
                progress_id = progress_row["progress_id"]
                assignment_type = progress_row["assignment_type"]
                assignment_id = progress_row["assignment_id"]
                status = progress_row["status"]
                started_at = progress_row["started_at"]
                completed_at = progress_row["completed_at"]
                time_taken_minutes = progress_row["time_taken_minutes"]

            courses.append({
                "progress_id": progress_id,
                "course_id": course_id,
                "course_name": course_name,
                "assignment_type": assignment_type,
                "assignment_id": assignment_id,
                "status": status,
                "started_at": started_at,
                "completed_at": completed_at,
                "time_taken_minutes": time_taken_minutes,
                "due_date": due_date
            })

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

    # Get employee's progress for this course
    query = """
    SELECT status, started_at, completed_at
    FROM employee_course_progress
    WHERE employee_id = %s AND course_id = %s
    """
    result = postgres_db.execute_query(query, (current_user["employee_id"], course_id), fetch=True)

    if not result:
        raise HTTPException(status_code=403, detail="Access denied to this course")

    progress = result[0]

    try:
        # Get course name and links from FalkorDB
        course_name = _get_course_name(course_id)
        links = _get_course_links(course_id)
        questions = _get_course_questions(course_id)

        return CourseDetail(
            course_id=course_id,
            course_name=course_name,
            links=links,
            questions=questions,
            status=progress["status"],
            started_at=progress["started_at"],
            completed_at=progress["completed_at"]
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

@router.get("/courses/{course_id}/quiz")
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
        logger.info(f"Quiz endpoint: Got {len(question_ids)} question IDs for course {course_id}")

        if not question_ids:
            logger.warning(f"No question IDs found for course {course_id}")
            return {"questions": []}

        # Get question details from PostgreSQL (without correct answers)
        placeholders = ",".join(["%s"] * len(question_ids))
        query = f"""
        SELECT question_id, question_text, option_a, option_b, option_c, option_d, multiple_answer_flag
        FROM mcqs
        WHERE question_id IN ({placeholders})
        """
        result = postgres_db.execute_query(query, tuple(question_ids), fetch=True)
        logger.info(f"Quiz endpoint: Got {len(result) if result else 0} questions from PostgreSQL")

        questions = [dict(row) for row in result]
        logger.info(f"Quiz endpoint: Returning {len(questions)} questions")
        return {"questions": questions}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get quiz questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/courses/{course_id}/submit-quiz", response_model=QuizResult)
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
        SELECT question_id, correct_answers, question_text, option_a, option_b, option_c, option_d, multiple_answer_flag
        FROM mcqs
        WHERE question_id IN ({placeholders})
        """
        correct_answers_result = postgres_db.execute_query(query, tuple(question_ids), fetch=True)
        correct_answers_map = {row["question_id"]: dict(row) for row in correct_answers_result}

        # Calculate score
        total_questions = len(submission.answers)
        correct_count = 0
        incorrect_questions = []

        for answer in submission.answers:
            question_data = correct_answers_map[answer.question_id]
            correct_answers = question_data["correct_answers"]
            is_multiple_answer = question_data["multiple_answer_flag"]

            # Determine if answer is correct based on question type
            if is_multiple_answer or len(correct_answers) > 1:
                # Multi-answer: compare sets (user must select ALL correct answers)
                if isinstance(answer.selected_answer, list):
                    selected_set = set(answer.selected_answer)
                    correct_set = set(correct_answers)
                    is_correct = selected_set == correct_set
                else:
                    # User selected single answer for multi-answer question - incorrect
                    is_correct = False
            else:
                # Single answer: exact match required
                if isinstance(answer.selected_answer, list):
                    # User selected multiple answers for single-answer question - incorrect
                    is_correct = False
                else:
                    # Check if selected answer matches the single correct answer
                    is_correct = answer.selected_answer in correct_answers and len(correct_answers) == 1

            if is_correct:
                correct_count += 1
            else:
                incorrect_questions.append({
                    "question_id": answer.question_id,
                    "question_text": question_data["question_text"],
                    "selected_answer": answer.selected_answer,
                    "correct_answer": correct_answers,
                    "options": {
                        "A": question_data["option_a"],
                        "B": question_data["option_b"],
                        "C": question_data["option_c"],
                        "D": question_data["option_d"]
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
            question_data = correct_answers_map[answer.question_id]
            correct_answers = question_data["correct_answers"]
            is_multiple_answer = question_data["multiple_answer_flag"]

            # Use EXACT same validation logic as score calculation
            if is_multiple_answer or len(correct_answers) > 1:
                # Multi-answer: compare sets (user must select ALL correct answers)
                if isinstance(answer.selected_answer, list):
                    selected_set = set(answer.selected_answer)
                    correct_set = set(correct_answers)
                    is_correct = selected_set == correct_set
                else:
                    # User selected single answer for multi-answer question - incorrect
                    is_correct = False
            else:
                # Single answer: exact match required
                if isinstance(answer.selected_answer, list):
                    # User selected multiple answers for single-answer question - incorrect
                    is_correct = False
                else:
                    # Check if selected answer matches the single correct answer
                    is_correct = answer.selected_answer in correct_answers and len(correct_answers) == 1

            query = """
            INSERT INTO quiz_responses
            (attempt_id, question_id, selected_answer, is_correct)
            VALUES (%s, %s, %s, %s)
            """
            # Convert list to PostgreSQL array format if needed
            selected_answer_value = answer.selected_answer if not isinstance(answer.selected_answer, list) else '{' + ','.join(answer.selected_answer) + '}'

            postgres_db.execute_query(query, (
                attempt_id,
                answer.question_id,
                selected_answer_value,
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
# EMPLOYEE PROFILE
# ============================================================================

@router.get("/profile-details", response_model=EmployeeProfileResponse)
async def get_employee_profile_details(current_user: dict = Depends(get_current_user)):
    """Get detailed employee profile (skills, projects, certifications)"""
    postgres_db = get_postgres_db()

    try:
        query = """
        SELECT employee_id, brief_profile, primary_skills, secondary_skills,
               past_projects, certifications, created_at, updated_at
        FROM employee_profiles
        WHERE employee_id = %s
        """
        result = postgres_db.execute_query(query, (current_user["employee_id"],), fetch=True)

        if not result:
            # Return empty profile if not exists yet
            return EmployeeProfileResponse(
                employee_id=current_user["employee_id"],
                brief_profile=None,
                primary_skills=[],
                secondary_skills=[],
                past_projects=[],
                certifications=[],
                created_at=None,
                updated_at=None
            )

        profile = dict(result[0])
        # Convert None to empty lists
        profile['primary_skills'] = profile.get('primary_skills') or []
        profile['secondary_skills'] = profile.get('secondary_skills') or []
        profile['past_projects'] = profile.get('past_projects') or []
        profile['certifications'] = profile.get('certifications') or []

        return profile
    except Exception as e:
        logger.error(f"Failed to get employee profile details: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/profile-details", response_model=EmployeeProfileResponse)
async def update_employee_profile_details(
    profile_update: EmployeeProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update employee profile details"""
    postgres_db = get_postgres_db()

    try:
        # Check if profile exists
        check_query = "SELECT employee_id FROM employee_profiles WHERE employee_id = %s"
        existing = postgres_db.execute_query(check_query, (current_user["employee_id"],), fetch=True)

        if existing:
            # Update existing profile
            update_fields = []
            update_values = []

            if profile_update.brief_profile is not None:
                update_fields.append("brief_profile = %s")
                update_values.append(profile_update.brief_profile)

            if profile_update.primary_skills is not None:
                update_fields.append("primary_skills = %s")
                update_values.append(profile_update.primary_skills)

            if profile_update.secondary_skills is not None:
                update_fields.append("secondary_skills = %s")
                update_values.append(profile_update.secondary_skills)

            if profile_update.past_projects is not None:
                update_fields.append("past_projects = %s")
                update_values.append(profile_update.past_projects)

            if profile_update.certifications is not None:
                update_fields.append("certifications = %s")
                update_values.append(profile_update.certifications)

            update_values.append(current_user["employee_id"])

            query = f"""
            UPDATE employee_profiles
            SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
            WHERE employee_id = %s
            RETURNING employee_id, brief_profile, primary_skills, secondary_skills,
                      past_projects, certifications, created_at, updated_at
            """
        else:
            # Insert new profile
            query = """
            INSERT INTO employee_profiles
            (employee_id, brief_profile, primary_skills, secondary_skills, past_projects, certifications)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING employee_id, brief_profile, primary_skills, secondary_skills,
                      past_projects, certifications, created_at, updated_at
            """
            update_values = [
                current_user["employee_id"],
                profile_update.brief_profile or None,
                profile_update.primary_skills or [],
                profile_update.secondary_skills or [],
                profile_update.past_projects or [],
                profile_update.certifications or []
            ]

        result = postgres_db.execute_query(query, tuple(update_values), fetch=True)
        profile = dict(result[0])

        # Convert None to empty lists
        profile['primary_skills'] = profile.get('primary_skills') or []
        profile['secondary_skills'] = profile.get('secondary_skills') or []
        profile['past_projects'] = profile.get('past_projects') or []
        profile['certifications'] = profile.get('certifications') or []

        return profile
    except Exception as e:
        logger.error(f"Failed to update employee profile: {e}")
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


@router.get("/notifications/unread/count")
async def get_unread_notification_count(current_user: dict = Depends(get_current_user)):
    """Get count of unread notifications for the current employee"""
    postgres_db = get_postgres_db()

    try:
        query = """
        SELECT COUNT(*) as count
        FROM notifications
        WHERE employee_id = %s AND is_read = FALSE
        """
        result = postgres_db.execute_query(query, (current_user["employee_id"],), fetch=True)

        count = result[0]["count"] if result else 0
        return {"count": count}
    except Exception as e:
        logger.error(f"Failed to get unread notification count: {e}")
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
        if result and len(result) > 0 and result[0][0]:
            return result[0][0]
        return course_id  # Fallback to ID if not found
    except Exception as e:
        logger.error(f"Failed to get course name: {e}")
        return course_id


def _get_course_links(course_id: str) -> List[dict]:
    """Get all links for a course from FalkorDB"""
    falkor_db = get_falkor_db()
    try:
        query = """
        MATCH (c:Course {course_id: $course_id})-[:has_links]->(l:Links)
        RETURN l.link_id as link_id, l.link as url, l.link_label as title
        ORDER BY l.link_label
        """
        result = falkor_db.execute_query(query, {"course_id": course_id})
        links = []
        if result:
            for row in result:
                links.append({
                    "link_id": row[0] if len(row) > 0 and row[0] else "",
                    "url": row[1] if len(row) > 1 and row[1] else "",
                    "title": row[2] if len(row) > 2 and row[2] else ""
                })
        return links
    except Exception as e:
        logger.error(f"Failed to get course links: {e}")
        return []


def _get_course_questions(course_id: str) -> List[str]:
    """Get all question IDs for a course from FalkorDB"""
    falkor_db = get_falkor_db()
    try:
        query = """
        MATCH (c:Course {course_id: $course_id})-[:has_question]->(q:Question)
        RETURN q.question_id AS question_id
        """
        result = falkor_db.execute_query(query, {"course_id": course_id})
        question_ids = []
        if result:
            for row in result:
                if row[0]:  # question_id is at index 0
                    question_ids.append(row[0])
        logger.info(f"Found {len(question_ids)} questions for course {course_id}")
        return question_ids
    except Exception as e:
        logger.error(f"Failed to get course questions: {e}")
        return []
