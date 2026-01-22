import { UserData, WeightEntry } from '@/types';
import { STORAGE_KEY } from './constants';

const defaultUserData: UserData = {
  goalPounds: 0,
  startingWeight: 0,
  entries: [],
  currentLevel: 1,
  onboardingComplete: false,
  levelUpPending: null,
};

export function getUserData(): UserData {
  if (typeof window === 'undefined') {
    return defaultUserData;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultUserData;
    }
    return JSON.parse(stored) as UserData;
  } catch {
    return defaultUserData;
  }
}

export function saveUserData(data: UserData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
}

export function addWeightEntry(weight: number, date?: string): UserData {
  const data = getUserData();
  const entryDate = date || new Date().toISOString().split('T')[0];

  // Check if entry for this date already exists
  const existingIndex = data.entries.findIndex(e => e.date === entryDate);

  if (existingIndex >= 0) {
    // Update existing entry
    data.entries[existingIndex].weight = weight;
  } else {
    // Add new entry
    const newEntry: WeightEntry = {
      date: entryDate,
      weight,
    };
    data.entries.push(newEntry);
  }

  // Sort entries by date
  data.entries.sort((a, b) => a.date.localeCompare(b.date));

  saveUserData(data);
  return data;
}

export function initializeGoal(goalPounds: number): UserData {
  const data = getUserData();
  data.goalPounds = goalPounds;
  saveUserData(data);
  return data;
}

export function completeOnboarding(startingWeight: number): UserData {
  const data = getUserData();
  data.startingWeight = startingWeight;
  data.onboardingComplete = true;
  saveUserData(data);
  return data;
}

export function setLevelUpPending(level: number): UserData {
  const data = getUserData();
  data.levelUpPending = level;
  saveUserData(data);
  return data;
}

export function confirmLevelUp(): UserData {
  const data = getUserData();
  if (data.levelUpPending !== null) {
    data.currentLevel = data.levelUpPending;
    data.levelUpPending = null;
  }
  saveUserData(data);
  return data;
}

export function clearAllData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}
