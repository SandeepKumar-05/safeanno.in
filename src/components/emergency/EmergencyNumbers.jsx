import React from 'react';
import { EMERGENCY_NUMBERS } from '../../lib/constants';
import SectionHeading from '../ui/SectionHeading';

/**
 * Emergency numbers grid — one-tap dial cards.
 */
export default function EmergencyNumbers() {
  return (
    <section className="emergency-section" id="emergency-section">
      <SectionHeading
        icon="📞"
        titleMl="അടിയന്തര നമ്പറുകൾ"
        subtitleEn="Emergency Numbers — tap to call"
      />
      <div className="emergency-grid">
        {EMERGENCY_NUMBERS.map((item) => (
          <a
            key={item.number}
            href={`tel:${item.number}`}
            className="emergency-card"
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
