import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # Use Render's PORT or fallback to 8000
    
    print("🚀 Starting Issue Tracker API...")
    print(f"🌐 Listening on 0.0.0.0:{port}")
    print("📖 API Docs: /docs")
    print("🏥 Health: /health")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",   # IMPORTANT: Required for Render
        port=port,
        reload=False      # Disable reload in production
    )
