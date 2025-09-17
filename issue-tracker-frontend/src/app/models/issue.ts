// ✅ This file is perfect - matches backend exactly
export interface Issue {
  id: string;
  title: string;
  description?: string;  // Optional, matches backend
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: string;     // Optional, matches backend
  created_at: string;    // String format, matches backend
  updated_at: string;    // String format, matches backend
}

export enum IssueStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved', 
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
  description?: string;  // Optional
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: string;     // Optional
}

export interface UpdateIssueRequest {
  title?: string;        // All optional for updates
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
