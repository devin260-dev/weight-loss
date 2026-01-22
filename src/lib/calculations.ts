import { WeightEntry, LevelThreshold } from '@/types';
import { DAYS_FOR_AVERAGE, TOTAL_LEVELS } from './constants';

/**
 * Calculate the running average of the last N days of entries
 */
export function calculateRunningAverage(
  entries: WeightEntry[],
  days: number = DAYS_FOR_AVERAGE
): number | null {
  if (entries.length < days) {
    return null;
  }

  // Sort entries by date (most recent last)
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // Get the last N entries
  const lastEntries = sortedEntries.slice(-days);

  // Calculate average
  const sum = lastEntries.reduce((acc, entry) => acc + entry.weight, 0);
  return sum / days;
}

/**
 * Calculate level thresholds based on goal and starting weight
 * Returns an array of thresholds from level 1 to 5
 */
export function calculateLevelThresholds(
  goalPounds: number,
  startingWeight: number
): LevelThreshold[] {
  const weightPerLevel = goalPounds / TOTAL_LEVELS;

  const thresholds: LevelThreshold[] = [];

  for (let level = 1; level <= TOTAL_LEVELS; level++) {
    // Level 1 starts at starting weight
    // Level 5 is reached when you hit target weight
    const weightThreshold = startingWeight - weightPerLevel * (level - 1);
    thresholds.push({
      level,
      weightThreshold,
    });
  }

  return thresholds;
}

/**
 * Determine the current level based on running average
 * Levels never decrease - only returns max of calculated vs current
 */
export function determineLevel(
  runningAverage: number | null,
  thresholds: LevelThreshold[],
  currentLevel: number
): number {
  if (runningAverage === null || thresholds.length === 0) {
    return currentLevel;
  }

  // Find the highest level threshold that has been crossed
  let calculatedLevel = 1;

  for (const threshold of thresholds) {
    // You achieve a level when your weight is AT or BELOW the threshold
    // (lower weight = higher level for weight loss)
    if (runningAverage <= threshold.weightThreshold) {
      calculatedLevel = Math.max(calculatedLevel, threshold.level);
    }
  }

  // Levels never decrease
  return Math.max(calculatedLevel, currentLevel);
}

/**
 * Check if a level up has occurred
 */
export function checkLevelUp(currentLevel: number, newLevel: number): boolean {
  return newLevel > currentLevel;
}

/**
 * Calculate progress toward next level (0-100)
 */
export function calculateProgressToNextLevel(
  runningAverage: number | null,
  thresholds: LevelThreshold[],
  currentLevel: number
): number {
  if (runningAverage === null || currentLevel >= TOTAL_LEVELS) {
    return currentLevel >= TOTAL_LEVELS ? 100 : 0;
  }

  const currentThreshold = thresholds.find(t => t.level === currentLevel);
  const nextThreshold = thresholds.find(t => t.level === currentLevel + 1);

  if (!currentThreshold || !nextThreshold) {
    return 0;
  }

  const totalRange = currentThreshold.weightThreshold - nextThreshold.weightThreshold;
  const progressMade = currentThreshold.weightThreshold - runningAverage;

  if (totalRange <= 0) return 100;

  const progress = (progressMade / totalRange) * 100;
  return Math.max(0, Math.min(100, progress));
}

/**
 * Calculate pounds remaining to next level
 */
export function poundsToNextLevel(
  runningAverage: number | null,
  thresholds: LevelThreshold[],
  currentLevel: number
): number | null {
  if (runningAverage === null || currentLevel >= TOTAL_LEVELS) {
    return null;
  }

  const nextThreshold = thresholds.find(t => t.level === currentLevel + 1);

  if (!nextThreshold) {
    return null;
  }

  const remaining = runningAverage - nextThreshold.weightThreshold;
  return Math.max(0, remaining);
}

/**
 * Calculate partial running average using available entries (less than DAYS_FOR_AVERAGE)
 */
export function calculatePartialAverage(entries: WeightEntry[]): number | null {
  if (entries.length === 0) {
    return null;
  }

  const sum = entries.reduce((acc, entry) => acc + entry.weight, 0);
  return sum / entries.length;
}

/**
 * Get chart data with running averages calculated for each point
 * Shows partial averages during baseline period (before 7 days)
 */
export function getChartData(entries: WeightEntry[]): Array<{
  date: string;
  weight: number;
  runningAverage: number | null;
  index: number;
}> {
  const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  return sortedEntries.map((entry, index) => {
    // Calculate running average using entries up to and including this one
    const entriesUpToNow = sortedEntries.slice(0, index + 1);

    // Use full 7-day average if we have enough data, otherwise use partial average
    let runningAverage: number | null;
    if (entriesUpToNow.length >= DAYS_FOR_AVERAGE) {
      runningAverage = calculateRunningAverage(entriesUpToNow, DAYS_FOR_AVERAGE);
    } else {
      // Show partial average during baseline period
      runningAverage = calculatePartialAverage(entriesUpToNow);
    }

    return {
      date: entry.date,
      weight: entry.weight,
      runningAverage,
      index,
    };
  });
}
