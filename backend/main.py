from contextlib import asynccontextmanager
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.routes import vendors, comparison, alerts, analysis, quick
from app.database.db import engine, Base, SessionLocal, _is_sqlite
from app.models import Vendor

# One-row table: first worker to insert wins the right to seed; others skip.
_SEED_CLAIM_TABLE = "_seed_claim"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables (deferred from import time for serverless compatibility)
    Base.metadata.create_all(bind=engine)
    # Startup: run seeding in one worker only, no import-time side effects
    db = SessionLocal()
    try:
        with engine.connect() as conn:
            if _is_sqlite:
                conn.execute(text(f"CREATE TABLE IF NOT EXISTS {_SEED_CLAIM_TABLE} (id INTEGER PRIMARY KEY)"))
            else:
                conn.execute(text(
                    f"CREATE TABLE IF NOT EXISTS {_SEED_CLAIM_TABLE} (id INTEGER PRIMARY KEY)"
                ))
            conn.commit()
        try:
            db.execute(text(f"INSERT INTO {_SEED_CLAIM_TABLE} (id) VALUES (1)"))
            db.commit()
        except (IntegrityError, Exception):
            db.rollback()
            # Another worker already claimed; skip seeding
        else:
            if db.query(Vendor).count() == 0:
                from app.database.seed_data import create_sample_data
                create_sample_data()
    finally:
        db.close()
    yield
    # Shutdown: nothing to do


app = FastAPI(
    title="Criminal Records Vendor Quality Scorecard API",
    description="Production-level vendor monitoring and comparison system",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app",  # All Vercel preview and production URLs
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vendors.router, prefix="/api/vendors", tags=["vendors"])
app.include_router(comparison.router, prefix="/api", tags=["comparison"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(analysis.router, prefix="/api", tags=["analysis"])
app.include_router(quick.router, prefix="/api/quick", tags=["quick"])

import os

# Serve static files from the React build (CRA puts assets in build/static/)
# Only mount if directories exist (for local dev without built frontend)
if os.path.exists("static/static"):
    app.mount("/static", StaticFiles(directory="static/static"), name="static")
if os.path.exists("static/static/css"):
    app.mount("/css", StaticFiles(directory="static/static/css"), name="css")
if os.path.exists("static/static/js"):
    app.mount("/js", StaticFiles(directory="static/static/js"), name="js")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def serve_app():
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    return {"message": "Vendor Scorecard API - Use /docs for API documentation"}

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Skip API routes - let them be handled by their routers
    if full_path.startswith("api/") or full_path == "api":
        raise HTTPException(status_code=404, detail="Not found")
    if full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi"):
        raise HTTPException(status_code=404, detail="Not found")
    # Skip health check
    if full_path == "health":
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
