import React, { useMemo } from 'react';

/**
 * Animated CSS rain background with 60 drops.
 * Pure CSS animation, no JS animation frames.
 */
export default function RainBackground() {
  const drops = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 1.5 + Math.random() * 2;
      const opacity = 0.15 + Math.random() * 0.35;
      const width = 1 + Math.random() * 1.5;
      const height = 15 + Math.random() * 25;

      return (
        <div
          key={i}
          className="rain-drop"
          style={{
            left: `${left}%`,
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            opacity,
            width: `${width}px`,
            height: `${height}px`,
          }}
        />
      );
    });
  }, []);

  return (
    <div className="rain-background" aria-hidden="true">
      {drops}
    </div>
  );
}
