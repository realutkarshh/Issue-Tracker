import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

// Angular Material Imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule
  ],
  templateUrl: './issue-list.html'
})
export class IssueListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = ['id', 'title', 'status', 'priority', 'assignee', 'updatedAt', 'actions'];
  dataSource = new MatTableDataSource<Issue>([]);

  // Component state
  loading = false;
  error: string | null = null;
  issues: Issue[] = [];
  
  // Filter controls
  searchControl = new FormControl('');
  statusFilter = new FormControl('');
  priorityFilter = new FormControl('');
  assigneeFilter = new FormControl('');

  // Filter options
  statusOptions: string[] = ['open', 'in-progress', 'resolved', 'closed'];
  priorityOptions: string[] = ['low', 'medium', 'high'];
  assigneeOptions: string[] = [];

  // Pagination settings
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  totalIssues = 0;

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
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom filter predicate
    this.dataSource.filterPredicate = this.createFilter();
  }

  // Setup reactive filters
  setupFilters(): void {
    // Search filter
    this.searchControl.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Status filter
    this.statusFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Priority filter
    this.priorityFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });

    // Assignee filter
    this.assigneeFilter.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  // Load ALL issues from MongoDB
  loadAllIssues(): void {
    console.log('📡 Loading ALL issues from MongoDB...');
    this.loading = true;
    this.error = null;

    this.issueService.getIssues().subscribe({
      next: (issues: Issue[]) => {
        console.log('✅ Issues loaded successfully:', issues);
        
        this.issues = issues;
        this.dataSource.data = issues;
        this.totalIssues = issues.length;
        
        // Extract unique assignees for filter
        this.extractAssigneeOptions();
        
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

  // Extract unique assignees from issues
// Extract unique assignees from issues
extractAssigneeOptions(): void {
  const assignees = this.issues
    .map(issue => issue.assignee)
    .filter((assignee): assignee is string => assignee !== null && assignee !== undefined);
  
  this.assigneeOptions = Array.from(new Set(assignees));
}

  // Create custom filter predicate
  createFilter(): (data: Issue, filter: string) => boolean {
    return (data: Issue, filter: string): boolean => {
      const filterObj = JSON.parse(filter);
      
      // Search filter
      if (filterObj.search) {
        const searchText = filterObj.search.toLowerCase();
        const searchMatch = 
          data.id.toLowerCase().includes(searchText) ||
          data.title.toLowerCase().includes(searchText) ||
          data.description?.toLowerCase().includes(searchText) ||
          (data.assignee && data.assignee.toLowerCase().includes(searchText));
        
        if (!searchMatch) return false;
      }

      // Status filter
      if (filterObj.status && data.status !== filterObj.status) {
        return false;
      }

      // Priority filter
      if (filterObj.priority && data.priority !== filterObj.priority) {
        return false;
      }

      // Assignee filter
      if (filterObj.assignee) {
        if (filterObj.assignee === 'unassigned' && data.assignee) {
          return false;
        }
        if (filterObj.assignee !== 'unassigned' && data.assignee !== filterObj.assignee) {
          return false;
        }
      }

      return true;
    };
  }

  // Apply all filters
  applyFilters(): void {
    const filterValue = {
      search: this.searchControl.value || '',
      status: this.statusFilter.value || '',
      priority: this.priorityFilter.value || '',
      assignee: this.assigneeFilter.value || ''
    };

    this.dataSource.filter = JSON.stringify(filterValue);

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Clear all filters
  clearFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter.setValue('');
    this.priorityFilter.setValue('');
    this.assigneeFilter.setValue('');
    
    this.dataSource.filter = '';
  }

  // Check if any filters are active
  hasActiveFilters(): boolean {
    return !!(
      this.searchControl.value ||
      this.statusFilter.value ||
      this.priorityFilter.value ||
      this.assigneeFilter.value
    );
  }

  // Get filtered results count
  getFilteredCount(): number {
    return this.dataSource.filteredData.length;
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

  createIssue(): void {
    console.log('➕ Creating new issue');
    this.router.navigate(['/create']);
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
          this.loadAllIssues();
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

  // Truncate ID for display
truncateId(id: string): string {
  if (!id || id.length <= 8) return id;
  return id.slice(0, 4) + '....' + id.slice(-2);
}

}
