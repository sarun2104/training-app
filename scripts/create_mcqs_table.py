"""
Script to create the MCQs table in PostgreSQL database
"""
import sys
import os
import logging

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import get_postgres_db

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def create_mcqs_table():
    """Create MCQs table in PostgreSQL"""
    logger.info("Creating MCQs table...")

    db = get_postgres_db()

    # Initialize the pool if not already initialized
    if not db.pool:
        db.initialize_pool()

    try:
        # Read the SQL file
        sql_file = os.path.join(
            os.path.dirname(__file__),
            '..',
            'backend',
            'database',
            'migrations',
            'create_mcqs_table.sql'
        )

        with open(sql_file, 'r') as f:
            sql = f.read()

        # Execute the SQL using the database execute_query method
        with db.get_cursor(dict_cursor=False) as cursor:
            cursor.execute(sql)

        logger.info("✓ MCQs table created successfully!")

        # Verify table exists
        columns = db.execute_query("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'mcqs'
            ORDER BY ordinal_position;
        """, fetch=True)

        logger.info("\nTable structure:")
        for col in columns:
            logger.info(f"  - {col['column_name']}: {col['data_type']}")

    except Exception as e:
        logger.error(f"Failed to create MCQs table: {e}")
        raise
    finally:
        db.close_pool()


if __name__ == "__main__":
    create_mcqs_table()
