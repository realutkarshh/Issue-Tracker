// Similar to your React types, but with more structure
export interface Issue {
  id: string;
  title: string;
  description?: string;  // Optional field
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: string;
  created_at: Date;
  updated_at: Date;
}

export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress', 
  CLOSED = 'closed'
}

export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// DTOs for API requests (like form data types in React)
export interface CreateIssueRequest {
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: string;
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assignee?: string;
}

// Query parameters interface
export interface IssueQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assignee?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
