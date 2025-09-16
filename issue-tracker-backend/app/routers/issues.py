from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from app.schemas.issue import IssueCreate, IssueUpdate, IssueResponse
from app.services.issue_service import IssueService

router = APIRouter(prefix="/issues", tags=["issues"])

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@router.get("/", response_model=List[IssueResponse])
async def get_issues(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    assignee: Optional[str] = Query(None, description="Filter by assignee"),
    sort_by: str = Query("updated_at", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc")
):
    """Get issues with filtering, searching, sorting, and pagination"""
    skip = (page - 1) * page_size
    sort_order_int = -1 if sort_order == "desc" else 1
    
    issues = await IssueService.get_issues(
        skip=skip,
        limit=page_size,
        search=search,
        status=status,
        priority=priority,
        assignee=assignee,
        sort_by=sort_by,
        sort_order=sort_order_int
    )
    
    return issues

@router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue_by_id(issue_id: str):
    """Get a single issue by ID"""
    issue = await IssueService.get_issue_by_id(issue_id)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    return issue

@router.post("/", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
async def create_issue(issue_data: IssueCreate):
    """Create a new issue"""
    issue = await IssueService.create_issue(issue_data)
    return issue

@router.put("/{issue_id}", response_model=IssueResponse)
async def update_issue(issue_id: str, issue_data: IssueUpdate):
    """Update an existing issue"""
    issue = await IssueService.update_issue(issue_id, issue_data)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
    return issue

@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_issue(issue_id: str):
    """Delete an issue"""
    success = await IssueService.delete_issue(issue_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue not found"
        )
