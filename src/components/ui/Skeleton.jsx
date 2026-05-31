import React from 'react';

/**
 * Reusable skeleton loading placeholder with shimmer animation.
 * @param {object} props
 * @param {string} [props.width='100%'] — CSS width
 * @param {string} [props.height='1em'] — CSS height
 * @param {string} [props.borderRadius='6px'] — CSS border-radius
 * @param {number} [props.count=1] — number of skeleton lines
 * @param {string} [props.className] — additional class
 */
export default function Skeleton({
  width = '100%',
  height = '1em',
  borderRadius = '6px',
  count = 1,
  className = '',
  gap = '0.5rem',
}) {
  if (count === 1) {
    return (
      <div
        className={`skeleton ${className}`}
        style={{ width, height, borderRadius }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`skeleton ${className}`}
          style={{
            width: i === count - 1 ? '60%' : width,
            height,
            borderRadius,
          }}
        />
      ))}
    </div>
  );
}
