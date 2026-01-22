'use client';

import { useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import Avatar from './Avatar';
import { LEVEL_COLORS, LEVEL_NAMES, LEVEL_MESSAGES } from '@/lib/constants';

interface LevelUpModalProps {
  newLevel: number;
  onConfirm: () => void;
}

export default function LevelUpModal({ newLevel, onConfirm }: LevelUpModalProps) {
  const levelColor = LEVEL_COLORS[newLevel] || LEVEL_COLORS[1];
  const levelName = LEVEL_NAMES[newLevel] || LEVEL_NAMES[1];
  const levelMessage = LEVEL_MESSAGES[newLevel] || '';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef(false);

  const playSound = useCallback(() => {
    if (hasPlayedRef.current) return;

    try {
      // Create new audio instance each time to avoid stale state
      const audio = new Audio('/sounds/levelup.mp3');
      audioRef.current = audio;
      audio.volume = 0.7;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            hasPlayedRef.current = true;
            console.log('Level up sound played successfully');
          })
          .catch((error) => {
            console.warn('Audio playback failed:', error.message);
            // Audio blocked by browser - will try again on user interaction
          });
      }
    } catch (error) {
      console.error('Error creating audio:', error);
    }
  }, []);

  // Try to play sound when modal appears
  useEffect(() => {
    playSound();

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [playSound]);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: [levelColor, '#ffd700', '#00ff00', '#ff6b9d'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: [levelColor, '#ffd700', '#00ff00', '#ff6b9d'],
      });
    }, 250);
  }, [levelColor]);

  useEffect(() => {
    fireConfetti();
  }, [fireConfetti]);

  const handleConfirm = () => {
    // Try to play sound on user interaction (in case autoplay was blocked)
    playSound();

    // Fire one more burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: [levelColor, '#ffd700', '#00ff00'],
    });

    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div
        className="pixel-card p-8 max-w-sm w-full text-center animate-bounce-in"
        style={{
          borderColor: levelColor,
          boxShadow: `0 0 30px ${levelColor}, inset 0 0 30px ${levelColor}20`,
        }}
      >
        {/* Flashing text */}
        <h2
          className="text-2xl mb-6 animate-pulse"
          style={{ color: levelColor }}
        >
          LEVEL UP!
        </h2>

        {/* Avatar with glow */}
        <div className="flex justify-center mb-6">
          <Avatar level={newLevel} size="lg" animated />
        </div>

        {/* Level info */}
        <div className="mb-6">
          <p className="text-3xl font-bold mb-2" style={{ color: levelColor }}>
            Level {newLevel}
          </p>
          <p className="text-lg text-[var(--secondary)]">
            {levelName}
          </p>
        </div>

        {/* Message */}
        <p className="text-sm text-[var(--text-muted)] mb-8">
          {levelMessage}
        </p>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          className="pixel-button w-full text-lg"
          style={{
            backgroundColor: levelColor,
            borderColor: levelColor,
          }}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
