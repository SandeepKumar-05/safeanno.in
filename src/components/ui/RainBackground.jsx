import React, { useMemo } from 'react';

/**
 * Animated rain background — CSS-driven falling drops.
 */
export default function RainBackground() {
  const drops = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      width: `${1 + Math.random() * 2}px`,
      height: `${10 + Math.random() * 20}px`,
      duration: `${1.5 + Math.random() * 2}s`,
      delay: `${Math.random() * 3}s`,
      opacity: 0.2 + Math.random() * 0.3,
    }));
  }, []);

  return (
    <div className="rain-background" aria-hidden="true">
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: drop.left,
            width: drop.width,
            height: drop.height,
            animationDuration: drop.duration,
            animationDelay: drop.delay,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
}
