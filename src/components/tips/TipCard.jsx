import React from 'react';

/**
 * Individual safety tip card with bilingual text.
 */
export default function TipCard({ tip }) {
  return (
    <div className="tip-card">
      <span className="tip-card__icon">{tip.icon}</span>
      <div>
        <h4 className="tip-card__title">{tip.titleMl}</h4>
        <p className="tip-card__desc-ml">{tip.descMl}</p>
        <p className="tip-card__desc-en">{tip.descEn}</p>
      </div>
    </div>
  );
}
