"""
End-to-End Tests for Employee Workflows
"""
import pytest
from httpx import AsyncClient
from typing import Dict, Any


@pytest.mark.employee
@pytest.mark.e2e
class TestEmployeeCourseAccess:
    """Test employee course access workflows."""

    async def test_get_assigned_courses_empty(
        self, client: AsyncClient, employee_headers: dict
    ):
        """Test getting assigned courses when none are assigned."""
        response = await client.get(
            "/api/employee/courses",
            headers=employee_headers
        )

        assert response.status_code == 200
        courses = response.json()
        assert isinstance(courses, list)

    async def test_get_assigned_courses(
        self,
        client: AsyncClient,
        auth_headers: dict,
        employee_headers: dict,
        sample_course: dict,
        test_db,
        test_graph_db
    ):
        """Test getting assigned courses."""
        # Get employee user ID
        response = await client.get(
            "/api/auth/me",
            headers=employee_headers
        )
        employee_id = response.json()["id"]

        # Assign course to employee (as admin)
        response = await client.post(
            "/api/admin/assign-course",
            headers=auth_headers,
            json={
                "user_id": employee_id,
                "course_id": sample_course["course_id"]
            }
        )
        assert response.status_code == 200

        # Get assigned courses (as employee)
        response = await client.get(
            "/api/employee/courses",
            headers=employee_headers
        )

        assert response.status_code == 200
        courses = response.json()
        assert isinstance(courses, list)
        assert len(courses) > 0
        assert any(course.get("course_id") == sample_course["course_id"] for course in courses)

    async def test_get_course_details(
        self,
        client: AsyncClient,
        auth_headers: dict,
        employee_headers: dict,
        sample_course: dict,
        test_db,
        test_graph_db
    ):
        """Test getting course details with study links."""
        # Get employee user ID
        response = await client.get(
            "/api/auth/me",
            headers=employee_headers
        )
        employee_id = response.json()["id"]

        # Assign course to employee
        response = await client.post(
            "/api/admin/assign-course",
            headers=auth_headers,
            json={
                "user_id": employee_id,
                "course_id": sample_course["course_id"]
            }
        )
        assert response.status_code == 200

        # Add study links
        await client.post(
            "/api/admin/add-link",
            headers=auth_headers,
            json={
                "course_id": sample_course["course_id"],
                "url": "https://example.com/resource1",
                "title": "Resource 1"
            }
        )

        # Get course details
        response = await client.get(
            f"/api/employee/courses/{sample_course['course_id']}",
            headers=employee_headers
        )

        assert response.status_code == 200
        course = response.json()
        assert course["course_id"] == sample_course["course_id"]
        assert "title" in course
        assert "description" in course
        assert "links" in course or "resources" in course

    async def test_get_unassigned_course_details(
        self,
        client: AsyncClient,
        employee_headers: dict,
        sample_course: dict
    ):
        """Test getting details of unassigned course (should fail)."""
        response = await client.get(
            f"/api/employee/courses/{sample_course['course_id']}",
            headers=employee_headers
        )

        # Should return forbidden or not found
        assert response.status_code in [403, 404]


