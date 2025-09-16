// Updated src/app/models/issue.ts
export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: string;
  created_at: string;    // ✅ Changed from Date to string
  updated_at: string;    // ✅ Changed from Date to string
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
