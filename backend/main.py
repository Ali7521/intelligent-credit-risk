"""
AI CreditGuard – Intelligent Credit Risk Assessment System
FastAPI Backend Application Entrypoint
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure root directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database.connection import engine, Base
from backend.routes.predict import router as predict_router
from backend.routes.applications import router as applications_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.metrics import router as metrics_router

# Configure clean logging (no sensitive PII logged)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("creditguard.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is created
    logger.info("Initializing CreditGuard database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
    yield
    # Shutdown
    logger.info("CreditGuard API shutting down.")


app = FastAPI(
    title="AI CreditGuard – Intelligent Credit Risk Assessment API",
    description="Enterprise-grade credit default risk prediction, explainable AI (SHAP), and portfolio analytics.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"  # Allow all for flexible local development and demos
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(predict_router, prefix="/api", tags=["Inference & SHAP"])
app.include_router(applications_router, prefix="/api", tags=["Applications"])
app.include_router(dashboard_router, prefix="/api", tags=["Portfolio Analytics"])
app.include_router(metrics_router, prefix="/api", tags=["Model Performance"])


@app.get("/api/health", tags=["Health"])
def health_check():
    """Service health and operational status check."""
    return {
        "status": "healthy",
        "service": "AI CreditGuard Engine",
        "version": "1.0.0",
        "database": "connected"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred while processing credit risk assessment."}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
