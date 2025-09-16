import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';  // Like process.env in Next.js
import { 
  Issue, 
  CreateIssueRequest, 
  UpdateIssueRequest, 
  IssueQueryParams 
} from '../models/issue';

// Like your API utility class in React
@Injectable({
  providedIn: 'root'  // Singleton service (like global state)
})
export class IssueService {
   private readonly baseUrl = environment.apiUrl;  // FastAPI backend URL

  constructor(private http: HttpClient) {}  // Like axios instance

  // GET /issues - Similar to your React fetch functions
  getIssues(params: IssueQueryParams = {}): Observable<Issue[]> {
    let httpParams = new HttpParams();
    
    // Build query parameters (like URLSearchParams in React)
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.page_size) httpParams = httpParams.set('page_size', params.page_size.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.priority) httpParams = httpParams.set('priority', params.priority);
    if (params.assignee) httpParams = httpParams.set('assignee', params.assignee);
    if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.sort_order) httpParams = httpParams.set('sort_order', params.sort_order);

    return this.http.get<Issue[]>(`${this.baseUrl}/issues`, { params: httpParams });
  }

  // GET /issues/:id - Similar to fetching single item in React
  getIssueById(id: string): Observable<Issue> {
    return this.http.get<Issue>(`${this.baseUrl}/issues/${id}`);
  }

  // POST /issues - Similar to your create functions in React
  createIssue(issue: CreateIssueRequest): Observable<Issue> {
    return this.http.post<Issue>(`${this.baseUrl}/issues`, issue);
  }

  // PUT /issues/:id - Similar to your update functions in React
  updateIssue(id: string, issue: UpdateIssueRequest): Observable<Issue> {
    return this.http.put<Issue>(`${this.baseUrl}/issues/${id}`, issue);
  }

  // DELETE /issues/:id - Similar to your delete functions in React
  deleteIssue(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/issues/${id}`);
  }

  // Health check
  healthCheck(): Observable<{status: string}> {
    return this.http.get<{status: string}>(`${this.baseUrl}/health`);
  }
}
