from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class IssueStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class IssuePriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IssueBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Issue title")
    description: Optional[str] = Field(None, max_length=1000, description="Issue description")
    status: IssueStatus = Field(default=IssueStatus.OPEN, description="Issue status")
    priority: IssuePriority = Field(default=IssuePriority.MEDIUM, description="Issue priority")
    assignee: Optional[str] = Field(None, max_length=100, description="Person assigned to this issue")

class CreateIssueRequest(IssueBase):
    """Request model for creating a new issue"""
    pass

class UpdateIssueRequest(BaseModel):
    """Request model for updating an existing issue"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[IssueStatus] = None
    priority: Optional[IssuePriority] = None
    assignee: Optional[str] = Field(None, max_length=100)

class Issue(IssueBase):
    """Complete issue model with timestamps"""
    id: str = Field(..., description="Unique issue identifier")
    created_at: str = Field(..., description="Creation timestamp (ISO format)")
    updated_at: str = Field(..., description="Last update timestamp (ISO format)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Login page not working",
                "description": "Users cannot log in using their email address",
                "status": "open",
                "priority": "high",
                "assignee": "john.doe@example.com",
                "created_at": "2025-09-17T01:15:00Z",
                "updated_at": "2025-09-17T01:15:00Z"
            }
        }
    }
