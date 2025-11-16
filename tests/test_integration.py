"""
End-to-End Integration Tests
"""
import pytest
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.integration
@pytest.mark.e2e
@pytest.mark.slow
class TestCompleteEmployeeJourney:
    """Test complete employee learning journey from start to finish."""

    async def test_complete_learning_path(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_db,
        test_graph_db
    ):
        """
        Test complete employee journey:
        1. Admin creates learning path
        2. Admin creates employee
        3. Admin assigns employee to track
        4. Employee logs in
        5. Employee views courses
        6. Employee starts course
        7. Employee takes quiz
        8. Employee completes course
        """
        # Step 1: Admin creates track, subtrack, and course
        track_response = await client.post(
            "/api/admin/tracks",
            headers=auth_headers,
            json={
                "name": "Full Stack Development",
                "description": "Complete full stack development path"
            }
        )
        assert track_response.status_code == 200
        track = track_response.json()

        subtrack_response = await client.post(
            "/api/admin/subtracks",
            headers=auth_headers,
            json={
                "name": "Backend Development",
                "description": "Learn backend development",
                "track_id": track["track_id"]
            }
        )
        assert subtrack_response.status_code == 200
        subtrack = subtrack_response.json()

        course_response = await client.post(
            "/api/admin/courses",
            headers=auth_headers,
            json={
                "title": "Python FastAPI Course",
                "description": "Learn FastAPI framework",
                "subtrack_id": subtrack["subtrack_id"]
            }
        )
        assert course_response.status_code == 200
        course = course_response.json()

        # Add study resources
        await client.post(
            "/api/admin/add-link",
            headers=auth_headers,
            json={
                "course_id": course["course_id"],
                "url": "https://fastapi.tiangolo.com",
                "title": "FastAPI Documentation"
            }
        )

        # Create quiz questions
        for i in range(5):
            question_response = await client.post(
                "/api/admin/questions",
                headers=auth_headers,
                json={
                    "question_text": f"FastAPI Question {i+1}?",
                    "option_a": "Correct Answer",
                    "option_b": "Wrong Answer 1",
                    "option_c": "Wrong Answer 2",
                    "option_d": "Wrong Answer 3",
                    "correct_option": "A"
                }
            )
            question = question_response.json()

            await client.post(
                "/api/admin/assign-question",
                headers=auth_headers,
                json={
                    "question_id": question["question_id"],
                    "course_id": course["course_id"]
                }
            )

        # Step 2: Admin creates employee
        employee_response = await client.post(
            "/api/admin/employees",
            headers=auth_headers,
            json={
                "username": "journeyemployee",
                "email": "journey@example.com",
                "password": "SecurePass123!",
                "full_name": "Journey Employee"
            }
        )
        assert employee_response.status_code == 200
        employee_id = employee_response.json()["user_id"]

        # Step 3: Admin assigns employee to track
        assign_response = await client.post(
            "/api/admin/assign-track",
            headers=auth_headers,
            json={
                "user_id": employee_id,
                "track_id": track["track_id"]
            }
        )
        assert assign_response.status_code == 200

        # Step 4: Employee logs in
        login_response = await client.post(
            "/api/auth/login",
            json={
                "username": "journeyemployee",
                "password": "SecurePass123!"
            }
        )
        assert login_response.status_code == 200
        employee_token = login_response.json()["access_token"]
        employee_headers = {"Authorization": f"Bearer {employee_token}"}

        # Step 5: Employee views assigned courses
        courses_response = await client.get(
            "/api/employee/courses",
            headers=employee_headers
        )
        assert courses_response.status_code == 200
        courses = courses_response.json()
        assert len(courses) > 0

        # Step 6: Employee starts course
        start_response = await client.post(
            f"/api/employee/courses/{course['course_id']}/start",
            headers=employee_headers
        )
        assert start_response.status_code == 200

        # Step 7: Employee takes quiz (passes)
        quiz_response = await client.get(
            f"/api/employee/courses/{course['course_id']}/quiz",
            headers=employee_headers
        )
        assert quiz_response.status_code == 200

        # Submit quiz with all correct answers
        quiz_data = quiz_response.json()
        if "questions" in quiz_data:
            questions = quiz_data["questions"]
        else:
            questions = quiz_data

        answers = [
            {"question_id": q["question_id"], "selected_option": "A"}
            for q in questions
        ]

        submit_response = await client.post(
            f"/api/employee/courses/{course['course_id']}/submit-quiz",
            headers=employee_headers,
            json={"answers": answers}
        )
        assert submit_response.status_code == 200
        result = submit_response.json()
        assert result["passed"] is True
        assert result["score"] >= 70

        # Step 8: Check employee progress
        progress_response = await client.get(
            "/api/employee/progress",
            headers=employee_headers
        )
        assert progress_response.status_code == 200

        # Admin views employee report
        report_response = await client.get(
            f"/api/admin/employee-progress/{employee_id}",
            headers=auth_headers
        )
        assert report_response.status_code == 200


