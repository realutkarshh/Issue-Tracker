import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material imports for header
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';  // ✅ ADD THIS

import { IssueService } from './services/issue.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatMenuModule  
  ],
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
  title = 'IssueFlow';

  constructor(private issueService: IssueService) {}

  ngOnInit(): void {
    // console.log('Issue Tracker Application Started');
    this.testBackendConnection();
  }

  private testBackendConnection(): void {
    this.issueService.healthCheck().subscribe({
      next: (response) => {
        // console.log('Backend connected successfully:', response);
      },
      error: (error) => {
        console.warn('⚠️ Backend not available:', error);
        console.log('💡 Make sure your FastAPI server is running on http://localhost:8000');
      }
    });
  }
}
