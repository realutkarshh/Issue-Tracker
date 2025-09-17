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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { IssueService } from '../../services/issue.service';
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
    MatSnackBarModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  templateUrl: './issue-form.html'
  // ✅ No styleUrl needed - using Tailwind classes
})
export class IssueFormComponent implements OnInit {
  issueForm!: FormGroup;
  isEditMode = false;
  issueId: string | null = null;
  loading = false;
  saving = false;
  
  // Original issue data for comparison
  originalIssue: Issue | null = null;

  // Form options
  statusOptions = [
    { value: IssueStatus.OPEN, label: 'Open', icon: 'radio_button_unchecked', color: 'text-blue-600' },
    { value: IssueStatus.IN_PROGRESS, label: 'In Progress', icon: 'schedule', color: 'text-purple-600' },
    { value: IssueStatus.CLOSED, label: 'Closed', icon: 'check_circle', color: 'text-green-600' }
  ];

  priorityOptions = [
    { value: IssuePriority.LOW, label: 'Low', icon: 'keyboard_arrow_down', color: 'text-green-600' },
    { value: IssuePriority.MEDIUM, label: 'Medium', icon: 'remove', color: 'text-yellow-600' },
    { value: IssuePriority.HIGH, label: 'High', icon: 'keyboard_arrow_up', color: 'text-orange-600' },
    { value: IssuePriority.CRITICAL, label: 'Critical', icon: 'warning', color: 'text-red-600' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private issueService: IssueService,
    private snackBar: MatSnackBar
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.issueId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.issueId;

    console.log(`🎨 IssueForm initialized - Mode: ${this.isEditMode ? 'Edit' : 'Create'}`, 
                this.isEditMode ? `ID: ${this.issueId}` : '');

    if (this.isEditMode && this.issueId) {
      this.loadIssueForEdit(this.issueId);
    }
  }

  // Create the reactive form
  createForm(): void {
    this.issueForm = this.formBuilder.group({
      title: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200),
        this.noWhitespaceValidator
      ]],
      description: ['', [
        Validators.maxLength(1000)
      ]],
      status: [IssueStatus.OPEN, [Validators.required]],
      priority: [IssuePriority.MEDIUM, [Validators.required]],
      assignee: ['', [
        Validators.maxLength(100),
        this.emailValidator
      ]]
    });

    // Watch for form changes to show unsaved changes warning
    this.issueForm.valueChanges.subscribe(() => {
      this.checkFormChanges();
    });
  }

  // Custom validator: no whitespace only
  noWhitespaceValidator(control: any) {
    const isWhitespace = (control.value || '').toString().trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  // Custom validator: email format (optional)
  emailValidator(control: any) {
    if (!control.value) return null; // Optional field
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(control.value);
    return isValid ? null : { email: true };
  }

  // Load issue data for editing
  loadIssueForEdit(id: string): void {
    console.log('📡 Loading issue for edit:', id);
    this.loading = true;

    this.issueService.getIssueById(id).subscribe({
      next: (issue: Issue) => {
        console.log('✅ Issue loaded for editing:', issue);
        this.originalIssue = { ...issue };
        
        // Populate form with existing data
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
        console.error('❌ Failed to load issue:', error);
        this.showNotification('Failed to load issue data. Redirecting...', 'error');
        this.router.navigate(['/issues']);
        this.loading = false;
      }
    });
  }

  // Check if form has unsaved changes
  checkFormChanges(): void {
    if (!this.isEditMode || !this.originalIssue) return;

    const currentValues = this.issueForm.value;
    const hasChanges = 
      currentValues.title !== this.originalIssue.title ||
      (currentValues.description || '') !== (this.originalIssue.description || '') ||
      currentValues.status !== this.originalIssue.status ||
      currentValues.priority !== this.originalIssue.priority ||
      (currentValues.assignee || '') !== (this.originalIssue.assignee || '');

    // You could add a property to track this
    // this.hasUnsavedChanges = hasChanges;
  }

  // Form submission handler
  onSubmit(): void {
    if (this.issueForm.invalid) {
      console.log('❌ Form is invalid, marking all fields as touched');
      this.markFormGroupTouched();
      this.showNotification('Please fix the errors in the form', 'error');
      return;
    }

    this.saving = true;
    const formValue = this.issueForm.value;

    console.log('💾 Submitting form:', formValue);

    if (this.isEditMode && this.issueId) {
      this.updateIssue(formValue);
    } else {
      this.createIssue(formValue);
    }
  }

  // Create new issue
  createIssue(formValue: any): void {
    const createData: CreateIssueRequest = {
      title: formValue.title.trim(),
      description: formValue.description?.trim() || undefined,
      status: formValue.status,
      priority: formValue.priority,
      assignee: formValue.assignee?.trim() || undefined
    };

    console.log('➕ Creating new issue:', createData);

    this.issueService.createIssue(createData).subscribe({
      next: (newIssue: Issue) => {
        console.log('✅ Issue created successfully:', newIssue);
        this.showNotification('🎉 Issue created successfully!', 'success');
        this.router.navigate(['/issues', newIssue.id]);
      },
      error: (error) => {
        console.error('❌ Failed to create issue:', error);
        this.showNotification('Failed to create issue. Please try again.', 'error');
        this.saving = false;
      }
    });
  }

  // Update existing issue
  updateIssue(formValue: any): void {
    const updateData: UpdateIssueRequest = {
      title: formValue.title.trim(),
      description: formValue.description?.trim() || undefined,
      status: formValue.status,
      priority: formValue.priority,
      assignee: formValue.assignee?.trim() || undefined
    };

    console.log('📝 Updating issue:', this.issueId, updateData);

    this.issueService.updateIssue(this.issueId!, updateData).subscribe({
      next: (updatedIssue: Issue) => {
        console.log('✅ Issue updated successfully:', updatedIssue);
        this.showNotification('✨ Issue updated successfully!', 'success');
        this.router.navigate(['/issues', updatedIssue.id]);
      },
      error: (error) => {
        console.error('❌ Failed to update issue:', error);
        this.showNotification('Failed to update issue. Please try again.', 'error');
        this.saving = false;
      }
    });
  }

  // Mark all form fields as touched to show validation errors
  markFormGroupTouched(): void {
    Object.keys(this.issueForm.controls).forEach(key => {
      const control = this.issueForm.get(key);
      control?.markAsTouched();
    });
  }

  // Check if field has specific error
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
    if (field.hasError('whitespace')) {
      return `${this.getFieldLabel(fieldName)} cannot be empty or just whitespace`;
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return 'Invalid input';
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

  // Show notification
  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, '✕', {
      duration: type === 'error' ? 6000 : 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [
        type === 'success' ? 'snackbar-success' : 
        type === 'error' ? 'snackbar-error' : 'snackbar-info'
      ]
    });
  }

  // Cancel and go back
  cancel(): void {
    // Check for unsaved changes
    if (this.issueForm.dirty) {
      const confirmed = confirm(
        'You have unsaved changes. Are you sure you want to leave?\n\n' +
        'All changes will be lost.'
      );
      if (!confirmed) return;
    }

    console.log('❌ Form cancelled, navigating back');
    this.router.navigate(['/issues']);
  }

  // Reset form to initial values
  resetForm(): void {
    console.log('🔄 Resetting form');
    
    if (this.isEditMode && this.originalIssue) {
      // Reset to original issue data
      this.issueForm.patchValue({
        title: this.originalIssue.title,
        description: this.originalIssue.description || '',
        status: this.originalIssue.status,
        priority: this.originalIssue.priority,
        assignee: this.originalIssue.assignee || ''
      });
    } else {
      // Reset to default values
      this.issueForm.reset({
        title: '',
        description: '',
        status: IssueStatus.OPEN,
        priority: IssuePriority.MEDIUM,
        assignee: ''
      });
    }
    
    this.showNotification('Form has been reset', 'info');
  }

  // Get character count with styling classes
  getCharacterCountClass(fieldName: string, maxLength: number): string {
    const field = this.issueForm.get(fieldName);
    if (!field?.value) return 'text-gray-400';
    
    const length = field.value.length;
    const percentage = (length / maxLength) * 100;
    
    if (percentage >= 90) return 'text-red-500 font-semibold';
    if (percentage >= 75) return 'text-orange-500 font-medium';
    return 'text-gray-500';
  }

  // Preview description formatting
  previewDescription(): void {
    const description = this.issueForm.get('description')?.value;
    if (!description?.trim()) {
      this.showNotification('No description to preview', 'info');
      return;
    }
    
    // Simple preview - could be enhanced with markdown support
    alert(`Description Preview:\n\n${description}`);
  }

  // Quick fill for testing (development only)
  quickFillForTesting(): void {
    if (this.isEditMode) return;
    
    const sampleData = {
      title: 'Sample Issue - ' + new Date().toLocaleTimeString(),
      description: 'This is a sample issue created for testing purposes.\n\nIt includes:\n- Multiple lines\n- Bullet points\n- Proper formatting',
      status: IssueStatus.OPEN,
      priority: IssuePriority.HIGH,
      assignee: 'test@example.com'
    };
    
    this.issueForm.patchValue(sampleData);
    this.showNotification('🧪 Form filled with sample data', 'info');
  }


  getStatusDescription(status: string): string {
  const descriptions: { [key: string]: string } = {
    'open': 'Issue is new and needs attention',
    'in-progress': 'Currently being worked on',
    'resolved': 'Issue has been fixed',
    'closed': 'Issue is completed and verified'
  };
  return descriptions[status] || '';
}

getPriorityDescription(priority: string): string {
  const descriptions: { [key: string]: string } = {
    'low': 'Can be addressed later',
    'medium': 'Should be addressed soon',
    'high': 'Needs immediate attention',
    'critical': 'Urgent - requires immediate action'
  };
  return descriptions[priority] || '';
}



}


