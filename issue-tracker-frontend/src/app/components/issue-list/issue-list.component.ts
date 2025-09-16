import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// Angular Material Imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// Our services and models
import { IssueService } from '../../services/issue';
import { Issue, IssueStatus, IssuePriority, IssueQueryParams } from '../../models/issue';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatRippleModule,
    MatSnackBarModule
  ],
  templateUrl: './issue-list.component.html',
  styleUrl: './issue-list.component.scss'
})
export class IssueListComponent implements OnInit, AfterViewInit {
  // Table configuration
  displayedColumns: string[] = ['id', 'title', 'status', 'priority', 'assignee', 'updated_at', 'actions'];
  dataSource = new MatTableDataSource<Issue>([]);
  
  // ViewChild references for pagination and sorting
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Component state
  loading = false;
  error: string | null = null;

  // Filter states
  searchTerm = '';
  selectedStatus = '';
  selectedPriority = '';
  selectedAssignee = '';

  // Options for dropdowns
  statusOptions = Object.values(IssueStatus);
  priorityOptions = Object.values(IssuePriority);
  assigneeOptions: string[] = [];

  // Pagination settings
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalItems = 0;

  constructor(
    private issueService: IssueService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    console.log('🔧 IssueListComponent constructor called');
  }

  ngOnInit(): void {
    console.log('🚀 IssueListComponent initialized');
    this.loadIssues();
  }

  ngAfterViewInit(): void {
    console.log('🔧 Setting up paginator and sort');
    
    // Connect paginator and sort to data source
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom filter predicate for search
    this.dataSource.filterPredicate = (data: Issue, filter: string) => {
      const searchData = `${data.title} ${data.description || ''} ${data.status} ${data.priority} ${data.assignee || ''}`.toLowerCase();
      return searchData.includes(filter.toLowerCase());
    };

    // Force change detection
    this.cdr.detectChanges();
  }

  // Load issues from the API
  loadIssues(): void {
    console.log('📡 Loading issues from API...');
    this.loading = true;
    this.error = null;

    // Build query parameters
    const params: IssueQueryParams = {
      search: this.searchTerm?.trim() || undefined,
      status: this.selectedStatus as IssueStatus || undefined,
      priority: this.selectedPriority as IssuePriority || undefined,
      assignee: this.selectedAssignee?.trim() || undefined,
      page: 1,
      page_size: 100, // Load more items for client-side pagination
      sort_by: 'updated_at',
      sort_order: 'desc'
    };

    console.log('📋 Query params:', params);

    this.issueService.getIssues(params).subscribe({
      next: (issues: Issue[]) => {
        console.log('✅ Issues loaded successfully:', issues);
        console.log(`📊 Total issues: ${issues.length}`);
        
        // Update data source
        this.dataSource.data = issues;
        this.totalItems = issues.length;
        
        // Extract unique assignees for filter dropdown
        this.extractAssigneeOptions(issues);
        
        // Update loading state
        this.loading = false;
        this.error = null;
        
        // Force change detection
        this.cdr.detectChanges();
        
        // Show success message if no issues
        if (issues.length === 0) {
          console.log('📝 No issues found');
        }
        
        console.log('🔍 DataSource data:', this.dataSource.data);
      },
      error: (error) => {
        console.error('❌ Failed to load issues:', error);
        this.error = this.getErrorMessage(error);
        this.loading = false;
        this.dataSource.data = [];
        this.cdr.detectChanges();
        
        // Show error notification
        this.showNotification('Failed to load issues. Please try again.');
      }
    });
  }

  // Extract unique assignees for filter dropdown
  extractAssigneeOptions(issues: Issue[]): void {
    const assignees = issues
      .map(issue => issue.assignee)
      .filter((assignee): assignee is string => !!assignee && assignee.trim() !== '');
    
    this.assigneeOptions = [...new Set(assignees)].sort();
    console.log('👥 Unique assignees:', this.assigneeOptions);
  }

