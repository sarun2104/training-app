#!/usr/bin/env python3
"""
Run FastAPI Development Server
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import uvicorn
from backend.config import settings

if __name__ == "__main__":
    print("="*60)
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print("="*60)
    print(f"Server: http://localhost:8000")
    print(f"API Documentation: http://localhost:8000/docs")
    print(f"Alternative Docs: http://localhost:8000/redoc")
    print("="*60)

    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
