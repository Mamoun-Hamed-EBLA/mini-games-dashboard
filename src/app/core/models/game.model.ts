export interface Game {
  id: string; // Guid
  name: string;
  description: string;
  maxScore: number;
  timeLimit: number; // seconds or minutes; UI uses minutes
  isActive: boolean;
  rules?: string | null;
}
