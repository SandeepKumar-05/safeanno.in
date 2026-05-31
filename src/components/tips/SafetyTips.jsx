import React from 'react';
import { SAFETY_TIPS } from '../../lib/constants';
import TipCard from './TipCard';
import SectionHeading from '../ui/SectionHeading';

/**
 * Safety tips grid — bilingual disaster safety guidelines.
 */
export default function SafetyTips() {
  return (
    <section id="safety-tips">
      <SectionHeading
        icon="🛡️"
        titleMl="സുരക്ഷാ നിർദ്ദേശങ്ങൾ"
        subtitleEn="Safety Tips"
      />
      <div className="safety-tips__grid">
        {SAFETY_TIPS.map((tip) => (
          <TipCard key={tip.type} tip={tip} />
        ))}
      </div>
    </section>
  );
}
