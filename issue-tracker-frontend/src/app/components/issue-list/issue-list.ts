import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material Imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

// Our services and models
import { IssueService } from '../../services/issue.service';
import { Issue, IssueStatus, IssuePriority } from '../../models/issue';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './issue-list.html'
})
export class IssueListComponent implements OnInit {
  // Simple table configuration
  displayedColumns: string[] = ['title', 'status', 'priority', 'assignee', 'actions'];
  dataSource = new MatTableDataSource<Issue>([]);

  // Component state
  loading = false;
  error: string | null = null;
  issues: Issue[] = [];

  constructor(
    private issueService: IssueService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    console.log('🔧 IssueListComponent constructor');
  }

  ngOnInit(): void {
    console.log('🚀 IssueListComponent initialized');
    this.loadAllIssues();
  }

  // Load ALL issues from MongoDB - Simple approach
  loadAllIssues(): void {
    console.log('📡 Loading ALL issues from MongoDB...');
    this.loading = true;
    this.error = null;

    // Simple call - no complex parameters
    this.issueService.getIssues().subscribe({
      next: (issues: Issue[]) => {
        console.log('✅ Issues loaded successfully:', issues);
        
        // Update data source
        this.issues = issues;
        this.dataSource.data = issues;
        
        this.loading = false;
        this.error = null;
        
        console.log(`📊 Total issues loaded: ${issues.length}`);
      },
      error: (error) => {
        console.error('❌ Failed to load issues:', error);
        this.error = 'Failed to load issues. Please make sure your backend is running on http://localhost:8000';
        this.loading = false;
        this.dataSource.data = [];
        
        this.showNotification('Failed to load issues', 'error');
      }
    });
  }

  // Refresh issues
  refreshIssues(): void {
    console.log('🔄 Refreshing issues');
    this.loadAllIssues();
  }

  // Get status styling classes
  getStatusClasses(status: string): string {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'closed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Get priority styling classes
  getPriorityClasses(priority: string): string {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Navigation methods
  viewIssue(issue: Issue): void {
    console.log('👀 Viewing issue:', issue.id);
    this.router.navigate(['/issues', issue.id]);
  }

  editIssue(issue: Issue): void {
    console.log('✏️ Editing issue:', issue.id);
    this.router.navigate(['/edit', issue.id]);
  }

  deleteIssue(issue: Issue): void {
    const confirmed = confirm(`Delete issue: "${issue.title}"?`);
    
    if (confirmed) {
      console.log('🗑️ Deleting issue:', issue.id);
      
      this.issueService.deleteIssue(issue.id).subscribe({
        next: () => {
          console.log('✅ Issue deleted successfully');
          this.showNotification('Issue deleted successfully!', 'success');
          this.loadAllIssues(); // Reload all issues
        },
        error: (error) => {
          console.error('❌ Failed to delete issue:', error);
          this.showNotification('Failed to delete issue', 'error');
        }
      });
    }
  }

  // Show notification
  showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // Test backend connection
  testConnection(): void {
    console.log('🔌 Testing backend connection...');
    this.issueService.healthCheck().subscribe({
      next: (response) => {
        console.log('✅ Backend connected:', response);
        this.showNotification('✅ Backend connection successful!', 'success');
      },
      error: (error) => {
        console.error('❌ Backend connection failed:', error);
        this.showNotification('❌ Backend connection failed', 'error');
      }
    });
  }
}
