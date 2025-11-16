# End-to-End Test Suite

Comprehensive E2E testing suite for the Training App API.

## Overview

This test suite provides end-to-end testing for all API endpoints and workflows in the Training App. It uses pytest with async support and httpx for API testing.

## Test Structure

```
tests/
├── __init__.py              # Package initialization
├── conftest.py              # Shared fixtures and test configuration
├── test_auth.py             # Authentication and authorization tests
├── test_admin.py            # Admin workflow tests
├── test_employee.py         # Employee workflow tests
└── test_integration.py      # Integration and end-to-end tests
```

## Test Categories

### Authentication Tests (`test_auth.py`)
- ✅ User login with valid/invalid credentials
- ✅ JWT token validation
- ✅ Get current user information
- ✅ Logout functionality
- ✅ Role-based authorization (admin vs employee)
- ✅ Protected endpoint access control

### Admin Tests (`test_admin.py`)
- ✅ Track management (create, list)
- ✅ SubTrack management (create, assign to tracks)
- ✅ Course management (create, assign to subtracks)
- ✅ Study resource management (add links to courses)
- ✅ Question management (create, assign to courses)
- ✅ Employee management (create, assign to tracks/courses)
- ✅ Reporting and analytics

### Employee Tests (`test_employee.py`)
- ✅ View assigned courses
- ✅ Access course details and resources
- ✅ Start courses
- ✅ Take quizzes (passing/failing)
- ✅ Multiple quiz attempts
- ✅ View training profile
- ✅ Check progress summary
- ✅ Manage notifications

### Integration Tests (`test_integration.py`)
- ✅ Complete employee learning journey
- ✅ Multiple course assignments
- ✅ Concurrent quiz submissions
- ✅ Health check endpoints
- ✅ Data validation and error handling

## Prerequisites

### 1. Install Dependencies

```bash
pip install -r requirements.txt
pip install pytest-cov  # For coverage reports
```

### 2. Database Setup

Ensure PostgreSQL and FalkorDB are running:

```bash
# PostgreSQL (default port 5432)
# FalkorDB (default port 6379)
```

### 3. Environment Configuration

Create a `.env` file with test database credentials:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=training_db

FALKORDB_HOST=localhost
FALKORDB_PORT=6379
FALKORDB_GRAPH=lms_graph

SECRET_KEY=your-secret-key-for-testing
```

## Running Tests

### Run All Tests

```bash
pytest
```

### Run Specific Test Categories

```bash
# Authentication tests only
pytest -m auth

# Admin tests only
pytest -m admin

# Employee tests only
pytest -m employee

# Integration tests only
pytest -m integration

# E2E tests only
pytest -m e2e
```

### Run Specific Test Files

```bash
# Run authentication tests
pytest tests/test_auth.py

# Run admin tests
pytest tests/test_admin.py

# Run employee tests
pytest tests/test_employee.py

# Run integration tests
pytest tests/test_integration.py
```

### Run Specific Test Classes

```bash
# Run specific test class
pytest tests/test_auth.py::TestAuthentication

# Run specific test method
pytest tests/test_auth.py::TestAuthentication::test_login_success
```

### Run with Verbose Output

```bash
pytest -v
```

### Run with Coverage Report

```bash
# Terminal coverage report
pytest --cov=backend --cov-report=term-missing

# HTML coverage report
pytest --cov=backend --cov-report=html
# Open htmlcov/index.html in browser

# XML coverage report (for CI/CD)
pytest --cov=backend --cov-report=xml
```

### Run Tests in Parallel

```bash
# Install pytest-xdist
pip install pytest-xdist

