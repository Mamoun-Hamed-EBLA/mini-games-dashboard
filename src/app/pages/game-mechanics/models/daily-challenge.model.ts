import { BaseModel } from '../../../core/models/base-model';
import { ChallengeStatus } from '../enums/ChallengeStatus';

export class DailyChallenge extends BaseModel {
  name!: string;
  startTime!: string;
  endTime!: string;
  entryFee!: number;
  gemReward!: number;
  playersLimit!: number;
  keysGranted!: number;
  maxAttemptsPerPlayer!: number;
  status!: ChallengeStatus;
  winnerId?: string | null;
}
