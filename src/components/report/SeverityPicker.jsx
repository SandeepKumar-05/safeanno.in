import React from 'react';
import { SEVERITY_LEVELS } from '../../lib/constants';

/**
 * Severity level picker — Low / Medium / High with color-coded buttons.
 */
export default function SeverityPicker({ selected, onSelect }) {
  return (
    <div className="severity-picker">
      {SEVERITY_LEVELS.map((sev) => (
        <button
          key={sev.id}
          type="button"
          className={`severity-btn ${selected === sev.id ? 'severity-btn--selected' : ''}`}
          onClick={() => onSelect(sev.id)}
          style={
            selected === sev.id
              ? { backgroundColor: sev.color, borderColor: sev.color }
              : undefined
          }
        >
          {sev.labelMl}
          <br />
          <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{sev.labelEn}</span>
        </button>
      ))}
    </div>
  );
}
