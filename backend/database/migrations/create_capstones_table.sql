-- Create capstones table to store capstone project information
-- Capstones are standalone projects that students can undertake to demonstrate mastery

CREATE TABLE IF NOT EXISTS capstones (
    capstone_id VARCHAR(50) PRIMARY KEY,
    capstone_name VARCHAR(255) NOT NULL,
    tags TEXT[],
    duration_weeks INTEGER NOT NULL,
    dataset_link TEXT,
    guidelines JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_capstones_tags ON capstones USING GIN (tags);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_capstones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_capstones_updated_at ON capstones;
CREATE TRIGGER trigger_update_capstones_updated_at
    BEFORE UPDATE ON capstones
    FOR EACH ROW
    EXECUTE FUNCTION update_capstones_updated_at();

-- Populate sample capstone 1: SQL Learning
INSERT INTO capstones (
    capstone_id,
    capstone_name,
    tags,
    duration_weeks,
    dataset_link,
    guidelines
) VALUES (
    'CAP001',
    'Master SQL: From Basics to Advanced',
    ARRAY['SQL', 'Database', 'Data Analysis', 'PostgreSQL'],
    4,
    'https://github.com/lerocha/chinook-database',
    '{
        "description": "Master SQL through hands-on practice with a real-world music store database. Learn to write complex queries, optimize performance, and solve real business problems.",
        "objectives": [
            "Write complex SQL queries with multiple joins",
            "Use aggregate functions and GROUP BY effectively",
            "Understand query optimization and indexing",
            "Work with subqueries and CTEs",
            "Implement window functions for advanced analytics"
        ],
        "weekly_plan": [
            {
                "week": 1,
                "title": "SQL Fundamentals & Basic Queries",
                "topics": [
                    "Setting up PostgreSQL and importing Chinook database",
                    "SELECT, WHERE, ORDER BY, LIMIT",
                    "Filtering data with comparison and logical operators",
                    "Working with NULL values",
                    "Basic aggregate functions (COUNT, SUM, AVG, MIN, MAX)"
                ],
                "tasks": [
                    "Install PostgreSQL and load the Chinook database",
                    "Write 10 basic queries to explore the database schema",
                    "Create queries to find top-selling tracks and albums",
                    "Calculate total sales by country",
                    "Identify customers who have spent the most"
                ],
                "deliverables": [
                    "Document with 20 queries solving business questions",
                    "Analysis of database schema with ER diagram notes"
                ]
            },
            {
                "week": 2,
                "title": "Joins & Relationships",
                "topics": [
                    "INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN",
                    "Self joins for hierarchical data",
                    "Multiple table joins",
                    "Understanding foreign key relationships",
                    "JOIN performance considerations"
                ],
                "tasks": [
                    "Write queries joining 3+ tables",
                    "Find artists with no albums in the database",
                    "Calculate revenue per employee",
                    "Identify customers and their total purchases",
                    "Create a report of tracks by genre with sales data"
                ],
                "deliverables": [
                    "15 queries demonstrating different join types",
                    "Sales report combining customer, invoice, and track data"
                ]
            },
            {
                "week": 3,
                "title": "Advanced SQL & Aggregations",
                "topics": [
                    "GROUP BY and HAVING clauses",
                    "Subqueries (scalar, row, table)",
                    "Common Table Expressions (CTEs)",
                    "CASE statements for conditional logic",
                    "Date/Time functions and manipulation"
                ],
                "tasks": [
                    "Create monthly sales reports using GROUP BY",
                    "Use subqueries to find above-average performers",
                    "Write CTEs for complex multi-step analysis",
                    "Segment customers by purchase behavior",
                    "Analyze sales trends over time"
                ],
                "deliverables": [
                    "Business intelligence queries with CTEs",
                    "Customer segmentation analysis report",
                    "Time-series analysis of sales trends"
                ]
            },
            {
                "week": 4,
                "title": "Window Functions & Optimization",
                "topics": [
                    "Window functions (ROW_NUMBER, RANK, DENSE_RANK)",
                    "Moving averages with window functions",
                    "PARTITION BY for grouped analytics",
                    "Query optimization techniques",
                    "Understanding EXPLAIN and query plans"
                ],
                "tasks": [
                    "Rank products by sales within each category",
                    "Calculate running totals and moving averages",
                    "Find top N items per category using window functions",
                    "Optimize slow queries using indexes",
                    "Create a comprehensive business dashboard query"
                ],
                "deliverables": [
                    "Advanced analytics queries with window functions",
                    "Query optimization report with EXPLAIN analysis",
                    "Final comprehensive SQL project: Business Intelligence Dashboard",
                    "Presentation documenting learning journey and key insights"
                ]
            }
        ],
        "final_deliverable": {
            "title": "SQL Business Intelligence Dashboard",
            "description": "Create a comprehensive set of SQL queries that answer key business questions for the Chinook music store. Your queries should be well-documented, optimized, and ready for production use.",
            "requirements": [
                "At least 30 different queries covering all topics learned",
                "Queries must be organized by business function (Sales, Marketing, Operations)",
                "Each query must include comments explaining the business question",
                "Include EXPLAIN analysis for complex queries",
                "Provide a summary document explaining insights discovered",
                "Create at least 3 views for commonly used reports"
            ]
        },
        "resources": [
            {
                "title": "Chinook Database Documentation",
                "url": "https://github.com/lerocha/chinook-database",
                "type": "dataset"
            },
            {
                "title": "PostgreSQL Official Documentation",
                "url": "https://www.postgresql.org/docs/",
                "type": "documentation"
            },
            {
                "title": "SQL Window Functions Guide",
                "url": "https://www.postgresql.org/docs/current/tutorial-window.html",
                "type": "tutorial"
            }
        ]
    }'
) ON CONFLICT (capstone_id) DO UPDATE SET
    capstone_name = EXCLUDED.capstone_name,
    tags = EXCLUDED.tags,
    duration_weeks = EXCLUDED.duration_weeks,
    dataset_link = EXCLUDED.dataset_link,
    guidelines = EXCLUDED.guidelines,
    updated_at = CURRENT_TIMESTAMP;

