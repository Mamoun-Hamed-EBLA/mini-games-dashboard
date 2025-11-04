import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function shouldPrefix(url: string): boolean {
  if (isAbsoluteUrl(url)) return false;
  const u = url.replace(/^\//, '');
  if (u.startsWith('assets/') || u.startsWith('public/')) return false;
  return true;
}

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  let url = req.url;
  if (shouldPrefix(url)) {
    const base = environment.apiBaseUrl.replace(/\/$/, '');
    const path = url.replace(/^\//, '');
    url = `${base}/${path}`;
  }

  const headers: Record<string, string> = {
    'X-Api-Key': environment.apiKey,
    'X-Tenant-Id': auth.getTenantId() || environment.defaultTenantId,
  };

  const cloned = req.clone({ url, setHeaders: headers });
  return next(cloned);
};
