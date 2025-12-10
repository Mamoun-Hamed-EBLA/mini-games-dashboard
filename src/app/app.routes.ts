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
        loadComponent: () => import('./pages/game/games.component').then(m => m.GamesComponent),
      },
      {
        path: 'badges',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/game-mechanics/badges.component').then(m => m.BadgesComponent),
      },
      {
        path: 'card-backgrounds',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/game-mechanics/card-backgrounds.component').then(m => m.CardBackgroundsComponent),
      },
      {
        path: 'rewards',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/game-mechanics/rewards.component').then(m => m.RewardsComponent),
      },
      {
        path: 'daily-challenges',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/game-mechanics/daily-challenges.component').then(m => m.DailyChallengesComponent),
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
        path: 'mini-games',
        canActivate: [authModeGuard],
        data: { authMode: 'apiKey' },
        loadComponent: () => import('./pages/mini-games/mini-games.component').then(m => m.MiniGamesComponent),
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
        path: 'reports/leaderboard',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/reports/leaderboard.component').then(m => m.LeaderboardComponent),
      },
      {
        path: 'reports/weekly-dashboard',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/reports/weekly-dashboard.component').then(m => m.WeeklyDashboardComponent),
      },
      {
        path: 'reports/game-leaderboard',
        canActivate: [authModeGuard],
        data: { authMode: 'token' },
        loadComponent: () => import('./pages/reports/game-leaderboard.component').then(m => m.GameLeaderboardComponent),
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
