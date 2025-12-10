import { SubscriptionType } from "../enum/SubscriptionType";

export class TenantSubscription {
    id!: string;
    name!: string;
    description!: string;
    price!: number;
    durationInDays!: number;
    maxPlayers!: number;
    maxKeysPerMonth!: number;
    type!: SubscriptionType;
}


