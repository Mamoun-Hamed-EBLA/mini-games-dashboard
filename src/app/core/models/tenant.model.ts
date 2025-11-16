export interface Tenant {
  id: string;
  name: string;
  description?: string | null;
  databaseConnectionString?: string | null;
  subscriptionId?: string | null;
  superAdminUsername?: string | null;
  superAdminEmail?: string | null;
  superAdminPassword?: string | null;
  superAdminFullName?: string | null;
}
