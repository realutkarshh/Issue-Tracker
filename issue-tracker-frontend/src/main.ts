import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';  // Correct path!
import { appConfig } from './app/app.config';        // Import config

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
