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
import MapView from './components/map/MapView';
import ReportForm from './components/report/ReportForm';
import LiveFeed from './components/feed/LiveFeed';
import StatsRow from './components/stats/StatsRow';
import DistrictGrid from './components/districts/DistrictGrid';
import RouteAlert from './components/alerts/RouteAlert';
import DrivingAlert from './components/alerts/DrivingAlert';
import SafetyTips from './components/tips/SafetyTips';
import EmergencyNumbers from './components/emergency/EmergencyNumbers';

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
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, []);

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

          <RouteAlert onRouteCalculated={handleRouteCalculated} />
          <DistrictGrid />
          <SafetyTips />
          <EmergencyNumbers />
        </main>

        <Footer />
      </div>
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
