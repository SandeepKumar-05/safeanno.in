import React from 'react';
import DistrictCard from './DistrictCard';
import SectionHeading from '../ui/SectionHeading';
import { useDistricts } from '../../hooks/useDistricts';

/**
 * Grid of all 14 Kerala districts with their alert levels.
 * Data comes from Supabase districts table, updated via IMD sync.
 */
export default function DistrictGrid() {
  const { districts, loading, activeAlertCount } = useDistricts();

  return (
    <section className="district-grid-section" id="districts-section">
      <SectionHeading
        titleMl="ജില്ലാ മുന്നറിയിപ്പുകൾ"
        titleEn={`District Alerts${activeAlertCount > 0 ? ` — ${activeAlertCount} active` : ''}`}
        icon="🗺️"
      />

      {loading ? (
        <div className="district-loading">
          <span className="spinner" /> ലോഡ് ചെയ്യുന്നു...
        </div>
      ) : (
        <div className="district-grid">
          {districts.map((district) => (
            <DistrictCard key={district.id} district={district} />
          ))}
        </div>
      )}
    </section>
  );
}
