import React from 'react';

/**
 * Reusable section heading with icon, Malayalam title, and English subtitle.
 */
export default function SectionHeading({ icon, titleMl, subtitleEn }) {
  return (
    <div className="section-heading">
      <h2 className="section-heading__title">
        {icon && <span className="section-heading__icon">{icon}</span>}
        {titleMl}
      </h2>
      {subtitleEn && (
        <p className="section-heading__subtitle">{subtitleEn}</p>
      )}
    </div>
  );
}
