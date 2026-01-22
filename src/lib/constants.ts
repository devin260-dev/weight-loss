export const COLORS = {
  primary: '#00ff00',      // retro green
  secondary: '#ffd700',    // retro gold
  background: '#1a0a2e',   // dark purple
  backgroundLight: '#2d1b4e',
  accent: '#ff6b9d',       // pixel pink
  text: '#ffffff',
  textMuted: '#a0a0a0',
  danger: '#ff4444',
  chartLine: '#00ff00',
  chartDot: '#ffd700',
  thresholdLine: '#ff6b9d',
} as const;

export const LEVEL_COLORS: Record<number, string> = {
  1: '#808080',  // Gray - starting out
  2: '#00ff00',  // Green - making progress
  3: '#00bfff',  // Blue - halfway there
  4: '#ffd700',  // Gold - almost there
  5: '#ff6b9d',  // Pink - champion
};

export const LEVEL_NAMES: Record<number, string> = {
  1: 'Novice',
  2: 'Apprentice',
  3: 'Warrior',
  4: 'Champion',
  5: 'Legend',
};

export const LEVEL_MESSAGES: Record<number, string> = {
  1: 'Your journey begins!',
  2: 'You are making great progress!',
  3: 'Halfway to your goal!',
  4: 'Almost there, champion!',
  5: 'You have achieved legendary status!',
};

export const STORAGE_KEY = 'weight-quest-data';

export const MIN_WEIGHT = 50;   // Minimum reasonable weight in pounds
export const MAX_WEIGHT = 700;  // Maximum reasonable weight in pounds

export const DAYS_FOR_AVERAGE = 7;
export const TOTAL_LEVELS = 5;
