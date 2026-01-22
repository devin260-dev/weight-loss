'use client';

import { useState } from 'react';
import { MIN_WEIGHT, MAX_WEIGHT } from '@/lib/constants';

interface WeightEntryProps {
  onSubmit: (weight: number, date: string) => void;
  existingDates?: string[];
}

export default function WeightEntry({ onSubmit, existingDates = [] }: WeightEntryProps) {
  const today = new Date().toISOString().split('T')[0];
  const [weight, setWeight] = useState<string>('');
  const [date, setDate] = useState<string>(today);
  const [error, setError] = useState<string>('');

  const hasEntryForToday = existingDates.includes(today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const weightNum = parseFloat(weight);

    if (isNaN(weightNum)) {
      setError('Please enter a valid weight');
      return;
    }

    if (weightNum < MIN_WEIGHT || weightNum > MAX_WEIGHT) {
      setError(`Weight must be between ${MIN_WEIGHT} and ${MAX_WEIGHT} lbs`);
      return;
    }

    onSubmit(weightNum, date);
    setWeight('');
    setDate(today);
  };

  return (
    <form onSubmit={handleSubmit} className="pixel-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="weight" className="block text-sm mb-2 text-[var(--text-muted)]">
            {hasEntryForToday ? "Update Today's Weight" : "Today's Weight"}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="185.5"
              step="0.1"
              min={MIN_WEIGHT}
              max={MAX_WEIGHT}
              className="pixel-input flex-1"
              required
            />
            <span className="text-[var(--primary)]">lbs</span>
          </div>
        </div>

        <div className="flex-shrink-0">
          <label htmlFor="date" className="block text-sm mb-2 text-[var(--text-muted)]">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
            className="pixel-input"
          />
        </div>

        <button type="submit" className="pixel-button">
          LOG
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>
      )}

      {existingDates.includes(date) && date !== today && (
        <p className="mt-2 text-sm text-[var(--secondary)]">
          This will update the existing entry for {date}
        </p>
      )}
    </form>
  );
}
