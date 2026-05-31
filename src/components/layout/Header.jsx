import React, { useState, useCallback } from 'react';
import LiveBadge from '../ui/LiveBadge';

/**
 * App header with responsive hamburger menu.
 * Desktop: logo + nav links. Mobile: logo + hamburger → fullscreen overlay.
 */

const NAV_ITEMS = [
  { id: 'map-section',       labelMl: 'മാപ്പ്',         labelEn: 'Map' },
  { id: 'report-form',       labelMl: 'റിപ്പോർട്ട്',    labelEn: 'Report' },
  { id: 'route-alert',       labelMl: 'റൂട്ട് അലേർട്ട്', labelEn: 'Route Alert' },
  { id: 'districts-section', labelMl: 'ജില്ലകൾ',        labelEn: 'Districts' },
  { id: 'emergency-section', labelMl: 'അടിയന്തരം',      labelEn: 'Emergency' },
];

export default function Header({ onScrollTo }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = useCallback((sectionId) => {
    setMenuOpen(false);
    if (onScrollTo) {
      onScrollTo(sectionId);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [onScrollTo]);

  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  return (
    <>
      <header className="app-header" id="app-header">
        <div className="app-header__inner">
          <div className="app-header__left">
            <a href="/" className="app-header__logo">🌊 വെള്ളം കേറിയോ?</a>
            <LiveBadge />
          </div>

          {/* Desktop nav */}
          <nav className="nav-links" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className="nav-links__item"
                onClick={() => handleNavClick(item.id)}
                type="button"
              >
                {item.labelEn}
              </button>
            ))}
          </nav>

          {/* Hamburger button — mobile only */}
          <button
            className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
            onClick={toggleMenu}
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Mobile fullscreen overlay menu */}
      <div className={`mobile-menu-overlay ${menuOpen ? 'mobile-menu-overlay--open' : ''}`}>
        <button
          className="mobile-menu-overlay__close"
          onClick={() => setMenuOpen(false)}
          type="button"
          aria-label="Close menu"
        >
          ✕
        </button>

        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className="mobile-menu-overlay__item"
            onClick={() => handleNavClick(item.id)}
            type="button"
          >
            {item.labelMl}
            <br />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {item.labelEn}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
