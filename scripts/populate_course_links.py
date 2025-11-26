"""
Script to populate reference links for all courses in FalkorDB
Searches for relevant URLs, validates them, and adds them to the graph
"""
import sys
import os
import hashlib
import logging
import time
import requests
from typing import List, Dict, Optional

# Add parent directory to path to import backend modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.falkordb import FalkorDB
from backend.config import settings

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def generate_id(text: str) -> str:
    """Generate a unique ID using hashlib SHA256"""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]


class CourseLinkPopulator:
    """Populate course reference links in FalkorDB"""

    def __init__(self, falkor_db: FalkorDB):
        self.db = falkor_db
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def get_all_courses(self) -> List[Dict[str, str]]:
        """Fetch all courses from FalkorDB"""
        logger.info("Fetching all courses from FalkorDB...")
        query = "MATCH (c:Course) RETURN c.course_id as course_id, c.course_name as course_name"
        results = self.db.execute_query(query)

        courses = [{"course_id": row[0], "course_name": row[1]} for row in results]
        logger.info(f"Found {len(courses)} courses")
        return courses

    def validate_url(self, url: str) -> bool:
        """Validate that a URL is accessible"""
        try:
            response = self.session.head(url, timeout=10, allow_redirects=True)
            return response.status_code == 200
        except:
            try:
                # Some servers don't support HEAD, try GET
                response = self.session.get(url, timeout=10, allow_redirects=True, stream=True)
                return response.status_code == 200
            except Exception as e:
                logger.warning(f"URL validation failed for {url}: {e}")
                return False

    def get_course_links(self, course_name: str) -> List[Dict[str, str]]:
        """
        Get curated reference links for a course
        Returns list of dicts with 'url' and 'label' keys
        """
        # Curated links for each course based on course name
        links_database = {
            # ========== FOUNDATIONAL TRACK ==========
            # Python SubTrack
            "Regular Expressions": [
                {"url": "https://docs.python.org/3/library/re.html", "label": "Python re Module - Official Documentation"},
                {"url": "https://regex101.com/", "label": "Regex101 - Online Regex Tester and Debugger"},
                {"url": "https://www.regular-expressions.info/python.html", "label": "Python Regex Tutorial - Regular-Expressions.info"},
                {"url": "https://realpython.com/regex-python/", "label": "Regular Expressions in Python - Real Python"},
            ],
            "Inheritance and Polymorphism": [
                {"url": "https://realpython.com/inheritance-composition-python/", "label": "Inheritance and Composition in Python - Real Python"},
                {"url": "https://docs.python.org/3/tutorial/classes.html#inheritance", "label": "Python Classes and Inheritance - Official Tutorial"},
                {"url": "https://www.programiz.com/python-programming/inheritance", "label": "Python Inheritance - Programiz"},
                {"url": "https://www.geeksforgeeks.org/polymorphism-in-python/", "label": "Polymorphism in Python - GeeksforGeeks"},
            ],
            "Asynchronous Programming": [
                {"url": "https://docs.python.org/3/library/asyncio.html", "label": "asyncio - Official Python Documentation"},
                {"url": "https://realpython.com/async-io-python/", "label": "Async IO in Python - Real Python"},
                {"url": "https://www.youtube.com/watch?v=t5Bo1Je9EmE", "label": "AsyncIO in Python - Explained (Video)"},
                {"url": "https://superfastpython.com/python-asyncio/", "label": "Python AsyncIO - SuperFastPython"},
            ],
            "Multithreading & Multiprocessing": [
                {"url": "https://realpython.com/python-concurrency/", "label": "Speed Up Your Python Program With Concurrency - Real Python"},
                {"url": "https://docs.python.org/3/library/threading.html", "label": "threading - Thread-based Parallelism"},
                {"url": "https://docs.python.org/3/library/multiprocessing.html", "label": "multiprocessing - Process-based Parallelism"},
                {"url": "https://superfastpython.com/threading-in-python/", "label": "Threading in Python - SuperFastPython"},
            ],
            "Type Hinting & Pydantic": [
                {"url": "https://docs.python.org/3/library/typing.html", "label": "typing - Support for Type Hints"},
                {"url": "https://docs.pydantic.dev/latest/", "label": "Pydantic Official Documentation"},
                {"url": "https://realpython.com/python-type-checking/", "label": "Python Type Checking Guide - Real Python"},
                {"url": "https://mypy.readthedocs.io/en/stable/", "label": "mypy - Static Type Checker for Python"},
            ],

            # SQL SubTrack
            "Date & Time Functions": [
                {"url": "https://www.postgresql.org/docs/current/functions-datetime.html", "label": "PostgreSQL Date/Time Functions"},
                {"url": "https://www.w3schools.com/sql/sql_dates.asp", "label": "SQL Date Functions - W3Schools"},
                {"url": "https://mode.com/sql-tutorial/sql-datetime-format/", "label": "SQL Date and Time Functions - Mode Analytics"},
                {"url": "https://learnsql.com/blog/sql-date-functions/", "label": "SQL Date Functions Guide - LearnSQL"},
            ],
            "Subquery": [
                {"url": "https://www.postgresql.org/docs/current/functions-subquery.html", "label": "PostgreSQL Subquery Expressions"},
                {"url": "https://www.w3schools.com/sql/sql_subqueries.asp", "label": "SQL Subqueries - W3Schools"},
                {"url": "https://mode.com/sql-tutorial/sql-sub-queries/", "label": "SQL Subqueries Tutorial - Mode Analytics"},
                {"url": "https://learnsql.com/blog/subquery-vs-join/", "label": "Subquery vs JOIN - LearnSQL"},
            ],
            "Window Functions": [
                {"url": "https://www.postgresql.org/docs/current/tutorial-window.html", "label": "Window Functions Tutorial - PostgreSQL"},
                {"url": "https://mode.com/sql-tutorial/sql-window-functions/", "label": "SQL Window Functions - Mode Analytics"},
                {"url": "https://learnsql.com/blog/sql-window-functions-cheat-sheet/", "label": "Window Functions Cheat Sheet - LearnSQL"},
                {"url": "https://www.sqlservertutorial.net/sql-server-window-functions/", "label": "SQL Server Window Functions Tutorial"},
            ],
            "Common Table Expression (CTE)": [
                {"url": "https://www.postgresql.org/docs/current/queries-with.html", "label": "WITH Queries (CTE) - PostgreSQL"},
                {"url": "https://learnsql.com/blog/what-is-common-table-expression/", "label": "What is a Common Table Expression - LearnSQL"},
                {"url": "https://www.essentialsql.com/introduction-common-table-expressions-ctes/", "label": "Introduction to CTEs - EssentialSQL"},
                {"url": "https://mode.com/sql-tutorial/sql-cte/", "label": "SQL Common Table Expressions - Mode Analytics"},
            ],
            "Database Indexing & Optimization": [
                {"url": "https://www.postgresql.org/docs/current/indexes.html", "label": "PostgreSQL Indexes Documentation"},
                {"url": "https://use-the-index-luke.com/", "label": "Use The Index, Luke! - Database Indexing Guide"},
                {"url": "https://www.sqlshack.com/sql-index-overview-and-strategy/", "label": "SQL Index Overview and Strategy"},
                {"url": "https://www.postgresql.org/docs/current/performance-tips.html", "label": "PostgreSQL Performance Tips"},
            ],

            # Mathematics for AI SubTrack
            "Linear Algebra (Vectors, Matrices)": [
                {"url": "https://www.khanacademy.org/math/linear-algebra", "label": "Linear Algebra - Khan Academy"},
                {"url": "https://www.3blue1brown.com/topics/linear-algebra", "label": "Essence of Linear Algebra - 3Blue1Brown"},
                {"url": "https://numpy.org/doc/stable/user/tutorial-svd.html", "label": "NumPy Linear Algebra Tutorial"},
                {"url": "https://machinelearningmastery.com/gentle-introduction-linear-algebra/", "label": "Linear Algebra for Machine Learning"},
            ],
            "Calculus (Gradient Descent)": [
                {"url": "https://www.khanacademy.org/math/multivariable-calculus", "label": "Multivariable Calculus - Khan Academy"},
                {"url": "https://www.3blue1brown.com/topics/calculus", "label": "Essence of Calculus - 3Blue1Brown"},
                {"url": "https://machinelearningmastery.com/gradient-descent-for-machine-learning/", "label": "Gradient Descent for Machine Learning"},
                {"url": "https://ml-cheatsheet.readthedocs.io/en/latest/gradient_descent.html", "label": "Gradient Descent - ML Cheatsheet"},
            ],
            "Probability & Statistics": [
                {"url": "https://www.khanacademy.org/math/statistics-probability", "label": "Statistics and Probability - Khan Academy"},
                {"url": "https://seeing-theory.brown.edu/", "label": "Seeing Theory - Visual Introduction to Probability"},
                {"url": "https://machinelearningmastery.com/statistical-methods-for-machine-learning/", "label": "Statistics for Machine Learning"},
                {"url": "https://www.probabilitycourse.com/", "label": "Introduction to Probability - Online Course"},
            ],

            # Data Manipulation & Analysis SubTrack
            "Data Manipulation with Pandas": [
                {"url": "https://pandas.pydata.org/docs/user_guide/index.html", "label": "Pandas User Guide - Official Documentation"},
                {"url": "https://realpython.com/pandas-python-explore-dataset/", "label": "Pandas Tutorial - Real Python"},
                {"url": "https://www.kaggle.com/learn/pandas", "label": "Pandas Course - Kaggle"},
                {"url": "https://www.datacamp.com/cheat-sheet/pandas-cheat-sheet-for-data-science-in-python", "label": "Pandas Cheat Sheet - DataCamp"},
            ],
            "Numerical Computing with NumPy": [
                {"url": "https://numpy.org/doc/stable/user/absolute_beginners.html", "label": "NumPy for Absolute Beginners"},
                {"url": "https://numpy.org/doc/stable/user/quickstart.html", "label": "NumPy Quickstart Tutorial"},
                {"url": "https://realpython.com/numpy-tutorial/", "label": "NumPy Tutorial - Real Python"},
                {"url": "https://www.w3schools.com/python/numpy/default.asp", "label": "NumPy Tutorial - W3Schools"},
            ],
            "Data Visualization (Matplotlib/Seaborn)": [
                {"url": "https://matplotlib.org/stable/tutorials/index.html", "label": "Matplotlib Tutorials - Official Documentation"},
                {"url": "https://seaborn.pydata.org/tutorial.html", "label": "Seaborn Tutorial - Official Documentation"},
                {"url": "https://realpython.com/python-matplotlib-guide/", "label": "Matplotlib Guide - Real Python"},
                {"url": "https://www.datacamp.com/cheat-sheet/matplotlib-cheat-sheet-plotting-in-python", "label": "Matplotlib Cheat Sheet - DataCamp"},
            ],

            # Unit Testing SubTrack
            "Python unit testing with pytest": [
                {"url": "https://docs.pytest.org/en/stable/getting-started.html", "label": "pytest: Getting Started - Official Documentation"},
                {"url": "https://realpython.com/pytest-python-testing/", "label": "Effective Python Testing With pytest - Real Python"},
                {"url": "https://www.guru99.com/pytest-tutorial.html", "label": "Pytest Tutorial - Guru99"},
                {"url": "https://testdriven.io/blog/testing-python/", "label": "Modern Test-Driven Development in Python"},
            ],
            "Python unit testing with unittest": [
                {"url": "https://docs.python.org/3/library/unittest.html", "label": "unittest - Unit Testing Framework"},
                {"url": "https://realpython.com/python-testing/", "label": "Getting Started With Testing in Python - Real Python"},
                {"url": "https://www.datacamp.com/tutorial/unit-testing-python", "label": "Unit Testing in Python - DataCamp"},
                {"url": "https://machinelearningmastery.com/a-gentle-introduction-to-unit-testing-in-python/", "label": "Unit Testing in Python Tutorial"},
            ],
            "Mocking and Fixtures": [
                {"url": "https://docs.pytest.org/en/stable/how-to/fixtures.html", "label": "pytest Fixtures - Official Documentation"},
                {"url": "https://docs.python.org/3/library/unittest.mock.html", "label": "unittest.mock - Mock Object Library"},
                {"url": "https://realpython.com/python-mock-library/", "label": "Python Mock Library - Real Python"},
                {"url": "https://semaphoreci.com/community/tutorials/testing-python-applications-with-pytest", "label": "Testing with pytest and Fixtures"},
            ],

            # Version Control & APIs SubTrack
            "Git Branching & Merging Strategies": [
                {"url": "https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows", "label": "Git Branching Workflows - Official Book"},
                {"url": "https://www.atlassian.com/git/tutorials/comparing-workflows", "label": "Git Workflows - Atlassian Tutorial"},
                {"url": "https://learngitbranching.js.org/", "label": "Learn Git Branching - Interactive Tutorial"},
                {"url": "https://www.atlassian.com/git/tutorials/using-branches", "label": "Git Branches Tutorial - Atlassian"},
            ],
            "REST API Fundamentals": [
                {"url": "https://restfulapi.net/", "label": "REST API Tutorial - RESTful API.net"},
                {"url": "https://www.redhat.com/en/topics/api/what-is-a-rest-api", "label": "What is a REST API - Red Hat"},
                {"url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods", "label": "HTTP Request Methods - MDN"},
                {"url": "https://www.freecodecamp.org/news/rest-api-best-practices-rest-endpoint-design-examples/", "label": "REST API Best Practices - freeCodeCamp"},
            ],
            "FastAPI Implementation": [
                {"url": "https://fastapi.tiangolo.com/tutorial/", "label": "FastAPI Tutorial - Official Documentation"},
                {"url": "https://realpython.com/fastapi-python-web-apis/", "label": "Building APIs with FastAPI - Real Python"},
                {"url": "https://testdriven.io/blog/fastapi-crud/", "label": "FastAPI CRUD Application Tutorial"},
                {"url": "https://www.youtube.com/watch?v=0sOvCWFmrtA", "label": "FastAPI Course for Beginners (Video)"},
            ],

            # ========== GENAI TRACK ==========
            # LLM Fundamentals & Architecture SubTrack
            "Transformer Architecture": [
                {"url": "https://arxiv.org/abs/1706.03762", "label": "Attention Is All You Need - Original Paper"},
                {"url": "https://jalammar.github.io/illustrated-transformer/", "label": "The Illustrated Transformer - Jay Alammar"},
                {"url": "https://www.youtube.com/watch?v=wjZofJX0v4M", "label": "Transformers Explained - StatQuest (Video)"},
                {"url": "https://huggingface.co/learn/nlp-course/chapter1/4", "label": "Transformer Models - Hugging Face Course"},
            ],
            "Attention Mechanisms": [
                {"url": "https://jalammar.github.io/visualizing-neural-machine-translation-mechanics-of-seq2seq-models-with-attention/", "label": "Visualizing Attention Mechanism - Jay Alammar"},
                {"url": "https://arxiv.org/abs/1409.0473", "label": "Neural Machine Translation by Jointly Learning to Align and Translate"},
                {"url": "https://www.youtube.com/watch?v=PSs6nxngL6k", "label": "Attention Mechanism Explained (Video)"},
                {"url": "https://machinelearningmastery.com/the-attention-mechanism-from-scratch/", "label": "Attention Mechanism from Scratch"},
            ],
            "Tokenization & Embeddings": [
                {"url": "https://huggingface.co/learn/nlp-course/chapter2/4", "label": "Tokenization - Hugging Face NLP Course"},
                {"url": "https://www.youtube.com/watch?v=zJW57aCBCTk", "label": "Tokenization and Embeddings Explained (Video)"},
                {"url": "https://developers.google.com/machine-learning/guides/text-classification/step-2-5", "label": "Text Embeddings - Google ML Guide"},
                {"url": "https://jalammar.github.io/illustrated-word2vec/", "label": "The Illustrated Word2vec - Jay Alammar"},
            ],
            "Neural Networks Basics (PyTorch)": [
                {"url": "https://pytorch.org/tutorials/beginner/basics/intro.html", "label": "PyTorch Basics Tutorial - Official Documentation"},
                {"url": "https://www.youtube.com/watch?v=c36lUUr864M", "label": "PyTorch for Deep Learning - freeCodeCamp (Video)"},
                {"url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", "label": "Deep Learning with PyTorch: A 60 Minute Blitz"},
                {"url": "https://www.learnpytorch.io/", "label": "Learn PyTorch for Deep Learning"},
            ],

            # Prompt Engineering SubTrack
            "Zero-shot & Few-shot Prompting": [
                {"url": "https://www.promptingguide.ai/techniques/fewshot", "label": "Few-Shot Prompting - Prompting Guide"},
                {"url": "https://learnprompting.org/docs/basics/few_shot", "label": "Few-Shot Prompting - Learn Prompting"},
                {"url": "https://arxiv.org/abs/2005.14165", "label": "Language Models are Few-Shot Learners (GPT-3 Paper)"},
                {"url": "https://www.anthropic.com/index/prompting-long-context-claude", "label": "Prompting Guide - Anthropic"},
            ],
            "Chain of Thought (CoT)": [
                {"url": "https://www.promptingguide.ai/techniques/cot", "label": "Chain-of-Thought Prompting - Prompting Guide"},
                {"url": "https://arxiv.org/abs/2201.11903", "label": "Chain-of-Thought Prompting Elicits Reasoning in LLMs"},
                {"url": "https://learnprompting.org/docs/intermediate/chain_of_thought", "label": "Chain of Thought - Learn Prompting"},
                {"url": "https://www.youtube.com/watch?v=H4YK_7MAckk", "label": "Chain of Thought Explained (Video)"},
            ],
            "Prompt Security & Jailbreaking Defense": [
                {"url": "https://learnprompting.org/docs/prompt_hacking/intro", "label": "Prompt Hacking - Learn Prompting"},
                {"url": "https://www.promptingguide.ai/risks/adversarial", "label": "Adversarial Prompting - Prompting Guide"},
                {"url": "https://simonwillison.net/2023/Apr/14/worst-that-can-happen/", "label": "Prompt Injection Attacks - Simon Willison"},
                {"url": "https://github.com/greshake/llm-security", "label": "LLM Security Resources - GitHub"},
            ],
            "System Prompts & Persona Definition": [
                {"url": "https://platform.openai.com/docs/guides/prompt-engineering", "label": "Prompt Engineering Guide - OpenAI"},
                {"url": "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview", "label": "Prompt Engineering - Anthropic Claude"},
                {"url": "https://www.promptingguide.ai/introduction/settings", "label": "LLM Settings - Prompting Guide"},
                {"url": "https://learnprompting.org/docs/basics/roles", "label": "Role Prompting - Learn Prompting"},
            ],

            # RAG SubTrack
            "Vector Databases (Pinecone, ChromaDB)": [
                {"url": "https://www.pinecone.io/learn/vector-database/", "label": "What is a Vector Database - Pinecone"},
                {"url": "https://docs.trychroma.com/", "label": "ChromaDB Documentation"},
                {"url": "https://www.youtube.com/watch?v=klTvEwg3oJ4", "label": "Vector Databases Explained (Video)"},
                {"url": "https://www.pinecone.io/learn/vector-embeddings/", "label": "Vector Embeddings - Pinecone Learn"},
            ],
            "Semantic Search & Cosine Similarity": [
                {"url": "https://www.pinecone.io/learn/semantic-search/", "label": "Semantic Search Guide - Pinecone"},
                {"url": "https://www.sbert.net/examples/applications/semantic-search/README.html", "label": "Semantic Search with Sentence-BERT"},
                {"url": "https://www.machinelearningplus.com/nlp/cosine-similarity/", "label": "Cosine Similarity Explained"},
                {"url": "https://www.youtube.com/watch?v=e9U0QAFbfLI", "label": "Semantic Search Tutorial (Video)"},
            ],
            "Chunking Strategies": [
                {"url": "https://www.pinecone.io/learn/chunking-strategies/", "label": "Chunking Strategies for RAG - Pinecone"},
                {"url": "https://python.langchain.com/docs/modules/data_connection/document_transformers/", "label": "Text Splitters - LangChain"},
                {"url": "https://www.youtube.com/watch?v=8OJC21T2SL4", "label": "RAG Chunking Strategies (Video)"},
                {"url": "https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/", "label": "Node Parsers - LlamaIndex"},
            ],
            "Hybrid Search & Reranking": [
                {"url": "https://www.pinecone.io/learn/hybrid-search-intro/", "label": "Hybrid Search Introduction - Pinecone"},
                {"url": "https://weaviate.io/blog/hybrid-search-explained", "label": "Hybrid Search Explained - Weaviate"},
                {"url": "https://www.youtube.com/watch?v=jReMi5ql4kg", "label": "Reranking in RAG Systems (Video)"},
                {"url": "https://docs.cohere.com/docs/rerank", "label": "Rerank API - Cohere Documentation"},
            ],

            # Orchestration Frameworks SubTrack
            "LangChain Fundamentals": [
                {"url": "https://python.langchain.com/docs/get_started/introduction", "label": "LangChain Introduction - Official Documentation"},
                {"url": "https://www.youtube.com/watch?v=_v_fgW2SkkQ", "label": "LangChain Tutorial - freeCodeCamp (Video)"},
                {"url": "https://www.deeplearning.ai/short-courses/langchain-for-llm-application-development/", "label": "LangChain Course - DeepLearning.AI"},
                {"url": "https://github.com/gkamradt/langchain-tutorials", "label": "LangChain Tutorials - GitHub"},
            ],
            "LlamaIndex Data Connectors": [
                {"url": "https://docs.llamaindex.ai/en/stable/", "label": "LlamaIndex Documentation"},
                {"url": "https://docs.llamaindex.ai/en/stable/module_guides/loading/connector/", "label": "Data Connectors - LlamaIndex"},
                {"url": "https://www.youtube.com/watch?v=CazFHYwf2a0", "label": "LlamaIndex Tutorial (Video)"},
                {"url": "https://www.deeplearning.ai/short-courses/building-evaluating-advanced-rag/", "label": "Advanced RAG with LlamaIndex - DeepLearning.AI"},
            ],
            "Building Autonomous Agents (ReAct)": [
                {"url": "https://arxiv.org/abs/2210.03629", "label": "ReAct: Synergizing Reasoning and Acting in LLMs"},
                {"url": "https://python.langchain.com/docs/modules/agents/agent_types/react", "label": "ReAct Agents - LangChain"},
                {"url": "https://www.youtube.com/watch?v=Eug2clsLtFs", "label": "ReAct Agents Explained (Video)"},
                {"url": "https://www.promptingguide.ai/techniques/react", "label": "ReAct Prompting - Prompting Guide"},
            ],
            "Multi-Agent Systems (CrewAI/AutoGen)": [
                {"url": "https://github.com/joaomdmoura/crewAI", "label": "CrewAI - GitHub Repository"},
                {"url": "https://microsoft.github.io/autogen/", "label": "AutoGen Documentation - Microsoft"},
                {"url": "https://www.youtube.com/watch?v=tnejrr-0a94", "label": "Multi-Agent Systems Tutorial (Video)"},
                {"url": "https://www.deeplearning.ai/short-courses/multi-ai-agent-systems-with-crewai/", "label": "Multi-Agent Systems - DeepLearning.AI"},
            ],

            # Fine-Tuning & Optimization SubTrack
            "PEFT (Parameter-Efficient Fine-Tuning)": [
                {"url": "https://huggingface.co/docs/peft/index", "label": "PEFT Documentation - Hugging Face"},
                {"url": "https://arxiv.org/abs/2106.09685", "label": "Parameter-Efficient Transfer Learning for NLP"},
                {"url": "https://www.youtube.com/watch?v=Us5ZFp16PaU", "label": "PEFT Explained (Video)"},
                {"url": "https://github.com/huggingface/peft", "label": "PEFT - GitHub Repository"},
            ],
            "LoRA & QLoRA": [
                {"url": "https://arxiv.org/abs/2106.09685", "label": "LoRA: Low-Rank Adaptation of LLMs"},
                {"url": "https://arxiv.org/abs/2305.14314", "label": "QLoRA: Efficient Finetuning of Quantized LLMs"},
                {"url": "https://huggingface.co/docs/peft/conceptual_guides/lora", "label": "LoRA Guide - Hugging Face"},
                {"url": "https://www.youtube.com/watch?v=t509sv5MT0w", "label": "LoRA and QLoRA Explained (Video)"},
            ],
            "Quantization (GGUF/INT8)": [
                {"url": "https://huggingface.co/docs/transformers/main/en/quantization", "label": "Quantization Guide - Hugging Face"},
                {"url": "https://github.com/ggerganov/ggml", "label": "GGML - Tensor Library for ML"},
                {"url": "https://www.youtube.com/watch?v=0VdNflU08yA", "label": "Model Quantization Explained (Video)"},
                {"url": "https://huggingface.co/docs/optimum/concept_guides/quantization", "label": "Quantization Concepts - Optimum"},
            ],
            "RLHF (Reinforcement Learning from Human Feedback)": [
                {"url": "https://huggingface.co/blog/rlhf", "label": "Illustrating RLHF - Hugging Face Blog"},
                {"url": "https://arxiv.org/abs/2203.02155", "label": "Training Language Models with RLHF"},
                {"url": "https://www.youtube.com/watch?v=2MBJOuVq380", "label": "RLHF Explained (Video)"},
                {"url": "https://openai.com/research/learning-from-human-preferences", "label": "Learning from Human Preferences - OpenAI"},
            ],

            # LLMOps & Evaluation SubTrack
            "LLM Evaluation Frameworks (Ragas)": [
                {"url": "https://docs.ragas.io/en/stable/", "label": "Ragas Documentation - RAG Assessment"},
                {"url": "https://github.com/explodinggradients/ragas", "label": "Ragas - GitHub Repository"},
                {"url": "https://www.youtube.com/watch?v=Cn-Xcg3LwWI", "label": "RAG Evaluation with Ragas (Video)"},
                {"url": "https://huggingface.co/spaces/explodinggradients/ragas", "label": "Ragas Demo - Hugging Face"},
            ],
            "Model Serving (vLLM/Ollama)": [
                {"url": "https://docs.vllm.ai/en/stable/", "label": "vLLM Documentation"},
                {"url": "https://ollama.ai/", "label": "Ollama - Run LLMs Locally"},
                {"url": "https://github.com/vllm-project/vllm", "label": "vLLM - GitHub Repository"},
                {"url": "https://www.youtube.com/watch?v=XUbRO7yx3cg", "label": "Local LLM Deployment Tutorial (Video)"},
            ],
            "Monitoring & Observability": [
                {"url": "https://www.langchain.com/langsmith", "label": "LangSmith - LLM Observability Platform"},
                {"url": "https://docs.arize.com/phoenix/", "label": "Phoenix - AI Observability"},
                {"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "label": "LLM Monitoring Best Practices (Video)"},
                {"url": "https://humanloop.com/blog/llm-evaluation", "label": "LLM Evaluation and Monitoring - Humanloop"},
            ],
        }

        return links_database.get(course_name, [])

    def add_link_to_course(self, course_id: str, link_url: str, link_label: str):
        """Add a link to a course in FalkorDB"""
        link_id = generate_id(link_url)

        query = """
        MATCH (c:Course {course_id: $course_id})
        MERGE (l:Links {link_id: $link_id})
        SET l.link = $link_url, l.link_label = $link_label
        MERGE (c)-[:has_links]->(l)
        RETURN l
        """

        params = {
            "course_id": course_id,
            "link_id": link_id,
            "link_url": link_url,
            "link_label": link_label
        }

        self.db.execute_query(query, params)
        logger.info(f"  ✓ Added link: {link_label}")

    def populate_all_links(self):
        """Main method to populate links for all courses"""
        logger.info("Starting course links population...")

        # Get all courses
        courses = self.get_all_courses()

        total_links = 0
        courses_with_links = 0
        courses_without_links = []

        for course in courses:
            course_id = course["course_id"]
            course_name = course["course_name"]

            logger.info(f"\n{'='*60}")
            logger.info(f"Processing: {course_name}")
            logger.info(f"{'='*60}")

            # Get curated links for this course
            links = self.get_course_links(course_name)

            if not links:
                logger.warning(f"No curated links found for: {course_name}")
                courses_without_links.append(course_name)
                continue

            # Validate and add links
            added_count = 0
            for link in links[:5]:  # Max 5 links per course
                url = link["url"]
                label = link["label"]

                logger.info(f"Validating: {url}")
                if self.validate_url(url):
                    self.add_link_to_course(course_id, url, label)
                    added_count += 1
                    total_links += 1
                    time.sleep(0.5)  # Rate limiting
                else:
                    logger.warning(f"  ✗ Invalid URL: {url}")

            if added_count > 0:
                courses_with_links += 1
                logger.info(f"Added {added_count} links to {course_name}")

        # Summary
        logger.info("\n" + "="*60)
        logger.info("✓ Link Population Completed!")
        logger.info("="*60)
        logger.info(f"Total courses processed: {len(courses)}")
        logger.info(f"Courses with links: {courses_with_links}")
        logger.info(f"Total links added: {total_links}")

        if courses_without_links:
            logger.warning(f"\nCourses without curated links ({len(courses_without_links)}):")
            for course_name in courses_without_links:
                logger.warning(f"  - {course_name}")


def main():
    """Main entry point"""
    try:
        # Initialize FalkorDB connection
        logger.info("Connecting to FalkorDB...")
        falkor_db = FalkorDB()
        falkor_db.connect()

        # Create populator and run
        populator = CourseLinkPopulator(falkor_db)
        populator.populate_all_links()

        # Close connection
        falkor_db.close()

        logger.info("\nScript completed successfully!")

    except Exception as e:
        logger.error(f"Script failed: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    main()
