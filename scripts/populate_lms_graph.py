"""
Script to populate FalkorDB lms_graph with Track, SubTrack, and Course structure
Clears existing graph and creates new hierarchical structure
"""
import sys
import os
import hashlib
import logging

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.falkordb import FalkorDB
from backend.config import settings

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def generate_id(name: str) -> str:
    """Generate a unique ID using hashlib SHA256"""
    return hashlib.sha256(name.encode('utf-8')).hexdigest()[:16]


class LMSGraphPopulator:
    """Populate LMS Graph with hierarchical learning structure"""

    def __init__(self, falkor_db: FalkorDB):
        self.db = falkor_db

    def clear_graph(self):
        """Clear all data from lms_graph"""
        logger.info("Clearing lms_graph...")
        try:
            self.db.clear_graph()
            logger.info("Graph cleared successfully")
        except Exception as e:
            logger.error(f"Failed to clear graph: {e}")
            raise

    def create_track(self, track_name: str) -> str:
        """Create a Track node and return its ID"""
        track_id = generate_id(track_name)
        query = f"""
        MERGE (t:Track {{track_id: '{track_id}'}})
        SET t.track_name = '{track_name}'
        RETURN t
        """
        self.db.execute_query(query)
        logger.info(f"✓ Track created: {track_name} (ID: {track_id})")
        return track_id

    def create_subtrack(self, subtrack_name: str, track_id: str) -> str:
        """Create a SubTrack node and link to Track"""
        subtrack_id = generate_id(subtrack_name)
        query = f"""
        MATCH (t:Track {{track_id: '{track_id}'}})
        MERGE (st:SubTrack {{subtrack_id: '{subtrack_id}'}})
        SET st.subtrack_name = '{subtrack_name}'
        MERGE (t)-[:has_subtrack]->(st)
        RETURN st
        """
        self.db.execute_query(query)
        logger.info(f"  ✓ SubTrack created: {subtrack_name} (ID: {subtrack_id})")
        return subtrack_id

    def create_course(self, course_name: str, subtrack_id: str) -> str:
        """Create a Course node and link to SubTrack"""
        course_id = generate_id(course_name)
        query = f"""
        MATCH (st:SubTrack {{subtrack_id: '{subtrack_id}'}})
        MERGE (c:Course {{course_id: '{course_id}'}})
        SET c.course_name = '{course_name}'
        MERGE (st)-[:has_course]->(c)
        RETURN c
        """
        self.db.execute_query(query)
        logger.info(f"    ✓ Course created: {course_name} (ID: {course_id})")
        return course_id

    def populate_foundational_track(self):
        """Populate Foundational Track with SubTracks and Courses"""
        logger.info("\n=== Creating Foundational Track ===")
        track_id = self.create_track("Foundational")

        # Python SubTrack
        logger.info("\n--- Python SubTrack ---")
        python_id = self.create_subtrack("Python", track_id)
        python_courses = [
            "Regular Expressions",
            "Inheritance and Polymorphism",
            "Asynchronous Programming",
            "Multithreading & Multiprocessing",
            "Type Hinting & Pydantic"
        ]
        for course in python_courses:
            self.create_course(course, python_id)

        # SQL SubTrack
        logger.info("\n--- SQL SubTrack ---")
        sql_id = self.create_subtrack("SQL", track_id)
        sql_courses = [
            "Date & Time Functions",
            "Subquery",
            "Window Functions",
            "Common Table Expression (CTE)",
            "Database Indexing & Optimization"
        ]
        for course in sql_courses:
            self.create_course(course, sql_id)

        # Mathematics for AI SubTrack
        logger.info("\n--- Mathematics for AI SubTrack ---")
        math_id = self.create_subtrack("Mathematics for AI", track_id)
        math_courses = [
            "Linear Algebra (Vectors, Matrices)",
            "Calculus (Gradient Descent)",
            "Probability & Statistics"
        ]
        for course in math_courses:
            self.create_course(course, math_id)

        # Data Manipulation & Analysis SubTrack
        logger.info("\n--- Data Manipulation & Analysis SubTrack ---")
        data_id = self.create_subtrack("Data Manipulation & Analysis", track_id)
        data_courses = [
            "Data Manipulation with Pandas",
            "Numerical Computing with NumPy",
            "Data Visualization (Matplotlib/Seaborn)"
        ]
        for course in data_courses:
            self.create_course(course, data_id)

        # Unit Testing SubTrack
        logger.info("\n--- Unit Testing SubTrack ---")
        testing_id = self.create_subtrack("Unit Testing", track_id)
        testing_courses = [
            "Python unit testing with pytest",
            "Python unit testing with unittest",
            "Mocking and Fixtures"
        ]
        for course in testing_courses:
            self.create_course(course, testing_id)

        # Version Control & APIs SubTrack
        logger.info("\n--- Version Control & APIs SubTrack ---")
        vcs_id = self.create_subtrack("Version Control & APIs", track_id)
        vcs_courses = [
            "Git Branching & Merging Strategies",
            "REST API Fundamentals",
            "FastAPI Implementation"
        ]
        for course in vcs_courses:
            self.create_course(course, vcs_id)

    def populate_genai_track(self):
        """Populate GenAI Track with SubTracks and Courses"""
        logger.info("\n=== Creating GenAI Track ===")
        track_id = self.create_track("GenAI")

        # LLM Fundamentals & Architecture SubTrack
        logger.info("\n--- LLM Fundamentals & Architecture SubTrack ---")
        llm_id = self.create_subtrack("LLM Fundamentals & Architecture", track_id)
        llm_courses = [
            "Transformer Architecture",
            "Attention Mechanisms",
            "Tokenization & Embeddings",
            "Neural Networks Basics (PyTorch)"
        ]
        for course in llm_courses:
            self.create_course(course, llm_id)

        # Prompt Engineering SubTrack
        logger.info("\n--- Prompt Engineering SubTrack ---")
        prompt_id = self.create_subtrack("Prompt Engineering", track_id)
        prompt_courses = [
            "Zero-shot & Few-shot Prompting",
            "Chain of Thought (CoT)",
            "Prompt Security & Jailbreaking Defense",
            "System Prompts & Persona Definition"
        ]
        for course in prompt_courses:
            self.create_course(course, prompt_id)

        # RAG SubTrack
        logger.info("\n--- RAG (Retrieval Augmented Generation) SubTrack ---")
        rag_id = self.create_subtrack("RAG (Retrieval Augmented Generation)", track_id)
        rag_courses = [
            "Vector Databases (Pinecone, ChromaDB)",
            "Semantic Search & Cosine Similarity",
            "Chunking Strategies",
            "Hybrid Search & Reranking"
        ]
        for course in rag_courses:
            self.create_course(course, rag_id)

        # Orchestration Frameworks SubTrack
        logger.info("\n--- Orchestration Frameworks SubTrack ---")
        orch_id = self.create_subtrack("Orchestration Frameworks", track_id)
        orch_courses = [
            "LangChain Fundamentals",
            "LlamaIndex Data Connectors",
            "Building Autonomous Agents (ReAct)",
            "Multi-Agent Systems (CrewAI/AutoGen)"
        ]
        for course in orch_courses:
            self.create_course(course, orch_id)

        # Fine-Tuning & Optimization SubTrack
        logger.info("\n--- Fine-Tuning & Optimization SubTrack ---")
        finetune_id = self.create_subtrack("Fine-Tuning & Optimization", track_id)
        finetune_courses = [
            "PEFT (Parameter-Efficient Fine-Tuning)",
            "LoRA & QLoRA",
            "Quantization (GGUF/INT8)",
            "RLHF (Reinforcement Learning from Human Feedback)"
        ]
        for course in finetune_courses:
            self.create_course(course, finetune_id)

        # LLMOps & Evaluation SubTrack
        logger.info("\n--- LLMOps & Evaluation SubTrack ---")
        llmops_id = self.create_subtrack("LLMOps & Evaluation", track_id)
        llmops_courses = [
            "LLM Evaluation Frameworks (Ragas)",
            "Model Serving (vLLM/Ollama)",
            "Monitoring & Observability"
        ]
        for course in llmops_courses:
            self.create_course(course, llmops_id)

    def populate_all(self):
        """Main method to populate entire graph"""
        logger.info("Starting LMS Graph population...")
        logger.info(f"Graph Name: {self.db.graph_name}")

        # Clear existing graph
        self.clear_graph()

        # Populate Tracks
        self.populate_foundational_track()
        self.populate_genai_track()

        logger.info("\n" + "="*60)
        logger.info("✓ LMS Graph population completed successfully!")
        logger.info("="*60)

    def verify_graph(self):
        """Verify the created graph structure"""
        logger.info("\n=== Verifying Graph Structure ===")

        # Count nodes
        count_query = """
        MATCH (n)
        RETURN labels(n)[0] as label, count(n) as count
        """
        results = self.db.execute_query(count_query)

        logger.info("\nNode counts:")
        for result in results:
            logger.info(f"  {result[0]}: {result[1]}")

        # Count relationships
        rel_query = """
        MATCH ()-[r]->()
        RETURN type(r) as relationship, count(r) as count
        """
        rel_results = self.db.execute_query(rel_query)

        logger.info("\nRelationship counts:")
        for result in rel_results:
            logger.info(f"  {result[0]}: {result[1]}")


def main():
    """Main entry point"""
    try:
        # Initialize FalkorDB connection
        logger.info("Connecting to FalkorDB...")
        falkor_db = FalkorDB()
        falkor_db.connect()

        # Create populator and run
        populator = LMSGraphPopulator(falkor_db)
        populator.populate_all()

        # Verify the graph
        populator.verify_graph()

        # Close connection
        falkor_db.close()

        logger.info("\nScript completed successfully!")

    except Exception as e:
        logger.error(f"Script failed: {e}")
        raise


if __name__ == "__main__":
    main()
