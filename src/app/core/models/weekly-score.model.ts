import { BaseModel } from './base-model';

export class WeeklyScore extends BaseModel {
  playerId!: string;
  playerName!: string;
  weeklyScore!: number;
  gamesPlayedThisWeek!: number;
  weekStartDate!: string;
  weekEndDate!: string;
}
