export type GameStatus = 'Active' | 'Completed' | 'Abandoned';

export interface GameSession {
  id: string; // Guid
  playerId: string; // Guid
  gameId: string; // Guid
  status: GameStatus;
  startedAt: string; // ISO string
  endedAt?: string | null; // ISO string
  finalScore: number;
  durationSeconds?: number | null;
  gameData?: string | null; // JSON string
}
