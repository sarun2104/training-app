"""
End-to-End Tests for Authentication
"""
import pytest
from httpx import AsyncClient


@pytest.mark.auth
@pytest.mark.e2e
class TestAuthentication:
    """Test authentication workflows."""

    async def test_login_success(self, client: AsyncClient, test_db):
        """Test successful login with valid credentials."""
        from utils.auth import hash_password

        # Create a test user
        cursor = test_db.cursor()
        hashed_pw = hash_password("testpass123")
        cursor.execute(
            """
            INSERT INTO users (username, email, hashed_password, full_name, role)
            VALUES (%s, %s, %s, %s, %s)
            """,
            ("testuser", "test@example.com", hashed_pw, "Test User", "employee")
        )
        test_db.commit()
        cursor.close()

        # Login
        response = await client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "testpass123"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0

    async def test_login_invalid_credentials(self, client: AsyncClient, test_db):
        """Test login with invalid credentials."""
        from utils.auth import hash_password

        # Create a test user
        cursor = test_db.cursor()
        hashed_pw = hash_password("correctpass")
        cursor.execute(
            """
            INSERT INTO users (username, email, hashed_password, full_name, role)
            VALUES (%s, %s, %s, %s, %s)
            """,
            ("testuser2", "test2@example.com", hashed_pw, "Test User 2", "employee")
        )
        test_db.commit()
        cursor.close()

        # Try login with wrong password
        response = await client.post(
            "/api/auth/login",
            json={"username": "testuser2", "password": "wrongpass"}
        )

        assert response.status_code == 401
        assert "detail" in response.json()

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test login with non-existent user."""
        response = await client.post(
            "/api/auth/login",
            json={"username": "nonexistent", "password": "password123"}
        )

        assert response.status_code == 401

    async def test_get_current_user(self, client: AsyncClient, admin_token: str):
        """Test getting current user information."""
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "admin"
        assert data["email"] == "admin@example.com"
        assert data["role"] == "admin"
        assert "id" in data

    async def test_get_current_user_unauthorized(self, client: AsyncClient):
        """Test getting current user without authentication."""
        response = await client.get("/api/auth/me")

        assert response.status_code == 401

    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """Test getting current user with invalid token."""
        response = await client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )

        assert response.status_code == 401

    async def test_logout(self, client: AsyncClient, admin_token: str):
        """Test logout functionality."""
        response = await client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {admin_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data

    async def test_protected_endpoint_without_auth(self, client: AsyncClient):
        """Test accessing protected endpoint without authentication."""
        response = await client.get("/api/admin/tracks")

        assert response.status_code == 401

    async def test_admin_endpoint_with_employee_token(
        self, client: AsyncClient, employee_token: str
    ):
        """Test accessing admin endpoint with employee token."""
        response = await client.post(
            "/api/admin/tracks",
            headers={"Authorization": f"Bearer {employee_token}"},
            json={"name": "Test Track", "description": "Test"}
        )

        # Should be forbidden (403) or unauthorized (401)
        assert response.status_code in [401, 403]


@pytest.mark.auth
@pytest.mark.e2e
class TestAuthorizationRoles:
    """Test role-based authorization."""

    async def test_admin_can_access_admin_endpoints(
        self, client: AsyncClient, auth_headers: dict, test_graph_db
    ):
        """Test that admin can access admin endpoints."""
        response = await client.get("/api/admin/tracks", headers=auth_headers)

        assert response.status_code == 200

    async def test_employee_can_access_employee_endpoints(
        self, client: AsyncClient, employee_headers: dict
    ):
        """Test that employee can access employee endpoints."""
        response = await client.get(
            "/api/employee/courses",
            headers=employee_headers
        )

        assert response.status_code == 200

    async def test_employee_cannot_create_tracks(
        self, client: AsyncClient, employee_headers: dict
    ):
        """Test that employee cannot create tracks."""
        response = await client.post(
            "/api/admin/tracks",
            headers=employee_headers,
            json={"name": "Unauthorized Track", "description": "Test"}
        )

        assert response.status_code in [401, 403]

    async def test_employee_cannot_create_courses(
        self, client: AsyncClient, employee_headers: dict
    ):
        """Test that employee cannot create courses."""
        response = await client.post(
            "/api/admin/courses",
            headers=employee_headers,
            json={
                "title": "Unauthorized Course",
                "description": "Test",
                "subtrack_id": 1
            }
        )

        assert response.status_code in [401, 403]
