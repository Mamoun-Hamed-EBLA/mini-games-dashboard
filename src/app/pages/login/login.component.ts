import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/notifications/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card mat-elevation-z8">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>lock</mat-icon>
            <span>Admin Login</span>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username or Email</mat-label>
              <input matInput formControlName="username" placeholder="admin" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" placeholder="••••••" />
            </mat-form-field>
            <button mat-flat-button color="primary" class="full-width action" [disabled]="form.invalid || loading">
              <mat-progress-spinner *ngIf="loading" mode="indeterminate" diameter="18"></mat-progress-spinner>
              <span *ngIf="!loading">Login</span>
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <a routerLink="/" mat-button>Back</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `.login-wrapper{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:
        radial-gradient(600px 200px at 20% -10%, rgba(37,99,235,.08), transparent),
        radial-gradient(600px 200px at 80% 110%, rgba(16,185,129,.06), transparent);
     }
     .login-card{width:100%;max-width:420px;border-radius:14px;}
     .form{display:flex;flex-direction:column;gap:16px;margin-top:8px;}
     .full-width{width:100%;}
     .action{height:44px;display:flex;align-items:center;justify-content:center;gap:8px;}`
  ]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);

  loading = false;

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid || this.loading) return;
    const { username, password } = this.form.value as { username: string; password: string };
    this.loading = true;
    this.auth.login(username, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: any) => { this.loading = false; this.notify.error(err?.message || 'Login failed'); },
      complete: () => { this.loading = false; }
    });
  }
}
