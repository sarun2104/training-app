#!/usr/bin/env python3
"""
Reset admin passwords to ensure compatibility
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.utils.auth import get_password_hash
from backend.database import get_postgres_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def reset_passwords():
    """Reset passwords for default users"""
    try:
        # Generate new password hashes
        admin_hash = get_password_hash("admin123")

        logger.info("Generated new password hashes")
        logger.info(f"Admin hash: {admin_hash}")

        # Update database
        db = get_postgres_db()
        db.initialize_pool(minconn=1, maxconn=2)

        # Update admin password
        query = "UPDATE employees SET password_hash = %s WHERE email = %s"
        db.execute_query(query, (admin_hash, 'admin@company.com'))
        logger.info("✓ Updated admin@company.com password")

        # Update employee password
        db.execute_query(query, (admin_hash, 'john.doe@company.com'))
        logger.info("✓ Updated john.doe@company.com password")

        db.close_pool()

        logger.info("\n" + "="*60)
        logger.info("Passwords reset successfully!")
        logger.info("="*60)
        logger.info("Credentials:")
        logger.info("  Email: admin@company.com")
        logger.info("  Password: admin123")
        logger.info("")
        logger.info("  Email: john.doe@company.com")
        logger.info("  Password: admin123")
        logger.info("="*60)

    except Exception as e:
        logger.error(f"Failed to reset passwords: {e}")
        raise

if __name__ == "__main__":
    reset_passwords()
