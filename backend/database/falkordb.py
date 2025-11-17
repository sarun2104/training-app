"""
FalkorDB (Redis Graph) Connection and Utilities
"""
import redis
from typing import Optional, Dict, List, Any
import logging

from backend.config import settings

logger = logging.getLogger(__name__)


class FalkorDB:
    """FalkorDB (Redis Graph) connection manager"""

    def __init__(self):
        self.client: Optional[redis.Redis] = None
        self.graph_name: str = settings.FALKORDB_GRAPH_NAME

    def connect(self):
        """Establish connection to FalkorDB"""
        try:
            # Only pass password if it's not empty or "Default"
            password = settings.FALKORDB_PASSWORD if settings.FALKORDB_PASSWORD and settings.FALKORDB_PASSWORD not in ["", "Default"] else None

            self.client = redis.Redis(
                host=settings.FALKORDB_HOST,
                port=settings.FALKORDB_PORT,
                db=settings.FALKORDB_DB,
                password=password,
                decode_responses=True,
            )
            # Test connection
            self.client.ping()
            logger.info("FalkorDB connection established successfully")
        except Exception as e:
            logger.error(f"Failed to connect to FalkorDB: {e}")
            raise

    def execute_query(self, query: str, params: Dict[str, Any] = None) -> List[Any]:
        """Execute a Cypher query on the graph"""
        if not self.client:
            raise Exception("FalkorDB client not connected")

        try:
            # Use GRAPH.QUERY command for FalkorDB/RedisGraph
            if params:
                # Build parameterized query
                query = self._build_parameterized_query(query, params)

            result = self.client.execute_command("GRAPH.QUERY", self.graph_name, query)
            return self._parse_result(result)
        except Exception as e:
            logger.error(f"FalkorDB query error: {e}")
            raise

    def _build_parameterized_query(self, query: str, params: Dict[str, Any]) -> str:
        """Build parameterized query (simple implementation)"""
        # For production, use proper parameterization
        # This is a simplified version for demonstration
        for key, value in params.items():
            placeholder = f"${key}"
            if isinstance(value, str):
                query = query.replace(placeholder, f"'{value}'")
            else:
                query = query.replace(placeholder, str(value))
        return query

    def _parse_result(self, result: Any) -> List[Any]:
        """Parse FalkorDB query result"""
        # FalkorDB/RedisGraph returns results in specific format
        # This is a basic parser, can be enhanced based on needs
        if not result or len(result) < 2:
            return []

        # Result format: [header, data_rows, statistics]
        if len(result) > 1 and isinstance(result[1], list):
            return result[1]
        return []

    def create_constraints(self):
        """Create uniqueness constraints for node properties"""
        constraints = [
            "CREATE CONSTRAINT ON (t:Track) ASSERT t.track_id IS UNIQUE",
            "CREATE CONSTRAINT ON (st:SubTrack) ASSERT st.subtrack_id IS UNIQUE",
            "CREATE CONSTRAINT ON (c:Course) ASSERT c.course_id IS UNIQUE",
            "CREATE CONSTRAINT ON (l:Links) ASSERT l.link_id IS UNIQUE",
            "CREATE CONSTRAINT ON (q:Question) ASSERT q.question_id IS UNIQUE",
            "CREATE CONSTRAINT ON (e:Employees) ASSERT e.employee_id IS UNIQUE",
        ]

        for constraint in constraints:
            try:
                self.execute_query(constraint)
                logger.info(f"Constraint created: {constraint}")
            except Exception as e:
                # Constraint might already exist
                logger.warning(f"Constraint creation skipped: {e}")

    def create_indexes(self):
        """Create indexes for frequently queried properties"""
        indexes = [
            "CREATE INDEX FOR (t:Track) ON (t.track_name)",
            "CREATE INDEX FOR (st:SubTrack) ON (st.subtrack_name)",
            "CREATE INDEX FOR (c:Course) ON (c.course_name)",
        ]

        for index in indexes:
            try:
                self.execute_query(index)
                logger.info(f"Index created: {index}")
            except Exception as e:
                logger.warning(f"Index creation skipped: {e}")

    def clear_graph(self):
        """Clear all data from graph (use with caution!)"""
        try:
            self.client.execute_command("GRAPH.DELETE", self.graph_name)
            logger.warning(f"Graph '{self.graph_name}' deleted")
        except Exception as e:
            logger.error(f"Failed to clear graph: {e}")

    def close(self):
        """Close FalkorDB connection"""
        if self.client:
            self.client.close()
            logger.info("FalkorDB connection closed")


# Global FalkorDB instance
falkor_db = FalkorDB()


def get_falkor_db() -> FalkorDB:
    """Get FalkorDB instance"""
    return falkor_db
