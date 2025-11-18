"""
Admin Router
Endpoints for content management, assignments, and reporting
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import logging
import hashlib

from backend.models.schemas import (
    TrackCreate,
    SubTrackCreate,
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


def generate_id(name: str) -> str:
    """Generate a unique ID using hashlib SHA256"""
    return hashlib.sha256(name.encode('utf-8')).hexdigest()[:16]


# ============================================================================
# TRACK MANAGEMENT
# ============================================================================

@router.post("/tracks")
async def create_track(
    track: TrackCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new Track with auto-generated ID"""
    falkor_db = get_falkor_db()

    try:
        # Generate ID from track name
        track_id = generate_id(track.track_name)

        # Check if track already exists
        check_query = f"MATCH (t:Track {{track_id: '{track_id}'}}) RETURN t"
        existing = falkor_db.execute_query(check_query)
        if existing and len(existing) > 0:
            raise HTTPException(status_code=400, detail="Track with this name already exists")

        # Create track
        query = f"""
        MERGE (t:Track {{track_id: '{track_id}'}})
        SET t.track_name = '{track.track_name}'
        RETURN t
        """
        falkor_db.execute_query(query)

        return {"track_id": track_id, "track_name": track.track_name}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create track: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/tracks/{track_id}")
async def update_track(
    track_id: str,
    track: TrackCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Update a Track and regenerate ID based on new name"""
    falkor_db = get_falkor_db()

    try:
        # Generate new ID from new track name
        new_track_id = generate_id(track.track_name)

        # If ID changed, check for duplicates
        if new_track_id != track_id:
            check_query = f"MATCH (t:Track {{track_id: '{new_track_id}'}}) RETURN t"
            existing = falkor_db.execute_query(check_query)
            if existing and len(existing) > 0:
                raise HTTPException(status_code=400, detail="Track with this name already exists")

        # Update track: create new node with new ID, copy relationships, delete old node
        if new_track_id != track_id:
            query = f"""
            MATCH (old:Track {{track_id: '{track_id}'}})
            OPTIONAL MATCH (old)-[r:has_subtrack]->(st:SubTrack)
            CREATE (new:Track {{track_id: '{new_track_id}', track_name: '{track.track_name}'}})
            WITH old, new, COLLECT(st) as subtracks
            FOREACH (st IN subtracks | CREATE (new)-[:has_subtrack]->(st))
            DETACH DELETE old
            RETURN new
            """
        else:
            query = f"""
            MATCH (t:Track {{track_id: '{track_id}'}})
            SET t.track_name = '{track.track_name}'
            RETURN t
            """

        falkor_db.execute_query(query)

        return {"track_id": new_track_id, "track_name": track.track_name}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update track: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tracks")
async def get_all_tracks(current_user: dict = Depends(get_current_admin_user)):
    """Get all tracks"""
    falkor_db = get_falkor_db()

    try:
        query = "MATCH (t:Track) RETURN t.track_id AS track_id, t.track_name AS track_name ORDER BY t.track_name"
        result = falkor_db.execute_query(query)

        tracks = []
        if result and len(result) > 0:
            for row in result:
                tracks.append({
                    "track_id": row[0],
                    "track_name": row[1]
                })

        return tracks
    except Exception as e:
        logger.error(f"Failed to get tracks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tracks-tree")
async def get_tracks_tree(current_user: dict = Depends(get_current_admin_user)):
    """Get all tracks with their subtracks in tree structure"""
    falkor_db = get_falkor_db()

    try:
        # First, get all tracks
        tracks_query = "MATCH (t:Track) RETURN t.track_id, t.track_name ORDER BY t.track_name"
        tracks_result = falkor_db.execute_query(tracks_query)

        tree = []
        if tracks_result and len(tracks_result) > 0:
            for track_row in tracks_result:
                track_id = track_row[0]
                track_name = track_row[1]

                # Get subtracks for this track
                subtracks_query = f"""
                MATCH (t:Track {{track_id: '{track_id}'}})-[:has_subtrack]->(st:SubTrack)
                RETURN st.subtrack_id, st.subtrack_name
                ORDER BY st.subtrack_name
                """
                subtracks_result = falkor_db.execute_query(subtracks_query)

                subtracks = []
                if subtracks_result and len(subtracks_result) > 0:
                    for st_row in subtracks_result:
                        subtracks.append({
                            "subtrack_id": st_row[0],
                            "subtrack_name": st_row[1]
                        })

                tree.append({
                    "track_id": track_id,
                    "track_name": track_name,
                    "subtracks": subtracks
                })

        return tree
    except Exception as e:
        logger.error(f"Failed to get tracks tree: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# SUBTRACK MANAGEMENT
# ============================================================================

@router.post("/subtracks")
async def create_subtrack(
    subtrack: SubTrackCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new SubTrack with auto-generated ID"""
    falkor_db = get_falkor_db()

    try:
        # Generate ID from subtrack name
        subtrack_id = generate_id(subtrack.subtrack_name)

        # Check if subtrack already exists
        check_query = f"MATCH (st:SubTrack {{subtrack_id: '{subtrack_id}'}}) RETURN st"
        existing = falkor_db.execute_query(check_query)
        if existing and len(existing) > 0:
            raise HTTPException(status_code=400, detail="SubTrack with this name already exists")

        # Create subtrack and link to track
        query = f"""
        MATCH (t:Track {{track_id: '{subtrack.track_id}'}})
        MERGE (st:SubTrack {{subtrack_id: '{subtrack_id}'}})
        SET st.subtrack_name = '{subtrack.subtrack_name}'
        MERGE (t)-[:has_subtrack]->(st)
        RETURN st
        """
        falkor_db.execute_query(query)

        return {
            "subtrack_id": subtrack_id,
            "subtrack_name": subtrack.subtrack_name,
            "track_id": subtrack.track_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create subtrack: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/subtracks/{subtrack_id}")
async def update_subtrack(
    subtrack_id: str,
    subtrack: SubTrackCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Update a SubTrack and regenerate ID based on new name"""
    falkor_db = get_falkor_db()

    try:
        # Generate new ID from new subtrack name
        new_subtrack_id = generate_id(subtrack.subtrack_name)

        # If ID changed, check for duplicates
        if new_subtrack_id != subtrack_id:
            check_query = f"MATCH (st:SubTrack {{subtrack_id: '{new_subtrack_id}'}}) RETURN st"
            existing = falkor_db.execute_query(check_query)
            if existing and len(existing) > 0:
                raise HTTPException(status_code=400, detail="SubTrack with this name already exists")

        # Update subtrack: create new node with new ID, copy relationships, delete old node
        if new_subtrack_id != subtrack_id:
            query = f"""
            MATCH (old:SubTrack {{subtrack_id: '{subtrack_id}'}})
            MATCH (t:Track {{track_id: '{subtrack.track_id}'}})
            OPTIONAL MATCH (old)-[r:has_course]->(c:Course)
            CREATE (new:SubTrack {{subtrack_id: '{new_subtrack_id}', subtrack_name: '{subtrack.subtrack_name}'}})
            CREATE (t)-[:has_subtrack]->(new)
            WITH old, new, COLLECT(c) as courses
            FOREACH (c IN courses | CREATE (new)-[:has_course]->(c))
            DETACH DELETE old
            RETURN new
            """
        else:
            query = f"""
            MATCH (st:SubTrack {{subtrack_id: '{subtrack_id}'}})
            SET st.subtrack_name = '{subtrack.subtrack_name}'
            RETURN st
            """

        falkor_db.execute_query(query)

        return {
            "subtrack_id": new_subtrack_id,
            "subtrack_name": subtrack.subtrack_name,
            "track_id": subtrack.track_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update subtrack: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subtracks")
async def get_all_subtracks(current_user: dict = Depends(get_current_admin_user)):
    """Get all subtracks"""
    falkor_db = get_falkor_db()

    try:
        query = """
        MATCH (t:Track)-[:has_subtrack]->(st:SubTrack)
        RETURN st.subtrack_id AS subtrack_id, st.subtrack_name AS subtrack_name, t.track_id AS track_id
        ORDER BY st.subtrack_name
        """
        result = falkor_db.execute_query(query)

        subtracks = []
        if result and len(result) > 0:
            for row in result:
                subtracks.append({
                    "subtrack_id": row[0],
                    "subtrack_name": row[1],
                    "track_id": row[2]
                })

        return subtracks
    except Exception as e:
        logger.error(f"Failed to get subtracks: {e}")
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


@router.get("/courses", response_model=List[CourseResponse])
async def get_all_courses(current_user: dict = Depends(get_current_admin_user)):
    """Get all courses"""
    falkor_db = get_falkor_db()

    try:
        query = "MATCH (c:Course) RETURN c.course_id AS course_id, c.course_name AS course_name"
        result = falkor_db.execute_query(query)
        # Return empty list for now - will be populated as data is added
        return []
    except Exception as e:
        logger.error(f"Failed to get courses: {e}")
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
        RETURNING employee_id, employee_name, email, department, role, created_at
        """
        result = postgres_db.execute_query(query, (
            employee.employee_id,
            employee.employee_name,
            employee.email,
            employee.department,
            employee.role,
            password_hash
        ), fetch=True)

        user_data = dict(result[0])
        # Transform to match frontend expectations
        return EmployeeResponse(
            id=user_data["employee_id"],
            username=user_data["email"].split("@")[0],
            email=user_data["email"],
            full_name=user_data["employee_name"],
            role=user_data["role"],
            created_at=user_data["created_at"].isoformat() if user_data.get("created_at") else None
        )
    except Exception as e:
        logger.error(f"Failed to create employee: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/employees", response_model=List[EmployeeResponse])
async def get_all_employees(current_user: dict = Depends(get_current_admin_user)):
    """Get all employees"""
    postgres_db = get_postgres_db()

    try:
        query = """
        SELECT employee_id, employee_name, email, role, created_at
        FROM employees
        ORDER BY created_at DESC
        """
        result = postgres_db.execute_query(query, fetch=True)

        employees = []
        for row in result:
            user_data = dict(row)
            employees.append({
                "id": user_data["employee_id"],
                "username": user_data["email"].split("@")[0],
                "email": user_data["email"],
                "full_name": user_data["employee_name"],
                "role": user_data["role"],
                "created_at": user_data["created_at"].isoformat() if user_data.get("created_at") else None
            })

        return employees
    except Exception as e:
        logger.error(f"Failed to get employees: {e}")
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
