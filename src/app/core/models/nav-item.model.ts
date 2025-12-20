export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  isGroup?: boolean;
  requiresAuth?: boolean;
  requiresApiKey?: boolean;
  exact?: boolean;
}

export interface NavGroup extends NavItem {
  isGroup: true;
  children: NavItem[];
}

export interface NavLink extends NavItem {
  route: string;
  isGroup?: false;
}