@pytest.mark.employee
@pytest.mark.e2e
class TestEmployeeCourseProgress:
    """Test employee course progress workflows."""

    async def test_start_course(
        self,
        client: AsyncClient,
        auth_headers: dict,
        employee_headers: dict,
        sample_course: dict,
        test_db,
        test_graph_db
    ):
        """Test starting a course."""
        # Get employee user ID
        response = await client.get(
            "/api/auth/me",
            headers=employee_headers
        )
        employee_id = response.json()["id"]

        # Assign course to employee
        response = await client.post(
            "/api/admin/assign-course",
            headers=auth_headers,
            json={
                "user_id": employee_id,
                "course_id": sample_course["course_id"]
            }
        )
        assert response.status_code == 200

        # Start the course
        response = await client.post(
            f"/api/employee/courses/{sample_course['course_id']}/start",
            headers=employee_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Course started successfully"

    async def test_start_unassigned_course(
        self,
        client: AsyncClient,
        employee_headers: dict,
        sample_course: dict
    ):
        """Test starting an unassigned course (should fail)."""
        response = await client.post(
            f"/api/employee/courses/{sample_course['course_id']}/start",
            headers=employee_headers
        )

        # Should return forbidden or not found
        assert response.status_code in [403, 404]


@pytest.mark.employee
@pytest.mark.e2e
class TestEmployeeQuizWorkflow:
    """Test employee quiz workflows."""

    async def test_get_quiz_questions(
        self,
        client: AsyncClient,
        auth_headers: dict,
        employee_headers: dict,
        sample_course: dict,
        sample_question: dict,
        test_db,
        test_graph_db
    ):
        """Test getting quiz questions for a course."""
        # Get employee user ID
        response = await client.get(
            "/api/auth/me",
            headers=employee_headers
        )
        employee_id = response.json()["id"]

        # Assign course to employee
        response = await client.post(
            "/api/admin/assign-course",
            headers=auth_headers,
            json={
                "user_id": employee_id,
                "course_id": sample_course["course_id"]
            }
        )
        assert response.status_code == 200

        # Get quiz questions
        response = await client.get(
            f"/api/employee/courses/{sample_course['course_id']}/quiz",
            headers=employee_headers
        )

        assert response.status_code == 200
        quiz = response.json()
        assert "questions" in quiz or isinstance(quiz, list)

    async def test_submit_quiz_passing_score(
        self,
        client: AsyncClient,
        auth_headers: dict,
        employee_headers: dict,
        sample_course: dict,
        test_db,
        test_graph_db
    ):
        """Test submitting quiz with passing score."""
        # Get employee user ID
        response = await client.get(
            "/api/auth/me",
            headers=employee_headers
        )
        employee_id = response.json()["id"]

        # Assign course to employee
        response = await client.post(
            "/api/admin/assign-course",
            headers=auth_headers,
            json={
                "user_id": employee_id,
                "course_id": sample_course["course_id"]
            }
        )
        assert response.status_code == 200

        # Create multiple questions
        questions = []
        for i in range(5):
            response = await client.post(
                "/api/admin/questions",
                headers=auth_headers,
                json={
                    "question_text": f"Question {i+1}?",
                    "option_a": "Correct Answer",
                    "option_b": "Wrong Answer 1",
                    "option_c": "Wrong Answer 2",
                    "option_d": "Wrong Answer 3",
                    "correct_option": "A"
                }
            )
            question = response.json()
            questions.append(question)

            # Assign to course
            await client.post(
                "/api/admin/assign-question",
                headers=auth_headers,
                json={
                    "question_id": question["question_id"],
                    "course_id": sample_course["course_id"]
                }
            )

        # Submit quiz with all correct answers (100% score)
        answers = [
            {"question_id": q["question_id"], "selected_option": "A"}
            for q in questions
        ]

        response = await client.post(
            f"/api/employee/courses/{sample_course['course_id']}/submit-quiz",
            headers=employee_headers,
            json={"answers": answers}
        )

        assert response.status_code == 200
        result = response.json()
        assert "score" in result
        assert "passed" in result
        assert result["passed"] is True
        assert result["score"] >= 70  # Passing score

    async def test_submit_quiz_failing_score(
        self,
        client: AsyncClient,
        auth_headers: dict,
        employee_headers: dict,
        sample_course: dict,
        test_db,
        test_graph_db
    ):
        """Test submitting quiz with failing score."""
        # Get employee user ID
        response = await client.get(
            "/api/auth/me",
            headers=employee_headers
        )
        employee_id = response.json()["id"]

        # Assign course to employee
        response = await client.post(
            "/api/admin/assign-course",
            headers=auth_headers,
            json={
                "user_id": employee_id,
                "course_id": sample_course["course_id"]
            }
        )
        assert response.status_code == 200

        # Create questions
        questions = []
        for i in range(5):
            response = await client.post(
                "/api/admin/questions",
                headers=auth_headers,
                json={
                    "question_text": f"Fail Question {i+1}?",
                    "option_a": "Correct Answer",
                    "option_b": "Wrong Answer 1",
                    "option_c": "Wrong Answer 2",
                    "option_d": "Wrong Answer 3",
                    "correct_option": "A"
                }
            )
            question = response.json()
            questions.append(question)

            await client.post(
                "/api/admin/assign-question",
                headers=auth_headers,
                json={
                    "question_id": question["question_id"],
                    "course_id": sample_course["course_id"]
                }
            )

        # Submit quiz with all wrong answers (0% score)
        answers = [
            {"question_id": q["question_id"], "selected_option": "B"}
            for q in questions
        ]

        response = await client.post(
            f"/api/employee/courses/{sample_course['course_id']}/submit-quiz",
            headers=employee_headers,
            json={"answers": answers}
        )

        assert response.status_code == 200
        result = response.json()
        assert "score" in result
        assert "passed" in result
        assert result["passed"] is False
        assert result["score"] < 70  # Failing score

    async def test_multiple_quiz_attempts(
        self,
        client: AsyncClient,
        auth_headers: dict,
        employee_headers: dict,
        sample_course: dict,
        test_db,
        test_graph_db
    ):
        """Test taking quiz multiple times."""
        # Get employee user ID
        response = await client.get(
            "/api/auth/me",
            headers=employee_headers
        )
        employee_id = response.json()["id"]

        # Assign course to employee
        response = await client.post(
            "/api/admin/assign-course",
            headers=auth_headers,
            json={
                "user_id": employee_id,
                "course_id": sample_course["course_id"]
            }
        )
        assert response.status_code == 200

        # Create questions
        questions = []
        for i in range(3):
            response = await client.post(
                "/api/admin/questions",
                headers=auth_headers,
                json={
                    "question_text": f"Multi Attempt Question {i+1}?",
                    "option_a": "Correct",
                    "option_b": "Wrong",
                    "option_c": "Wrong",
                    "option_d": "Wrong",
                    "correct_option": "A"
                }
            )
            question = response.json()
            questions.append(question)

            await client.post(
                "/api/admin/assign-question",
                headers=auth_headers,
                json={
                    "question_id": question["question_id"],
                    "course_id": sample_course["course_id"]
                }
            )

        # First attempt - fail
        answers = [
            {"question_id": q["question_id"], "selected_option": "B"}
            for q in questions
        ]
        response = await client.post(
            f"/api/employee/courses/{sample_course['course_id']}/submit-quiz",
            headers=employee_headers,
            json={"answers": answers}
        )
        assert response.status_code == 200
        assert response.json()["passed"] is False

        # Second attempt - pass
        answers = [
            {"question_id": q["question_id"], "selected_option": "A"}
            for q in questions
        ]
        response = await client.post(
            f"/api/employee/courses/{sample_course['course_id']}/submit-quiz",
            headers=employee_headers,
            json={"answers": answers}
        )
        assert response.status_code == 200
        result = response.json()
        assert result["passed"] is True
        assert "attempt_number" in result or "attempts" in result


@pytest.mark.employee
@pytest.mark.e2e
class TestEmployeeProfile:
    """Test employee profile and progress workflows."""

    async def test_get_training_profile(
        self, client: AsyncClient, employee_headers: dict
    ):
        """Test getting employee training profile."""
        response = await client.get(
            "/api/employee/profile",
            headers=employee_headers
        )

        assert response.status_code == 200
        profile = response.json()
        assert "username" in profile or "user" in profile
        # Profile may contain various fields based on implementation

    async def test_get_progress_summary(
        self,
        client: AsyncClient,
        auth_headers: dict,
        employee_headers: dict,
        sample_course: dict,
        test_db,
        test_graph_db
    ):
        """Test getting employee progress summary."""
        # Get employee user ID
        response = await client.get(
            "/api/auth/me",
            headers=employee_headers
        )
        employee_id = response.json()["id"]

        # Assign course to employee
        response = await client.post(
            "/api/admin/assign-course",
            headers=auth_headers,
            json={
                "user_id": employee_id,
                "course_id": sample_course["course_id"]
            }
        )
        assert response.status_code == 200

        # Get progress
        response = await client.get(
            "/api/employee/progress",
            headers=employee_headers
        )

        assert response.status_code == 200
        progress = response.json()
        assert isinstance(progress, (dict, list))


@pytest.mark.employee
@pytest.mark.e2e
class TestEmployeeNotifications:
    """Test employee notification workflows."""

    async def test_get_notifications(
        self, client: AsyncClient, employee_headers: dict, test_db
    ):
        """Test getting employee notifications."""
        # Get employee user ID
        response = await client.get(
            "/api/auth/me",
            headers=employee_headers
        )
        employee_id = response.json()["id"]

        # Create a notification
        cursor = test_db.cursor()
        cursor.execute(
            """
            INSERT INTO notifications (user_id, message, is_read)
            VALUES (%s, %s, %s)
            """,
            (employee_id, "Test notification message", False)
        )
        test_db.commit()
        cursor.close()

        # Get notifications
        response = await client.get(
            "/api/employee/notifications",
            headers=employee_headers
        )

        assert response.status_code == 200
        notifications = response.json()
        assert isinstance(notifications, list)
        assert len(notifications) > 0
        assert any("Test notification" in str(n) for n in notifications)

    async def test_mark_notification_as_read(
        self, client: AsyncClient, employee_headers: dict, test_db
    ):
        """Test marking a notification as read."""
        # Get employee user ID
        response = await client.get(
            "/api/auth/me",
            headers=employee_headers
        )
        employee_id = response.json()["id"]

        # Create a notification
        cursor = test_db.cursor()
        cursor.execute(
            """
            INSERT INTO notifications (user_id, message, is_read)
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (employee_id, "Notification to mark as read", False)
        )
        notification_id = cursor.fetchone()[0]
        test_db.commit()
        cursor.close()

        # Mark as read
        response = await client.put(
            f"/api/employee/notifications/{notification_id}/read",
            headers=employee_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data

        # Verify it was marked as read
        cursor = test_db.cursor()
        cursor.execute(
            "SELECT is_read FROM notifications WHERE id = %s",
            (notification_id,)
        )
        is_read = cursor.fetchone()[0]
        cursor.close()
        assert is_read is True
