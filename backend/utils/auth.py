"""
Authentication and Authorization Utilities
JWT token generation, password hashing, and user verification
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import logging

from backend.config import settings
from backend.database import get_postgres_db
from backend.models.schemas import TokenData

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_token(token: str, credentials_exception: HTTPException) -> TokenData:
    """Verify JWT token and extract payload"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        employee_id: str = payload.get("sub")
        role: str = payload.get("role")

        if employee_id is None:
            raise credentials_exception

        token_data = TokenData(employee_id=employee_id, role=role)
        return token_data
    except JWTError:
        raise credentials_exception


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Get current authenticated user from token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = verify_token(token, credentials_exception)

    # Fetch user from database
    db = get_postgres_db()
    query = """
        SELECT employee_id, employee_name, email, role, created_at
        FROM employees
        WHERE employee_id = %s
    """
    result = db.execute_query(query, (token_data.employee_id,), fetch=True)

    if not result:
        raise credentials_exception

    user_data = dict(result[0])

    # Transform to match frontend expectations
    return {
        "id": user_data["employee_id"],
        "username": user_data["email"].split("@")[0],  # Use email prefix as username
        "email": user_data["email"],
        "full_name": user_data["employee_name"],
        "role": user_data["role"],
        "created_at": user_data["created_at"].isoformat() if user_data.get("created_at") else None
    }


def get_current_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    """Verify current user is an admin"""
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Authenticate user by email and password"""
    db = get_postgres_db()
    query = "SELECT employee_id, employee_name, email, role, password_hash FROM employees WHERE email = %s"
    result = db.execute_query(query, (email,), fetch=True)

    if not result:
        return None

    user = dict(result[0])
    if not verify_password(password, user["password_hash"]):
        return None

    return user
