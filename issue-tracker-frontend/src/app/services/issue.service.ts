import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Issue, CreateIssueRequest, UpdateIssueRequest } from '../models/issue';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private readonly API_URL = 'https://issue-tracker-kp69.onrender.com';

  constructor(private http: HttpClient) {
    // console.log('🔧 IssueService initialized with API_URL:', this.API_URL);
  }

  // Health check with detailed logging
  healthCheck(): Observable<any> {
    // console.log('🏥 Checking health at:', `${this.API_URL}/health`);
    return this.http.get(`${this.API_URL}/health`)
      .pipe(
        // tap(response => console.log('✅ Health check successful:', response)),
        catchError(this.handleError)
      );
  }

  // Get ALL issues with detailed logging
  getIssues(): Observable<Issue[]> {
    const url = `${this.API_URL}/issues/`;
    // console.log('📡 Fetching ALL issues from:', url);
    
    return this.http.get<Issue[]>(url)
      .pipe(
        tap(issues => {
          // console.log('✅ Issues received:', issues);
          // console.log('📊 Number of issues:', issues.length);
          // if (issues.length > 0) {
          //   console.log('📋 First issue sample:', issues[0]);
          // }
        }),
        catchError(this.handleError)
      );
  }

  // Get single issue
  getIssueById(id: string): Observable<Issue> {
    const url = `${this.API_URL}/issues/${id}`;
    // console.log('📄 Fetching issue by ID:', url);
    
    return this.http.get<Issue>(url)
      .pipe(
        // tap(issue => console.log('✅ Issue received:', issue)),
        catchError(this.handleError)
      );
  }

  // Create issue
  createIssue(issue: CreateIssueRequest): Observable<Issue> {
    const url = `${this.API_URL}/issues/`;
    // console.log('➕ Creating issue at:', url, issue);
    
    return this.http.post<Issue>(url, issue)
      .pipe(
        // tap(created => console.log('✅ Issue created:', created)),
        catchError(this.handleError)
      );
  }

  // Update issue
  updateIssue(id: string, issue: UpdateIssueRequest): Observable<Issue> {
    const url = `${this.API_URL}/issues/${id}`;
    // console.log('📝 Updating issue at:', url, issue);
    
    return this.http.put<Issue>(url, issue)
      .pipe(
        // tap(updated => console.log('✅ Issue updated:', updated)),
        catchError(this.handleError)
      );
  }

  // Delete issue - ✅ Enhanced return type
  deleteIssue(id: string): Observable<{message: string, deleted_id: string, deleted_title: string}> {
    const url = `${this.API_URL}/issues/${id}`;
    // console.log('🗑️ Deleting issue at:', url);
    
    return this.http.delete<{message: string, deleted_id: string, deleted_title: string}>(url)
      .pipe(
        // tap(result => console.log('✅ Issue deleted:', result)),
        catchError(this.handleError)
      );
  }

  // ✅ Added debug database method
  debugDatabase(): Observable<any> {
    const url = `${this.API_URL}/debug/database`;
    // console.log('🔍 Checking database status at:', url);
    
    return this.http.get(url)
      .pipe(
        // tap(status => console.log('✅ Database status:', status)),
        catchError(this.handleError)
      );
  }

  // Enhanced error handler
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('🚨 API Error Details:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      message: error.message,
      error: error.error
    });
    
    let errorMessage = 'An error occurred';
    
    if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Check if backend is running on http://localhost:8000';
      console.error('💡 Possible solutions:');
      console.error('   1. Start the backend server: python run.py');
      console.error('   2. Check CORS configuration');
      console.error('   3. Verify the API URL is correct');
    } else if (error.status === 404) {
      errorMessage = 'API endpoint not found. Check your backend routes.';
    } else if (error.status === 500) {
      errorMessage = 'Server error occurred. Check backend logs.';
    } else if (error.status === 422) {
      errorMessage = 'Invalid request data. Check request format.';
    } else {
      errorMessage = `Server returned ${error.status}: ${error.statusText}`;
    }

    return throwError(() => new Error(errorMessage));
  };
}
