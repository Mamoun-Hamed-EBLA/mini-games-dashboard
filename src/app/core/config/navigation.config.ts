import { NavItem } from '../models/nav-item.model';

export const NAVIGATION_CONFIG: NavItem[] = [
  {
    id: 'api-key-management',
    label: 'API Key Management',
    icon: 'vpn_key',
    isGroup: true,
    requiresApiKey: true,
    children: [
      {
        id: 'subscriptions',
        label: 'Subscription Tenant',
        icon: 'subscriptions',
        route: '/subscriptions',
        requiresApiKey: true
      },
      {
        id: 'tenants',
        label: 'Tenants',
        icon: 'business',
        route: '/tenants',
        requiresApiKey: true
      },
      {
        id: 'mini-games',
        label: 'Mini Games',
        icon: 'sports_esports',
        route: '/mini-games',
        requiresApiKey: true
      }
    ]
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'space_dashboard',
    route: '/dashboard',
    requiresAuth: true,
    exact: true
  },
  {
    id: 'management',
    label: 'Management',
    icon: 'settings_applications',
    isGroup: true,
    requiresAuth: true,
    children: [
      {
        id: 'games',
        label: 'Games',
        icon: 'sports_esports',
        route: '/games',
        requiresAuth: true
      },
      {
        id: 'sessions',
        label: 'Sessions',
        icon: 'timer',
        route: '/sessions',
        requiresAuth: true
      },
      {
        id: 'players',
        label: 'Players',
        icon: 'person',
        route: '/players',
        requiresAuth: true
      },
      {
        id: 'users',
        label: 'Users',
        icon: 'group',
        route: '/users',
        requiresAuth: true
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: 'settings',
        route: '/settings',
        requiresAuth: true
      }
    ]
  },
  {
    id: 'store',
    label: 'Store',
    icon: 'store',
    isGroup: true,
    requiresAuth: true,
    children: [
      {
        id: 'products',
        label: 'Products',
        icon: 'inventory_2',
        route: '/store/products',
        requiresAuth: true
      },
      {
        id: 'likecards-products',
        label: 'LikeCards Products',
        icon: 'shopping_cart',
        route: '/store/likecards-products',
        requiresAuth: true
      },
      {
        id: 'likecards-orders',
        label: 'LikeCards Orders',
        icon: 'receipt_long',
        route: '/store/likecards-orders',
        requiresAuth: true
      },
      {
        id: 'product-serials',
        label: 'Product Serials',
        icon: 'confirmation_number',
        route: '/store/product-serials',
        requiresAuth: true
      }
    ]
  },
  {
    id: 'game-mechanics',
    label: 'Game Mechanics',
    icon: 'extension',
    isGroup: true,
    requiresAuth: true,
    children: [
      {
        id: 'badges',
        label: 'Badges',
        icon: 'emoji_events',
        route: '/badges',
        requiresAuth: true
      },
      {
        id: 'card-backgrounds',
        label: 'Card Backgrounds',
        icon: 'image',
        route: '/card-backgrounds',
        requiresAuth: true
      },
      {
        id: 'daily-challenges',
        label: 'Daily Challenges',
        icon: 'event_note',
        route: '/daily-challenges',
        requiresAuth: true
      },
      {
        id: 'daily-quests',
        label: 'Daily Quests',
        icon: 'assignment',
        route: '/daily-quests',
        requiresAuth: true
      },
      {
        id: 'rewards',
        label: 'Rewards',
        icon: 'redeem',
        route: '/rewards',
        requiresAuth: true
      }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: 'bar_chart',
    isGroup: true,
    requiresAuth: true,
    children: [
      {
        id: 'leaderboard',
        label: 'Leaderboard',
        icon: 'leaderboard',
        route: '/reports/leaderboard',
        requiresAuth: true
      },
      {
        id: 'weekly-dashboard',
        label: 'Weekly Dashboard',
        icon: 'calendar_today',
        route: '/reports/weekly-dashboard',
        requiresAuth: true
      },
      {
        id: 'game-leaderboard',
        label: 'Game Leaderboard',
        icon: 'sports_score',
        route: '/reports/game-leaderboard',
        requiresAuth: true
      }
    ]
  }
];

export const DEFAULT_EXPANDED_GROUPS = {
  management: true,
  store: false,
  'game-mechanics': false,
  reports: false,
  'api-key-management': false
};
