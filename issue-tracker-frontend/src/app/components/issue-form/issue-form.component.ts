import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { IssueService } from '../../services/issue';
import { 
  Issue, 
  IssueStatus, 
  IssuePriority, 
  CreateIssueRequest, 
  UpdateIssueRequest 
} from '../../models/issue';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './issue-form.component.html',
  styleUrl: './issue-form.component.scss'
})
export class IssueFormComponent implements OnInit {
  issueForm!: FormGroup;
  isEditMode = false;
  issueId: string | null = null;
  loading = false;
  saving = false;

  // Form options (like dropdown options in React)
  statusOptions = Object.values(IssueStatus);
  priorityOptions = Object.values(IssuePriority);

  constructor(
    private formBuilder: FormBuilder,    // For building reactive forms
    private route: ActivatedRoute,       // For reading route parameters
    private router: Router,              // For navigation
    private issueService: IssueService,  // For API calls
    private snackBar: MatSnackBar       // For showing notifications
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // Check if we're in edit mode (like checking URL params in React)
    this.issueId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.issueId;

    if (this.isEditMode && this.issueId) {
      this.loadIssueForEdit(this.issueId);
    }
  }

  // Create the reactive form (like setting up form state in React)
  createForm(): void {
    this.issueForm = this.formBuilder.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200)
      ]],
      description: ['', [
        Validators.maxLength(1000)
      ]],
      status: [IssueStatus.OPEN, [Validators.required]],
      priority: [IssuePriority.MEDIUM, [Validators.required]],
      assignee: ['', [
        Validators.maxLength(100)
      ]]
    });
  }

  // Load issue data for editing
  loadIssueForEdit(id: string): void {
    this.loading = true;

    this.issueService.getIssueById(id).subscribe({
      next: (issue: Issue) => {
        // Populate form with existing data (like setting initial values in React)
        this.issueForm.patchValue({
          title: issue.title,
          description: issue.description || '',
          status: issue.status,
          priority: issue.priority,
          assignee: issue.assignee || ''
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load issue:', error);
        this.showNotification('Failed to load issue data');
        this.router.navigate(['/issues']);
        this.loading = false;
      }
    });
  }

  // Form submission handler (like onSubmit in React)
  onSubmit(): void {
    if (this.issueForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    const formValue = this.issueForm.value;

    if (this.isEditMode && this.issueId) {
      // Update existing issue
      const updateData: UpdateIssueRequest = {
        title: formValue.title,
        description: formValue.description || undefined,
        status: formValue.status,
        priority: formValue.priority,
        assignee: formValue.assignee || undefined
      };

      this.issueService.updateIssue(this.issueId, updateData).subscribe({
        next: (updatedIssue: Issue) => {
          this.showNotification('Issue updated successfully!');
          this.router.navigate(['/issues', updatedIssue.id]);
          this.saving = false;
        },
        error: (error) => {
          console.error('Failed to update issue:', error);
          this.showNotification('Failed to update issue. Please try again.');
          this.saving = false;
        }
      });
    } else {
      // Create new issue
      const createData: CreateIssueRequest = {
        title: formValue.title,
        description: formValue.description || undefined,
        status: formValue.status,
        priority: formValue.priority,
        assignee: formValue.assignee || undefined
      };

      this.issueService.createIssue(createData).subscribe({
        next: (newIssue: Issue) => {
          this.showNotification('Issue created successfully!');
          this.router.navigate(['/issues', newIssue.id]);
          this.saving = false;
        },
        error: (error) => {
          console.error('Failed to create issue:', error);
          this.showNotification('Failed to create issue. Please try again.');
          this.saving = false;
        }
      });
    }
  }

  // Mark all fields as touched to show validation errors
  markFormGroupTouched(): void {
    Object.keys(this.issueForm.controls).forEach(key => {
      const control = this.issueForm.get(key);
      control?.markAsTouched();
    });
  }

  // Check if field has error (helper for template)
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.issueForm.get(fieldName);
    return field ? field.hasError(errorType) && field.touched : false;
  }

  // Get error message for field
  getErrorMessage(fieldName: string): string {
    const field = this.issueForm.get(fieldName);
    if (!field || !field.touched) return '';

    if (field.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `${this.getFieldLabel(fieldName)} cannot exceed ${maxLength} characters`;
    }
    return '';
  }

  // Get field label for error messages
  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      description: 'Description',
      status: 'Status',
      priority: 'Priority',
      assignee: 'Assignee'
    };
    return labels[fieldName] || fieldName;
  }

  // Show notification (like toast in React)
  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  // Cancel and go back
  cancel(): void {
    this.router.navigate(['/issues']);
  }

  // Reset form to initial values
  resetForm(): void {
    if (this.isEditMode && this.issueId) {
      this.loadIssueForEdit(this.issueId);
    } else {
      this.issueForm.reset({
        status: IssueStatus.OPEN,
        priority: IssuePriority.MEDIUM
      });
    }
  }

  // Add this method for debug info (you can remove this in production)
getFormErrors(): any {
  const errors: any = {};
  Object.keys(this.issueForm.controls).forEach(key => {
    const control = this.issueForm.get(key);
    if (control && control.errors && control.touched) {
      errors[key] = control.errors;
    }
  });
  return errors;
}

}
