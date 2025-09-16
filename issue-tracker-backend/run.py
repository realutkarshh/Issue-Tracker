import uvicorn

if __name__ == "__main__":
    print("🚀 Starting Issue Tracker API...")
    print("🌐 CORS enabled for Angular frontend")
    print("📖 API Docs: http://localhost:8000/docs")
    print("🏥 Health: http://localhost:8000/health")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",  # ✅ Fixed: Points to app/main.py file, app instance
        port=8000,
        reload=True
    )
