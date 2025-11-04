export interface Admin {
  id: string;
  tenantId: string;
  username: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  lastLoginAt: string;
  canManageTenants: boolean;
  canManageGames: boolean;
  canManagePlayers: boolean;
  canManageStore: boolean;
  canManageFinance: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  createdAt: string;
}

export interface LoginData {
  isSuccess: boolean;
  token: string;
  admin: Admin;
  errorMessage: string | null;
}
