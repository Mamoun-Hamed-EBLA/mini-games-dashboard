import { Routes } from '@angular/router';

import { ShellComponent } from './layout/shell.component';
import { authGuard } from './core/auth/auth.guard';
import { redirectLoggedInGuard } from './core/auth/redirect.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [redirectLoggedInGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'games',
        loadComponent: () => import('./pages/games/games.component').then(m => m.GamesComponent),
      },
      {
        path: 'sessions',
        loadComponent: () => import('./pages/sessions/sessions.component').then(m => m.SessionsComponent),
      },
      {
        path: 'players',
        loadComponent: () => import('./pages/players/players.component').then(m => m.PlayersComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
