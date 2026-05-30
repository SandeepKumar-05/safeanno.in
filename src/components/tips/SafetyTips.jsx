import React from 'react';
import TipCard from './TipCard';
import SectionHeading from '../ui/SectionHeading';
import { SAFETY_TIPS } from '../../lib/constants';

/**
 * Safety tips section — rendered from constants, not hardcoded
 */
export default function SafetyTips() {
  return (
    <section className="safety-tips" id="safety-tips-section">
      <SectionHeading
        titleMl="സുരക്ഷാ നിർദ്ദേശങ്ങൾ"
        titleEn="Safety Tips"
        icon="🛡️"
      />
      <div className="safety-tips__grid">
        {SAFETY_TIPS.map((tip) => (
          <TipCard key={tip.type} tip={tip} />
        ))}
      </div>
    </section>
  );
}
