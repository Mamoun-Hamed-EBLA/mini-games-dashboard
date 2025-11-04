export interface Player {
  id: string; // Guid
  username: string;
  socialMediaId: string;
  countryCode: string;
  icon: string;
  frame: string;
  score: number;
  lastLoginAt?: Date | null;
  isActive: boolean;
}
