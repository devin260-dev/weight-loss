'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LEVEL_COLORS, LEVEL_NAMES } from '@/lib/constants';

interface AvatarProps {
  level: number;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Level-specific glow colors
const GLOW_COLORS: Record<number, { primary: string; secondary: string }> = {
  1: { primary: '#00ff00', secondary: '#00cc00' }, // Green
  2: { primary: '#00bfff', secondary: '#0080ff' }, // Blue
  3: { primary: '#bf00ff', secondary: '#8000ff' }, // Purple
  4: { primary: '#ffd700', secondary: '#ffaa00' }, // Gold
  5: { primary: '#ff0000', secondary: '#ff00ff' }, // Rainbow (animated)
};

export default function Avatar({ level, animated = false, size = 'md' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-64 h-64',
    md: 'w-96 h-96',
    lg: 'w-[512px] h-[512px]',
  };

  const levelColor = LEVEL_COLORS[level] || LEVEL_COLORS[1];
  const levelName = LEVEL_NAMES[level] || LEVEL_NAMES[1];
  const glowColors = GLOW_COLORS[level] || GLOW_COLORS[1];
  const isRainbow = level === 5;

  // Pixel art character fallback using CSS
  const renderFallbackAvatar = () => {
    const pixelSize = size === 'sm' ? 16 : size === 'md' ? 24 : 32;

    return (
      <div
        className={`${sizeClasses[size]} flex items-center justify-center`}
        style={{
          backgroundColor: '#2d1b4e',
          border: `4px solid ${levelColor}`,
          boxShadow: `0 0 ${animated ? '20px' : '10px'} ${levelColor}`,
        }}
      >
        {/* Simple pixel character made with divs */}
        <div className="relative" style={{ width: pixelSize * 8, height: pixelSize * 10 }}>
          {/* Head */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: pixelSize * 2,
              width: pixelSize * 4,
              height: pixelSize * 4,
              backgroundColor: levelColor,
            }}
          />
          {/* Eyes */}
          <div
            style={{
              position: 'absolute',
              top: pixelSize,
              left: pixelSize * 2.5,
              width: pixelSize,
              height: pixelSize,
              backgroundColor: '#1a0a2e',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: pixelSize,
              left: pixelSize * 4.5,
              width: pixelSize,
              height: pixelSize,
              backgroundColor: '#1a0a2e',
            }}
          />
          {/* Body */}
          <div
            style={{
              position: 'absolute',
              top: pixelSize * 4,
              left: pixelSize,
              width: pixelSize * 6,
              height: pixelSize * 4,
              backgroundColor: levelColor,
              opacity: 0.8,
            }}
          />
          {/* Arms */}
          <div
            style={{
              position: 'absolute',
              top: pixelSize * 5,
              left: 0,
              width: pixelSize,
              height: pixelSize * 2,
              backgroundColor: levelColor,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: pixelSize * 5,
              left: pixelSize * 7,
              width: pixelSize,
              height: pixelSize * 2,
              backgroundColor: levelColor,
            }}
          />
          {/* Legs */}
          <div
            style={{
              position: 'absolute',
              top: pixelSize * 8,
              left: pixelSize * 2,
              width: pixelSize * 1.5,
              height: pixelSize * 2,
              backgroundColor: levelColor,
              opacity: 0.7,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: pixelSize * 8,
              left: pixelSize * 4.5,
              width: pixelSize * 1.5,
              height: pixelSize * 2,
              backgroundColor: levelColor,
              opacity: 0.7,
            }}
          />
        </div>
      </div>
    );
  };

  const sizePixels = {
    sm: 256,
    md: 384,
    lg: 512,
  };

  // Generate dramatic glow box-shadow
  const getGlowStyle = () => {
    const baseGlow = animated ? 40 : 20;
    const extraGlow = animated ? 80 : 40;

    if (isRainbow) {
      // Rainbow gets multiple colored glows
      return `
        0 0 ${baseGlow}px #ff0000,
        0 0 ${baseGlow + 20}px #ff8000,
        0 0 ${extraGlow}px #ffff00,
        0 0 ${extraGlow + 20}px #00ff00,
        0 0 ${extraGlow + 40}px #00ffff,
        0 0 ${extraGlow + 60}px #8000ff
      `;
    }

    return `
      0 0 ${baseGlow}px ${glowColors.primary},
      0 0 ${extraGlow}px ${glowColors.primary},
      0 0 ${extraGlow + 30}px ${glowColors.secondary}
    `;
  };

  return (
    <div className="relative">
      {/* Animated glow layers */}
      {animated && (
        <>
          {/* Outer pulsing glow */}
          <div
            className={`absolute inset-0 rounded-lg ${isRainbow ? 'animate-rainbow-glow' : 'animate-glow-pulse'}`}
            style={{
              background: isRainbow
                ? 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0080ff, #8000ff, #ff0080, #ff0000)'
                : `radial-gradient(circle, ${glowColors.primary}40, transparent 70%)`,
              filter: 'blur(30px)',
              transform: 'scale(1.3)',
            }}
          />
          {/* Inner intense glow */}
          <div
            className={`absolute inset-0 rounded-lg ${isRainbow ? 'animate-rainbow-spin' : 'animate-glow-pulse-fast'}`}
            style={{
              background: isRainbow
                ? 'conic-gradient(from 180deg, #ff0000, #ffff00, #00ff00, #00ffff, #8000ff, #ff0000)'
                : `radial-gradient(circle, ${glowColors.primary}60, transparent 60%)`,
              filter: 'blur(20px)',
              transform: 'scale(1.15)',
            }}
          />
        </>
      )}

      {/* Avatar image */}
      {!imageError ? (
        <Image
          src={`/avatars/level${level}.png`}
          alt={`Level ${level} - ${levelName}`}
          width={sizePixels[size]}
          height={sizePixels[size]}
          className={`${sizeClasses[size]} pixel-art relative z-10 ${animated ? 'animate-float' : ''}`}
          style={{
            border: `4px solid ${glowColors.primary}`,
            boxShadow: getGlowStyle(),
            imageRendering: 'pixelated',
            objectFit: 'contain',
          }}
          onError={() => setImageError(true)}
          unoptimized
        />
      ) : (
        <div className={`relative z-10 ${animated ? 'animate-float' : ''}`}>
          {renderFallbackAvatar()}
        </div>
      )}

      {/* Particle effects for animated state */}
      {animated && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-sparkle"
              style={{
                backgroundColor: isRainbow
                  ? ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#00ffff', '#0080ff', '#8000ff', '#ff0080'][i]
                  : glowColors.primary,
                left: `${10 + (i * 12)}%`,
                top: `${20 + ((i % 3) * 25)}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1.3); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes glow-pulse-fast {
          0%, 100% { opacity: 0.6; transform: scale(1.15); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        @keyframes rainbow-glow {
          0%, 100% { opacity: 0.6; transform: scale(1.3) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
        }
        @keyframes rainbow-spin {
          0% { transform: scale(1.15) rotate(0deg); }
          100% { transform: scale(1.15) rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) translateY(0); }
          50% { opacity: 1; transform: scale(1.5) translateY(-20px); }
        }
        .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
        .animate-glow-pulse-fast { animation: glow-pulse-fast 1.5s ease-in-out infinite; }
        .animate-rainbow-glow { animation: rainbow-glow 3s ease-in-out infinite; }
        .animate-rainbow-spin { animation: rainbow-spin 4s linear infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
