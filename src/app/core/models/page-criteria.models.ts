import { BaseCriteria } from './base-criteria.model';

export interface TenantCriteria extends BaseCriteria {
  subscriptionId?: string;
}

export interface SubscriptionCriteria extends BaseCriteria {
  type?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface UserCriteria extends BaseCriteria {
  tenantId?: string;
  role?: string;
  isActive?: boolean;
}

export interface SessionCriteria extends BaseCriteria {
  gameId?: string;
  minScore?: number;
  maxScore?: number;
  startedFrom?: Date | string;
  startedTo?: Date | string;
  endedFrom?: Date | string;
  endedTo?: Date | string;
  minDuration?: number;
  maxDuration?: number;
  playerId?: string;
  status?: string;
}

export interface GameCriteria extends BaseCriteria {
  minMaxScore?: number;
  maxMaxScore?: number;
  minTimeLimit?: number;
  maxTimeLimit?: number;
  isActive?: boolean;
}
