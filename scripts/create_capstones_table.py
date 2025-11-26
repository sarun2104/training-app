"""
Script to create capstones table and populate sample data
"""
import sys
import os
import logging

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import get_postgres_db

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def create_capstones_table():
    """Create capstones table and populate sample data"""
    logger.info("Creating capstones table...")

    db = get_postgres_db()

    # Initialize the pool if not already initialized
    if not db.pool:
        db.initialize_pool()

    try:
        # Read and execute the migration SQL
        sql_file = os.path.join(
            os.path.dirname(__file__),
            '..',
            'backend',
            'database',
            'migrations',
            'create_capstones_table.sql'
        )

        with open(sql_file, 'r') as f:
            sql = f.read()

        with db.get_cursor(dict_cursor=False) as cursor:
            cursor.execute(sql)

        logger.info("✓ capstones table created successfully!")

        # Verify the table exists and check sample data
        verify_query = """
        SELECT capstone_id, capstone_name, tags, duration_weeks, dataset_link
        FROM capstones
        ORDER BY capstone_id
        """
        result = db.execute_query(verify_query, fetch=True)

        if result:
            logger.info(f"\n✓ Sample capstones created: {len(result)}")
            for capstone in result:
                logger.info(f"\n  {capstone['capstone_id']}: {capstone['capstone_name']}")
                logger.info(f"    Duration: {capstone['duration_weeks']} weeks")
                logger.info(f"    Tags: {', '.join(capstone['tags'])}")
                logger.info(f"    Dataset: {capstone['dataset_link']}")

        logger.info("\n=== CAPSTONES TABLE CREATED SUCCESSFULLY ===")

    except Exception as e:
        logger.error(f"Failed to create capstones table: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close_pool()


if __name__ == "__main__":
    create_capstones_table()
