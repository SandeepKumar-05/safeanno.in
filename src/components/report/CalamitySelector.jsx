import React from 'react';
import { DISASTER_TYPES } from '../../lib/constants';

/**
 * Grid of disaster type buttons for report form
 */
export default function CalamitySelector({ selected, onSelect }) {
  return (
    <div className="calamity-selector">
      <label className="form-label">
        ദുരന്ത തരം (Disaster Type) <span className="required">*</span>
      </label>
      <div className="calamity-grid">
        {DISASTER_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            className={`calamity-btn ${selected === type.id ? 'calamity-btn--active' : ''}`}
            onClick={() => onSelect(type.id)}
            style={{
              '--type-color': type.color,
            }}
            id={`calamity-${type.id}`}
          >
            <span className="calamity-btn__icon">{type.icon}</span>
            <span className="calamity-btn__label-ml">{type.labelMl}</span>
            <span className="calamity-btn__label-en">{type.labelEn}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
