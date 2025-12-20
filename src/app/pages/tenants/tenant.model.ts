export interface Tenant {
  id: string;
  name: string;
  description?: string | null;
  databaseConnectionString?: string | null;
  isActive: boolean;
  currentSubscriptionId?: string | null;
  currentSubscriptionName?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  superAdminUsername?: string | null;
  superAdminEmail?: string | null;
  superAdminPassword?: string | null;
  superAdminFullName?: string | null;
}
