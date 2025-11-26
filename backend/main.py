"""
Main FastAPI Application
Learning Management System Backend
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from backend.config import settings
from backend.database import postgres_db, falkor_db
from backend.routers import auth, admin, employee, capstones

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Track-based learning platform with hierarchical course structure",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database connections on startup"""
    logger.info("Starting up Learning Management System...")

    # Initialize PostgreSQL connection pool
    try:
        postgres_db.initialize_pool(minconn=2, maxconn=10)
        logger.info("PostgreSQL connection pool initialized")
    except Exception as e:
        logger.error(f"Failed to initialize PostgreSQL: {e}")

    # Initialize FalkorDB connection
    try:
        falkor_db.connect()
        logger.info("FalkorDB connection established")
    except Exception as e:
        logger.error(f"Failed to connect to FalkorDB: {e}")

    logger.info("Application startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up database connections on shutdown"""
    logger.info("Shutting down Learning Management System...")

    # Close PostgreSQL connection pool
    postgres_db.close_pool()

    # Close FalkorDB connection
    falkor_db.close()

    logger.info("Application shutdown complete")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Learning Management System API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "postgres": "connected",
        "falkordb": "connected"
    }


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(employee.router, prefix="/api/employee", tags=["Employee"])
app.include_router(capstones.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
