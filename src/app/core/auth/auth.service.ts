import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly rolesKey = 'auth_roles';

  constructor(private router: Router) {}

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

  login(username: string, password: string): Observable<boolean> {
    // TODO: Replace with a real HTTP call to your backend.
    // For now we simulate a successful login with a fake token and admin role.
    return of(true).pipe(
      delay(400),
      tap(() => {
        localStorage.setItem(this.tokenKey, 'demo-token');
        localStorage.setItem(this.rolesKey, JSON.stringify(['admin']));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.rolesKey);
    this.router.navigateByUrl('/login');
  }
}
