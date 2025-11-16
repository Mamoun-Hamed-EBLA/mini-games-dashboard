import { SubscriptionType } from '../enums/SubscriptionType';

export interface TenantSubscription {
  id: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  maxPlayers: number;
  maxKeysPerMonth: number;
  type: SubscriptionType;
}
