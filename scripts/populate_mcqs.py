"""
Script to populate sample MCQs for all courses
Creates 4-5 MCQs per course with a mix of single and multiple answer questions
"""
import sys
import os
import hashlib
import logging

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.falkordb import FalkorDB
from backend.database import get_postgres_db

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def generate_id(text: str) -> str:
    """Generate a unique ID using hashlib SHA256"""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]


# Technical MCQs database for all courses
COURSE_MCQS = {
    "Regular Expressions": [
        {
            "question": "Which metacharacter matches any single character except newline in regex?",
            "options": ["*", ".", "+", "?"],
            "correct": ["B"],
            "multiple": False
        },
        {
            "question": "What does the regex pattern \\d+ match?",
            "options": ["One or more digits", "Zero or more digits", "Exactly one digit", "Any character"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which of the following are valid regex quantifiers?",
            "options": ["{n}", "*", "++", "{n,m}"],
            "correct": ["A", "B", "D"],
            "multiple": True
        },
        {
            "question": "What does the ^ symbol represent in regex?",
            "options": ["End of string", "Start of string", "Any character", "Negation in character class"],
            "correct": ["B"],
            "multiple": False
        },
    ],

    "Inheritance and Polymorphism": [
        {
            "question": "What is method overriding in Python?",
            "options": [
                "Defining multiple methods with same name but different parameters",
                "Child class providing specific implementation of parent method",
                "Creating multiple classes with same method names",
                "Using decorators to modify methods"
            ],
            "correct": ["B"],
            "multiple": False
        },
        {
            "question": "Which of the following are types of inheritance in Python?",
            "options": ["Single inheritance", "Multiple inheritance", "Multilevel inheritance", "Hybrid inheritance"],
            "correct": ["A", "B", "C", "D"],
            "multiple": True
        },
        {
            "question": "What is the super() function used for?",
            "options": [
                "To call parent class methods",
                "To create superclass",
                "To override methods",
                "To check inheritance"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which methods demonstrate polymorphism in Python?",
            "options": [
                "Method overriding",
                "Duck typing",
                "Operator overloading",
                "Constructor chaining"
            ],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
    ],

    "Asynchronous Programming": [
        {
            "question": "What is the main purpose of async/await in Python?",
            "options": [
                "To write concurrent code",
                "To improve CPU-bound operations",
                "To handle I/O-bound operations efficiently",
                "To create multiple processes"
            ],
            "correct": ["C"],
            "multiple": False
        },
        {
            "question": "Which module provides async/await support in Python?",
            "options": ["threading", "asyncio", "multiprocessing", "concurrent"],
            "correct": ["B"],
            "multiple": False
        },
        {
            "question": "What are characteristics of coroutines in Python?",
            "options": [
                "Defined with async def",
                "Can use await keyword",
                "Run in separate threads",
                "Return awaitable objects"
            ],
            "correct": ["A", "B", "D"],
            "multiple": True
        },
        {
            "question": "What does await keyword do?",
            "options": [
                "Pauses coroutine execution",
                "Creates a new thread",
                "Blocks the entire program",
                "Waits for async operation to complete"
            ],
            "correct": ["A", "D"],
            "multiple": True
        },
    ],

    "Multithreading & Multiprocessing": [
        {
            "question": "What is the GIL in Python?",
            "options": [
                "Global Interpreter Lock",
                "General Interface Library",
                "Garbage Collection Indicator",
                "A lock that prevents multiple threads from executing Python bytecode simultaneously"
            ],
            "correct": ["A", "D"],
            "multiple": True
        },
        {
            "question": "When should you use multiprocessing over multithreading?",
            "options": [
                "For I/O-bound tasks",
                "For CPU-bound tasks",
                "For network operations",
                "For file operations"
            ],
            "correct": ["B"],
            "multiple": False
        },
        {
            "question": "Which module is used for thread-based parallelism in Python?",
            "options": ["threading", "asyncio", "multiprocessing", "concurrent"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What are advantages of multiprocessing?",
            "options": [
                "Bypasses GIL",
                "True parallelism",
                "Lower memory usage",
                "Better for CPU-intensive tasks"
            ],
            "correct": ["A", "B", "D"],
            "multiple": True
        },
    ],

    "Type Hinting & Pydantic": [
        {
            "question": "What is the purpose of type hints in Python?",
            "options": [
                "To enforce runtime type checking",
                "To improve code readability",
                "To help IDEs provide better suggestions",
                "To catch type errors before runtime"
            ],
            "correct": ["B", "C", "D"],
            "multiple": True
        },
        {
            "question": "What does Pydantic primarily do?",
            "options": [
                "Data validation",
                "Type enforcement at runtime",
                "JSON serialization",
                "Database ORM"
            ],
            "correct": ["A", "B"],
            "multiple": True
        },
        {
            "question": "Which module provides type hinting support in Python?",
            "options": ["types", "typing", "pydantic", "annotations"],
            "correct": ["B"],
            "multiple": False
        },
        {
            "question": "What is a Pydantic BaseModel?",
            "options": [
                "A class for data validation",
                "A database model",
                "A type annotation helper",
                "A class that validates data at instantiation"
            ],
            "correct": ["A", "D"],
            "multiple": True
        },
    ],

    "Attention Mechanisms": [
        {
            "question": "What is the key innovation of the attention mechanism in neural networks?",
            "options": [
                "Allowing models to focus on relevant parts of input",
                "Reducing model parameters",
                "Speeding up training time",
                "Eliminating the need for labeled data"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "In self-attention, what are the three main components?",
            "options": ["Query, Key, Value", "Input, Hidden, Output", "Encoder, Decoder, Attention", "Embedding, Position, Context"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which of the following are types of attention mechanisms?",
            "options": ["Self-attention", "Cross-attention", "Multi-head attention", "Bidirectional attention"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What does the attention score represent?",
            "options": [
                "The relevance between query and key vectors",
                "The model's confidence level",
                "The loss function value",
                "The gradient magnitude"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Building Autonomous Agents (ReAct)": [
        {
            "question": "What does ReAct stand for in the context of AI agents?",
            "options": ["Reasoning and Acting", "React Framework", "Recursive Action", "Response and Action"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which components are essential in a ReAct agent?",
            "options": ["Thought generation", "Action selection", "Observation processing", "Data preprocessing"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is the primary advantage of ReAct over chain-of-thought prompting?",
            "options": [
                "Combines reasoning with external tool use",
                "Requires less computational power",
                "Eliminates need for fine-tuning",
                "Works only with small models"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "In ReAct, what follows the Thought step?",
            "options": ["Action", "Observation", "Final Answer", "Reasoning"],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Calculus (Gradient Descent)": [
        {
            "question": "What is the purpose of gradient descent in machine learning?",
            "options": [
                "To minimize the loss function",
                "To maximize accuracy",
                "To normalize data",
                "To split datasets"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which of the following are variants of gradient descent?",
            "options": ["Batch gradient descent", "Stochastic gradient descent", "Mini-batch gradient descent", "Parallel gradient descent"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What does the learning rate control in gradient descent?",
            "options": [
                "The step size in parameter updates",
                "The number of epochs",
                "The batch size",
                "The model architecture"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What happens if the learning rate is too high?",
            "options": [
                "The model may fail to converge",
                "Training becomes slower",
                "Accuracy improves",
                "Memory usage decreases"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Chain of Thought (CoT)": [
        {
            "question": "What is Chain of Thought prompting?",
            "options": [
                "A technique to make LLMs show intermediate reasoning steps",
                "A method to chain multiple prompts",
                "A way to connect different models",
                "A training technique for neural networks"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which tasks benefit most from CoT prompting?",
            "options": ["Arithmetic reasoning", "Logical reasoning", "Commonsense reasoning", "Image classification"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is zero-shot CoT?",
            "options": [
                "Adding 'Let's think step by step' to prompts",
                "Training models from scratch",
                "Using no examples at all",
                "Removing intermediate steps"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "How does CoT improve model performance?",
            "options": [
                "By breaking down complex problems into steps",
                "By increasing model parameters",
                "By using more training data",
                "By reducing inference time"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Chunking Strategies": [
        {
            "question": "Why is chunking important in RAG systems?",
            "options": [
                "To fit documents within context window limits",
                "To increase processing speed",
                "To reduce storage costs",
                "To improve model accuracy"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are common chunking strategies?",
            "options": ["Fixed-size chunking", "Semantic chunking", "Recursive chunking", "Random chunking"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is chunk overlap used for?",
            "options": [
                "To preserve context between chunks",
                "To increase chunk count",
                "To reduce memory usage",
                "To speed up indexing"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What factors should influence chunk size?",
            "options": ["Model context window", "Document structure", "Use case requirements", "Hardware limitations"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
    ],

    "Common Table Expression (CTE)": [
        {
            "question": "What is a CTE in SQL?",
            "options": [
                "A temporary named result set",
                "A permanent table",
                "A stored procedure",
                "A database index"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which keyword is used to define a CTE?",
            "options": ["WITH", "CREATE", "TEMP", "DEFINE"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What are advantages of using CTEs?",
            "options": ["Improved readability", "Recursive queries support", "Query modularity", "Permanent storage"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "Can a CTE reference itself?",
            "options": [
                "Yes, in recursive CTEs",
                "No, never allowed",
                "Only in PostgreSQL",
                "Only with special permissions"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Data Manipulation with Pandas": [
        {
            "question": "What is the primary data structure in Pandas?",
            "options": ["DataFrame", "Array", "List", "Dictionary"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which methods are used to handle missing data in Pandas?",
            "options": ["dropna()", "fillna()", "interpolate()", "delete()"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What does the groupby() method do?",
            "options": [
                "Groups data by one or more columns for aggregation",
                "Sorts data in ascending order",
                "Filters rows based on condition",
                "Joins two DataFrames"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "How do you select a column in a Pandas DataFrame?",
            "options": ["df['column_name']", "df.column_name", "Both A and B", "df.get('column_name')"],
            "correct": ["C"],
            "multiple": False
        },
    ],

    "Data Visualization (Matplotlib/Seaborn)": [
        {
            "question": "Which library is built on top of Matplotlib?",
            "options": ["Seaborn", "Plotly", "Bokeh", "NumPy"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which Matplotlib function creates a scatter plot?",
            "options": ["scatter()", "plot()", "scatterplot()", "points()"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What are common Seaborn plot types?",
            "options": ["violinplot", "boxplot", "heatmap", "mesh3d"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What does plt.figure() do in Matplotlib?",
            "options": [
                "Creates a new figure object",
                "Displays the plot",
                "Saves the plot to file",
                "Clears the current plot"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Database Indexing & Optimization": [
        {
            "question": "What is a database index?",
            "options": [
                "A data structure that improves query speed",
                "A type of constraint",
                "A backup mechanism",
                "A user permission level"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which types of indexes exist in databases?",
            "options": ["B-tree index", "Hash index", "Bitmap index", "Linear index"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is the trade-off of adding indexes?",
            "options": [
                "Faster reads but slower writes",
                "Slower reads but faster writes",
                "No trade-offs",
                "Increased memory only"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "When should you use EXPLAIN in SQL?",
            "options": [
                "To analyze query execution plan",
                "To create documentation",
                "To backup data",
                "To grant permissions"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Date & Time Functions": [
        {
            "question": "Which SQL function returns the current date?",
            "options": ["CURRENT_DATE", "NOW()", "TODAY()", "GET_DATE()"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which Python module handles date and time operations?",
            "options": ["datetime", "time", "calendar", "dateutil"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What do these SQL functions return?",
            "options": ["EXTRACT() - specific date part", "DATE_TRUNC() - truncated date", "AGE() - time interval", "GETDATE() - system date"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "How do you add days to a date in Python datetime?",
            "options": [
                "Using timedelta",
                "Using dateadd()",
                "Using date.add()",
                "Using date + integer"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "FastAPI Implementation": [
        {
            "question": "What is FastAPI primarily used for?",
            "options": [
                "Building REST APIs",
                "Frontend development",
                "Database management",
                "Machine learning"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which features are built into FastAPI?",
            "options": ["Automatic API documentation", "Data validation with Pydantic", "Async support", "Built-in database ORM"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What decorator is used to define a GET endpoint?",
            "options": ["@app.get()", "@app.route()", "@get()", "@endpoint()"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "How does FastAPI handle request validation?",
            "options": [
                "Using Pydantic models",
                "Using decorators only",
                "Manual validation required",
                "No validation support"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Genie Space": [
        {
            "question": "What is Genie Space in the context of AI?",
            "options": [
                "A latent representation space",
                "A cloud storage service",
                "A type of neural network",
                "A data preprocessing tool"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which techniques are used for space manipulation?",
            "options": ["Vector arithmetic", "Interpolation", "Projection", "Compression"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is the primary use of latent space?",
            "options": [
                "To represent high-dimensional data in lower dimensions",
                "To store training data",
                "To speed up inference",
                "To reduce model size"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which models commonly use latent spaces?",
            "options": ["VAE", "GAN", "Autoencoders", "Decision Trees"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
    ],

    "Git Branching & Merging Strategies": [
        {
            "question": "What is a Git branch?",
            "options": [
                "A pointer to a specific commit",
                "A copy of the repository",
                "A remote server",
                "A file version"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are common branching strategies?",
            "options": ["Git Flow", "GitHub Flow", "Trunk-based development", "Star topology"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What does 'git merge' do?",
            "options": [
                "Combines changes from different branches",
                "Deletes a branch",
                "Creates a new branch",
                "Reverts commits"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is a merge conflict?",
            "options": [
                "When same lines are modified in different branches",
                "When branch names conflict",
                "When commits are duplicate",
                "When repository is corrupted"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Hybrid Search & Reranking": [
        {
            "question": "What is hybrid search?",
            "options": [
                "Combining dense and sparse retrieval methods",
                "Searching multiple databases",
                "Using both SQL and NoSQL",
                "Parallel processing of queries"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which methods are combined in hybrid search?",
            "options": ["Vector search", "BM25/keyword search", "Fuzzy matching", "Random sampling"],
            "correct": ["A", "B"],
            "multiple": True
        },
        {
            "question": "What is the purpose of reranking?",
            "options": [
                "To improve relevance of top results",
                "To sort alphabetically",
                "To randomize results",
                "To compress data"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which models are commonly used for reranking?",
            "options": ["Cross-encoders", "Bi-encoders", "Transformer models", "Linear regression"],
            "correct": ["A", "C"],
            "multiple": True
        },
    ],

    "LLM Evaluation Frameworks (Ragas)": [
        {
            "question": "What does Ragas framework evaluate?",
            "options": [
                "RAG system performance",
                "Model training speed",
                "Code quality",
                "Database queries"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which metrics does Ragas provide?",
            "options": ["Faithfulness", "Answer relevancy", "Context recall", "Training loss"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is faithfulness in RAG evaluation?",
            "options": [
                "Whether answers are grounded in retrieved context",
                "Model confidence score",
                "Response speed",
                "Token count"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What does context recall measure?",
            "options": [
                "How much relevant context was retrieved",
                "Model memory usage",
                "Query processing time",
                "Database performance"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "LangChain Fundamentals": [
        {
            "question": "What is LangChain?",
            "options": [
                "A framework for building LLM applications",
                "A blockchain platform",
                "A database system",
                "A programming language"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are core components of LangChain?",
            "options": ["Chains", "Agents", "Memory", "Compiler"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is a LangChain chain?",
            "options": [
                "A sequence of calls to components",
                "A blockchain transaction",
                "A database connection",
                "A network protocol"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What do LangChain agents do?",
            "options": [
                "Use LLMs to decide which tools to use",
                "Deploy models to production",
                "Manage user authentication",
                "Optimize database queries"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Linear Algebra (Vectors, Matrices)": [
        {
            "question": "What is a vector in linear algebra?",
            "options": [
                "An ordered array of numbers",
                "A type of matrix",
                "A scalar value",
                "A programming construct"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which operations can be performed on matrices?",
            "options": ["Addition", "Multiplication", "Transposition", "Compilation"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is the dot product?",
            "options": [
                "Sum of element-wise products of two vectors",
                "Matrix multiplication",
                "Vector addition",
                "Scalar division"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What does matrix transposition do?",
            "options": [
                "Swaps rows and columns",
                "Inverts the matrix",
                "Multiplies by identity",
                "Calculates determinant"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "LlamaIndex Data Connectors": [
        {
            "question": "What are LlamaIndex data connectors?",
            "options": [
                "Tools to load data from various sources",
                "Database connections",
                "API endpoints",
                "Network protocols"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which data sources can LlamaIndex connect to?",
            "options": ["PDFs", "Databases", "APIs", "Audio files"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is a Document in LlamaIndex?",
            "options": [
                "A container for text data with metadata",
                "A file format",
                "A database table",
                "An API response"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What does the SimpleDirectoryReader do?",
            "options": [
                "Loads all files from a directory",
                "Creates new directories",
                "Deletes files",
                "Compresses folders"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "LoRA & QLoRA": [
        {
            "question": "What does LoRA stand for?",
            "options": [
                "Low-Rank Adaptation",
                "Long Range Attention",
                "Local Resource Allocation",
                "Linear Regression Analysis"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What are advantages of LoRA?",
            "options": ["Reduces trainable parameters", "Lower memory usage", "Faster training", "Eliminates need for data"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "How does LoRA work?",
            "options": [
                "By adding low-rank matrices to frozen weights",
                "By removing layers",
                "By quantizing all weights",
                "By pruning neurons"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is QLoRA?",
            "options": [
                "LoRA with quantized base model",
                "Quantum LoRA",
                "Quick LoRA",
                "Query LoRA"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Mocking and Fixtures": [
        {
            "question": "What is mocking in unit testing?",
            "options": [
                "Replacing real objects with simulated ones",
                "Making fun of code",
                "Creating test data",
                "Debugging technique"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which Python libraries support mocking?",
            "options": ["unittest.mock", "pytest-mock", "mock", "faker"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is a fixture in pytest?",
            "options": [
                "A function that provides test data or setup",
                "A broken test",
                "A test configuration file",
                "A debugging tool"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What does the @patch decorator do?",
            "options": [
                "Replaces an object with a mock during test",
                "Fixes bugs automatically",
                "Creates test files",
                "Measures code coverage"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Model Serving (vLLM/Ollama)": [
        {
            "question": "What is vLLM?",
            "options": [
                "A high-throughput LLM inference engine",
                "A training framework",
                "A data preprocessing tool",
                "A model compression technique"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which features does vLLM provide?",
            "options": ["PagedAttention", "Continuous batching", "OpenAI-compatible API", "Model training"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is Ollama used for?",
            "options": [
                "Running LLMs locally",
                "Cloud deployment",
                "Model training",
                "Data labeling"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is PagedAttention in vLLM?",
            "options": [
                "Memory-efficient attention mechanism",
                "A caching strategy",
                "A model architecture",
                "A training algorithm"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Monitoring & Observability": [
        {
            "question": "What is observability in software systems?",
            "options": [
                "Ability to understand system state from outputs",
                "Code visibility",
                "User interface design",
                "Database optimization"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What are the three pillars of observability?",
            "options": ["Logs", "Metrics", "Traces", "Alerts"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "Which tools are used for monitoring?",
            "options": ["Prometheus", "Grafana", "Datadog", "Git"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is distributed tracing?",
            "options": [
                "Tracking requests across multiple services",
                "Parallel processing",
                "Load balancing",
                "Data replication"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Multi-Agent Systems (CrewAI/AutoGen)": [
        {
            "question": "What is a multi-agent system?",
            "options": [
                "Multiple AI agents collaborating on tasks",
                "Multiple users in a system",
                "Multiple databases",
                "Multiple programming languages"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which frameworks support multi-agent systems?",
            "options": ["CrewAI", "AutoGen", "LangChain", "TensorFlow"],
            "correct": ["A", "B"],
            "multiple": True
        },
        {
            "question": "What is agent communication in multi-agent systems?",
            "options": [
                "How agents share information and coordinate",
                "Network protocols",
                "User interactions",
                "Database queries"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What roles can agents have in CrewAI?",
            "options": [
                "Specialized roles with specific goals",
                "Only generic roles",
                "Database roles",
                "Network roles"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Neural Networks Basics (PyTorch)": [
        {
            "question": "What is a tensor in PyTorch?",
            "options": [
                "A multi-dimensional array",
                "A neural network layer",
                "An optimizer",
                "A loss function"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are core components of a PyTorch model?",
            "options": ["nn.Module", "forward()", "backward()", "compile()"],
            "correct": ["A", "B"],
            "multiple": True
        },
        {
            "question": "What does the backward() method do?",
            "options": [
                "Computes gradients via backpropagation",
                "Reverses tensor order",
                "Undoes last operation",
                "Loads previous checkpoint"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which activation functions are available in PyTorch?",
            "options": ["ReLU", "Sigmoid", "Tanh", "Linear"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
    ],

    "Numerical Computing with NumPy": [
        {
            "question": "What is NumPy primarily used for?",
            "options": [
                "Numerical computing with arrays",
                "Web development",
                "Database management",
                "GUI development"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is a NumPy array?",
            "options": [
                "A grid of values of the same type",
                "A Python list",
                "A dictionary",
                "A string buffer"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which operations are optimized in NumPy?",
            "options": ["Vectorized operations", "Broadcasting", "Matrix operations", "String parsing"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What does np.reshape() do?",
            "options": [
                "Changes array dimensions without changing data",
                "Sorts array elements",
                "Filters array values",
                "Creates new array"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "PEFT (Parameter-Efficient Fine-Tuning)": [
        {
            "question": "What is PEFT?",
            "options": [
                "Techniques to fine-tune models with fewer parameters",
                "A programming language",
                "A database system",
                "A deployment tool"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are PEFT methods?",
            "options": ["LoRA", "Prefix Tuning", "Adapter layers", "Full fine-tuning"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "Why use PEFT over full fine-tuning?",
            "options": [
                "Requires less memory and compute",
                "Always better performance",
                "Simpler code",
                "No training needed"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is adapter layer?",
            "options": [
                "Small trainable layers inserted into frozen model",
                "A network protocol",
                "A data transformation",
                "A loss function"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Probability & Statistics": [
        {
            "question": "What is probability?",
            "options": [
                "Measure of likelihood of an event",
                "Count of occurrences",
                "Average value",
                "Data type"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are measures of central tendency?",
            "options": ["Mean", "Median", "Mode", "Range"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is standard deviation?",
            "options": [
                "Measure of data spread around mean",
                "The average value",
                "The most frequent value",
                "The range of values"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is a normal distribution?",
            "options": [
                "Bell-shaped probability distribution",
                "Uniform distribution",
                "Random distribution",
                "Linear distribution"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Prompt Security & Jailbreaking Defense": [
        {
            "question": "What is prompt injection?",
            "options": [
                "Manipulating LLM behavior through malicious inputs",
                "Adding prompts to code",
                "Prompt optimization",
                "Model fine-tuning"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are prompt security techniques?",
            "options": ["Input validation", "Prompt filtering", "Output sanitization", "Model compression"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is jailbreaking in LLMs?",
            "options": [
                "Bypassing safety guardrails",
                "Unlocking model weights",
                "Removing copyright",
                "Accelerating inference"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "How can you defend against prompt injection?",
            "options": [
                "Use delimiters and clear instructions",
                "Increase model size",
                "Remove all safety filters",
                "Use only small models"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Python unit testing with pytest": [
        {
            "question": "What is pytest?",
            "options": [
                "A Python testing framework",
                "A web framework",
                "A data library",
                "A debugging tool"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are pytest features?",
            "options": ["Fixtures", "Parametrization", "Markers", "Compilation"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "How do you run tests with pytest?",
            "options": [
                "Using 'pytest' command",
                "Using 'python -m test'",
                "Using 'run_tests'",
                "Using 'test.py'"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What does assert statement do in pytest?",
            "options": [
                "Verifies test expectations",
                "Imports modules",
                "Defines variables",
                "Creates functions"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Python unit testing with unittest": [
        {
            "question": "What is unittest?",
            "options": [
                "Python's built-in testing framework",
                "A third-party library",
                "A debugging tool",
                "A code formatter"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which class do test cases inherit from in unittest?",
            "options": ["unittest.TestCase", "TestBase", "Test", "TestClass"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are unittest assertion methods?",
            "options": ["assertEqual()", "assertTrue()", "assertRaises()", "assertValid()"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What do setUp() and tearDown() methods do?",
            "options": [
                "Initialize and cleanup test environment",
                "Run test cases",
                "Generate reports",
                "Import modules"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Quantization (GGUF/INT8)": [
        {
            "question": "What is model quantization?",
            "options": [
                "Reducing model precision to lower bits",
                "Increasing model size",
                "Adding more layers",
                "Training technique"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What are benefits of quantization?",
            "options": ["Smaller model size", "Faster inference", "Lower memory usage", "Better accuracy"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is INT8 quantization?",
            "options": [
                "Converting weights to 8-bit integers",
                "Using 8 layers",
                "Training for 8 epochs",
                "8-dimensional vectors"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is GGUF?",
            "options": [
                "A model file format for quantized models",
                "A training algorithm",
                "A neural network architecture",
                "A programming language"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "REST API Fundamentals": [
        {
            "question": "What does REST stand for?",
            "options": [
                "Representational State Transfer",
                "Remote Execution State Transfer",
                "Rapid Execution Service Technology",
                "Resource Execution State Transformation"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are standard HTTP methods in REST?",
            "options": ["GET", "POST", "PUT", "DELETE"],
            "correct": ["A", "B", "C", "D"],
            "multiple": True
        },
        {
            "question": "What HTTP status code indicates success?",
            "options": ["200", "404", "500", "301"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is an API endpoint?",
            "options": [
                "A URL where an API can be accessed",
                "The end of API execution",
                "A database connection",
                "A configuration file"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "RLHF (Reinforcement Learning from Human Feedback)": [
        {
            "question": "What is RLHF?",
            "options": [
                "Training models using human preference feedback",
                "A supervised learning technique",
                "A data augmentation method",
                "A model architecture"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What are the main stages of RLHF?",
            "options": ["Supervised fine-tuning", "Reward model training", "RL optimization", "Data preprocessing"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "Which algorithm is commonly used in RLHF?",
            "options": [
                "PPO (Proximal Policy Optimization)",
                "Adam",
                "SGD",
                "Backpropagation"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What does the reward model do in RLHF?",
            "options": [
                "Scores model outputs based on human preferences",
                "Generates training data",
                "Compresses the model",
                "Handles tokenization"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Semantic Search & Cosine Similarity": [
        {
            "question": "What is semantic search?",
            "options": [
                "Search based on meaning rather than keywords",
                "Alphabetical search",
                "Random search",
                "Binary search"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is cosine similarity?",
            "options": [
                "Measure of similarity between two vectors",
                "A trigonometric function",
                "A distance metric",
                "A loss function"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What range does cosine similarity return?",
            "options": ["-1 to 1", "0 to 1", "0 to 100", "Any real number"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which models generate embeddings for semantic search?",
            "options": ["BERT", "Sentence transformers", "OpenAI embeddings", "Linear regression"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
    ],

    "Subquery": [
        {
            "question": "What is a subquery in SQL?",
            "options": [
                "A query nested inside another query",
                "A primary key",
                "A database index",
                "A stored procedure"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Where can subqueries be used?",
            "options": ["SELECT clause", "WHERE clause", "FROM clause", "GRANT clause"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is a correlated subquery?",
            "options": [
                "Subquery that references outer query columns",
                "Two independent subqueries",
                "A subquery with JOIN",
                "A recursive subquery"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which operators work with subqueries?",
            "options": ["IN", "EXISTS", "ANY", "MERGE"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
    ],

    "System Prompts & Persona Definition": [
        {
            "question": "What is a system prompt?",
            "options": [
                "Initial instructions defining model behavior",
                "A command line interface",
                "An error message",
                "A file path"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What should a good system prompt include?",
            "options": ["Clear role definition", "Behavioral guidelines", "Output format", "Model architecture"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is persona definition?",
            "options": [
                "Defining the character or role for the AI",
                "User profile management",
                "Database schema",
                "API specification"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Why use system prompts?",
            "options": [
                "To control model behavior consistently",
                "To increase model size",
                "To speed up training",
                "To reduce costs only"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Tokenization & Embeddings": [
        {
            "question": "What is tokenization?",
            "options": [
                "Breaking text into smaller units (tokens)",
                "Encrypting text",
                "Translating text",
                "Compressing text"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are common tokenization methods?",
            "options": ["Word-level", "Subword (BPE)", "Character-level", "Sentence-level"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What is an embedding?",
            "options": [
                "Dense vector representation of text",
                "A compression algorithm",
                "A database field",
                "A file format"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is the purpose of embeddings?",
            "options": [
                "To represent text in numerical form for models",
                "To encrypt data",
                "To reduce file size",
                "To format output"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Transformer Architecture": [
        {
            "question": "What are the two main components of a Transformer?",
            "options": ["Encoder and Decoder", "Input and Output", "Forward and Backward", "Training and Testing"],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which mechanisms are key to Transformers?",
            "options": ["Self-attention", "Multi-head attention", "Positional encoding", "Convolution"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "Why is positional encoding needed in Transformers?",
            "options": [
                "To provide sequence order information",
                "To reduce model size",
                "To increase speed",
                "To handle images"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is multi-head attention?",
            "options": [
                "Running multiple attention mechanisms in parallel",
                "Using multiple models",
                "Training on multiple datasets",
                "Using multiple loss functions"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Vector Databases (Pinecone, ChromaDB)": [
        {
            "question": "What is a vector database?",
            "options": [
                "Database optimized for storing and querying embeddings",
                "A relational database",
                "A key-value store",
                "A file system"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are popular vector databases?",
            "options": ["Pinecone", "ChromaDB", "Weaviate", "MySQL"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What operation do vector databases optimize?",
            "options": [
                "Similarity search",
                "Text search",
                "Aggregation",
                "Sorting"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is an index in vector databases?",
            "options": [
                "Data structure for efficient similarity search",
                "Primary key",
                "Foreign key",
                "Timestamp field"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Window Functions": [
        {
            "question": "What are window functions in SQL?",
            "options": [
                "Functions that perform calculations across row sets",
                "Functions for date operations",
                "Functions for string manipulation",
                "Functions for window management"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "Which are common window functions?",
            "options": ["ROW_NUMBER()", "RANK()", "LAG()", "COUNT(*)"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
        {
            "question": "What does the OVER clause do?",
            "options": [
                "Defines the window for the function",
                "Filters rows",
                "Joins tables",
                "Creates indexes"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is PARTITION BY used for in window functions?",
            "options": [
                "Dividing rows into partitions",
                "Partitioning tables",
                "Creating views",
                "Indexing columns"
            ],
            "correct": ["A"],
            "multiple": False
        },
    ],

    "Zero-shot & Few-shot Prompting": [
        {
            "question": "What is zero-shot prompting?",
            "options": [
                "Asking model to perform task without examples",
                "Using no prompts",
                "Training without data",
                "Testing without validation"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What is few-shot prompting?",
            "options": [
                "Providing few examples before asking task",
                "Using minimal tokens",
                "Short prompts only",
                "Limited model capacity"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "When is few-shot prompting more effective?",
            "options": [
                "For complex or ambiguous tasks",
                "For simple yes/no questions",
                "Never useful",
                "Only for small models"
            ],
            "correct": ["A"],
            "multiple": False
        },
        {
            "question": "What are benefits of few-shot learning?",
            "options": ["No fine-tuning needed", "Quick adaptation", "Works with frozen models", "Requires no compute"],
            "correct": ["A", "B", "C"],
            "multiple": True
        },
    ],
}


class MCQPopulator:
    """Populate MCQs for all courses"""

    def __init__(self, postgres_db, falkor_db: FalkorDB):
        self.postgres_db = postgres_db
        self.falkor_db = falkor_db

    def get_all_courses(self):
        """Fetch all courses from FalkorDB"""
        logger.info("Fetching courses from FalkorDB...")
        query = """
        MATCH (c:Course)
        RETURN c.course_id as course_id, c.course_name as course_name
        ORDER BY c.course_name
        """
        result = self.falkor_db.execute_query(query)
        courses = [{"course_id": row[0], "course_name": row[1]} for row in result]
        logger.info(f"Found {len(courses)} courses")
        return courses

    def get_mcqs_for_course(self, course_name: str):
        """Get MCQs for a specific course"""
        if course_name not in COURSE_MCQS:
            logger.warning(f"No MCQs found for course: {course_name}")
            return []
        return COURSE_MCQS[course_name]

    def insert_mcq(self, question_id: str, question_text: str, options: list,
                   correct_answers: list, multiple_answer_flag: bool):
        """Insert MCQ into PostgreSQL"""
        query = """
        INSERT INTO mcqs
        (question_id, question_text, option_a, option_b, option_c, option_d,
         correct_answers, multiple_answer_flag)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (question_id) DO NOTHING
        """

        self.postgres_db.execute_query(
            query,
            (
                question_id,
                question_text,
                options[0],
                options[1],
                options[2],
                options[3],
                correct_answers,
                multiple_answer_flag
            )
        )

    def link_question_to_course(self, course_id: str, question_id: str):
        """Link Question to Course in FalkorDB"""
        query = """
        MATCH (c:Course {course_id: $course_id})
        MERGE (q:Question {question_id: $question_id})
        MERGE (c)-[:has_question]->(q)
        RETURN q
        """
        params = {"course_id": course_id, "question_id": question_id}
        self.falkor_db.execute_query(query, params)

    def populate_course_mcqs(self, course_id: str, course_name: str):
        """Populate MCQs for a single course"""
        logger.info(f"\nPopulating MCQs for: {course_name}")

        mcqs = self.get_mcqs_for_course(course_name)
        count = 0

        for mcq in mcqs:
            # Generate question ID
            question_id = generate_id(mcq["question"])

            # Insert into PostgreSQL
            try:
                self.insert_mcq(
                    question_id=question_id,
                    question_text=mcq["question"],
                    options=mcq["options"],
                    correct_answers=mcq["correct"],
                    multiple_answer_flag=mcq["multiple"]
                )

                # Link to course in FalkorDB
                self.link_question_to_course(course_id, question_id)
                count += 1
                logger.info(f"  ✓ Added: {mcq['question'][:60]}...")

            except Exception as e:
                logger.error(f"  ✗ Failed to add question: {e}")

        return count

    def populate_all(self):
        """Main method to populate MCQs for all courses"""
        logger.info("Starting MCQ population...")
        logger.info("="*60)

        courses = self.get_all_courses()
        total_questions = 0

        for course in courses:
            count = self.populate_course_mcqs(course["course_id"], course["course_name"])
            total_questions += count

        logger.info("\n" + "="*60)
        logger.info("✓ MCQ Population Completed!")
        logger.info("="*60)
        logger.info(f"Total courses: {len(courses)}")
        logger.info(f"Total questions added: {total_questions}")
        logger.info(f"Average questions per course: {total_questions / len(courses):.1f}")
        logger.info("="*60)


def main():
    """Main entry point"""
    try:
        # Initialize databases
        logger.info("Connecting to databases...")

        postgres_db = get_postgres_db()
        if not postgres_db.pool:
            postgres_db.initialize_pool()

        falkor_db = FalkorDB()
        falkor_db.connect()

        # Create populator and run
        populator = MCQPopulator(postgres_db, falkor_db)
        populator.populate_all()

        # Close connections
        falkor_db.close()
        postgres_db.close_pool()

        logger.info("\n✓ Script completed successfully!")

    except Exception as e:
        logger.error(f"Script failed: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()
