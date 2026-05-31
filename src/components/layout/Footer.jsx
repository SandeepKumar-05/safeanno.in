import React from 'react';

/**
 * App footer with credits. Adds padding on mobile for emergency bar.
 */
export default function Footer() {
  return (
    <footer className="app-footer" id="app-footer">
      <div className="app-footer__inner">
        <p className="app-footer__text">
          വെള്ളം കേറിയോ? — കേരളത്തിന്റെ ദുരന്ത മുന്നറിയിപ്പ്
        </p>
        <p className="app-footer__text-en">
          Kerala&apos;s community disaster alert system
        </p>
        <p className="app-footer__credits">
          Built with ❤️ for Kerala |{' '}
          <a href="https://github.com/SandeepKumar-05/VellamKeriyo.in" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>{' '}
          | Data: IMD + KSDMA |{' '}
          <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">
            OpenStreetMap
          </a>
        </p>
      </div>
    </footer>
  );
}
