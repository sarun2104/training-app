"""Script to check users table structure"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import get_postgres_db

db = get_postgres_db()
db.initialize_pool()

# First check what tables exist
tables = db.execute_query("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
""", fetch=True)

print("Available tables:")
print("=" * 50)
for row in tables:
    print(f"- {row['table_name']}")

print("\n")

# Now check users/employees table
result = db.execute_query("""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name IN ('users', 'employees')
    ORDER BY table_name, ordinal_position
""", fetch=True)

if result:
    print("Users/Employees table structure:")
    print("=" * 50)
    for row in result:
        print(f"{row['column_name']}: {row['data_type']}")
else:
    print("No users or employees table found")

db.close_pool()
