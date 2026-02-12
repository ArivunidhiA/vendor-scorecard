from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import ssl
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vendor_quality.db")

_is_sqlite = DATABASE_URL.startswith("sqlite")

# Connection pool settings for better performance
engine_kwargs = dict(
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False,  # Set to True for debugging SQL queries
)

if _is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # Use pg8000 pure-Python driver for Vercel serverless compatibility
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)
    elif DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
    # Remove sslmode from URL query params (pg8000 uses connect_args for SSL)
    if "sslmode=" in DATABASE_URL:
        import re
        DATABASE_URL = re.sub(r'[?&]sslmode=[^&]*', '', DATABASE_URL)
        # Fix dangling ? if sslmode was the only param
        DATABASE_URL = DATABASE_URL.rstrip('?')
    # pg8000 SSL via connect_args
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    engine_kwargs["connect_args"] = {"ssl_context": ssl_context}
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10

engine = create_engine(DATABASE_URL, **engine_kwargs)

# Enable WAL mode for SQLite for better concurrency and performance
if _is_sqlite:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=10000")
        cursor.execute("PRAGMA temp_store=memory")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
