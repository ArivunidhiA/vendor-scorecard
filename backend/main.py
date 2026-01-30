from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import vendors, comparison, alerts, analysis
from app.database.db import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Criminal Records Vendor Quality Scorecard API",
    description="Production-level vendor monitoring and comparison system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vendors.router, prefix="/api/vendors", tags=["vendors"])
app.include_router(comparison.router, prefix="/api", tags=["comparison"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(analysis.router, prefix="/api", tags=["analysis"])

@app.get("/")
async def root():
    return {"message": "Criminal Records Vendor Quality Scorecard API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
