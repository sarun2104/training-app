"""
Quick script to get all course names from FalkorDB
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.falkordb import FalkorDB

falkor_db = FalkorDB()
falkor_db.connect()

query = """
MATCH (c:Course)
RETURN c.course_name as course_name
ORDER BY c.course_name
"""

result = falkor_db.execute_query(query)
courses = [row[0] for row in result]

print(f"Total courses: {len(courses)}\n")
for i, course in enumerate(courses, 1):
    print(f"{i}. {course}")

falkor_db.close()
