"""
Database migration utilities for PostgreSQL schema setup
"""
import psycopg2
import logging
from pathlib import Path

from backend.config import settings

logger = logging.getLogger(__name__)


def run_migration():
    """Run PostgreSQL schema migration"""
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            database=settings.POSTGRES_DB,
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Read schema file
        schema_path = Path(__file__).parent / "schema.sql"
        with open(schema_path, "r") as f:
            schema_sql = f.read()

        # Execute schema
        logger.info("Executing PostgreSQL schema migration...")
        cursor.execute(schema_sql)
        logger.info("PostgreSQL schema migration completed successfully")

        cursor.close()
        conn.close()

    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise


def check_database_exists():
    """Check if database exists, create if not"""
    try:
        # Connect to default postgres database
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            database="postgres",
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s", (settings.POSTGRES_DB,)
        )
        exists = cursor.fetchone()

        if not exists:
            logger.info(f"Creating database: {settings.POSTGRES_DB}")
            cursor.execute(f"CREATE DATABASE {settings.POSTGRES_DB}")
            logger.info(f"Database {settings.POSTGRES_DB} created successfully")
        else:
            logger.info(f"Database {settings.POSTGRES_DB} already exists")

        cursor.close()
        conn.close()

    except Exception as e:
        logger.error(f"Database check/creation failed: {e}")
        raise


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    check_database_exists()
    run_migration()
