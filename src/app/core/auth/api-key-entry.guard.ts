import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ShortcutService } from '../services/shortcut.service';

export const apiKeyEntryGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const shortcuts = inject(ShortcutService);

  if (auth.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }
  if (auth.isApiKeyAuthenticated()) {
    return router.createUrlTree(['/subscriptions']);
  }

  const allowed = shortcuts.consumeApiKeyRouteRequested();
  if (allowed) return true;

  return router.createUrlTree(['/login']);
};
