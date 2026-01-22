'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { UserData } from '@/types';
import { STORAGE_KEY } from './constants';

const defaultUserData: UserData = {
  goalPounds: 0,
  startingWeight: 0,
  entries: [],
  currentLevel: 1,
  onboardingComplete: false,
  levelUpPending: null,
};

// Store for managing subscribers
const subscribers = new Set<() => void>();

// Cache for getSnapshot to avoid infinite loops with useSyncExternalStore
let cachedSnapshot: UserData = defaultUserData;
let cachedStorageValue: string | null = null;

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers() {
  subscribers.forEach(callback => callback());
}

function getSnapshot(): UserData {
  if (typeof window === 'undefined') {
    return defaultUserData;
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Return cached snapshot if storage value hasn't changed
    if (stored === cachedStorageValue) {
      return cachedSnapshot;
    }
    cachedStorageValue = stored;
    if (!stored) {
      cachedSnapshot = defaultUserData;
      return cachedSnapshot;
    }
    cachedSnapshot = JSON.parse(stored) as UserData;
    return cachedSnapshot;
  } catch {
    cachedSnapshot = defaultUserData;
    return cachedSnapshot;
  }
}

function getServerSnapshot(): UserData {
  return defaultUserData;
}

function saveData(data: UserData): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    notifySubscribers();
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
}

export function useUserData() {
  const userData = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateUserData = useCallback((updater: (data: UserData) => UserData) => {
    const currentData = getSnapshot();
    const newData = updater(currentData);
    saveData(newData);
  }, []);

  const setUserData = useCallback((data: UserData) => {
    saveData(data);
  }, []);

  return { userData, updateUserData, setUserData };
}