# Run tests in parallel
pytest -n auto
```

### Skip Slow Tests

```bash
# Skip tests marked as slow
pytest -m "not slow"
```

## Test Fixtures

### Database Fixtures
- `test_db`: Creates isolated test PostgreSQL database
- `test_graph_db`: Creates isolated test FalkorDB graph

### Authentication Fixtures
- `admin_token`: JWT token for admin user
- `employee_token`: JWT token for employee user
- `auth_headers`: Authorization headers with admin token
- `employee_headers`: Authorization headers with employee token

### Data Fixtures
- `sample_track`: Pre-created track
- `sample_subtrack`: Pre-created subtrack
- `sample_course`: Pre-created course
- `sample_question`: Pre-created question

## Test Coverage

Current test coverage includes:

- **Authentication**: 100% of auth endpoints
- **Admin Workflows**: All CRUD operations
- **Employee Workflows**: All user-facing features
- **Integration**: Complete user journeys
- **Error Handling**: Validation and authorization errors

### Coverage Goals

- **Line Coverage**: > 85%
- **Branch Coverage**: > 80%
- **Critical Paths**: 100%

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      falkordb:
        image: falkordb/falkordb:latest
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install pytest-cov

      - name: Run tests
        env:
          POSTGRES_HOST: localhost
          POSTGRES_PORT: 5432
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: training_db
          FALKORDB_HOST: localhost
          FALKORDB_PORT: 6379
        run: |
          pytest --cov=backend --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Writing New Tests

### Test Structure Template

```python
import pytest
from httpx import AsyncClient


@pytest.mark.your_category
@pytest.mark.e2e
class TestYourFeature:
    """Test your feature description."""

    async def test_your_scenario(
        self,
        client: AsyncClient,
        auth_headers: dict
    ):
        """Test scenario description."""
        # Arrange
        test_data = {"key": "value"}

        # Act
        response = await client.post(
            "/api/endpoint",
            headers=auth_headers,
            json=test_data
        )

        # Assert
        assert response.status_code == 200
        assert "expected_field" in response.json()
```

### Best Practices

1. **Use Descriptive Names**: Test names should clearly describe what is being tested
2. **Follow AAA Pattern**: Arrange, Act, Assert
3. **One Assertion Per Test**: Keep tests focused on a single behavior
4. **Use Fixtures**: Leverage shared fixtures for common setup
5. **Clean Up**: Fixtures handle cleanup automatically
6. **Test Edge Cases**: Include both success and failure scenarios
7. **Document Complex Tests**: Add docstrings explaining the test scenario

### Adding New Fixtures

Add shared fixtures to `conftest.py`:

```python
@pytest.fixture(scope="function")
async def your_fixture(client: AsyncClient, auth_headers: dict):
    """Description of your fixture."""
    # Setup code
    response = await client.post("/api/setup", headers=auth_headers)
    data = response.json()

    yield data

    # Cleanup code (if needed)
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check FalkorDB is running
redis-cli -h localhost -p 6379 ping
```

### Test Database Cleanup

Tests automatically create and destroy test databases. If you encounter issues:

```bash
# Manually drop test database
psql -U postgres -c "DROP DATABASE training_db_test;"
```

### Async Test Issues

If async tests fail to run:

```bash
# Ensure pytest-asyncio is installed
pip install pytest-asyncio

# Check pytest.ini has asyncio_mode = auto
```

### Import Errors

```bash
# Add backend to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"

# Or install in development mode
pip install -e .
```

## Performance Benchmarks

### Test Execution Time

- Unit tests: < 1s per test
- Integration tests: 1-3s per test
- Full suite: ~30-60s

### Optimization Tips

1. Use fixtures with appropriate scope
2. Run tests in parallel with pytest-xdist
3. Skip slow tests during development
4. Use database transactions for faster cleanup

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain coverage above 85%
4. Update this README if adding new test categories
5. Follow existing test patterns and naming conventions

## Support

For issues or questions:

- Check test output for detailed error messages
- Review test fixtures in `conftest.py`
- Consult pytest documentation: https://docs.pytest.org/
- Review FastAPI testing docs: https://fastapi.tiangolo.com/tutorial/testing/

## License

Same as the main project license.
