import { Component, HostListener, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/notifications/notification.service';

@Component({
  selector: 'app-api-key-login',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-wrapper">
      <mat-card class="login-card mat-elevation-z8">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>vpn_key</mat-icon>
            <span>API Key Login</span>
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>API Key</mat-label>
              <input matInput formControlName="apiKey" placeholder="Paste your API key" />
            </mat-form-field>
            <button mat-flat-button color="primary" class="full-width action" [disabled]="form.invalid || loading">
              @if (loading) {
                <mat-progress-spinner mode="indeterminate" diameter="18"></mat-progress-spinner>
              }
              @if (!loading) {
                <span>Continue</span>
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <a routerLink="/login" mat-button>Back to Admin Login</a>
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
export class ApiKeyLoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);

  loading = false;

  form = this.fb.group({
    apiKey: ['', Validators.required],
  });

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'F1') {
      e.preventDefault();
    }
  }

  submit() {
    if (this.form.invalid || this.loading) return;
    const { apiKey } = this.form.value as { apiKey: string };
    this.loading = true;
    this.auth.loginWithApiKey(apiKey).subscribe({
      next: () => {
        const fallback = '/subscriptions';
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || fallback;
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: any) => { this.loading = false; this.notify.error(err?.message || 'Login failed'); },
      complete: () => { this.loading = false; }
    });
  }
}
