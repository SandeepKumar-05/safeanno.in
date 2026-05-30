import React, { useState, useRef, useEffect } from 'react';
import CalamitySelector from './CalamitySelector';
import SeverityPicker from './SeverityPicker';
import LocationDetect from './LocationDetect';
import { supabase } from '../../lib/supabase';
import { reverseGeocode } from '../../lib/geocode';
import { useSession } from '../../hooks/useSession';
import { useRateLimit } from '../../hooks/useRateLimit';
import { useToast } from '../../hooks/useToast';
import { useGeolocation } from '../../hooks/useGeolocation';
import { REPORT_EXPIRY_HOURS } from '../../lib/constants';
import './ReportForm.css';

/**
 * Complete report submission form.
 * Collects disaster type, severity, location, and message.
 */
export default function ReportForm({ coords, onClose, onSubmitted }) {
  const sessionId = useSession();
  const { isLimited, waitSeconds, recordSubmission } = useRateLimit();
  const { addToast } = useToast();
  const { position: gpsPosition, loading: gpsLoading, refresh: refreshGps } = useGeolocation();
  const formRef = useRef(null);

  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(coords || null);
  const [placeName, setPlaceName] = useState('');
  const [district, setDistrict] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // Scroll into view on mount
  useEffect(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Update location when coords prop changes (map click)
  useEffect(() => {
    if (coords) {
      setLocation(coords);
      setGeoLoading(true);
      reverseGeocode(coords.lat, coords.lng).then((result) => {
        if (result) {
          setPlaceName(result.placeName);
          setDistrict(result.district);
        }
        setGeoLoading(false);
      });
    }
  }, [coords]);

  const handleDetectGps = async () => {
    refreshGps();
    if (gpsPosition) {
      setLocation({ lat: gpsPosition.lat, lng: gpsPosition.lng });
      setGeoLoading(true);
      const result = await reverseGeocode(gpsPosition.lat, gpsPosition.lng);
      if (result) {
        setPlaceName(result.placeName);
        setDistrict(result.district);
      }
      setGeoLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type) {
      addToast('ദുരന്ത തരം തിരഞ്ഞെടുക്കുക (Select disaster type)', 'warning');
      return;
    }
    if (!severity) {
      addToast('തീവ്രത തിരഞ്ഞെടുക്കുക (Select severity)', 'warning');
      return;
    }
    if (!location) {
      addToast('സ്ഥാനം നൽകുക (Set location on map or use GPS)', 'warning');
      return;
    }
    if (!message.trim()) {
      addToast('വിവരണം നൽകുക (Enter a description)', 'warning');
      return;
    }
    if (!sessionId) {
      addToast('Session not ready, please wait...', 'error');
      return;
    }
    if (isLimited) {
      addToast(
        `${waitSeconds} സെക്കൻഡ് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക (Wait ${waitSeconds}s)`,
        'warning'
      );
      return;
    }

    setSubmitting(true);

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + REPORT_EXPIRY_HOURS);

      const { error: insertError } = await supabase.from('reports').insert({
        type,
        severity,
        message: message.trim(),
        location: `SRID=4326;POINT(${location.lng} ${location.lat})`,
        place_name: placeName || null,
        district: district || null,
        session_id: sessionId,
        expires_at: expiresAt.toISOString(),
      });

      if (insertError) throw insertError;

      recordSubmission();
      addToast('✅ റിപ്പോർട്ട് സമർപ്പിച്ചു! (Report submitted!)', 'success');

      // Reset form
      setType('');
      setSeverity('');
      setMessage('');
      setLocation(null);
      setPlaceName('');
      setDistrict('');

      onSubmitted?.();
      onClose?.();
    } catch (err) {
      console.error('Report submission error:', err);
      addToast(
        `റിപ്പോർട്ട് പരാജയപ്പെട്ടു: ${err.message} (Submission failed)`,
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="report-form" onSubmit={handleSubmit} ref={formRef} id="report-form">
      <div className="report-form__header">
        <h3 className="report-form__title">
          🚨 ദുരന്തം റിപ്പോർട്ട് ചെയ്യുക
          <small style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Report a Disaster
          </small>
        </h3>
        {onClose && (
          <button
            type="button"
            className="report-form__close"
            onClick={onClose}
            aria-label="Close form"
          >
            ✕
          </button>
        )}
      </div>

      <CalamitySelector selected={type} onSelect={setType} />
      <SeverityPicker selected={severity} onSelect={setSeverity} />
      <LocationDetect
        coords={location}
        placeName={placeName}
        loading={gpsLoading || geoLoading}
        onDetect={handleDetectGps}
      />

      <label className="form-label">
        വിവരണം (Description) <span className="required">*</span>
      </label>
      <textarea
        className="report-form__textarea"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="എന്താണ് സംഭവിച്ചത്? (What happened?)"
        maxLength={500}
        id="report-message"
      />

      <button
        type="submit"
        className="report-form__submit"
        disabled={submitting || isLimited}
        id="report-submit-btn"
      >
        {submitting ? (
          <>
            <span className="spinner" /> സമർപ്പിക്കുന്നു...
          </>
        ) : (
          '🚨 റിപ്പോർട്ട് സമർപ്പിക്കുക (Submit Report)'
        )}
      </button>

      {isLimited && (
        <p className="report-form__rate-limit">
          ⏱️ {waitSeconds} സെക്കൻഡ് കഴിഞ്ഞ് വീണ്ടും ശ്രമിക്കുക
          <br />
          <small>Please wait {waitSeconds}s before submitting again</small>
        </p>
      )}
    </form>
  );
}
