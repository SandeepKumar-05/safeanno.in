import React from 'react';
import { DISASTER_TYPES } from '../../lib/constants';

/**
 * Disaster type selector grid — 8 calamity types with emoji icons.
 */
export default function CalamitySelector({ selected, onSelect }) {
  return (
    <div className="calamity-selector">
      {DISASTER_TYPES.map((type) => (
        <button
          key={type.id}
          type="button"
          className={`calamity-btn ${selected === type.id ? 'calamity-btn--selected' : ''}`}
          onClick={() => onSelect(type.id)}
          style={selected === type.id ? { borderColor: type.color } : undefined}
        >
          <span className="calamity-btn__icon">{type.icon}</span>
          <span className="calamity-btn__label">{type.labelMl}</span>
        </button>
      ))}
    </div>
  );
}
