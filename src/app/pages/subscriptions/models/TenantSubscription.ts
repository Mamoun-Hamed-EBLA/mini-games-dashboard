import { SubscriptionType } from "../../../core/enums/SubscriptionType";

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


