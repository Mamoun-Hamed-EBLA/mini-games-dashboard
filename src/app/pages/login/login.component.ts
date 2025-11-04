import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card mat-elevation-z4">
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
            <button mat-flat-button color="primary" class="full-width" [disabled]="form.invalid || loading">
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
    `.login-wrapper{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
     .login-card{width:100%;max-width:420px;}
     .form{display:flex;flex-direction:column;gap:16px;}
     .full-width{width:100%;}`
  ]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }
}
