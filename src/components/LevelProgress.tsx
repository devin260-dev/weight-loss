'use client';

import { LEVEL_COLORS, LEVEL_NAMES, TOTAL_LEVELS } from '@/lib/constants';

interface LevelProgressProps {
  level: number;
  progress: number; // 0-100
  poundsRemaining: number | null;
}

export default function LevelProgress({ level, progress, poundsRemaining }: LevelProgressProps) {
  const levelColor = LEVEL_COLORS[level] || LEVEL_COLORS[1];
  const levelName = LEVEL_NAMES[level] || LEVEL_NAMES[1];
  const isMaxLevel = level >= TOTAL_LEVELS;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-bold"
            style={{ color: levelColor }}
          >
            Level {level}
          </span>
          <span className="text-sm text-[var(--text-muted)]">
            {levelName}
          </span>
        </div>
        {!isMaxLevel && (
          <span className="text-sm text-[var(--text-muted)]">
            {Math.round(progress)}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-4 bg-[var(--background-light)] border-2 border-[var(--primary)] relative overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${isMaxLevel ? 100 : progress}%`,
            backgroundColor: levelColor,
            boxShadow: `0 0 10px ${levelColor}`,
          }}
        />
        {/* Pixel-style segments */}
        <div className="absolute inset-0 flex">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-[var(--background)]"
              style={{ opacity: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Status text */}
      <div className="text-sm text-[var(--text-muted)]">
        {isMaxLevel ? (
          <span style={{ color: levelColor }}>
            MAX LEVEL ACHIEVED!
          </span>
        ) : poundsRemaining !== null ? (
          <span>
            <span style={{ color: levelColor }}>
              {poundsRemaining.toFixed(1)} lbs
            </span>
            {' '}to Level {level + 1}
          </span>
        ) : (
          <span>Keep logging to see progress!</span>
        )}
      </div>
    </div>
  );
}
