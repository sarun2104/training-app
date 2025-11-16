"""
End-to-End Tests for Admin Workflows
"""
import pytest
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.admin
@pytest.mark.e2e
class TestAdminTrackManagement:
    """Test admin track management workflows."""

    async def test_create_track(
        self, client: AsyncClient, auth_headers: dict, test_graph_db
    ):
        """Test creating a new track."""
        response = await client.post(
            "/api/admin/tracks",
            headers=auth_headers,
            json={
                "name": "Data Science",
                "description": "Learn data science and ML"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "track_id" in data
        assert data["message"] == "Track created successfully"

    async def test_get_all_tracks(
        self, client: AsyncClient, auth_headers: dict, sample_track: dict
    ):
        """Test getting all tracks."""
        response = await client.get("/api/admin/tracks", headers=auth_headers)

        assert response.status_code == 200
        tracks = response.json()
        assert isinstance(tracks, list)
        assert len(tracks) > 0
        assert any(track["name"] == "Python Development" for track in tracks)

    async def test_create_duplicate_track(
        self, client: AsyncClient, auth_headers: dict, sample_track: dict
    ):
        """Test creating a track with duplicate name."""
        response = await client.post(
            "/api/admin/tracks",
            headers=auth_headers,
            json={
                "name": "Python Development",
                "description": "Duplicate track"
            }
        )

        # Should handle duplicate gracefully
        assert response.status_code in [200, 400, 409]


@pytest.mark.admin
@pytest.mark.e2e
class TestAdminSubtrackManagement:
    """Test admin subtrack management workflows."""

    async def test_create_subtrack(
        self, client: AsyncClient, auth_headers: dict, sample_track: dict, test_graph_db
    ):
        """Test creating a new subtrack."""
        response = await client.post(
            "/api/admin/subtracks",
            headers=auth_headers,
            json={
                "name": "Web Development",
                "description": "Learn web development with Python",
                "track_id": sample_track["track_id"]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "subtrack_id" in data
        assert data["message"] == "SubTrack created successfully"

    async def test_create_subtrack_invalid_track(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test creating subtrack with invalid track ID."""
        response = await client.post(
            "/api/admin/subtracks",
            headers=auth_headers,
            json={
                "name": "Invalid Subtrack",
                "description": "Test",
                "track_id": 99999
            }
        )

        # Should return error for non-existent track
        assert response.status_code in [400, 404]


@pytest.mark.admin
@pytest.mark.e2e
class TestAdminCourseManagement:
    """Test admin course management workflows."""

    async def test_create_course(
        self, client: AsyncClient, auth_headers: dict, sample_subtrack: dict, test_graph_db
    ):
        """Test creating a new course."""
        response = await client.post(
            "/api/admin/courses",
            headers=auth_headers,
            json={
                "title": "Advanced FastAPI",
                "description": "Deep dive into FastAPI features",
                "subtrack_id": sample_subtrack["subtrack_id"]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "course_id" in data
        assert data["message"] == "Course created successfully"

    async def test_add_study_link_to_course(
        self, client: AsyncClient, auth_headers: dict, sample_course: dict, test_graph_db
    ):
        """Test adding a study resource link to a course."""
        response = await client.post(
            "/api/admin/add-link",
            headers=auth_headers,
            json={
                "course_id": sample_course["course_id"],
                "url": "https://fastapi.tiangolo.com",
                "title": "Official FastAPI Documentation"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "link_id" in data
        assert data["message"] == "Study link added successfully"

    async def test_add_multiple_links_to_course(
        self, client: AsyncClient, auth_headers: dict, sample_course: dict, test_graph_db
    ):
        """Test adding multiple study links to a course."""
        links = [
            {
                "url": "https://fastapi.tiangolo.com",
                "title": "FastAPI Docs"
            },
            {
                "url": "https://www.youtube.com/watch?v=example",
                "title": "FastAPI Tutorial Video"
            },
            {
                "url": "https://github.com/tiangolo/fastapi",
                "title": "FastAPI GitHub"
            }
        ]

        for link in links:
            response = await client.post(
                "/api/admin/add-link",
                headers=auth_headers,
                json={
                    "course_id": sample_course["course_id"],
                    **link
                }
            )
            assert response.status_code == 200


@pytest.mark.admin
@pytest.mark.e2e
class TestAdminQuestionManagement:
    """Test admin question management workflows."""

    async def test_create_question(
        self, client: AsyncClient, auth_headers: dict, test_graph_db
    ):
        """Test creating a new question."""
        response = await client.post(
            "/api/admin/questions",
            headers=auth_headers,
            json={
                "question_text": "What is the default port for FastAPI?",
                "option_a": "8000",
                "option_b": "3000",
                "option_c": "5000",
                "option_d": "8080",
                "correct_option": "A"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert "question_id" in data
        assert data["message"] == "Question created successfully"

    async def test_assign_question_to_course(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_course: dict,
        test_graph_db
    ):
        """Test assigning a question to a course."""
        # First create a question
        response = await client.post(
            "/api/admin/questions",
            headers=auth_headers,
            json={
                "question_text": "What does ASGI stand for?",
                "option_a": "Asynchronous Server Gateway Interface",
                "option_b": "Advanced Server Gateway Interface",
                "option_c": "Application Server Gateway Interface",
                "option_d": "Automated Server Gateway Interface",
                "correct_option": "A"
            }
        )
        assert response.status_code == 200
        question_id = response.json()["question_id"]

        # Assign to course
        response = await client.post(
            "/api/admin/assign-question",
            headers=auth_headers,
            json={
                "question_id": question_id,
                "course_id": sample_course["course_id"]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Question assigned to course successfully"

    async def test_create_question_invalid_option(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test creating question with invalid correct option."""
        response = await client.post(
            "/api/admin/questions",
            headers=auth_headers,
            json={
                "question_text": "Test question?",
                "option_a": "Option A",
                "option_b": "Option B",
                "option_c": "Option C",
                "option_d": "Option D",
                "correct_option": "E"  # Invalid option
            }
        )

        # Should return validation error
        assert response.status_code == 422


@pytest.mark.admin
@pytest.mark.e2e
class TestAdminEmployeeManagement:
    """Test admin employee management workflows."""

    async def test_create_employee(
        self, client: AsyncClient, auth_headers: dict, test_db
    ):
        """Test creating a new employee."""
        response = await client.post(
            "/api/admin/employees",
            headers=auth_headers,
            json={
                "username": "newemployee",
                "email": "newemployee@example.com",
                "password": "SecurePass123!",
                "full_name": "New Employee"
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Employee created successfully"
        assert "user_id" in data

        # Verify employee was created in database
        cursor = test_db.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s", ("newemployee",))
        user = cursor.fetchone()
        cursor.close()
        assert user is not None
        assert user[3] == "newemployee@example.com"  # email

    async def test_create_duplicate_employee(
        self, client: AsyncClient, auth_headers: dict, test_db
    ):
        """Test creating employee with duplicate username."""
        employee_data = {
            "username": "duplicateuser",
            "email": "duplicate@example.com",
            "password": "SecurePass123!",
            "full_name": "Duplicate User"
        }

        # Create first employee
        response = await client.post(
            "/api/admin/employees",
            headers=auth_headers,
            json=employee_data
        )
        assert response.status_code == 200

        # Try to create duplicate
        response = await client.post(
            "/api/admin/employees",
            headers=auth_headers,
            json=employee_data
        )

        # Should return error for duplicate
        assert response.status_code in [400, 409]

    async def test_assign_employee_to_track(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_track: dict,
        test_db,
        test_graph_db
    ):
        """Test assigning an employee to a track."""
        # Create employee
        response = await client.post(
            "/api/admin/employees",
            headers=auth_headers,
            json={
                "username": "trackemployee",
                "email": "trackemployee@example.com",
                "password": "SecurePass123!",
                "full_name": "Track Employee"
            }
        )
        assert response.status_code == 200
        employee_id = response.json()["user_id"]

        # Assign to track
        response = await client.post(
            "/api/admin/assign-track",
            headers=auth_headers,
            json={
                "user_id": employee_id,
                "track_id": sample_track["track_id"]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Employee assigned to track successfully"

    async def test_assign_employee_to_course(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_course: dict,
        test_db,
        test_graph_db
    ):
        """Test assigning an employee to a specific course."""
        # Create employee
        response = await client.post(
            "/api/admin/employees",
            headers=auth_headers,
            json={
                "username": "courseemployee",
                "email": "courseemployee@example.com",
                "password": "SecurePass123!",
                "full_name": "Course Employee"
            }
        )
        assert response.status_code == 200
        employee_id = response.json()["user_id"]

        # Assign to course
        response = await client.post(
            "/api/admin/assign-course",
            headers=auth_headers,
            json={
                "user_id": employee_id,
                "course_id": sample_course["course_id"]
            }
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Employee assigned to course successfully"


@pytest.mark.admin
@pytest.mark.e2e
class TestAdminReporting:
    """Test admin reporting and analytics workflows."""

    async def test_get_employee_progress_report(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_db
    ):
        """Test getting employee progress report."""
        # Create employee
        response = await client.post(
            "/api/admin/employees",
            headers=auth_headers,
            json={
                "username": "reportemployee",
                "email": "reportemployee@example.com",
                "password": "SecurePass123!",
                "full_name": "Report Employee"
            }
        )
        assert response.status_code == 200
        employee_id = response.json()["user_id"]

        # Get progress report
        response = await client.get(
            f"/api/admin/employee-progress/{employee_id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "user_id" in data
        assert "username" in data
        assert "courses" in data or "progress" in data

    async def test_get_course_statistics(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_course: dict
    ):
        """Test getting course statistics."""
        response = await client.get(
            f"/api/admin/course-stats/{sample_course['course_id']}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "course_id" in data
        # Statistics fields may vary based on implementation
        assert isinstance(data, dict)
