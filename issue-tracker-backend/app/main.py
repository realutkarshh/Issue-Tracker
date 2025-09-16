from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import issues
from app.database import connect_to_mongo, close_mongo_connection

# Create FastAPI instance
app = FastAPI(
    title="Issue Tracker API",
    description="A simple issue tracking system API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(issues.router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", port=8000, reload=True)
