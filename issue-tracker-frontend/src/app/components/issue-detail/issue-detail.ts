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
  // ✅ No styleUrl needed - using Tailwind classes
})
export class IssueDetailComponent implements OnInit {
  issue: Issue | null = null;
  loading = false;
  error: string | null = null;
  issueId: string | null = null;
  
  // For better UX
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
        this.showNotification('Failed to load issue details');
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
      `⚠️ Delete Issue Confirmation\n\n` +
      `Title: "${this.issue.title}"\n` +
      `ID: ${this.issue.id}\n\n` +
      `This action cannot be undone. Are you sure you want to delete this issue?`
    );
    
    if (confirmed) {
      console.log('🗑️ Deleting issue:', this.issue.id);
      this.deleting = true;
      
      this.issueService.deleteIssue(this.issue.id).subscribe({
        next: () => {
          console.log('✅ Issue deleted successfully');
          this.showNotification(`Issue "${this.issue!.title}" has been deleted successfully!`);
          this.router.navigate(['/issues']);
        },
        error: (error) => {
          console.error('❌ Failed to delete issue:', error);
          this.deleting = false;
          this.showNotification('Failed to delete issue. Please try again.');
        }
      });
    }
  }

  // Get status color for Tailwind classes
  getStatusClasses(status: string): string {
    switch (status) {
      case IssueStatus.OPEN: 
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case IssueStatus.IN_PROGRESS: 
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case IssueStatus.CLOSED: 
        return 'bg-green-100 text-green-800 border-green-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Get priority color for Tailwind classes
  getPriorityClasses(priority: string): string {
    switch (priority) {
      case IssuePriority.LOW: 
        return 'bg-green-100 text-green-800 border-green-200';
      case IssuePriority.MEDIUM: 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case IssuePriority.HIGH: 
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case IssuePriority.CRITICAL: 
        return 'bg-red-100 text-red-800 border-red-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  // Get status icon
  getStatusIcon(status: string): string {
    switch (status) {
      case IssueStatus.OPEN: return 'radio_button_unchecked';
      case IssueStatus.IN_PROGRESS: return 'schedule';
      case IssueStatus.CLOSED: return 'check_circle';
      default: return 'help';
    }
  }

  // Get priority icon
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case IssuePriority.LOW: return 'keyboard_arrow_down';
      case IssuePriority.MEDIUM: return 'remove';
      case IssuePriority.HIGH: return 'keyboard_arrow_up';
      case IssuePriority.CRITICAL: return 'warning';
      default: return 'help';
    }
  }

  // Format date for display
  formatDate(date: Date | string): string {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  // Get relative time (e.g., "2 hours ago")
  getRelativeTime(date: Date | string): string {
    try {
      const now = new Date();
      const then = new Date(date);
      const diffMs = now.getTime() - then.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      return this.formatDate(date);
    } catch (error) {
      return this.formatDate(date);
    }
  }

  // Get formatted JSON for display
  getFormattedJson(): string {
    if (!this.issue) return '';
    
    // Create a clean version for JSON display
    const jsonData = {
      id: this.issue.id,
      title: this.issue.title,
      description: this.issue.description,
      status: this.issue.status,
      priority: this.issue.priority,
      assignee: this.issue.assignee,
      created_at: this.issue.created_at,
      updated_at: this.issue.updated_at
    };
    
    return JSON.stringify(jsonData, null, 2);
  }

  // Copy JSON to clipboard
  copyJsonToClipboard(): void {
    if (!this.issue) return;

    const jsonString = this.getFormattedJson();
    navigator.clipboard.writeText(jsonString).then(() => {
      this.showNotification('📋 JSON data copied to clipboard!');
    }).catch(() => {
      this.showNotification('Failed to copy to clipboard');
    });
  }

  // Show notification
  showNotification(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  // Get user-friendly error message
  getErrorMessage(error: any): string {
    if (error?.status === 0) {
      return 'Unable to connect to the server. Please make sure the backend is running.';
    } else if (error?.status === 404) {
      return 'Issue not found. It may have been deleted or the ID is incorrect.';
    } else if (error?.status >= 500) {
      return 'Server error occurred. Please try again later.';
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

  // Share issue (simple URL copy)
  shareIssue(): void {
    if (!this.issue) return;

    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.showNotification('🔗 Issue URL copied to clipboard!');
    }).catch(() => {
      this.showNotification('Failed to copy URL');
    });
  }
}
