import React from 'react';
import Skeleton from '../ui/Skeleton';
import SectionHeading from '../ui/SectionHeading';
import DistrictCard from './DistrictCard';
import { useDistricts } from '../../hooks/useDistricts';

/**
 * Grid of all 14 Kerala districts with alert levels.
 * Shows skeleton loading state.
 */
export default function DistrictGrid() {
  const { districts, loading } = useDistricts();

  return (
    <section id="districts-section">
      <SectionHeading
        icon="🏛️"
        titleMl="ജില്ലാ മുന്നറിയിപ്പുകൾ"
        subtitleEn="District Alerts — IMD Data"
      />

      <div className="district-grid">
        {loading ? (
          Array.from({ length: 14 }, (_, i) => (
            <div key={i} className="district-card">
              <Skeleton width="6px" height="40px" borderRadius="3px" />
              <div style={{ flex: 1 }}>
                <Skeleton width="70%" height="1em" />
                <Skeleton width="40%" height="0.8em" />
              </div>
              <Skeleton width="50px" height="20px" borderRadius="4px" />
            </div>
          ))
        ) : (
          (districts || []).map((district) => (
            <DistrictCard key={district.id} district={district} />
          ))
        )}
      </div>
    </section>
  );
}
