import React from 'react';

/**
 * Bilingual section heading — Malayalam title with English subtitle
 */
export default function SectionHeading({ titleMl, titleEn, icon, id }) {
  return (
    <div className="section-heading" id={id}>
      <h2 className="section-heading__title">
        {icon && <span className="section-heading__icon">{icon}</span>}
        {titleMl}
      </h2>
      {titleEn && (
        <p className="section-heading__subtitle">{titleEn}</p>
      )}
    </div>
  );
}
