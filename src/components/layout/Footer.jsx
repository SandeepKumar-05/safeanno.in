import React from 'react';

/**
 * App footer with credits
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer" id="app-footer">
      <div className="app-footer__inner">
        <p className="app-footer__text">
          🌊 വെള്ളം കേറിയോ? — കേരളത്തിലെ ജനകീയ ദുരന്ത മുന്നറിയിപ്പ് സംവിധാനം
        </p>
        <p className="app-footer__text-en">
          Community Disaster Alert System for Kerala &copy; {year}
        </p>
        <p className="app-footer__credits">
          Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
          &nbsp;|&nbsp;
          Weather data © <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer">IMD</a>
        </p>
      </div>
    </footer>
  );
}
