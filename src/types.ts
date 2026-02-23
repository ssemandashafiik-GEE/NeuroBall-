export enum PredictionStatus {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  VOID = 'void'
}

export interface MatchPrediction {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  startTime: string;
  prediction: string; // e.g., "Home Win", "Over 2.5", "BTTS"
  odds: number;
  confidence: number; // 0-100
  analysis: string;
  status: PredictionStatus;
  isElite: boolean;
}

export interface User {
  id: string;
  email: string;
  tier: 'free' | 'basic' | 'pro' | 'elite';
  predictionsRemaining: number;
  subscriptionEnd?: string;
}

export interface BetSlip {
  id: string;
  matches: MatchPrediction[];
  totalOdds: number;
  confidence: number;
  date: string;
}
