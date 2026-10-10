"""
Database Connection and Session Management
Configured for PostgreSQL with automatic fallback to SQLite for immediate local execution.
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger("creditguard.database")

# Database URL from environment or PostgreSQL default
DEFAULT_POSTGRES_URL = "postgresql://postgres:postgres@localhost:5432/creditguard"
SQLITE_FALLBACK_URL = "sqlite:///./creditguard.db"

DATABASE_URL = os.getenv("DATABASE_URL", SQLITE_FALLBACK_URL)

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
    else:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20
        )
    # Test connection
    with engine.connect() as conn:
        logger.info("Database engine initialized successfully.")
except Exception as e:
    logger.warning(f"Could not connect to configured DATABASE_URL ({DATABASE_URL}): {e}")
    logger.info("Falling back to local SQLite database: sqlite:///./creditguard.db")
    DATABASE_URL = SQLITE_FALLBACK_URL
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    """Initializes tables in database."""
    from backend.database import models  # noqa
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency for yielding database session."""
    init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

