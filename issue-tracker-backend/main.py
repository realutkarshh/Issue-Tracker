from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List
from datetime import datetime
import uuid

from database import connect_to_mongo, close_mongo_connection, get_collection
from models import Issue, CreateIssueRequest, UpdateIssueRequest

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    # Startup
    print("🚀 Starting Issue Tracker API...")
    await connect_to_mongo()
    yield
    # Shutdown
    print("🛑 Shutting down API...")
    await close_mongo_connection()

# Create FastAPI application
app = FastAPI(
    title="Issue Tracker API",
    description="Simple issue tracking system with MongoDB Atlas",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",    # Angular dev server
        "http://127.0.0.1:4200",   # Alternative localhost
        "https://localhost:4200",  # HTTPS
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

def issue_helper(issue_doc: dict) -> dict:
    """Convert MongoDB document to Issue response format"""
    return {
        "id": issue_doc["id"],
        "title": issue_doc["title"],
        "description": issue_doc.get("description"),
        "status": issue_doc["status"],
        "priority": issue_doc["priority"],
        "assignee": issue_doc.get("assignee"),
        "created_at": issue_doc["created_at"],
        "updated_at": issue_doc["updated_at"]
    }

# ================================
# API ROUTES
# ================================


#Root API (METHOD: GET) - To get the status about the working of the API
@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "message": "🎉 Issue Tracker API is running!",
        "version": "1.0.0",
        "documentation": "/docs",
        "health_check": "/health",
        "database": "MongoDB Atlas"
    }

#"/health" (METHOD: GET) - To get the health of the server. Returns 'healthy' when working and 'unhealthy' if connection with database fails
@app.get("/health")
async def health_check():
    """Health check endpoint with database status"""
    try:
        collection = get_collection()
        if collection is None:
            raise Exception("Database not connected")
        
        # Count documents to test connection
        count = await collection.count_documents({})
        
        return {
            "status": "healthy",
            "message": "API and database are working",
            "database": "MongoDB Atlas connected",
            "issues_count": count,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "message": "Database connection failed",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }


#"/issues" (METHOD: GET) - To get all the issues from the database
@app.get("/issues/", response_model=List[Issue])
async def get_all_issues():
    """Get all issues from MongoDB Atlas"""
    print("📡 GET /issues/ - Fetching from MongoDB Atlas")
    
    try:
        collection = get_collection()
        if collection is None:
            raise HTTPException(status_code=500, detail="Database not connected")
        
        # Get all issues sorted by updated_at descending
        issues = []
        cursor = collection.find({}).sort("updated_at", -1)
        
        async for issue_doc in cursor:
            issues.append(issue_helper(issue_doc))
        
        print(f"✅ Retrieved {len(issues)} issues from MongoDB Atlas")
        return issues
        
    except Exception as e:
        print(f"❌ Error fetching issues: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch issues: {str(e)}")


