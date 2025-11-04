import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';
import { GlobalErrorHandler } from './core/error/global-error-handler';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loaderInterceptor, apiInterceptor, authInterceptor])),
    provideAnimations(),
    importProvidersFrom(MatSnackBarModule, MatNativeDateModule),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ]
};
