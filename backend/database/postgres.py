"""
PostgreSQL Database Connection and Utilities
"""
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from typing import Optional
import logging

from backend.config import settings

logger = logging.getLogger(__name__)


class PostgresDB:
    """PostgreSQL database connection manager with connection pooling"""

    def __init__(self):
        self.pool: Optional[SimpleConnectionPool] = None

    def initialize_pool(self, minconn: int = 1, maxconn: int = 10):
        """Initialize connection pool"""
        try:
            self.pool = SimpleConnectionPool(
                minconn,
                maxconn,
                host=settings.POSTGRES_HOST,
                port=settings.POSTGRES_PORT,
                user=settings.POSTGRES_USER,
                password=settings.POSTGRES_PASSWORD,
                database=settings.POSTGRES_DB,
            )
            logger.info("PostgreSQL connection pool initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL pool: {e}")
            raise

    @contextmanager
    def get_connection(self):
        """Get connection from pool (context manager)"""
        if not self.pool:
            raise Exception("Connection pool not initialized")

        conn = self.pool.getconn()
        try:
            yield conn
        finally:
            self.pool.putconn(conn)

    @contextmanager
    def get_cursor(self, dict_cursor: bool = True):
        """Get cursor from pool connection (context manager)"""
        with self.get_connection() as conn:
            cursor_factory = RealDictCursor if dict_cursor else None
            cursor = conn.cursor(cursor_factory=cursor_factory)
            try:
                yield cursor
                conn.commit()
            except Exception as e:
                conn.rollback()
                logger.error(f"Database error: {e}")
                raise
            finally:
                cursor.close()

    def execute_query(self, query: str, params: tuple = None, fetch: bool = False):
        """Execute a query and optionally fetch results"""
        with self.get_cursor() as cursor:
            cursor.execute(query, params or ())
            if fetch:
                return cursor.fetchall()
            return cursor.rowcount

    def execute_many(self, query: str, params_list: list):
        """Execute query with multiple parameter sets"""
        with self.get_cursor() as cursor:
            cursor.executemany(query, params_list)
            return cursor.rowcount

    def close_pool(self):
        """Close all connections in pool"""
        if self.pool:
            self.pool.closeall()
            logger.info("PostgreSQL connection pool closed")


# Global database instance
postgres_db = PostgresDB()


def get_postgres_db() -> PostgresDB:
    """Get PostgreSQL database instance"""
    return postgres_db
