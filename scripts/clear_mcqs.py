"""
Script to clear all existing MCQs from the database
"""
import sys
import os
import logging

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.falkordb import FalkorDB
from backend.database import get_postgres_db

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def clear_all_mcqs():
    """Delete all MCQs from PostgreSQL and FalkorDB"""
    try:
        # Initialize databases
        logger.info("Connecting to databases...")

        postgres_db = get_postgres_db()
        if not postgres_db.pool:
            postgres_db.initialize_pool()

        falkor_db = FalkorDB()
        falkor_db.connect()

        # Delete from PostgreSQL
        logger.info("Deleting MCQs from PostgreSQL...")
        postgres_db.execute_query("DELETE FROM mcqs")
        logger.info("PostgreSQL MCQs deleted")

        # Delete from FalkorDB
        logger.info("Deleting Question nodes from FalkorDB...")
        query = "MATCH (q:Question) DETACH DELETE q"
        falkor_db.execute_query(query)
        logger.info("FalkorDB Question nodes deleted")

        # Close connections
        falkor_db.close()
        postgres_db.close_pool()

        logger.info("\nAll MCQs cleared successfully!")

    except Exception as e:
        logger.error(f"Failed to clear MCQs: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    clear_all_mcqs()
