import React from 'react';
import SectionHeading from '../ui/SectionHeading';
import { EMERGENCY_NUMBERS } from '../../lib/constants';

/**
 * Emergency contact numbers section
 */
export default function EmergencyNumbers() {
  return (
    <section className="emergency-section" id="emergency-section">
      <SectionHeading
        titleMl="അടിയന്തര നമ്പറുകൾ"
        titleEn="Emergency Numbers"
        icon="🆘"
      />
      <div className="emergency-grid">
        {EMERGENCY_NUMBERS.map((item) => (
          <a
            key={item.number}
            href={`tel:${item.number}`}
            className="emergency-card"
            id={`emergency-${item.number}`}
          >
            <span className="emergency-card__number">{item.number}</span>
            <span className="emergency-card__label-ml">{item.labelMl}</span>
            <span className="emergency-card__label-en">{item.labelEn}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
