export interface WeightEntry {
  date: string;        // ISO date string (YYYY-MM-DD)
  weight: number;      // in pounds
}

export interface UserData {
  goalPounds: number;           // Total weight to lose
  startingWeight: number;       // 7-day average after onboarding
  entries: WeightEntry[];       // All weight entries
  currentLevel: number;         // 1-5, permanent (never decreases)
  onboardingComplete: boolean;  // After 7 days of entries
  levelUpPending: number | null; // New level to show in modal, null if no pending level up
}

export interface LevelThreshold {
  level: number;
  weightThreshold: number;
}
