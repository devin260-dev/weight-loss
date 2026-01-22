'use client';

import { useCallback, useState, useEffect } from 'react';
import { WeightEntry } from '@/types';
import { useUserData } from '@/lib/useUserData';
import {
  calculateRunningAverage,
  calculateLevelThresholds,
  determineLevel,
  checkLevelUp,
  calculateProgressToNextLevel,
  poundsToNextLevel,
  getChartData,
} from '@/lib/calculations';
import { DAYS_FOR_AVERAGE } from '@/lib/constants';
import Avatar from '@/components/Avatar';
import WeightEntryComponent from '@/components/WeightEntry';
import LevelProgress from '@/components/LevelProgress';
import WeightChart from '@/components/WeightChart';
import OnboardingForm from '@/components/OnboardingForm';
import LevelUpModal from '@/components/LevelUpModal';
import MuteToggle from '@/components/MuteToggle';
import { useBackgroundMusic } from '@/lib/useBackgroundMusic';

export default function Home() {
  const { userData, setUserData } = useUserData();
  const [isClient, setIsClient] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // Background music - plays level-specific music that loops
  const { isMuted, toggleMute, play: playMusic } = useBackgroundMusic({
    level: userData?.currentLevel || 1,
    enabled: isClient && !!userData?.onboardingComplete,
  });

  useEffect(() => {
    // This is a standard pattern for client-side mounting detection
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  // Generate fake historical weight data for testing
  const addFakeData = useCallback(() => {
    const today = new Date();
    const startWeight = 200;
    const fakeEntries: WeightEntry[] = [];

    // Generate 14 days of data with gradual weight loss and some variation
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Gradual decrease with random daily fluctuation
      const daysFromStart = 13 - i;
      const baseWeight = startWeight - (daysFromStart * 0.3); // ~0.3 lbs/day loss
      const fluctuation = (Math.random() - 0.5) * 1.5; // +/- 0.75 lbs
      const weight = Math.round((baseWeight + fluctuation) * 10) / 10;

      fakeEntries.push({ date: dateStr, weight });
    }

    const avgWeight = fakeEntries.slice(-7).reduce((sum, e) => sum + e.weight, 0) / 7;

    setUserData({
      ...userData,
      goalPounds: 30,
      startingWeight: startWeight,
      entries: fakeEntries,
      onboardingComplete: true,
      currentLevel: 1,
      levelUpPending: null,
    });
  }, [userData, setUserData]);

  const clearAllData = useCallback(() => {
    setUserData({
      goalPounds: 0,
      startingWeight: 0,
      entries: [],
      currentLevel: 1,
      onboardingComplete: false,
      levelUpPending: null,
    });
  }, [setUserData]);

  // Adjust all weights by a given amount (to shift running average)
  const adjustWeights = useCallback((amount: number) => {
    if (!userData.entries.length) return;

    const adjustedEntries = userData.entries.map((entry: WeightEntry) => ({
      ...entry,
      weight: Math.round((entry.weight + amount) * 10) / 10,
    }));

    const updatedData = { ...userData, entries: adjustedEntries };

    // Check for level changes after adjustment
    if (updatedData.onboardingComplete) {
      const currentAvg = calculateRunningAverage(adjustedEntries, DAYS_FOR_AVERAGE);
      const currentThresholds = calculateLevelThresholds(updatedData.goalPounds, updatedData.startingWeight);
      const newLevel = determineLevel(currentAvg, currentThresholds, updatedData.currentLevel);

      if (checkLevelUp(updatedData.currentLevel, newLevel)) {
        updatedData.levelUpPending = newLevel;
      }
    }

    setUserData(updatedData);
  }, [userData, setUserData]);

  // Calculate derived values
  const runningAverage = userData
    ? calculateRunningAverage(userData.entries, DAYS_FOR_AVERAGE)
    : null;

  const thresholds = userData && userData.onboardingComplete
    ? calculateLevelThresholds(userData.goalPounds, userData.startingWeight)
    : [];

  const progress = userData
    ? calculateProgressToNextLevel(runningAverage, thresholds, userData.currentLevel)
    : 0;

  const poundsRemaining = userData
    ? poundsToNextLevel(runningAverage, thresholds, userData.currentLevel)
    : null;

  const chartData = userData ? getChartData(userData.entries) : [];

  // Handle goal submission (onboarding step 1)
  const handleGoalSubmit = useCallback((goalPounds: number) => {
    const updated = { ...userData, goalPounds };
    setUserData(updated);
  }, [userData, setUserData]);

  // Handle weight entry
  const handleWeightSubmit = useCallback((weight: number, date: string) => {
    const updated = { ...userData };

    // Add or update entry
    const entryDate = date || new Date().toISOString().split('T')[0];
    const existingIndex = updated.entries.findIndex((e: WeightEntry) => e.date === entryDate);

    if (existingIndex >= 0) {
      updated.entries[existingIndex].weight = weight;
    } else {
      updated.entries = [...updated.entries, { date: entryDate, weight }];
    }
    updated.entries.sort((a: WeightEntry, b: WeightEntry) => a.date.localeCompare(b.date));

    // Check if onboarding should complete (7 days of entries)
    if (!updated.onboardingComplete && updated.entries.length >= DAYS_FOR_AVERAGE) {
      const avg = calculateRunningAverage(updated.entries, DAYS_FOR_AVERAGE);
      if (avg !== null) {
        updated.startingWeight = avg;
        updated.onboardingComplete = true;
      }
    }

    // Check for level up after onboarding is complete
    if (updated.onboardingComplete) {
      const currentAvg = calculateRunningAverage(updated.entries, DAYS_FOR_AVERAGE);
      const currentThresholds = calculateLevelThresholds(updated.goalPounds, updated.startingWeight);
      const newLevel = determineLevel(currentAvg, currentThresholds, updated.currentLevel);

      if (checkLevelUp(updated.currentLevel, newLevel)) {
        updated.levelUpPending = newLevel;
      }
    }

    setUserData(updated);
  }, [userData, setUserData]);

  // Handle level up confirmation
  const handleLevelUpConfirm = useCallback(() => {
    if (userData.levelUpPending !== null) {
      const updated = {
        ...userData,
        currentLevel: userData.levelUpPending,
        levelUpPending: null,
      };
      setUserData(updated);
    }
  }, [userData, setUserData]);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--primary)] animate-pulse">LOADING...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--danger)]">Error loading data</div>
      </div>
    );
  }

  const showOnboarding = !userData.goalPounds || !userData.onboardingComplete;
  const existingDates = userData.entries.map((e: WeightEntry) => e.date);

  return (
    <div className="min-h-screen p-4" onClick={playMusic}>
      {/* Mute Toggle Button */}
      {isClient && userData?.onboardingComplete && (
        <MuteToggle isMuted={isMuted} onToggle={toggleMute} />
      )}

      {/* Header */}
      <header className="text-center py-2 mb-4">
        <h1 className="text-xl text-[var(--primary)] mb-1">
          WEIGHT QUEST RPG
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Your Epic Weight Loss Adventure
        </p>
      </header>

      {/* Onboarding or Main Content */}
      {showOnboarding ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <OnboardingForm
            onSubmit={handleGoalSubmit}
            entriesCount={userData.entries.length}
            goalSet={userData.goalPounds > 0}
          />
          {userData.goalPounds > 0 && (
            <WeightEntryComponent
              onSubmit={handleWeightSubmit}
              existingDates={existingDates}
            />
          )}
          {userData.entries.length > 0 && (
            <WeightChart
              data={chartData}
              thresholds={[]}
              currentLevel={1}
            />
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Avatar (full width on mobile, 1/3 on desktop) */}
          <div className="flex flex-col items-center lg:col-span-1">
            {/* Show medium avatar on mobile, large on desktop */}
            <div className="hidden lg:block">
              <Avatar level={userData.currentLevel} size="lg" animated />
            </div>
            <div className="block lg:hidden">
              <Avatar level={userData.currentLevel} size="md" animated />
            </div>
            <div className="mt-4 w-full">
              <LevelProgress
                level={userData.currentLevel}
                progress={progress}
                poundsRemaining={poundsRemaining}
              />
            </div>
            {/* Stats */}
            <div className="pixel-card p-3 mt-4 w-full">
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div>
                  <p className="text-xs text-[var(--text-muted)]">7-Day Avg</p>
                  <p className="text-[var(--primary)]">
                    {runningAverage ? `${runningAverage.toFixed(1)}` : '--'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Started</p>
                  <p className="text-[var(--secondary)]">
                    {userData.startingWeight.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Goal</p>
                  <p className="text-[var(--accent)]">
                    -{userData.goalPounds}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Lost</p>
                  <p className="text-[var(--primary)]">
                    {runningAverage
                      ? `-${(userData.startingWeight - runningAverage).toFixed(1)}`
                      : '--'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form and Chart (full width on mobile, 2/3 on desktop) */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* Weight Entry */}
            <WeightEntryComponent
              onSubmit={handleWeightSubmit}
              existingDates={existingDates}
            />

            {/* Weight Chart */}
            <WeightChart
              data={chartData}
              thresholds={thresholds}
              currentLevel={userData.currentLevel}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 mt-4">
        <p className="text-xs text-[var(--text-muted)]">
          Entries: {userData.entries.length} | Level {userData.currentLevel}
        </p>
        <button
          onClick={() => setDevMode(!devMode)}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] mt-2"
        >
          {devMode ? 'Hide Dev Tools' : 'Dev Tools'}
        </button>
      </footer>

      {/* Dev Mode Panel */}
      {devMode && (
        <div className="fixed bottom-20 right-4 pixel-card p-4 space-y-2">
          <p className="text-sm text-[var(--primary)] mb-2">Dev Tools</p>
          <button
            onClick={addFakeData}
            className="block w-full px-3 py-2 text-sm bg-[var(--primary)] text-black hover:opacity-80"
          >
            Add 14 Days Fake Data
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => adjustWeights(-1)}
              className="flex-1 px-3 py-2 text-sm bg-[var(--secondary)] text-black hover:opacity-80"
            >
              -1 lb
            </button>
            <button
              onClick={() => adjustWeights(1)}
              className="flex-1 px-3 py-2 text-sm bg-[var(--accent)] text-black hover:opacity-80"
            >
              +1 lb
            </button>
          </div>
          <button
            onClick={clearAllData}
            className="block w-full px-3 py-2 text-sm bg-[var(--danger)] text-white hover:opacity-80"
          >
            Clear All Data
          </button>
        </div>
      )}

      {/* Level Up Modal */}
      {userData.levelUpPending !== null && (
        <LevelUpModal
          newLevel={userData.levelUpPending}
          onConfirm={handleLevelUpConfirm}
        />
      )}
    </div>
  );
}
