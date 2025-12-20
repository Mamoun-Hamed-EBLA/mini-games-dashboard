import { Component, HostListener, ViewChild, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs';
import { AuthService } from '../core/auth/auth.service';
import { ShortcutService } from '../core/services/shortcut.service';

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
          @if (hasToken) {
            <a mat-list-item class="nav-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="closeOnMobile()">
              <mat-icon matListItemIcon>space_dashboard</mat-icon>
              <div matListItemTitle>Dashboard</div>
            </a>

            <!-- Management Group -->
            <mat-list-item (click)="toggleManagement()" class="group-header">
              <!-- <mat-icon matListItemIcon>settings_applications</mat-icon> -->
              <div matListItemTitle>Management</div>
              @if(managementExpanded){
                <mat-icon >expand_more</mat-icon>
              }@else{
                <mat-icon >expand_less</mat-icon>
              }
              <!-- <mat-icon matListItemMeta [innerHtml]="managementExpanded ? 'expand_less' : 'expand_more'"></mat-icon> -->
            </mat-list-item>
            @if (managementExpanded) {
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/games" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>sports_esports</mat-icon>
                <div matListItemTitle>Games</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/sessions" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>timer</mat-icon>
                <div matListItemTitle>Sessions</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/players" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>person</mat-icon>
                <div matListItemTitle>Players</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/users" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>group</mat-icon>
                <div matListItemTitle>Users</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/settings" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>settings</mat-icon>
                <div matListItemTitle>Settings</div>
              </a>
            }

            <!-- Store Group -->
            <mat-list-item (click)="toggleStore()" class="group-header">
              <mat-icon matListItemIcon>store</mat-icon>
              <div matListItemTitle>Store</div>
              <mat-icon matListItemMeta [fontIcon]="storeExpanded ? 'expand_less' : 'expand_more'"></mat-icon>
            </mat-list-item>
            @if (storeExpanded) {
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/store/products" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>inventory_2</mat-icon>
                <div matListItemTitle>Products</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/store/likecards-products" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>shopping_cart</mat-icon>
                <div matListItemTitle>LikeCards Products</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/store/likecards-orders" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>receipt_long</mat-icon>
                <div matListItemTitle>LikeCards Orders</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/store/product-serials" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>confirmation_number</mat-icon>
                <div matListItemTitle>Product Serials</div>
              </a>
            }

            <!-- Game Mechanics Group -->
            <mat-list-item (click)="toggleMechanics()" class="group-header">
              <mat-icon matListItemIcon>extension</mat-icon>
              <div matListItemTitle>Game Mechanics</div>
              <mat-icon matListItemMeta [fontIcon]="mechanicsExpanded ? 'expand_less' : 'expand_more'"></mat-icon>
            </mat-list-item>
            @if (mechanicsExpanded) {
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/badges" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>emoji_events</mat-icon>
                <div matListItemTitle>Badges</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/card-backgrounds" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>image</mat-icon>
                <div matListItemTitle>Card Backgrounds</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/daily-challenges" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>event_note</mat-icon>
                <div matListItemTitle>Daily Challenges</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/daily-quests" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>assignment</mat-icon>
                <div matListItemTitle>Daily Quests</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/rewards" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>redeem</mat-icon>
                <div matListItemTitle>Rewards</div>
              </a>
            }

            <!-- Reports Group -->
            <mat-list-item (click)="toggleReports()" class="group-header">
              <mat-icon matListItemIcon>bar_chart</mat-icon>
              <div matListItemTitle>Reports</div>
              <mat-icon matListItemMeta [fontIcon]="reportsExpanded ? 'expand_less' : 'expand_more'"></mat-icon>
            </mat-list-item>
            @if (reportsExpanded) {
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/reports/leaderboard" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>leaderboard</mat-icon>
                <div matListItemTitle>Leaderboard</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/reports/weekly-dashboard" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>calendar_today</mat-icon>
                <div matListItemTitle>Weekly Dashboard</div>
              </a>
              <a mat-list-item class="nav-link nav-sub-link" routerLink="/reports/game-leaderboard" routerLinkActive="active" (click)="closeOnMobile()">
                <mat-icon matListItemIcon>sports_score</mat-icon>
                <div matListItemTitle>Game Leaderboard</div>
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
     .sidenav{ width: 260px; background: rgba(255,255,255,.85); backdrop-filter: blur(10px); border-right: 1px solid var(--app-border); }
     .brand{display:flex; align-items:center; gap:8px; padding:18px 16px; font-weight:700; color:#0f172a; letter-spacing:.3px;}
     .brand mat-icon{ color:#7c3aed; }

     .nav-link{ border-radius:12px; margin:6px 10px; padding:4px 6px; transition: all .18s ease; }
     .nav-link mat-icon{ color:#64748b; }
     .nav-link.active, .nav-link:hover{ background: rgba(124,58,237,.12); box-shadow: inset 0 0 0 1px var(--app-gold-light); }
     .nav-link.active mat-icon, .nav-link:hover mat-icon{ color:var( --app-gold-medium); }

     .group-header { cursor: pointer; user-select: none; transition: background 0.2s; margin: 4px 8px; border-radius: 8px; }
     .group-header:hover { background: rgba(0,0,0,0.04); }
     .nav-sub-link { margin-left: 20px !important; }

     .toolbar{ position:sticky; top:0; z-index:2; border-bottom:1px solid var(--app-border); background: linear-gradient(90deg, rgba(124,58,237,.25), rgba(14,165,233,.20)); backdrop-filter: blur(8px); }
     .title{ font-weight:700; letter-spacing:.4px; }
     .content{ padding:16px; }
     .spacer{ flex:1 1 auto; }
     .menu-btn{ display:none; }
     @media (max-width: 1400px){
       .menu-btn{display:inline-flex;}
       .sidenav{width:80vw; max-width:320px;}
       .content{padding:12px;}
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

  managementExpanded = true;
  storeExpanded = false;
  mechanicsExpanded = false;
  reportsExpanded = false;

  toggleManagement() { this.managementExpanded = !this.managementExpanded; }
  toggleStore() { this.storeExpanded = !this.storeExpanded; }
  toggleMechanics() { this.mechanicsExpanded = !this.mechanicsExpanded; }
  toggleReports() { this.reportsExpanded = !this.reportsExpanded; }

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
