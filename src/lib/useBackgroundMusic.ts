'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseBackgroundMusicOptions {
  level: number;
  enabled: boolean;
}

export function useBackgroundMusic({ level, enabled }: UseBackgroundMusicOptions) {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('weight-quest-muted');
      return saved === 'true';
    }
    return false;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentLevelRef = useRef<number>(level);

  // Persist mute preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('weight-quest-muted', String(isMuted));
    }
  }, [isMuted]);

  // Get music file path for a level (clamp to 1-5)
  const getMusicPath = useCallback((lvl: number) => {
    const clampedLevel = Math.max(1, Math.min(5, lvl));
    return `/music/level${clampedLevel}.mp3`;
  }, []);

  // Initialize or change music when level changes
  useEffect(() => {
    if (!enabled) return;

    const musicPath = getMusicPath(level);

    // If level changed or no audio exists, create new audio
    if (currentLevelRef.current !== level || !audioRef.current) {
      // Stop and cleanup previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }

      // Create new audio for new level
      const audio = new Audio(musicPath);
      audio.loop = true;
      audio.volume = 0.3;
      audioRef.current = audio;
      currentLevelRef.current = level;

      // Handle audio events
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('error', (e) => {
        console.warn('Background music failed to load:', e);
        setIsPlaying(false);
      });

      // Start playing if not muted
      if (!isMuted) {
        audio.play().catch((error) => {
          console.warn('Background music autoplay blocked:', error.message);
        });
      }
    }

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [level, enabled, getMusicPath, isMuted]);

  // Handle mute/unmute
  useEffect(() => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.warn('Background music play failed:', error.message);
      });
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Allow manual play trigger (for user interaction to bypass autoplay restrictions)
  const play = useCallback(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch((error) => {
        console.warn('Background music play failed:', error.message);
      });
    }
  }, [isMuted]);

  return {
    isMuted,
    isPlaying,
    toggleMute,
    play,
  };
}