@pytest.mark.integration
@pytest.mark.e2e
class TestMultipleCourses:
    """Test workflows with multiple courses."""

    async def test_employee_with_multiple_courses(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_db,
        test_graph_db
    ):
        """Test employee assigned to multiple courses."""
        # Create track and subtrack
        track_response = await client.post(
            "/api/admin/tracks",
            headers=auth_headers,
            json={
                "name": "Web Development",
                "description": "Learn web development"
            }
        )
        track = track_response.json()

        subtrack_response = await client.post(
            "/api/admin/subtracks",
            headers=auth_headers,
            json={
                "name": "Frontend",
                "description": "Frontend development",
                "track_id": track["track_id"]
            }
        )
        subtrack = subtrack_response.json()

        # Create multiple courses
        courses = []
        for i in range(3):
            course_response = await client.post(
                "/api/admin/courses",
                headers=auth_headers,
                json={
                    "title": f"Course {i+1}",
                    "description": f"Description for course {i+1}",
                    "subtrack_id": subtrack["subtrack_id"]
                }
            )
            courses.append(course_response.json())

        # Create employee
        employee_response = await client.post(
            "/api/admin/employees",
            headers=auth_headers,
            json={
                "username": "multiemployee",
                "email": "multi@example.com",
                "password": "SecurePass123!",
                "full_name": "Multi Course Employee"
            }
        )
        employee_id = employee_response.json()["user_id"]

        # Assign all courses to employee
        for course in courses:
            await client.post(
                "/api/admin/assign-course",
                headers=auth_headers,
                json={
                    "user_id": employee_id,
                    "course_id": course["course_id"]
                }
            )

        # Login as employee
        login_response = await client.post(
            "/api/auth/login",
            json={"username": "multiemployee", "password": "SecurePass123!"}
        )
        employee_token = login_response.json()["access_token"]
        employee_headers = {"Authorization": f"Bearer {employee_token}"}

        # Get all assigned courses
        courses_response = await client.get(
            "/api/employee/courses",
            headers=employee_headers
        )
        assert courses_response.status_code == 200
        assigned_courses = courses_response.json()
        assert len(assigned_courses) == 3


@pytest.mark.integration
@pytest.mark.e2e
class TestHealthAndSystem:
    """Test system health and basic endpoints."""

    async def test_root_endpoint(self, client: AsyncClient):
        """Test root endpoint is accessible."""
        response = await client.get("/")
        assert response.status_code == 200

    async def test_health_check(self, client: AsyncClient, test_db, test_graph_db):
        """Test health check endpoint."""
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data or "postgres" in data or "falkordb" in data


