import React from 'react';
import { SEVERITY_LEVELS } from '../../lib/constants';

/**
 * Severity level picker — Low / Medium / High
 */
export default function SeverityPicker({ selected, onSelect }) {
  return (
    <div className="severity-picker">
      <label className="form-label">
        തീവ്രത (Severity) <span className="required">*</span>
      </label>
      <div className="severity-options">
        {SEVERITY_LEVELS.map((level) => (
          <button
            key={level.id}
            type="button"
            className={`severity-btn ${selected === level.id ? 'severity-btn--active' : ''}`}
            onClick={() => onSelect(level.id)}
            style={{ '--severity-color': level.color }}
            id={`severity-${level.id}`}
          >
            <span
              className="severity-btn__dot"
              style={{ background: level.color }}
            />
            <span className="severity-btn__label">
              {level.labelMl}
              <small> ({level.labelEn})</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
