import React from 'react';

/**
 * Single safety tip card
 */
export default function TipCard({ tip }) {
  return (
    <div className="tip-card" id={`tip-${tip.type}`}>
      <span className="tip-card__icon">{tip.icon}</span>
      <div className="tip-card__content">
        <h4 className="tip-card__title">{tip.titleMl}</h4>
        <p className="tip-card__desc-ml">{tip.descMl}</p>
        <p className="tip-card__desc-en">{tip.descEn}</p>
      </div>
    </div>
  );
}