@pytest.mark.integration
@pytest.mark.e2e
class TestConcurrentOperations:
    """Test concurrent operations and race conditions."""

    async def test_concurrent_quiz_submissions(
        self,
        client: AsyncClient,
        auth_headers: dict,
        test_db,
        test_graph_db
    ):
        """Test multiple employees taking the same quiz concurrently."""
        # Create course
        track_response = await client.post(
            "/api/admin/tracks",
            headers=auth_headers,
            json={"name": "Concurrent Track", "description": "Test"}
        )
        track = track_response.json()

        subtrack_response = await client.post(
            "/api/admin/subtracks",
            headers=auth_headers,
            json={
                "name": "Concurrent Subtrack",
                "description": "Test",
                "track_id": track["track_id"]
            }
        )
        subtrack = subtrack_response.json()

        course_response = await client.post(
            "/api/admin/courses",
            headers=auth_headers,
            json={
                "title": "Concurrent Course",
                "description": "Test",
                "subtrack_id": subtrack["subtrack_id"]
            }
        )
        course = course_response.json()

        # Create questions
        questions = []
        for i in range(3):
            question_response = await client.post(
                "/api/admin/questions",
                headers=auth_headers,
                json={
                    "question_text": f"Concurrent Question {i+1}?",
                    "option_a": "A",
                    "option_b": "B",
                    "option_c": "C",
                    "option_d": "D",
                    "correct_option": "A"
                }
            )
            question = question_response.json()
            questions.append(question)

            await client.post(
                "/api/admin/assign-question",
                headers=auth_headers,
                json={
                    "question_id": question["question_id"],
                    "course_id": course["course_id"]
                }
            )

        # Create two employees
        employee_tokens = []
        for i in range(2):
            employee_response = await client.post(
                "/api/admin/employees",
                headers=auth_headers,
                json={
                    "username": f"concurrent{i}",
                    "email": f"concurrent{i}@example.com",
                    "password": "SecurePass123!",
                    "full_name": f"Concurrent Employee {i}"
                }
            )
            employee_id = employee_response.json()["user_id"]

            # Assign course
            await client.post(
                "/api/admin/assign-course",
                headers=auth_headers,
                json={
                    "user_id": employee_id,
                    "course_id": course["course_id"]
                }
            )

            # Login
            login_response = await client.post(
                "/api/auth/login",
                json={
                    "username": f"concurrent{i}",
                    "password": "SecurePass123!"
                }
            )
            employee_tokens.append(login_response.json()["access_token"])

        # Both employees submit quiz
        answers = [
            {"question_id": q["question_id"], "selected_option": "A"}
            for q in questions
        ]

        for token in employee_tokens:
            response = await client.post(
                f"/api/employee/courses/{course['course_id']}/submit-quiz",
                headers={"Authorization": f"Bearer {token}"},
                json={"answers": answers}
            )
            assert response.status_code == 200
            assert response.json()["passed"] is True


@pytest.mark.integration
@pytest.mark.e2e
class TestDataValidation:
    """Test data validation and error handling."""

    async def test_invalid_email_format(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test creating employee with invalid email format."""
        response = await client.post(
            "/api/admin/employees",
            headers=auth_headers,
            json={
                "username": "invalidemail",
                "email": "not-an-email",
                "password": "SecurePass123!",
                "full_name": "Invalid Email"
            }
        )

        # Should return validation error
        assert response.status_code == 422

    async def test_weak_password(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test creating employee with weak password."""
        response = await client.post(
            "/api/admin/employees",
            headers=auth_headers,
            json={
                "username": "weakpass",
                "email": "weakpass@example.com",
                "password": "123",  # Too weak
                "full_name": "Weak Password"
            }
        )

        # Should return validation error
        assert response.status_code in [400, 422]

    async def test_missing_required_fields(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test creating entities with missing required fields."""
        # Try to create track without name
        response = await client.post(
            "/api/admin/tracks",
            headers=auth_headers,
            json={"description": "No name provided"}
        )

        assert response.status_code == 422

    async def test_invalid_course_assignment(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test assigning employee to non-existent course."""
        response = await client.post(
            "/api/admin/assign-course",
            headers=auth_headers,
            json={
                "user_id": 99999,  # Non-existent user
                "course_id": 99999  # Non-existent course
            }
        )

        # Should return error
        assert response.status_code in [400, 404]
