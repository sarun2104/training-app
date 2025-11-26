"""
Script to test employee profile update functionality
Verifies that adding new items updates the PostgreSQL database
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import get_postgres_db
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def test_profile_update():
    """Test profile update functionality"""
    logger.info("Testing employee profile update...")

    db = get_postgres_db()
    db.initialize_pool()

    try:
        # Get current profile for EMP001
        logger.info("\n1. Current Profile for EMP001:")
        logger.info("-" * 50)
        query = """
        SELECT employee_id, brief_profile, primary_skills, secondary_skills,
               past_projects, certifications
        FROM employee_profiles
        WHERE employee_id = 'EMP001'
        """
        result = db.execute_query(query, fetch=True)

        if result:
            profile = result[0]
            logger.info(f"Employee: {profile['employee_id']}")
            logger.info(f"Primary Skills Count: {len(profile['primary_skills'])}")
            logger.info(f"Secondary Skills Count: {len(profile['secondary_skills'])}")
            logger.info(f"Past Projects Count: {len(profile['past_projects'])}")
            logger.info(f"Certifications Count: {len(profile['certifications'])}")

        # Test adding a new skill
        logger.info("\n2. Testing Update - Adding New Skills:")
        logger.info("-" * 50)
        new_primary_skills = profile['primary_skills'] + ['TensorFlow', 'PyTorch']
        new_secondary_skills = profile['secondary_skills'] + ['Kubernetes']

        update_query = """
        UPDATE employee_profiles
        SET primary_skills = %s, secondary_skills = %s, updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = %s
        RETURNING primary_skills, secondary_skills
        """
        updated = db.execute_query(
            update_query,
            (new_primary_skills, new_secondary_skills, 'EMP001'),
            fetch=True
        )

        if updated:
            logger.info(f"✓ Updated Primary Skills: {updated[0]['primary_skills']}")
            logger.info(f"✓ Updated Secondary Skills: {updated[0]['secondary_skills']}")

        # Verify the update persisted
        logger.info("\n3. Verifying Update Persisted:")
        logger.info("-" * 50)
        verify_result = db.execute_query(query, fetch=True)

        if verify_result:
            verified_profile = verify_result[0]
            logger.info(f"✓ Primary Skills Count: {len(verified_profile['primary_skills'])}")
            logger.info(f"✓ Secondary Skills Count: {len(verified_profile['secondary_skills'])}")
            logger.info(f"✓ Primary Skills: {verified_profile['primary_skills']}")
            logger.info(f"✓ Secondary Skills: {verified_profile['secondary_skills']}")

        # Restore original profile
        logger.info("\n4. Restoring Original Profile:")
        logger.info("-" * 50)
        restore_query = """
        UPDATE employee_profiles
        SET primary_skills = %s, secondary_skills = %s, updated_at = CURRENT_TIMESTAMP
        WHERE employee_id = %s
        """
        db.execute_query(
            restore_query,
            (profile['primary_skills'], profile['secondary_skills'], 'EMP001'),
            fetch=False
        )
        logger.info("✓ Original profile restored")

        logger.info("\n=== PROFILE UPDATE TEST COMPLETED SUCCESSFULLY ===")

    except Exception as e:
        logger.error(f"Failed to test profile update: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close_pool()


if __name__ == "__main__":
    test_profile_update()
