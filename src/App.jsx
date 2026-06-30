import React, { useState, useRef, useCallback } from 'react';

// Fix Leaflet default marker icon issue
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Context providers
import { SessionProvider } from './context/SessionContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import Header from './components/layout/Header';
import AlertTicker from './components/layout/AlertTicker';
import AlertBanner from './components/layout/AlertBanner';
import Footer from './components/layout/Footer';

// Components
import RainBackground from './components/ui/RainBackground';
import Toast from './components/ui/Toast';
import EmergencyBar from './components/ui/EmergencyBar';
import OfflineBanner from './components/ui/OfflineBanner';
import StatsRow from './components/stats/StatsRow'; // keep stats row eager since it's above the fold

// Lazy-loaded components
const MapView = React.lazy(() => import('./components/map/MapView'));
const ReportForm = React.lazy(() => import('./components/report/ReportForm'));
const LiveFeed = React.lazy(() => import('./components/feed/LiveFeed'));
const RouteAlert = React.lazy(() => import('./components/alerts/RouteAlert'));
const WeatherAlertPanel = React.lazy(() => import('./components/alerts/WeatherAlertPanel'));
const DrivingAlert = React.lazy(() => import('./components/alerts/DrivingAlert'));
const SafetyTips = React.lazy(() => import('./components/tips/SafetyTips'));
const EmergencyNumbers = React.lazy(() => import('./components/emergency/EmergencyNumbers'));

// Hooks
import { useReports } from './hooks/useReports';
import { useSession } from './hooks/useSession';
import { useGeolocation } from './hooks/useGeolocation';
import { useToast } from './hooks/useToast';
import { useTravelAlert } from './hooks/useTravelAlert';

// Utils
import { confirmReport } from './components/alerts/PushManager';

/**
 * Inner app component (inside providers) — manages state and composes all sections
 */
function AppContent() {
  const { reports, loading } = useReports();
  const sessionId = useSession();
  const { position, accuracy, getPosition } = useGeolocation();
  const { addToast } = useToast();
  const mapRef = useRef(null);

  const [showReportForm, setShowReportForm] = useState(false);
  const [reportCoords, setReportCoords] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [drivingAlertReport, setDrivingAlertReport] = useState(null);

  // Geofencing while driving — triggers fullscreen alert
  const { isTracking } = useTravelAlert({
    enabled: !!routeData,
    reports,
    onAlert: useCallback((report) => {
      setDrivingAlertReport(report);
    }, []),
  });

  // Handle map click — set coords for report form
  const handleMapClick = useCallback((coords) => {
    setReportCoords(coords);
    if (!showReportForm) {
      setShowReportForm(true);
    }
  }, [showReportForm]);

  // Handle report button click
  const handleReportClick = useCallback(() => {
    setShowReportForm(true);
    setTimeout(() => {
      document.getElementById('report-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }, []);

  // Handle feed card click — fly map to location
  const handleFeedCardClick = useCallback((report) => {
    if (report.location?.coordinates) {
      const [lng, lat] = report.location.coordinates;
      mapRef.current?.flyTo(lat, lng, 13);
    }
  }, []);

  // Handle confirm report
  const handleConfirm = useCallback(
    async (reportId) => {
      if (!sessionId) return;
      try {
        await confirmReport(reportId, sessionId);
        addToast('✅ സ്ഥിരീകരിച്ചു! (Confirmed!)', 'success');
      } catch (err) {
        addToast(err.message, 'warning');
      }
    },
    [sessionId, addToast]
  );

  // Handle route calculated from RouteAlert
  const handleRouteCalculated = useCallback((route) => {
    setRouteData(route);
  }, []);

  // Smooth scroll to a section
  const handleScrollTo = useCallback((sectionId) => {
    if (sectionId === 'report-form') {
      handleReportClick();
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [handleReportClick]);

  // Dismiss driving alert
  const handleDrivingAlertDismiss = useCallback(() => {
    setDrivingAlertReport(null);
  }, []);

  return (
    <>
      <RainBackground />
      <div className="app-wrapper">
        <Header onScrollTo={handleScrollTo} />
        <AlertTicker />
        <OfflineBanner />
        <AlertBanner />

        <main className="app-main">
          <StatsRow />

          <div className="map-feed-layout">
            <div>
              <MapView
                ref={mapRef}
                reports={reports}
                onMapClick={handleMapClick}
                onConfirm={handleConfirm}
                onReportClick={handleReportClick}
                sessionId={sessionId}
                userPosition={position}
                userAccuracy={accuracy}
                routeData={routeData}
              />

              {showReportForm && (
                <ReportForm
                  coords={reportCoords}
                  onClose={() => {
                    setShowReportForm(false);
                    setReportCoords(null);
                  }}
                  onSubmitted={() => {
                    setShowReportForm(false);
                    setReportCoords(null);
                  }}
                />
              )}
            </div>

            <LiveFeed
              reports={reports}
              loading={loading}
              onCardClick={handleFeedCardClick}
              onConfirm={handleConfirm}
            />
          </div>

          {/* Weather Alert Panel — district-wise live alerts */}
          <WeatherAlertPanel />

          {/* Route Safety Check */}
          <RouteAlert onRouteCalculated={handleRouteCalculated} />

          <SafetyTips />
          <EmergencyNumbers />
        </main>

        <Footer />
      </div>
      
      <button
        className="report-fab"
        onClick={handleReportClick}
        type="button"
        title="Report an Incident"
      >
        <span style={{ fontSize: '1.2rem' }}>🚨</span> Report Incident
      </button>

      <Toast />
      <EmergencyBar />

      {/* Fullscreen driving alert overlay */}
      {drivingAlertReport && (
        <DrivingAlert
          report={drivingAlertReport}
          onDismiss={handleDrivingAlertDismiss}
        />
      )}
    </>
  );
}

/**
 * Root App component — wraps everything in context providers
 */
export default function App() {
  return (
    <SessionProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </SessionProvider>
  );
}
