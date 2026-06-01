import React, { useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { DISASTER_TYPES, REPORT_EXPIRY_HOURS, PHOTO_MAX_WIDTH, PHOTO_QUALITY, PHOTO_BUCKET } from '../../lib/constants';
import { canSubmitReport, markReportSubmitted } from '../../lib/spamGuard';
import { useToast } from '../../hooks/useToast';
import { useSession } from '../../hooks/useSession';
import CalamitySelector from './CalamitySelector';
import SeverityPicker from './SeverityPicker';
import LocationDetect from './LocationDetect';
import LocationAutocomplete from '../ui/LocationAutocomplete';
import SectionHeading from '../ui/SectionHeading';
import './ReportForm.css';

/**
 * Compress image client-side before upload
 */
function compressImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > PHOTO_MAX_WIDTH) {
          height = (height * PHOTO_MAX_WIDTH) / width;
          width = PHOTO_MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => resolve(blob),
          'image/jpeg',
          PHOTO_QUALITY
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Report submission form with photo upload, calamity selector,
 * severity picker, GPS detection, and success animation.
 */
export default function ReportForm({ coords, onClose, onSubmitted }) {
  const { addToast } = useToast();
  const sessionId = useSession();

  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(coords ? {
    lat: coords.lat,
    lng: coords.lng,
    placeName: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
    district: '',
  } : null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleLocationDetect = useCallback((loc) => {
    setLocation(loc);
  }, []);

  const handlePhotoSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'warning');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image too large (max 10MB)', 'warning');
      return;
    }

    setPhoto(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  }, [addToast]);

  const handleRemovePhoto = useCallback(() => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!type) { addToast('ദുരന്ത തരം തിരഞ്ഞെടുക്കുക (Select disaster type)', 'warning'); return; }
    if (!severity) { addToast('തീവ്രത തിരഞ്ഞെടുക്കുക (Select severity)', 'warning'); return; }
    if (!message.trim()) { addToast('വിവരണം എഴുതുക (Enter description)', 'warning'); return; }
    if (!location) { addToast('ലൊക്കേഷൻ കണ്ടെത്തുക (Detect location)', 'warning'); return; }

    // Rate limit check
    const { allowed, waitSeconds } = canSubmitReport();
    if (!allowed) {
      addToast(`⏳ ${waitSeconds} സെക്കൻഡ് കാത്തിരിക്കുക (Wait ${waitSeconds}s)`, 'warning');
      return;
    }

    setSubmitting(true);

    try {
      const expiresAt = new Date(Date.now() + REPORT_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

      // Build location as WKT for PostGIS
      const locationWKT = `POINT(${location.lng} ${location.lat})`;

      // Insert report
      const { data: report, error: insertError } = await supabase
        .from('reports')
        .insert({
          type,
          severity,
          message: message.trim(),
          location: locationWKT,
          place_name: location.placeName || null,
          district: location.district || null,
          session_id: sessionId,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Upload photo if selected
      if (photo && report) {
        try {
          const compressed = await compressImage(photo);
          const ext = 'jpg';
          const path = `${report.id}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from(PHOTO_BUCKET)
            .upload(path, compressed, {
              contentType: 'image/jpeg',
              upsert: false,
            });

          if (!uploadError) {
            const { data: urlData } = supabase.storage
              .from(PHOTO_BUCKET)
              .getPublicUrl(path);

            if (urlData?.publicUrl) {
              await supabase
                .from('reports')
                .update({ photo_url: urlData.publicUrl })
                .eq('id', report.id);
            }
          }
        } catch (photoErr) {
          console.error('Photo upload failed:', photoErr);
          // Don't fail the whole report for a photo error
        }
      }

      markReportSubmitted();
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        if (onSubmitted) onSubmitted();
      }, 2500);

    } catch (err) {
      console.error('Report submit error:', err);
      addToast(`❌ ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Success animation
  if (showSuccess) {
    return (
      <div className="report-form" id="report-form">
        <div className="report-success">
          <span className="report-success__check">✅</span>
          <h3 className="report-success__title">
            റിപ്പോർട്ട് സമർപ്പിച്ചു!
          </h3>
          <p className="report-success__subtitle">
            Report submitted successfully
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-form" id="report-form">
      <div className="report-form__header">
        <SectionHeading
          icon="📝"
          titleMl="ദുരന്തം റിപ്പോർട്ട് ചെയ്യുക"
          subtitleEn="Report a disaster"
        />
        {onClose && (
          <button className="report-form__close" onClick={onClose} type="button">
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="report-form__body">
        {/* Disaster type */}
        <div className="report-form__field">
          <label className="report-form__label">
            ദുരന്ത തരം <span className="report-form__label-en">(Type)</span>
          </label>
          <CalamitySelector selected={type} onSelect={setType} />
        </div>

        {/* Severity */}
        <div className="report-form__field">
          <label className="report-form__label">
            തീവ്രത <span className="report-form__label-en">(Severity)</span>
          </label>
          <SeverityPicker selected={severity} onSelect={setSeverity} />
        </div>

        {/* Location */}
        <div className="report-form__field">
          <label className="report-form__label">
            സ്ഥലം <span className="report-form__label-en">(Location)</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <LocationDetect onDetect={handleLocationDetect} />
            <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#7f8c8d' }}>അല്ലെങ്കിൽ തിരയുക (Or search)</div>
            <LocationAutocomplete 
              placeholder="കൃത്യമായ സ്ഥലം തിരയുക (Search location)"
              onSelect={handleLocationDetect}
              value={location ? { 
                lat: location.lat, 
                lng: location.lng, 
                displayName: location.placeName, 
                district: location.district 
              } : null}
            />
          </div>
          {location && (
            <p className="report-form__location-preview">
              ✓ {location.placeName}
              {location.district ? ` — ${location.district}` : ''}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="report-form__field">
          <label className="report-form__label">
            വിവരണം <span className="report-form__label-en">(Description)</span>
          </label>
          <textarea
            className="report-form__textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="എന്താണ് സംഭവിക്കുന്നത്? (What's happening?)"
            rows={3}
            maxLength={500}
          />
          <span className="report-form__char-count">
            {message.length}/500
          </span>
        </div>

        {/* Photo upload */}
        <div className="report-form__field">
          <label className="report-form__label">
            ഫോട്ടോ <span className="report-form__label-en">(Photo — optional)</span>
          </label>
          <div className="photo-upload">
            <button
              type="button"
              className="photo-upload__btn"
              onClick={() => fileInputRef.current?.click()}
            >
              📷 ഫോട്ടോ ചേർക്കുക (Add Photo)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />
            {photoPreview && (
              <>
                <img src={photoPreview} alt="Preview" className="photo-upload__preview" />
                <button
                  type="button"
                  className="photo-upload__remove"
                  onClick={handleRemovePhoto}
                >
                  ✕
                </button>
              </>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          className="report-form__submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? '⏳ സമർപ്പിക്കുന്നു...' : '🚨 റിപ്പോർട്ട് സമർപ്പിക്കുക (Submit Report)'}
        </button>
      </form>
    </div>
  );
}
