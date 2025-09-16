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

import { IssueService } from '../../services/issue';
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
    MatDividerModule
  ],
  templateUrl: './issue-detail.component.html',
  styleUrl: './issue-detail.component.scss'
})
export class IssueDetailComponent implements OnInit {
  issue: Issue | null = null;
  loading = false;
  error: string | null = null;
  issueId: string | null = null;

  constructor(
    private route: ActivatedRoute,        // For reading route parameters
    private router: Router,               // For navigation
    private issueService: IssueService    // For API calls
  ) {}

  ngOnInit(): void {
    // Get issue ID from route parameters (like useParams in React)
    this.issueId = this.route.snapshot.paramMap.get('id');
    
    if (this.issueId) {
      this.loadIssue(this.issueId);
    } else {
      this.error = 'Issue ID not provided';
    }
  }

  // Load issue details from API
  loadIssue(id: string): void {
    this.loading = true;
    this.error = null;

    this.issueService.getIssueById(id).subscribe({
      next: (issue: Issue) => {
        this.issue = issue;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load issue:', error);
        this.error = 'Failed to load issue details. Please try again.';
        this.loading = false;
      }
    });
  }

  // Navigate back to issues list
  goBack(): void {
    this.router.navigate(['/issues']);
  }

  // Navigate to edit form
  editIssue(): void {
    if (this.issue) {
      this.router.navigate(['/edit', this.issue.id]);
    }
  }

  // Delete issue with confirmation
  deleteIssue(): void {
    if (!this.issue) return;

    const confirmed = confirm(`Are you sure you want to delete issue "${this.issue.title}"?`);
    
    if (confirmed) {
      this.issueService.deleteIssue(this.issue.id).subscribe({
        next: () => {
          console.log('Issue deleted successfully');
          this.router.navigate(['/issues']);
        },
        error: (error) => {
          console.error('Failed to delete issue:', error);
          alert('Failed to delete issue. Please try again.');
        }
      });
    }
  }

  // Get status chip color (similar to Issue List)
  getStatusColor(status: string): string {
    switch (status) {
      case IssueStatus.OPEN: return 'primary';
      case IssueStatus.IN_PROGRESS: return 'accent';
      case IssueStatus.CLOSED: return 'warn';
      default: return '';
    }
  }

  // Get priority chip color (similar to Issue List)
  getPriorityColor(priority: string): string {
    switch (priority) {
      case IssuePriority.LOW: return 'primary';
      case IssuePriority.MEDIUM: return 'accent';
      case IssuePriority.HIGH: return 'warn';
      case IssuePriority.CRITICAL: return 'warn';
      default: return '';
    }
  }

  // Format date for display
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Get JSON representation for display
  getIssueJson(): string {
    return this.issue ? JSON.stringify(this.issue, null, 2) : '';
  }
}
