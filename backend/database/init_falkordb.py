"""
FalkorDB Graph Initialization and Sample Data
"""
import logging
from typing import Dict, Any

from backend.database.falkordb import FalkorDB
from backend.config import settings

logger = logging.getLogger(__name__)


class GraphInitializer:
    """Initialize FalkorDB graph with schema and sample data"""

    def __init__(self, falkor_db: FalkorDB):
        self.db = falkor_db

    def initialize_schema(self):
        """Create constraints and indexes for the graph"""
        logger.info("Initializing FalkorDB schema...")

        # Note: FalkorDB/RedisGraph has limited constraint support
        # We'll handle uniqueness in application logic
        try:
            # Create sample structure to establish schema
            self.db.execute_query("""
                CREATE (t:Track {track_id: '_schema', track_name: '_schema'})
                RETURN t
            """)

            # Delete the schema node
            self.db.execute_query("""
                MATCH (t:Track {track_id: '_schema'})
                DELETE t
            """)

            logger.info("FalkorDB schema initialized")
        except Exception as e:
            logger.warning(f"Schema initialization: {e}")

    def create_sample_data(self):
        """Create sample learning structure in FalkorDB"""
        logger.info("Creating sample data in FalkorDB...")

        try:
            # Clear existing data (optional - comment out for production)
            # self.db.clear_graph()

            # Create Track: Data Science
            self.create_track("T001", "Data Science")

            # Create SubTrack: Machine Learning
            self.create_subtrack("ST001", "Machine Learning", "T001")

            # Create SubTrack: Deep Learning
            self.create_subtrack("ST002", "Deep Learning", "T001")

            # Create Course: EDA under Machine Learning
            self.create_course("C001", "Exploratory Data Analysis (EDA)", "ST001", "subtrack")

            # Create Course: PCA under Machine Learning
            self.create_course("C002", "Principal Component Analysis (PCA)", "ST001", "subtrack")

            # Create Course: Neural Networks under Deep Learning
            self.create_course("C006", "Neural Networks Fundamentals", "ST002", "subtrack")

            # Create child courses under EDA
            self.create_course("C004", "Univariate Analysis", "C001", "course")
            self.create_course("C005", "Multivariate Analysis", "C001", "course")

            # Create Track: Foundational
            self.create_track("T002", "Foundational Skills")

            # Create Course: Python directly under Foundational track
            self.create_course("C003", "Python Programming Basics", "T002", "track")

            # Add Links to Courses
            self.add_link("L001", "https://www.kaggle.com/learn/pandas", "C001")
            self.add_link("L002", "https://scikit-learn.org/stable/modules/decomposition.html#pca", "C002")
            self.add_link("L003", "https://docs.python.org/3/tutorial/", "C003")
            self.add_link("L004", "https://www.statology.org/univariate-analysis/", "C004")
            self.add_link("L005", "https://www.statology.org/multivariate-analysis/", "C005")
            self.add_link("L006", "https://www.deeplearning.ai/", "C006")

            # Add Questions to Courses
            self.add_question("Q001", "C001")
            self.add_question("Q002", "C002")
            self.add_question("Q003", "C003")

            logger.info("Sample data created successfully in FalkorDB")

        except Exception as e:
            logger.error(f"Failed to create sample data: {e}")
            raise

    def create_track(self, track_id: str, track_name: str):
        """Create a Track node"""
        query = f"""
        MERGE (t:Track {{track_id: '{track_id}'}})
        SET t.track_name = '{track_name}'
        RETURN t
        """
        self.db.execute_query(query)
        logger.info(f"Track created: {track_name} ({track_id})")

    def create_subtrack(self, subtrack_id: str, subtrack_name: str, track_id: str):
        """Create a SubTrack node and link to Track"""
        query = f"""
        MATCH (t:Track {{track_id: '{track_id}'}})
        MERGE (st:SubTrack {{subtrack_id: '{subtrack_id}'}})
        SET st.subtrack_name = '{subtrack_name}'
        MERGE (t)-[:has_subtrack]->(st)
        RETURN st
        """
        self.db.execute_query(query)
        logger.info(f"SubTrack created: {subtrack_name} ({subtrack_id}) under {track_id}")

    def create_course(self, course_id: str, course_name: str, parent_id: str, parent_type: str):
        """Create a Course node and link to parent (Track, SubTrack, or Course)"""
        if parent_type == "track":
            parent_label = "Track"
            parent_prop = "track_id"
        elif parent_type == "subtrack":
            parent_label = "SubTrack"
            parent_prop = "subtrack_id"
        else:  # course
            parent_label = "Course"
            parent_prop = "course_id"

        query = f"""
        MATCH (p:{parent_label} {{{parent_prop}: '{parent_id}'}})
        MERGE (c:Course {{course_id: '{course_id}'}})
        SET c.course_name = '{course_name}'
        MERGE (p)-[:has_course]->(c)
        RETURN c
        """
        self.db.execute_query(query)
        logger.info(f"Course created: {course_name} ({course_id}) under {parent_id}")

    def add_link(self, link_id: str, link_url: str, course_id: str):
        """Add a Link to a Course"""
        query = f"""
        MATCH (c:Course {{course_id: '{course_id}'}})
        MERGE (l:Links {{link_id: '{link_id}'}})
        SET l.link = '{link_url}'
        MERGE (c)-[:has_links]->(l)
        RETURN l
        """
        self.db.execute_query(query)
        logger.info(f"Link added: {link_id} to {course_id}")

    def add_question(self, question_id: str, course_id: str):
        """Add a Question to a Course"""
        query = f"""
        MATCH (c:Course {{course_id: '{course_id}'}})
        MERGE (q:Question {{question_id: '{question_id}'}})
        MERGE (c)-[:has_question]->(q)
        RETURN q
        """
        self.db.execute_query(query)
        logger.info(f"Question added: {question_id} to {course_id}")

    def assign_employee(self, employee_id: str, assignment_type: str, assignment_id: str):
        """Assign employee to Track, SubTrack, or Course"""
        if assignment_type == "track":
            label = "Track"
            prop = "track_id"
            rel = "assigned_track"
        elif assignment_type == "subtrack":
            label = "SubTrack"
            prop = "subtrack_id"
            rel = "assigned_subtrack"
        else:  # course
            label = "Course"
            prop = "course_id"
            rel = "assigned_course"

        query = f"""
        MATCH (n:{label} {{{prop}: '{assignment_id}'}})
        MERGE (e:Employees {{employee_id: '{employee_id}'}})
        MERGE (e)-[:{rel}]->(n)
        RETURN e, n
        """
        self.db.execute_query(query)
        logger.info(f"Employee {employee_id} assigned to {assignment_type} {assignment_id}")


def initialize_falkordb():
    """Main function to initialize FalkorDB"""
    from backend.database import get_falkor_db

    falkor_db = get_falkor_db()
    falkor_db.connect()

    initializer = GraphInitializer(falkor_db)
    initializer.initialize_schema()
    initializer.create_sample_data()

    logger.info("FalkorDB initialization complete")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    initialize_falkordb()
