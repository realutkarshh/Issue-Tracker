import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material imports for header
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IssueService } from './services/issue';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Issue Tracker';

  constructor(private issueService: IssueService) {}

  ngOnInit(): void {
    // Test API connection on app startup
    this.issueService.healthCheck().subscribe({
      next: (response) => {
        console.log('✅ Backend connected:', response);
      },
      error: (error) => {
        console.log('❌ Backend not available:', error);
        console.log('Make sure FastAPI server is running on http://localhost:8000');
      }
    });
  }
}
