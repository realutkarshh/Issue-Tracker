import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IssueService } from '../../services/issue.service';
import { Issue, IssueStatus, IssuePriority } from '../../models/issue';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './issue-detail.html'
})
export class IssueDetailComponent implements OnInit {
  issue: Issue | null = null;
  loading = false;
  error: string | null = null;
  issueId: string | null = null;
  deleting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Get issue ID from route parameters
    this.issueId = this.route.snapshot.paramMap.get('id');
    console.log('📄 Issue Detail component loaded for ID:', this.issueId);
    
    if (this.issueId) {
      this.loadIssue(this.issueId);
    } else {
      this.error = 'Issue ID not provided in the URL';
      console.error('❌ No issue ID provided');
    }
  }

  // Load issue details from API
  loadIssue(id: string): void {
    console.log('📡 Loading issue details for ID:', id);
    this.loading = true;
    this.error = null;

    this.issueService.getIssueById(id).subscribe({
      next: (issue: Issue) => {
        console.log('✅ Issue loaded successfully:', issue);
        this.issue = issue;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Failed to load issue:', error);
        this.error = this.getErrorMessage(error);
        this.loading = false;
        this.showNotification('Failed to load issue details', 'error');
      }
    });
  }

  // Navigate back to issues list
  goBack(): void {
    console.log('⬅️ Navigating back to issues list');
    this.router.navigate(['/issues']);
  }

  // Navigate to edit form
  editIssue(): void {
    if (this.issue) {
      console.log('✏️ Navigating to edit form for issue:', this.issue.id);
      this.router.navigate(['/edit', this.issue.id]);
    }
  }

  // Delete issue with confirmation
  deleteIssue(): void {
    if (!this.issue) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${this.issue.title}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmed) {
      console.log('🗑️ Deleting issue:', this.issue.id);
      this.deleting = true;
      
      this.issueService.deleteIssue(this.issue.id).subscribe({
        next: () => {
          console.log('✅ Issue deleted successfully');
          this.showNotification(`Issue "${this.issue!.title}" deleted successfully!`, 'success');
          this.router.navigate(['/issues']);
        },
        error: (error) => {
          console.error('❌ Failed to delete issue:', error);
          this.deleting = false;
          this.showNotification('Failed to delete issue. Please try again.', 'error');
        }
      });
    }
  }

  // Modern status classes matching the issue list design
  getStatusClasses(status: string): string {
    const statusMap: { [key: string]: string } = {
      'open': 'bg-orange-100 text-orange-800 border border-orange-200',
      'in-progress': 'bg-blue-100 text-blue-800 border border-blue-200', 
      'resolved': 'bg-green-100 text-green-800 border border-green-200',
      'closed': 'bg-slate-100 text-slate-600 border border-slate-200'
    };
    return statusMap[status?.toLowerCase()] || 'bg-slate-100 text-slate-600 border border-slate-200';
  }

  // Modern priority classes matching the issue list design
  getPriorityClasses(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'high': 'bg-red-100 text-red-800 border border-red-200',
      'critical': 'bg-red-100 text-red-800 border border-red-200',
      'medium': 'bg-orange-100 text-orange-800 border border-orange-200',
      'low': 'bg-slate-100 text-slate-600 border border-slate-200'
    };
    return priorityMap[priority?.toLowerCase()] || 'bg-slate-100 text-slate-600 border border-slate-200';
  }

  // Get status icon (simplified for modern UI)
  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'open': 'radio_button_unchecked',
      'in-progress': 'schedule',
      'resolved': 'check_circle',
      'closed': 'check_circle_outline'
    };
    return iconMap[status?.toLowerCase()] || 'help';
  }

  // Get priority icon (simplified for modern UI)
  getPriorityIcon(priority: string): string {
    const iconMap: { [key: string]: string } = {
      'low': 'keyboard_arrow_down',
      'medium': 'remove',
      'high': 'keyboard_arrow_up',
      'critical': 'warning'
    };
    return iconMap[priority?.toLowerCase()] || 'help';
  }

  // Format date for display (cleaner format)
  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    
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

  // Get relative time (e.g., "2 hours ago") - more concise
  getRelativeTime(date: Date | string): string {
    if (!date) return '';
    
    try {
      const now = new Date();
      const targetDate = new Date(date);
      const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      
      return this.formatDate(date);
    } catch (error) {
      return this.formatDate(date);
    }
  }

  // Get formatted JSON for display (cleaner structure)
  getFormattedJson(): string {
    if (!this.issue) return '';
    
    // Create a clean version matching your backend structure
    const jsonData = {
      id: this.issue.id,
      title: this.issue.title,
      description: this.issue.description || null,
      status: this.issue.status,
      priority: this.issue.priority,
      assignee: this.issue.assignee || null,
      createdAt: this.issue.created_at,
      updatedAt: this.issue.updated_at
    };
    
    return JSON.stringify(jsonData, null, 2);
  }

  // Copy JSON to clipboard
  copyJsonToClipboard(): void {
    if (!this.issue) return;

    const jsonString = this.getFormattedJson();
    navigator.clipboard.writeText(jsonString).then(() => {
      this.showNotification('JSON copied to clipboard!', 'success');
    }).catch((error) => {
      console.error('Clipboard error:', error);
      this.showNotification('Failed to copy to clipboard', 'error');
    });
  }

  // Share issue URL
  shareIssue(): void {
    if (!this.issue) return;

    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.showNotification('Issue URL copied to clipboard!', 'success');
    }).catch((error) => {
      console.error('Clipboard error:', error);
      this.showNotification('Failed to copy URL', 'error');
    });
  }

  // Show notification with consistent styling
  showNotification(message: string, type: 'success' | 'error' = 'success', duration: number = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  // Get user-friendly error message
  getErrorMessage(error: any): string {
    if (error?.status === 0) {
      return 'Unable to connect to the server. Please check if the backend is running on http://localhost:8000';
    } else if (error?.status === 404) {
      return 'Issue not found. It may have been deleted or the ID is incorrect.';
    } else if (error?.status >= 500) {
      return 'Server error occurred. Please try again later.';
    } else if (error?.error?.message) {
      return error.error.message;
    } else if (error?.message) {
      return error.message;
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }

  // Retry loading
  retryLoad(): void {
    if (this.issueId) {
      console.log('🔄 Retrying to load issue:', this.issueId);
      this.loadIssue(this.issueId);
    }
  }
}
