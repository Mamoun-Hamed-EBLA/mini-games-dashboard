import { Component, HostListener, ViewChild, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { ShortcutService } from '../core/services/shortcut.service';
import { NAVIGATION_CONFIG, DEFAULT_EXPANDED_GROUPS } from '../core/config/navigation.config';
import { NavItem } from '../core/models/nav-item.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [SharedModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav
        #snav
        [mode]="(isHandset$ | async) ? 'over' : 'side'"
        [opened]="!(isHandset$ | async)"
        class="sidenav">
        <div class="brand">
          <mat-icon>dashboard</mat-icon>
          <span>Mini Games Admin</span>
        </div>
        <mat-nav-list>
          @for (item of filteredNavItems; track item.id) {
            @if (item.isGroup) {
              <mat-list-item (click)="toggleGroup(item.id)" class="group-header">
                @if (item.icon) {
                  <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                }
                <div matListItemTitle>{{ item.label }}

                 <mat-icon matListItemIcon >{{ expandedGroups[item.id] ? 'arrow_drop_down' : 'arrow_drop_up' }}</mat-icon>
                </div>
               
              </mat-list-item>
              @if (expandedGroups[item.id] && item.children) {
                @for (child of item.children; track child.id) {
                  <a mat-list-item class="nav-link nav-sub-link" routerLink="{{ child.route }}" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: child.exact || false }" (click)="closeOnMobile()">
                    <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                    <div matListItemTitle>{{ child.label }}</div>
                  </a>
                }
              }
            } @else {
              <a mat-list-item class="nav-link" routerLink="{{ item.route }}" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: item.exact || false }" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <div matListItemTitle>{{ item.label }}</div>
              </a>
            }
          }
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
     .sidenav{ width: clamp(16rem, 20vw, 20rem); background: rgba(255,255,255,.85); backdrop-filter: blur(10px); border-right: 1px solid var(--app-border); }
     .brand{display:flex; align-items:center; gap: clamp(0.5rem, 1vw, 0.75rem); padding: clamp(1rem, 2vw, 1.125rem); font-weight:700; color:#0f172a; letter-spacing:.3px;}
     .brand mat-icon{ color:#7c3aed; }

     .nav-link{ border-radius:clamp(0.75rem, 1.5vw, 0.875rem); margin:clamp(0.375rem, 0.75vw, 0.5rem) clamp(0.625rem, 1.25vw, 0.75rem); padding:clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.375rem, 0.75vw, 0.5rem); transition: all .18s ease; }
     .nav-link mat-icon{ color:#64748b; }
     .nav-link.active, .nav-link:hover{ background: rgba(124,58,237,.12); box-shadow: inset 0 0 0 1px var(--app-gold-light); }
     .nav-link.active mat-icon, .nav-link:hover mat-icon{ color:var( --app-gold-medium); }

     .group-header { cursor: pointer; user-select: none;  transition: background 0.2s; margin: clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.5rem, 1vw, 0.625rem); border-radius: clamp(0.5rem, 1vw, 0.625rem); }
     .group-header:hover { background: rgba(0,0,0,0.04); }
     ::ng-deep .mdc-list-item__primary-text{display:flex; align-items:center; font-size:clamp(0.875rem, 1.5vw, 1rem);}
     .nav-sub-link { margin-left: clamp(1.25rem, 2.5vw, 1.5rem) !important; }

     .toolbar{ position:sticky; top:0; z-index:2; border-bottom:1px solid var(--app-border); background: linear-gradient(90deg, rgba(124,58,237,.25), rgba(14,165,233,.20)); backdrop-filter: blur(8px); }
     .title{ font-weight:700; letter-spacing:.4px; }
     .content{ padding:clamp(0.75rem, 2vw, 1rem); }
     .spacer{ flex:1 1 auto; }
     .menu-btn{ display:none; }
     @media (max-width: 1400px){
       .menu-btn{display:inline-flex;}
       .sidenav{width:clamp(12rem, 80vw, 20rem);}
       .content{padding:clamp(0.5rem, 1.5vw, 0.75rem);}
     }`
  ]
})
export class ShellComponent {
  @ViewChild('snav') sidenav!: MatSidenav;
  private auth = inject(AuthService);
  private router = inject(Router);
  private shortcuts = inject(ShortcutService);

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$ = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
    .pipe(
      map(result => result.matches),
      shareReplay(1)
    );

  expandedGroups: Record<string, boolean> = { ...DEFAULT_EXPANDED_GROUPS };

  get filteredNavItems(): NavItem[] {
    return NAVIGATION_CONFIG.filter(item => {
      if (item.requiresApiKey && !this.hasApiKey) return false;
      if (item.requiresAuth && !this.hasToken) return false;
      if (item.children) {
        item.children = item.children.filter(child => {
          if (child.requiresApiKey && !this.hasApiKey) return false;
          if (child.requiresAuth && !this.hasToken) return false;
          return true;
        });
      }
      return true;
    });
  }

  toggleGroup(groupId: string) {
    this.expandedGroups[groupId] = !(this.expandedGroups[groupId] ?? false);
  }

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
