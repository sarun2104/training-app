"""
Comprehensive script to analyze and fix all quiz-related issues
"""
import sys
import os
import logging

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import get_postgres_db

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def analyze_and_fix_quiz_tables():
    """Analyze and fix all quiz-related tables"""
    logger.info("=== COMPREHENSIVE QUIZ ANALYSIS AND FIX ===\n")

    db = get_postgres_db()

    # Initialize the pool if not already initialized
    if not db.pool:
        db.initialize_pool()

    try:
        # 1. Check current schema of all quiz-related tables
        logger.info("1. ANALYZING TABLE SCHEMAS:")
        logger.info("-" * 50)

        tables = ['mcqs', 'quiz_attempts', 'quiz_responses', 'employee_course_progress']

        for table in tables:
            logger.info(f"\n{table.upper()} table:")
            columns = db.execute_query(f"""
                SELECT column_name, data_type, character_maximum_length, is_nullable
                FROM information_schema.columns
                WHERE table_name = '{table}'
                ORDER BY ordinal_position;
            """, fetch=True)

            if columns:
                for col in columns:
                    max_len = f"({col['character_maximum_length']})" if col['character_maximum_length'] else ""
                    logger.info(f"  - {col['column_name']}: {col['data_type']}{max_len} {'NULL' if col['is_nullable'] == 'YES' else 'NOT NULL'}")
            else:
                logger.warning(f"  Table {table} not found!")

        # 2. Check constraints on quiz_responses
        logger.info("\n\n2. CHECKING CONSTRAINTS ON quiz_responses:")
        logger.info("-" * 50)
        constraints = db.execute_query("""
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'quiz_responses';
        """, fetch=True)

        if constraints:
            for const in constraints:
                logger.info(f"  - {const['constraint_name']}: {const['constraint_type']}")

        # 3. Fix quiz_responses table
        logger.info("\n\n3. FIXING quiz_responses TABLE:")
        logger.info("-" * 50)

        # Read and execute the fix SQL
        sql_file = os.path.join(
            os.path.dirname(__file__),
            '..',
            'backend',
            'database',
            'migrations',
            'fix_quiz_responses_constraints.sql'
        )

        with open(sql_file, 'r') as f:
            sql = f.read()

        with db.get_cursor(dict_cursor=False) as cursor:
            cursor.execute(sql)

        logger.info("  ✓ quiz_responses table fixed!")

        # 4. Verify the fix
        logger.info("\n\n4. VERIFYING FIX:")
        logger.info("-" * 50)

        # Check column type
        result = db.execute_query("""
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'quiz_responses' AND column_name = 'selected_answer';
        """, fetch=True)

        if result:
            logger.info(f"  ✓ selected_answer column type: {result[0]['data_type']}")

        # Check remaining constraints
        constraints_after = db.execute_query("""
            SELECT constraint_name, constraint_type
            FROM information_schema.table_constraints
            WHERE table_name = 'quiz_responses';
        """, fetch=True)

        logger.info("  Remaining constraints:")
        if constraints_after:
            for const in constraints_after:
                logger.info(f"    - {const['constraint_name']}: {const['constraint_type']}")

        # 5. Check sample data
        logger.info("\n\n5. SAMPLE DATA CHECK:")
        logger.info("-" * 50)

        # Check if there are any quiz attempts
        attempt_count = db.execute_query("""
            SELECT COUNT(*) as count FROM quiz_attempts;
        """, fetch=True)

        if attempt_count:
            logger.info(f"  Total quiz attempts: {attempt_count[0]['count']}")

        # Check quiz responses
        response_count = db.execute_query("""
            SELECT COUNT(*) as count FROM quiz_responses;
        """, fetch=True)

        if response_count:
            logger.info(f"  Total quiz responses: {response_count[0]['count']}")

        logger.info("\n\n=== FIX COMPLETED SUCCESSFULLY ===")

    except Exception as e:
        logger.error(f"Failed to analyze/fix quiz tables: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close_pool()


if __name__ == "__main__":
    analyze_and_fix_quiz_tables()
