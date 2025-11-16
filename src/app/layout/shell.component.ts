import { Component, HostListener, ViewChild, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../core/auth/auth.service';
import { ShortcutService } from '../core/services/shortcut.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [SharedModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav #snav mode="side" opened class="sidenav">
        <div class="brand">
          <mat-icon>dashboard</mat-icon>
          <span>Mini Games Admin</span>
        </div>
        <mat-nav-list>
          <a *ngIf="hasToken" mat-list-item class="nav-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>space_dashboard</mat-icon>
            <div matListItemTitle>Dashboard</div>
          </a>
          <a *ngIf="hasToken" mat-list-item class="nav-link" routerLink="/games" routerLinkActive="active" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>sports_esports</mat-icon>
            <div matListItemTitle>Games</div>
          </a>
          <a *ngIf="hasApiKey" mat-list-item class="nav-link" routerLink="/subscriptions" routerLinkActive="active" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>vpn_key</mat-icon>
            <div matListItemTitle>Subscriptions</div>
          </a>
          <a *ngIf="hasApiKey" mat-list-item class="nav-link" routerLink="/tenants" routerLinkActive="active" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>domain</mat-icon>
            <div matListItemTitle>Tenants</div>
          </a>
          <a *ngIf="hasToken" mat-list-item class="nav-link" routerLink="/sessions" routerLinkActive="active" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>timer</mat-icon>
            <div matListItemTitle>Sessions</div>
          </a>
          <a *ngIf="hasToken" mat-list-item class="nav-link" routerLink="/players" routerLinkActive="active" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>person</mat-icon>
            <div matListItemTitle>Players</div>
          </a>
          <a *ngIf="hasToken" mat-list-item class="nav-link" routerLink="/users" routerLinkActive="active" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>group</mat-icon>
            <div matListItemTitle>Users</div>
          </a>
          <a *ngIf="hasToken" mat-list-item class="nav-link" routerLink="/settings" routerLinkActive="active" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>settings</mat-icon>
            <div matListItemTitle>Settings</div>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          <button mat-icon-button (click)="snav.toggle()" class="menu-btn">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="title">Mini Games Admin</span>
          <span class="spacer"></span>
          <button mat-button color="accent" (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </mat-toolbar>
        <div class="content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `.container{height:100vh;}
     .sidenav{ width: 260px; background: rgba(255,255,255,.85); backdrop-filter: blur(10px); border-right: 1px solid var(--app-border); }
     .brand{display:flex; align-items:center; gap:8px; padding:18px 16px; font-weight:700; color:#0f172a; letter-spacing:.3px;}
     .brand mat-icon{ color:#7c3aed; }

     .nav-link{ border-radius:12px; margin:6px 10px; padding:4px 6px; transition: all .18s ease; }
     .nav-link mat-icon{ color:#64748b; }
     .nav-link.active, .nav-link:hover{ background: rgba(124,58,237,.12); box-shadow: inset 0 0 0 1px rgba(124,58,237,.25); }
     .nav-link.active mat-icon, .nav-link:hover mat-icon{ color:#7c3aed; }

     .toolbar{ position:sticky; top:0; z-index:2; border-bottom:1px solid var(--app-border); background: linear-gradient(90deg, rgba(124,58,237,.25), rgba(14,165,233,.20)); backdrop-filter: blur(8px); }
     .title{ font-weight:700; letter-spacing:.4px; }
     .content{ padding:16px; }
     .spacer{ flex:1 1 auto; }
     .menu-btn{ display:none; }
     @media (max-width: 960px){ .menu-btn{display:inline-flex;} }`
  ]
})
export class ShellComponent {
  @ViewChild('snav') sidenav!: MatSidenav;
  private auth = inject(AuthService);
  private router = inject(Router);
  private shortcuts = inject(ShortcutService);

  closeOnMobile() {
    // Close the sidenav on smaller screens when navigating
    if (window.innerWidth < 960) {
      this.sidenav?.close();
    }
  }

  logout() { this.auth.logout(); }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'F1') {
      e.preventDefault();
      this.shortcuts.markApiKeyRouteRequested();
      this.router.navigateByUrl('/apikey-login');
    }
  }

  get hasToken() { return this.auth.isAuthenticated(); }
  get hasApiKey() { return this.auth.isApiKeyAuthenticated(); }
}
