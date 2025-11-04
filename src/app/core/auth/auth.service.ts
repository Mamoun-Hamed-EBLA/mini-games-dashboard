import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { LoginData } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly rolesKey = 'auth_roles';
  private readonly tenantKey = 'auth_tenant';

  constructor(private router: Router, private http: HttpClient) {}

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRoles(): string[] {
    try {
      return JSON.parse(localStorage.getItem(this.rolesKey) || '[]');
    } catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  getTenantId(): string | null {
    return localStorage.getItem(this.tenantKey);
  }

  private decodeJwtPayload(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
      } catch {
        return null;
      }
    }
  }

  login(username: string, password: string): Observable<boolean> {
    const body = { emailOrUsername: username, password };
    return this.http
      .post<ApiResponse<LoginData>>('Auth/admin/login', body)
      .pipe(
        map((resp) => {
          if (!resp?.success || !resp.data?.isSuccess || !resp.data.token) {
            const msg = resp?.data?.errorMessage || resp?.message || 'Login failed';
            throw new Error(msg);
          }
          const token = resp.data.token;
          const tenantId = resp.data.admin?.tenantId;
          localStorage.setItem(this.tokenKey, token);
          if (tenantId) localStorage.setItem(this.tenantKey, tenantId);

          const payload = this.decodeJwtPayload(token);
          const role = payload?.role;
          const roles = Array.isArray(role) ? role : role ? [role] : [];
          localStorage.setItem(this.rolesKey, JSON.stringify(roles));
          return true;
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.rolesKey);
    localStorage.removeItem(this.tenantKey);
    this.router.navigateByUrl('/login');
  }
}
