import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell.component';
import { redirectLoggedInGuard } from './core/auth/redirect.guard';
import { anyAuthGuard } from './core/auth/any-auth.guard';
import { authModeGuard } from './core/auth/auth-mode.guard';
import { apiKeyEntryGuard } from './core/auth/api-key-entry.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [redirectLoggedInGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'apikey-login',
    canActivate: [apiKeyEntryGuard],
    loadComponent: () => import('./pages/api-key-login/api-key-login.component').then(m => m.ApiKeyLoginComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [anyAuthGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'games',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/games/games.component').then(m => m.GamesComponent),
      },
      {
        path: 'subscriptions',
        canActivate: [authModeGuard],
        data: { authMode: 'apiKey' },
        loadComponent: () => import('./pages/subscriptions/subscriptions.component').then(m => m.SubscriptionsComponent),
      },
      {
        path: 'tenants',
        canActivate: [authModeGuard],
        data: { authMode: 'apiKey' },
        loadComponent: () => import('./pages/tenants/tenants.component').then(m => m.TenantsComponent),
      },
      {
        path: 'sessions',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/sessions/sessions.component').then(m => m.SessionsComponent),
      },
      {
        path: 'players',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/players/players.component').then(m => m.PlayersComponent),
      },
      {
        path: 'users',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'settings',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
