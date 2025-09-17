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
  displayedColumns: string[] = ['id','title', 'status', 'priority', 'assignee','updatedAt', 'actions'];
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

 getStatusClasses(status: string): string {
  const statusMap: { [key: string]: string } = {
    'open': 'bg-orange-100 text-orange-800 border border-orange-200',
    'in-progress': 'bg-blue-100 text-blue-800 border border-blue-200', 
    'resolved': 'bg-green-100 text-green-800 border border-green-200',
    'closed': 'bg-slate-100 text-slate-600 border border-slate-200'
  };
  return statusMap[status?.toLowerCase()] || 'bg-slate-100 text-slate-600 border border-slate-200';
}

getPriorityClasses(priority: string): string {
  const priorityMap: { [key: string]: string } = {
    'high': 'bg-red-100 text-red-800 border border-red-200',
    'medium': 'bg-orange-100 text-orange-800 border border-orange-200',
    'low': 'bg-slate-100 text-slate-600 border border-slate-200'
  };
  return priorityMap[priority?.toLowerCase()] || 'bg-slate-100 text-slate-600 border border-slate-200';
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
