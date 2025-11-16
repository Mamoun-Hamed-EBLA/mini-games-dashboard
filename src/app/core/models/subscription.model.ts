import { SubscriptionType } from '../enums/SubscriptionType';

export interface Subscription {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationDays: number;
  maxPlayers: number;
  maxKeysPerMonth: number;
  type: SubscriptionType;
}
