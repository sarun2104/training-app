#!/usr/bin/env python3
"""
Database Setup Script
Run this script to initialize PostgreSQL and FalkorDB with schema and sample data
"""
import sys
import os
import logging

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.migrations import check_database_exists, run_migration
from backend.database.init_falkordb import initialize_falkordb

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    """Main setup function"""
    logger.info("="*60)
    logger.info("Learning Management System - Database Setup")
    logger.info("="*60)

    # Step 1: Check and create PostgreSQL database
    logger.info("\n[1/3] Checking PostgreSQL database...")
    try:
        check_database_exists()
    except Exception as e:
        logger.error(f"Failed to check/create database: {e}")
        return 1

    # Step 2: Run PostgreSQL migrations
    logger.info("\n[2/3] Running PostgreSQL schema migration...")
    try:
        run_migration()
    except Exception as e:
        logger.error(f"Failed to run migration: {e}")
        return 1

    # Step 3: Initialize FalkorDB
    logger.info("\n[3/3] Initializing FalkorDB graph database...")
    try:
        initialize_falkordb()
    except Exception as e:
        logger.error(f"Failed to initialize FalkorDB: {e}")
        logger.warning("Make sure FalkorDB is running on localhost:6379")
        return 1

    logger.info("\n" + "="*60)
    logger.info("Database setup completed successfully!")
    logger.info("="*60)
    logger.info("\nDefault admin credentials:")
    logger.info("  Email: admin@company.com")
    logger.info("  Password: admin123")
    logger.info("\nDefault employee credentials:")
    logger.info("  Email: john.doe@company.com")
    logger.info("  Password: admin123")
    logger.info("\n⚠️  IMPORTANT: Change default passwords in production!")
    logger.info("="*60)

    return 0


if __name__ == "__main__":
    sys.exit(main())
