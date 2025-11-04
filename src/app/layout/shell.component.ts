import { Component, ViewChild, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [SharedModule, RouterLink, RouterOutlet],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav #snav mode="side" opened class="sidenav">
        <div class="brand">
          <mat-icon>dashboard</mat-icon>
          <span>Mini Games Admin</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>space_dashboard</mat-icon>
            <div matListItemTitle>Dashboard</div>
          </a>
          <a mat-list-item routerLink="/games" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>sports_esports</mat-icon>
            <div matListItemTitle>Games</div>
          </a>
          <a mat-list-item routerLink="/sessions" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>timer</mat-icon>
            <div matListItemTitle>Sessions</div>
          </a>
          <a mat-list-item routerLink="/players" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>person</mat-icon>
            <div matListItemTitle>Players</div>
          </a>
          <a mat-list-item routerLink="/users" (click)="closeOnMobile()">
            <mat-icon matListItemIcon>group</mat-icon>
            <div matListItemTitle>Users</div>
          </a>
          <a mat-list-item routerLink="/settings" (click)="closeOnMobile()">
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
     .toolbar{position:sticky; top:0; z-index:1; background: linear-gradient(90deg, #1f2937, #0f172a); color: #e2e8f0;}
     .content{padding:16px;}
     .spacer{flex:1 1 auto;}
     .menu-btn{display:none;}
     .brand{display:flex; align-items:center; gap:8px; padding:16px; font-weight:600; color:#e2e8f0;}
     @media (max-width: 960px){
       .menu-btn{display:inline-flex;}
     }`
  ]
})
export class ShellComponent {
  @ViewChild('snav') sidenav!: MatSidenav;
  private auth = inject(AuthService);

  closeOnMobile() {
    // Close the sidenav on smaller screens when navigating
    if (window.innerWidth < 960) {
      this.sidenav?.close();
    }
  }

  logout() { this.auth.logout(); }
}
