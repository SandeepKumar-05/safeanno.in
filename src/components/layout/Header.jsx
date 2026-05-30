import React from 'react';
import './Header.css';

/**
 * App header with branding and navigation
 */
export default function Header({ onScrollTo }) {
  return (
    <header className="app-header" id="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <span className="app-header__logo" role="img" aria-label="Water wave">🌊</span>
          <div>
            <h1 className="app-header__title">വെള്ളം കേറിയോ?</h1>
            <p className="app-header__subtitle">Kerala Community Disaster Alerts</p>
          </div>
        </div>

        <nav className="app-header__nav">
          <button
            className="app-header__nav-btn"
            onClick={() => onScrollTo?.('map-section')}
          >
            🗺️ <span className="nav-label">മാപ്പ്</span>
          </button>
          <button
            className="app-header__nav-btn"
            onClick={() => onScrollTo?.('districts-section')}
          >
            🏛️ <span className="nav-label">ജില്ലകൾ</span>
          </button>
          <button
            className="app-header__nav-btn"
            onClick={() => onScrollTo?.('emergency-section')}
          >
            🆘 <span className="nav-label">അടിയന്തരം</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
