from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.routes import vendors, comparison, alerts, analysis
from app.database.db import engine, Base, SessionLocal
from app.models import Vendor

Base.metadata.create_all(bind=engine)

# Seed empty database (e.g. on Render ephemeral disk) so dashboard has data
def _ensure_seeded():
    db = SessionLocal()
    try:
        if db.query(Vendor).count() == 0:
            from app.database.seed_data import create_sample_data
            create_sample_data()
    finally:
        db.close()

_ensure_seeded()

app = FastAPI(
    title="Criminal Records Vendor Quality Scorecard API",
    description="Production-level vendor monitoring and comparison system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://vendor-scorecard.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vendors.router, prefix="/api/vendors", tags=["vendors"])
app.include_router(comparison.router, prefix="/api", tags=["comparison"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(analysis.router, prefix="/api", tags=["analysis"])

# Serve static files from the React build (CRA puts assets in build/static/)
app.mount("/static", StaticFiles(directory="static/static"), name="static")
app.mount("/css", StaticFiles(directory="static/static/css"), name="css")
app.mount("/js", StaticFiles(directory="static/static/js"), name="js")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def serve_app():
    return FileResponse("static/index.html")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi"):
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
