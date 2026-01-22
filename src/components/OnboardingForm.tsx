'use client';

import { useState } from 'react';
import Avatar from './Avatar';
import { DAYS_FOR_AVERAGE } from '@/lib/constants';

interface OnboardingFormProps {
  onSubmit: (goalPounds: number) => void;
  entriesCount: number;
  goalSet: boolean;
}

export default function OnboardingForm({ onSubmit, entriesCount, goalSet }: OnboardingFormProps) {
  const [goal, setGoal] = useState<string>('');
  const [error, setError] = useState<string>('');

  const daysRemaining = DAYS_FOR_AVERAGE - entriesCount;
  const showGoalForm = !goalSet;
  const showBaselineProgress = goalSet && daysRemaining > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const goalNum = parseFloat(goal);

    if (isNaN(goalNum) || goalNum <= 0) {
      setError('Please enter a valid weight loss goal');
      return;
    }

    if (goalNum > 200) {
      setError('Goal seems too high. Please enter a realistic goal.');
      return;
    }

    onSubmit(goalNum);
    setGoal('');
  };

  if (showGoalForm) {
    return (
      <div className="pixel-card p-6 max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Avatar level={1} size="lg" />
        </div>

        <h2 className="text-xl mb-4 text-[var(--primary)]">
          BEGIN YOUR QUEST
        </h2>

        <p className="text-sm text-[var(--text-muted)] mb-6">
          Welcome, brave adventurer! Set your weight loss goal to begin your journey.
          You&apos;ll establish a baseline over the first {DAYS_FOR_AVERAGE} days.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="goal" className="block text-sm mb-2 text-[var(--text-muted)]">
              How many pounds do you want to lose?
            </label>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="20"
                step="0.5"
                min="1"
                max="200"
                className="pixel-input w-24 text-center"
                required
              />
              <span className="text-[var(--primary)]">lbs</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-[var(--danger)]">{error}</p>
          )}

          <button type="submit" className="pixel-button w-full">
            START QUEST
          </button>
        </form>
      </div>
    );
  }

  if (showBaselineProgress) {
    return (
      <div className="pixel-card p-6 max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <Avatar level={1} size="lg" />
        </div>

        <h2 className="text-xl mb-4 text-[var(--secondary)]">
          ESTABLISHING BASELINE
        </h2>

        <p className="text-sm text-[var(--text-muted)] mb-4">
          Log your weight daily to establish your starting point.
          Your journey officially begins after {DAYS_FOR_AVERAGE} days of entries.
        </p>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
            <span>Day {entriesCount}</span>
            <span>Day {DAYS_FOR_AVERAGE}</span>
          </div>
          <div className="h-4 bg-[var(--background-light)] border-2 border-[var(--secondary)] relative overflow-hidden">
            <div
              className="h-full bg-[var(--secondary)] transition-all duration-500"
              style={{ width: `${(entriesCount / DAYS_FOR_AVERAGE) * 100}%` }}
            />
          </div>
        </div>

        <p className="text-sm text-[var(--primary)]">
          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
        </p>
      </div>
    );
  }

  return null;
}
