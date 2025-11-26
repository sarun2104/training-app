"""
Check if questions exist for a specific course
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.falkordb import FalkorDB
from backend.database import get_postgres_db

# Get course ID from command line
course_id = sys.argv[1] if len(sys.argv) > 1 else "0031386635853e3d"

print(f"\nChecking course: {course_id}\n")

# Check FalkorDB
falkor_db = FalkorDB()
falkor_db.connect()

# Get course name
query = f"MATCH (c:Course {{course_id: '{course_id}'}}) RETURN c.course_name AS course_name"
result = falkor_db.execute_query(query)
if result:
    print(f"Course name: {result[0][0]}")
else:
    print("Course not found in FalkorDB!")

# Get questions
query = """
MATCH (c:Course {course_id: $course_id})-[:has_question]->(q:Question)
RETURN q.question_id AS question_id
"""
result = falkor_db.execute_query(query, {"course_id": course_id})
print(f"\nFound {len(result) if result else 0} questions in FalkorDB")
if result:
    for row in result:
        print(f"  - {row[0]}")

# Check PostgreSQL
postgres_db = get_postgres_db()
if result:
    question_ids = [row[0] for row in result]
    placeholders = ",".join(["%s"] * len(question_ids))
    query = f"""
    SELECT question_id, question_text
    FROM mcqs
    WHERE question_id IN ({placeholders})
    """
    pg_result = postgres_db.execute_query(query, tuple(question_ids), fetch=True)
    print(f"\nFound {len(pg_result) if pg_result else 0} questions in PostgreSQL")
    if pg_result:
        for row in pg_result:
            print(f"  - {row['question_id']}: {row['question_text'][:60]}...")