# "/issues/{issue_id} (METHOD: GET) - To get a specific issue from the database."
@app.get("/issues/{issue_id}", response_model=Issue)
async def get_issue_by_id(issue_id: str):
    """Get a specific issue by ID"""
    print(f"📄 GET /issues/{issue_id}")
    
    try:
        collection = get_collection()
        issue_doc = await collection.find_one({"id": issue_id})
        
        if not issue_doc:
            print(f"❌ Issue not found: {issue_id}")
            raise HTTPException(status_code=404, detail="Issue not found")
        
        print(f"✅ Found issue: {issue_doc['title']}")
        return issue_helper(issue_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching issue {issue_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch issue: {str(e)}")


# "/issues" (METHOD: POST) - To create a new issue into the database
@app.post("/issues/", response_model=Issue)
async def create_issue(issue_request: CreateIssueRequest):
    """Create a new issue in MongoDB Atlas"""
    print(f"➕ POST /issues/ - Creating: '{issue_request.title}'")
    
    try:
        collection = get_collection()
        if collection is None:
            raise HTTPException(status_code=500, detail="Database not connected")
        
        # Generate unique ID and timestamp
        issue_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat() + "Z"
        
        # Create issue document for MongoDB
        issue_doc = {
            "id": issue_id,
            "title": issue_request.title,
            "description": issue_request.description,
            "status": issue_request.status,
            "priority": issue_request.priority,
            "assignee": issue_request.assignee,
            "created_at": now,
            "updated_at": now
        }
        
        # Insert into MongoDB Atlas
        result = await collection.insert_one(issue_doc)
        print(f"✅ Issue inserted with MongoDB _id: {result.inserted_id}")
        
        # Return the created issue
        created_issue = issue_helper(issue_doc)
        print(f"✅ Issue created successfully: {issue_id}")
        return created_issue
        
    except Exception as e:
        print(f"❌ Error creating issue: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create issue: {str(e)}")


# "/issues/{issue_id}" (METHOD:PUT) - To update an existing issue using the issue id
@app.put("/issues/{issue_id}", response_model=Issue)
async def update_issue(issue_id: str, issue_request: UpdateIssueRequest):
    """Update an existing issue in MongoDB Atlas"""
    print(f"📝 PUT /issues/{issue_id}")
    
    try:
        collection = get_collection()
        
        # Check if issue exists
        existing_issue = await collection.find_one({"id": issue_id})
        if not existing_issue:
            print(f"❌ Issue not found for update: {issue_id}")
            raise HTTPException(status_code=404, detail="Issue not found")
        
        # Prepare update data (only include fields that were provided)
        update_data = issue_request.model_dump(exclude_unset=True)
        if update_data:  # Only update if there are changes
            update_data["updated_at"] = datetime.utcnow().isoformat() + "Z"
            
            # Update in MongoDB Atlas
            result = await collection.update_one(
                {"id": issue_id},
                {"$set": update_data}
            )
            
            print(f"✅ Issue updated. Modified count: {result.modified_count}")
        
        # Return updated issue
        updated_issue_doc = await collection.find_one({"id": issue_id})
        return issue_helper(updated_issue_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating issue {issue_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update issue: {str(e)}")


# "/issues/{issue_id} (METHOD:DELETE) - To delete an existing issue in the database. "
@app.delete("/issues/{issue_id}")
async def delete_issue(issue_id: str):
    """Delete an issue from MongoDB Atlas"""
    print(f"🗑️ DELETE /issues/{issue_id}")
    
    try:
        collection = get_collection()
        
        # Check if issue exists before deletion
        existing_issue = await collection.find_one({"id": issue_id})
        if not existing_issue:
            print(f"❌ Issue not found for deletion: {issue_id}")
            raise HTTPException(status_code=404, detail="Issue not found")
        
        # Delete from MongoDB Atlas
        result = await collection.delete_one({"id": issue_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=500, detail="Failed to delete issue")
        
        print(f"✅ Issue deleted: {existing_issue['title']}")
        return {
            "message": "Issue deleted successfully",
            "deleted_id": issue_id,
            "deleted_title": existing_issue["title"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting issue {issue_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete issue: {str(e)}")

# ================================
# DEBUG ENDPOINTS (for development)
# ================================

@app.get("/debug/database")
async def debug_database():
    """Debug endpoint to check database connection and data"""
    try:
        collection = get_collection()
        if collection is None:
            return {"status": "error", "message": "Database not connected"}
        
        # Get database statistics
        total_count = await collection.count_documents({})
        
        # Get sample issues (first 3)
        sample_issues = []
        async for issue_doc in collection.find({}).limit(3):
            sample_issues.append(issue_helper(issue_doc))
        
        return {
            "status": "connected",
            "database": "MongoDB Atlas",
            "total_issues": total_count,
            "sample_issues": sample_issues
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app",host="0.0.0.0", port=8000, reload=True)
