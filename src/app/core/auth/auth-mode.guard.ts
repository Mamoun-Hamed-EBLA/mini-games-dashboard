import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export type AuthMode = 'any' | 'token' | 'apiKey';

export const authModeGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const mode = (route.data && (route.data['authMode'] as AuthMode)) || 'any';

  if (mode === 'any' && auth.isAnyAuthenticated()) return true;
  if (mode === 'token' && auth.isAuthenticated()) return true;
  if (mode === 'apiKey' && auth.isApiKeyAuthenticated()) return true;

  // Redirect appropriately
  if (mode === 'token') {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  if (mode === 'apiKey') {
    return router.createUrlTree(['/apikey-login'], { queryParams: { returnUrl: state.url } });
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
