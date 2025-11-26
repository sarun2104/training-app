"""
Script to alter quiz_responses table to support multi-answer questions
"""
import sys
import os
import logging

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import get_postgres_db

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def fix_quiz_responses_table():
    """Alter quiz_responses.selected_answer column to TEXT"""
    logger.info("Altering quiz_responses table...")

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
            'alter_quiz_responses_selected_answer.sql'
        )

        with open(sql_file, 'r') as f:
            sql = f.read()

        # Execute the SQL using the database execute_query method
        with db.get_cursor(dict_cursor=False) as cursor:
            cursor.execute(sql)

        logger.info("✓ quiz_responses table altered successfully!")

        # Verify column type
        check_query = """
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'quiz_responses' AND column_name = 'selected_answer';
        """
        result = db.execute_query(check_query, fetch=True)

        if result:
            col = result[0]
            logger.info(f"\nColumn 'selected_answer' type: {col['data_type']}")
        else:
            logger.warning("Could not verify column type")

    except Exception as e:
        logger.error(f"Failed to alter quiz_responses table: {e}")
        raise
    finally:
        db.close_pool()


if __name__ == "__main__":
    fix_quiz_responses_table()