  // Apply search filter
  applySearchFilter(): void {
    console.log('🔍 Applying search filter:', this.searchTerm);
    this.dataSource.filter = this.searchTerm.trim();
    
    // Reset to first page when filtering
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Apply dropdown filters by reloading data
  applyFilters(): void {
    console.log('🎯 Applying filters - Status:', this.selectedStatus, 'Priority:', this.selectedPriority, 'Assignee:', this.selectedAssignee);
    this.loadIssues();
  }

  // Clear all filters
  clearFilters(): void {
    console.log('🧹 Clearing all filters');
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPriority = '';
    this.selectedAssignee = '';
    this.dataSource.filter = '';
    this.loadIssues();
  }

  // Get status chip color
  getStatusColor(status: string): string {
    switch (status) {
      case IssueStatus.OPEN: return 'primary';
      case IssueStatus.IN_PROGRESS: return 'accent';
      case IssueStatus.CLOSED: return 'warn';
      default: return 'primary';
    }
  }

  // Get priority chip color
  getPriorityColor(priority: string): string {
    switch (priority) {
      case IssuePriority.LOW: return 'primary';
      case IssuePriority.MEDIUM: return 'accent';
      case IssuePriority.HIGH: return 'warn';
      case IssuePriority.CRITICAL: return 'warn';
      default: return 'primary';
    }
  }

  // Format date for display
  formatDate(date: Date | string): string {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  // Navigate to issue detail
  viewIssue(issue: Issue): void {
    console.log('👀 Viewing issue:', issue.id);
    this.router.navigate(['/issues', issue.id]);
  }

  // Navigate to edit form
  editIssue(event: Event, issue: Issue): void {
    event.stopPropagation();
    console.log('✏️ Editing issue:', issue.id);
    this.router.navigate(['/edit', issue.id]);
  }

  // Delete issue with confirmation
  deleteIssue(event: Event, issue: Issue): void {
    event.stopPropagation();
    
    const confirmed = confirm(`Are you sure you want to delete issue "${issue.title}"?\n\nThis action cannot be undone.`);
    
    if (confirmed) {
      console.log('🗑️ Deleting issue:', issue.id);
      
      this.issueService.deleteIssue(issue.id).subscribe({
        next: () => {
          console.log('✅ Issue deleted successfully');
          this.showNotification(`Issue "${issue.title}" has been deleted successfully.`);
          this.loadIssues(); // Reload the list
        },
        error: (error) => {
          console.error('❌ Failed to delete issue:', error);
          this.showNotification('Failed to delete issue. Please try again.');
        }
      });
    }
  }

  // Show notification message
  showNotification(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  // Get user-friendly error message
  getErrorMessage(error: any): string {
    if (error?.status === 0) {
      return 'Unable to connect to the server. Please make sure the backend is running on http://localhost:8000';
    } else if (error?.status === 404) {
      return 'API endpoint not found. Please check your backend configuration.';
    } else if (error?.status >= 500) {
      return 'Server error occurred. Please try again later.';
    } else if (error?.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }

  // Retry loading issues
  retryLoading(): void {
    console.log('🔄 Retrying to load issues...');
    this.loadIssues();
  }

  // Debug method to inspect data source
  debugDataSource(): void {
    console.log('=== 🐛 DEBUG INFO ===');
    console.log('dataSource.data:', this.dataSource.data);
    console.log('dataSource.filteredData:', this.dataSource.filteredData);
    console.log('dataSource.filter:', this.dataSource.filter);
    console.log('loading:', this.loading);
    console.log('error:', this.error);
    console.log('totalItems:', this.totalItems);
    console.log('displayedColumns:', this.displayedColumns);
    console.log('statusOptions:', this.statusOptions);
    console.log('priorityOptions:', this.priorityOptions);
    console.log('assigneeOptions:', this.assigneeOptions);
    console.log('======================');
  }

  // Test API connection
  testConnection(): void {
    console.log('🔌 Testing API connection...');
    this.issueService.healthCheck().subscribe({
      next: (response) => {
        console.log('✅ API connection successful:', response);
        this.showNotification('✅ API connection successful!');
      },
      error: (error) => {
        console.error('❌ API connection failed:', error);
        this.showNotification('❌ API connection failed. Check console for details.');
      }
    });
  }
}
