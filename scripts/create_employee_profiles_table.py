"""
Script to create employee_profiles table and populate sample data
"""
import sys
import os
import logging

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import get_postgres_db

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def create_employee_profiles_table():
    """Create employee_profiles table and populate sample data"""
    logger.info("Creating employee_profiles table...")

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
            'create_employee_profiles.sql'
        )

        with open(sql_file, 'r') as f:
            sql = f.read()

        with db.get_cursor(dict_cursor=False) as cursor:
            cursor.execute(sql)

        logger.info("✓ employee_profiles table created successfully!")

        # Verify the table exists and check sample data
        verify_query = """
        SELECT employee_id, brief_profile,
               array_length(primary_skills, 1) as primary_skills_count,
               array_length(secondary_skills, 1) as secondary_skills_count,
               array_length(past_projects, 1) as past_projects_count,
               array_length(certifications, 1) as certifications_count
        FROM employee_profiles
        WHERE employee_id = 'EMP001'
        """
        result = db.execute_query(verify_query, fetch=True)

        if result:
            profile = result[0]
            logger.info(f"\n✓ Sample profile created for {profile['employee_id']}")
            logger.info(f"  - Primary skills: {profile['primary_skills_count']}")
            logger.info(f"  - Secondary skills: {profile['secondary_skills_count']}")
            logger.info(f"  - Past projects: {profile['past_projects_count']}")
            logger.info(f"  - Certifications: {profile['certifications_count']}")

        logger.info("\n=== EMPLOYEE PROFILES TABLE CREATED SUCCESSFULLY ===")

    except Exception as e:
        logger.error(f"Failed to create employee_profiles table: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close_pool()


if __name__ == "__main__":
    create_employee_profiles_table()
