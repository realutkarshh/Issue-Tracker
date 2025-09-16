import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default route - redirect to issues list
  { 
    path: '', 
    redirectTo: '/issues', 
    pathMatch: 'full' 
  },
  
  // Issues list page
  { 
    path: 'issues', 
    loadComponent: () => import('./components/issue-list/issue-list.component').then(c => c.IssueListComponent),
    title: 'Issues - Issue Tracker'
  },
  
  // Create new issue
  { 
    path: 'create', 
    loadComponent: () => import('./components/issue-form/issue-form.component').then(c => c.IssueFormComponent),
    title: 'Create Issue - Issue Tracker'
  },
  
  // Edit existing issue
  { 
    path: 'edit/:id', 
    loadComponent: () => import('./components/issue-form/issue-form.component').then(c => c.IssueFormComponent),
    title: 'Edit Issue - Issue Tracker'
  },
  
  // View issue details (with route parameter)
  { 
    path: 'issues/:id', 
    loadComponent: () => import('./components/issue-detail/issue-detail.component').then(c => c.IssueDetailComponent),
    title: 'Issue Details - Issue Tracker'
  },
  
  // Wildcard route - 404 page
  { 
    path: '**', 
    redirectTo: '/issues' 
  }
];
