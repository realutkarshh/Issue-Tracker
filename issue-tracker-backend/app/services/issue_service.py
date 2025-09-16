from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.database import issue_collection
from app.schemas.issue import IssueCreate, IssueUpdate

class IssueService:
    
    @staticmethod
    async def create_issue(issue_data: IssueCreate) -> dict:
        """Create a new issue"""
        issue_dict = issue_data.model_dump()
        issue_dict["created_at"] = datetime.utcnow()
        issue_dict["updated_at"] = datetime.utcnow()
        
        result = await issue_collection.insert_one(issue_dict)
        created_issue = await issue_collection.find_one({"_id": result.inserted_id})
        return created_issue

    @staticmethod
    async def get_issue_by_id(issue_id: str) -> Optional[dict]:
        """Get issue by ID"""
        if not ObjectId.is_valid(issue_id):
            return None
        return await issue_collection.find_one({"_id": ObjectId(issue_id)})

    @staticmethod
    async def get_issues(
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        assignee: Optional[str] = None,
        sort_by: str = "updated_at",
        sort_order: int = -1
    ) -> List[dict]:
        """Get issues with filtering, searching, and pagination"""
        
        # Build query filter
        query = {}
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        if status:
            query["status"] = status
        if priority:
            query["priority"] = priority
        if assignee:
            query["assignee"] = assignee
        
        # Execute query
        cursor = issue_collection.find(query).sort(sort_by, sort_order).skip(skip).limit(limit)
        return await cursor.to_list(length=limit)

    @staticmethod
    async def update_issue(issue_id: str, issue_data: IssueUpdate) -> Optional[dict]:
        """Update an issue"""
        if not ObjectId.is_valid(issue_id):
            return None
        
        update_data = {k: v for k, v in issue_data.model_dump().items() if v is not None}
        if update_data:
            update_data["updated_at"] = datetime.utcnow()
            
            await issue_collection.update_one(
                {"_id": ObjectId(issue_id)},
                {"$set": update_data}
            )
        
        return await issue_collection.find_one({"_id": ObjectId(issue_id)})

    @staticmethod
    async def delete_issue(issue_id: str) -> bool:
        """Delete an issue"""
        if not ObjectId.is_valid(issue_id):
            return False
        
        result = await issue_collection.delete_one({"_id": ObjectId(issue_id)})
        return result.deleted_count > 0
