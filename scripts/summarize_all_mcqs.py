"""
Script to show first question from each course for complete verification
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.falkordb import FalkorDB
from backend.database import get_postgres_db

falkor_db = FalkorDB()
postgres_db = get_postgres_db()

try:
    falkor_db.connect()
    if not postgres_db.pool:
        postgres_db.initialize_pool()

    # Get all courses
    query = """
    MATCH (c:Course)
    RETURN c.course_id as course_id, c.course_name as course_name
    ORDER BY c.course_name
    """
    courses = falkor_db.execute_query(query)

    print(f"\n{'='*100}")
    print(f"MCQ QUALITY VERIFICATION - First Question from Each Course")
    print(f"{'='*100}\n")

    for i, (course_id, course_name) in enumerate(courses, 1):
        # Get first question for this course
        query = """
        MATCH (c:Course {course_id: $course_id})-[:has_question]->(q:Question)
        RETURN q.question_id as question_id
        LIMIT 1
        """
        result = falkor_db.execute_query(query, {"course_id": course_id})

        if result:
            qid = result[0][0]
            mcq = postgres_db.execute_query(
                "SELECT question_text FROM mcqs WHERE question_id = %s",
                (qid,),
                fetch=True
            )

            if mcq:
                print(f"{i}. {course_name}")
                print(f"   Q: {mcq[0]['question_text']}")
                print()

    print(f"{'='*100}")
    print(f"Total: {len(courses)} courses with technical MCQs")
    print(f"{'='*100}\n")

finally:
    falkor_db.close()
    postgres_db.close_pool()
