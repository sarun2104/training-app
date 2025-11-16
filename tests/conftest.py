"""
Pytest fixtures for E2E testing
"""
import asyncio
import pytest
import psycopg2
from httpx import AsyncClient, ASGITransport
from typing import AsyncGenerator, Dict, Any
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app
from config import settings
from database import postgres_db, falkor_db


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def test_db():
    """Create a test database connection and clean up after tests."""
    # Connect to default postgres database to create test database
    conn = psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        database="postgres"
    )
    conn.autocommit = True
    cursor = conn.cursor()

    # Drop and recreate test database
    test_db_name = f"{settings.POSTGRES_DB}_test"
    cursor.execute(f"DROP DATABASE IF EXISTS {test_db_name}")
    cursor.execute(f"CREATE DATABASE {test_db_name}")
    cursor.close()
    conn.close()

    # Connect to test database
    test_conn = psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        database=test_db_name
    )

    # Create tables
    cursor = test_conn.cursor()

    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            role VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create courses table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            track_id INTEGER,
            subtrack_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create enrollments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS enrollments (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
            enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'active',
            progress INTEGER DEFAULT 0,
            UNIQUE(user_id, course_id)
        )
    """)

    # Create quiz_attempts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
            score FLOAT NOT NULL,
            passed BOOLEAN NOT NULL,
            attempt_number INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create notifications table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    test_conn.commit()
    cursor.close()

    yield test_conn

    # Cleanup
    test_conn.close()

    # Drop test database
    conn = psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        database="postgres"
    )
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute(f"DROP DATABASE IF EXISTS {test_db_name}")
    cursor.close()
    conn.close()


@pytest.fixture(scope="function")
async def test_graph_db():
    """Create a test graph database connection and clean up after tests."""
    # Ensure FalkorDB is connected
    if not falkor_db.client:
        falkor_db.connect()

    # Clear the graph
    try:
        falkor_db.execute_query("MATCH (n) DETACH DELETE n")
    except:
        pass  # Graph might be empty

    yield falkor_db

    # Cleanup
    try:
        falkor_db.execute_query("MATCH (n) DETACH DELETE n")
    except:
        pass


@pytest.fixture(scope="function")
async def client(test_db, test_graph_db) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client."""
    # Override database connections in the app
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac


@pytest.fixture(scope="function")
async def admin_token(client: AsyncClient, test_db) -> str:
    """Create an admin user and return authentication token."""
    from utils.auth import hash_password

    # Create admin user
    cursor = test_db.cursor()
    hashed_pw = hash_password("admin123")
    cursor.execute(
        """
        INSERT INTO users (username, email, hashed_password, full_name, role)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """,
        ("admin", "admin@example.com", hashed_pw, "Admin User", "admin")
    )
    test_db.commit()
    cursor.close()

    # Login and get token
    response = await client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin123"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture(scope="function")
async def employee_token(client: AsyncClient, test_db) -> str:
    """Create an employee user and return authentication token."""
    from utils.auth import hash_password

    # Create employee user
    cursor = test_db.cursor()
    hashed_pw = hash_password("employee123")
    cursor.execute(
        """
        INSERT INTO users (username, email, hashed_password, full_name, role)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """,
        ("employee", "employee@example.com", hashed_pw, "Employee User", "employee")
    )
    test_db.commit()
    cursor.close()

    # Login and get token
    response = await client.post(
        "/api/auth/login",
        json={"username": "employee", "password": "employee123"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture(scope="function")
def auth_headers(admin_token: str) -> Dict[str, str]:
    """Return authorization headers with admin token."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="function")
def employee_headers(employee_token: str) -> Dict[str, str]:
    """Return authorization headers with employee token."""
    return {"Authorization": f"Bearer {employee_token}"}


@pytest.fixture(scope="function")
async def sample_track(client: AsyncClient, auth_headers: Dict[str, str], test_graph_db) -> Dict[str, Any]:
    """Create a sample track in the graph database."""
    response = await client.post(
        "/api/admin/tracks",
        headers=auth_headers,
        json={
            "name": "Python Development",
            "description": "Learn Python programming"
        }
    )
    assert response.status_code == 200
    return response.json()


@pytest.fixture(scope="function")
async def sample_subtrack(
    client: AsyncClient,
    auth_headers: Dict[str, str],
    sample_track: Dict[str, Any],
    test_graph_db
) -> Dict[str, Any]:
    """Create a sample subtrack in the graph database."""
    response = await client.post(
        "/api/admin/subtracks",
        headers=auth_headers,
        json={
            "name": "FastAPI Framework",
            "description": "Learn FastAPI",
            "track_id": sample_track["track_id"]
        }
    )
    assert response.status_code == 200
    return response.json()


@pytest.fixture(scope="function")
async def sample_course(
    client: AsyncClient,
    auth_headers: Dict[str, str],
    sample_subtrack: Dict[str, Any],
    test_graph_db
) -> Dict[str, Any]:
    """Create a sample course in the graph database."""
    response = await client.post(
        "/api/admin/courses",
        headers=auth_headers,
        json={
            "title": "FastAPI Basics",
            "description": "Introduction to FastAPI",
            "subtrack_id": sample_subtrack["subtrack_id"]
        }
    )
    assert response.status_code == 200
    return response.json()


@pytest.fixture(scope="function")
async def sample_question(
    client: AsyncClient,
    auth_headers: Dict[str, str],
    sample_course: Dict[str, Any],
    test_graph_db
) -> Dict[str, Any]:
    """Create a sample question and assign to course."""
    # Create question
    response = await client.post(
        "/api/admin/questions",
        headers=auth_headers,
        json={
            "question_text": "What is FastAPI?",
            "option_a": "A web framework",
            "option_b": "A database",
            "option_c": "A testing tool",
            "option_d": "A deployment tool",
            "correct_option": "A"
        }
    )
    assert response.status_code == 200
    question = response.json()

    # Assign to course
    response = await client.post(
        "/api/admin/assign-question",
        headers=auth_headers,
        json={
            "question_id": question["question_id"],
            "course_id": sample_course["course_id"]
        }
    )
    assert response.status_code == 200

    return question
