import React from 'react';

/**
 * Fixed bottom emergency bar — mobile only.
 * One-tap dial for 112 (Emergency) and 1077 (KSDMA).
 */
export default function EmergencyBar() {
  return (
    <div className="emergency-bar" id="emergency-bar">
      <a href="tel:112" className="emergency-bar__item">
        <span>🚨</span>
        <strong>112</strong>
        <span className="emergency-bar__label">Emergency</span>
      </a>
      <a href="tel:1077" className="emergency-bar__item">
        <span>📞</span>
        <strong>1077</strong>
        <span className="emergency-bar__label">KSDMA</span>
      </a>
    </div>
  );
}
