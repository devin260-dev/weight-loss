'use client';

import { Volume2, VolumeX } from 'lucide-react';

interface MuteToggleProps {
  isMuted: boolean;
  onToggle: () => void;
}

export default function MuteToggle({ isMuted, onToggle }: MuteToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="fixed top-4 right-4 z-40 pixel-card p-2 hover:scale-110 transition-transform"
      aria-label={isMuted ? 'Unmute music' : 'Mute music'}
      title={isMuted ? 'Unmute music' : 'Mute music'}
    >
      {isMuted ? (
        <VolumeX className="w-6 h-6 text-[var(--text-muted)]" />
      ) : (
        <Volume2 className="w-6 h-6 text-[var(--primary)]" />
      )}
    </button>
  );
}
