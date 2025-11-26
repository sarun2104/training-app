"""
Script to verify MCQ quality by showing samples
"""
import sys
import os
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.falkordb import FalkorDB
from backend.database import get_postgres_db

# Sample a few courses to verify
SAMPLE_COURSES = [
    "Linear Algebra (Vectors, Matrices)",
    "Chunking Strategies",
    "Multi-Agent Systems (CrewAI/AutoGen)",
    "Window Functions",
    "Prompt Security & Jailbreaking Defense"
]

falkor_db = FalkorDB()
postgres_db = get_postgres_db()

try:
    falkor_db.connect()
    if not postgres_db.pool:
        postgres_db.initialize_pool()

    for course_name in SAMPLE_COURSES:
        print(f"\n{'='*80}")
        print(f"Course: {course_name}")
        print('='*80)

        # Get course ID
        query = """
        MATCH (c:Course {course_name: $course_name})
        RETURN c.course_id as course_id
        """
        result = falkor_db.execute_query(query, {"course_name": course_name})

        if not result:
            print(f"Course not found: {course_name}")
            continue

        course_id = result[0][0]

        # Get questions for this course
        query = """
        MATCH (c:Course {course_id: $course_id})-[:has_question]->(q:Question)
        RETURN q.question_id as question_id
        """
        result = falkor_db.execute_query(query, {"course_id": course_id})
        question_ids = [row[0] for row in result]

        # Get MCQ details from PostgreSQL
        for i, qid in enumerate(question_ids, 1):
            mcq = postgres_db.execute_query(
                "SELECT question_text, option_a, option_b, option_c, option_d, correct_answers, multiple_answer_flag FROM mcqs WHERE question_id = %s",
                (qid,),
                fetch=True
            )

            if mcq:
                mcq = mcq[0]
                print(f"\nQ{i}. {mcq['question_text']}")
                print(f"   A) {mcq['option_a']}")
                print(f"   B) {mcq['option_b']}")
                print(f"   C) {mcq['option_c']}")
                print(f"   D) {mcq['option_d']}")
                print(f"   Correct: {', '.join(mcq['correct_answers'])}")
                print(f"   Type: {'Multiple Choice' if mcq['multiple_answer_flag'] else 'Single Choice'}")

    print(f"\n{'='*80}")
    print("Verification Complete!")
    print('='*80)

finally:
    falkor_db.close()
    postgres_db.close_pool()