-- Populate sample capstone 2: Text-to-SQL with LangGraph
INSERT INTO capstones (
    capstone_id,
    capstone_name,
    tags,
    duration_weeks,
    dataset_link,
    guidelines
) VALUES (
    'CAP002',
    'Build a Text-to-SQL Chatbot with LangGraph',
    ARRAY['LangGraph', 'LLM', 'SQL', 'Chatbot', 'LangChain', 'AI'],
    6,
    'https://github.com/lerocha/chinook-database',
    '{
        "description": "Build an intelligent Text-to-SQL chatbot using LangGraph that can understand natural language questions and convert them into SQL queries. Learn agent orchestration, prompt engineering, and how to build production-ready LLM applications.",
        "objectives": [
            "Understand LangGraph architecture and state management",
            "Build a multi-agent system for Text-to-SQL conversion",
            "Implement error handling and query validation",
            "Create a conversational interface with memory",
            "Deploy a production-ready chatbot application"
        ],
        "weekly_plan": [
            {
                "week": 1,
                "title": "Foundations: LangChain & LangGraph Basics",
                "topics": [
                    "Introduction to LangChain and LangGraph",
                    "Understanding LLM prompts and chains",
                    "LangGraph nodes, edges, and state management",
                    "Setting up development environment",
                    "Working with OpenAI/Anthropic APIs"
                ],
                "tasks": [
                    "Set up Python environment with LangChain and LangGraph",
                    "Create your first LangGraph workflow",
                    "Experiment with different LLM prompts for SQL generation",
                    "Build a simple chain that generates SQL from natural language",
                    "Understand the Chinook database schema thoroughly"
                ],
                "deliverables": [
                    "Working development environment with all dependencies",
                    "Simple Text-to-SQL prototype using basic LangChain",
                    "Documentation of Chinook schema with sample queries"
                ]
            },
            {
                "week": 2,
                "title": "Schema Understanding & Prompt Engineering",
                "topics": [
                    "Schema representation for LLMs",
                    "Few-shot prompting for SQL generation",
                    "Prompt templates and best practices",
                    "Handling database schema context",
                    "Error handling in LLM outputs"
                ],
                "tasks": [
                    "Create effective schema descriptions for the LLM",
                    "Build a few-shot prompt library with example Q&A pairs",
                    "Implement schema filtering for large databases",
                    "Test different prompting strategies",
                    "Create a validation layer for generated SQL"
                ],
                "deliverables": [
                    "Optimized prompt templates for Text-to-SQL",
                    "Library of 20+ example question-SQL pairs",
                    "SQL validation module"
                ]
            },
            {
                "week": 3,
                "title": "Building the LangGraph Agent System",
                "topics": [
                    "Multi-agent architecture design",
                    "LangGraph state management",
                    "Agent routing and decision making",
                    "Implementing retry logic",
                    "Agent communication patterns"
                ],
                "tasks": [
                    "Design a multi-agent architecture (Router → SQL Generator → Validator → Executor)",
                    "Implement state management for conversation history",
                    "Create a router agent to classify user intents",
                    "Build SQL generation agent with error correction",
                    "Implement SQL execution agent with safety checks"
                ],
                "deliverables": [
                    "LangGraph workflow with 4+ specialized agents",
                    "State management system for multi-turn conversations",
                    "Architecture diagram documenting agent interactions"
                ]
            },
            {
                "week": 4,
                "title": "Conversational Memory & Context",
                "topics": [
                    "Conversation memory in LangChain",
                    "Context window management",
                    "Follow-up question handling",
                    "Ambiguity resolution",
                    "User intent clarification"
                ],
                "tasks": [
                    "Implement conversation memory",
                    "Handle follow-up questions that reference previous context",
                    "Build clarification agent for ambiguous queries",
                    "Create context summarization for long conversations",
                    "Test edge cases and error scenarios"
                ],
                "deliverables": [
                    "Chatbot with working conversation memory",
                    "Clarification system for ambiguous queries",
                    "Test suite covering 50+ conversation scenarios"
                ]
            },
            {
                "week": 5,
                "title": "Advanced Features & Optimization",
                "topics": [
                    "Query optimization suggestions",
                    "Handling complex multi-table queries",
                    "Explaining SQL queries to users",
                    "Caching and performance optimization",
                    "Observability and logging"
                ],
                "tasks": [
                    "Add query explanation feature",
                    "Implement query result summarization",
                    "Add caching for common queries",
                    "Build observability with LangSmith or similar",
                    "Optimize LLM API costs with caching and batching"
                ],
                "deliverables": [
                    "Feature-complete chatbot with explanations",
                    "Performance optimization report",
                    "Observability dashboard"
                ]
            },
            {
                "week": 6,
                "title": "Production Deployment & Polish",
                "topics": [
                    "Building a web interface (Streamlit/Gradio)",
                    "API design and FastAPI implementation",
                    "Security considerations",
                    "Rate limiting and cost management",
                    "Testing and evaluation"
                ],
                "tasks": [
                    "Build web UI using Streamlit or Gradio",
                    "Create REST API with FastAPI",
                    "Implement authentication and rate limiting",
                    "Add comprehensive error handling",
                    "Create evaluation dataset and measure accuracy"
                ],
                "deliverables": [
                    "Deployed web application",
                    "REST API with documentation",
                    "Evaluation report with accuracy metrics",
                    "Final project presentation"
                ]
            }
        ],
        "final_deliverable": {
            "title": "Production-Ready Text-to-SQL Chatbot",
            "description": "A fully functional Text-to-SQL chatbot that can handle natural language questions about the Chinook database, with a web interface and REST API.",
            "requirements": [
                "LangGraph-based multi-agent system with at least 4 specialized agents",
                "Web interface (Streamlit/Gradio) for user interaction",
                "REST API with FastAPI for programmatic access",
                "Conversation memory supporting multi-turn dialogues",
                "SQL validation and safety checks",
                "Query explanation feature",
                "Comprehensive error handling",
                "Evaluation report with accuracy metrics on 100+ test queries",
                "Documentation including architecture diagram, API docs, and user guide",
                "GitHub repository with clean, documented code"
            ]
        },
        "resources": [
            {
                "title": "LangGraph Documentation",
                "url": "https://langchain-ai.github.io/langgraph/",
                "type": "documentation"
            },
            {
                "title": "Chinook Database",
                "url": "https://github.com/lerocha/chinook-database",
                "type": "dataset"
            },
            {
                "title": "Text-to-SQL Prompting Guide",
                "url": "https://python.langchain.com/docs/use_cases/sql/",
                "type": "tutorial"
            },
            {
                "title": "LangGraph Tutorials",
                "url": "https://langchain-ai.github.io/langgraph/tutorials/",
                "type": "tutorial"
            }
        ]
    }'
) ON CONFLICT (capstone_id) DO UPDATE SET
    capstone_name = EXCLUDED.capstone_name,
    tags = EXCLUDED.tags,
    duration_weeks = EXCLUDED.duration_weeks,
    dataset_link = EXCLUDED.dataset_link,
    guidelines = EXCLUDED.guidelines,
    updated_at = CURRENT_TIMESTAMP;
