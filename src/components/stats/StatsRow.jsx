import React, { useState, useEffect } from 'react';
import { useReports } from '../../hooks/useReports';
import { useDistricts } from '../../hooks/useDistricts';
import Skeleton from '../ui/Skeleton';
import SectionHeading from '../ui/SectionHeading';

/**
 * Stats dashboard row — active reports, today's count, districts on alert.
 * Shows skeleton loading states instead of 0.
 */
export default function StatsRow() {
  const { reports, loading: reportsLoading, getTodayCount } = useReports();
  const { districts, loading: districtsLoading } = useDistricts();
  const [todayCount, setTodayCount] = useState(null);

  useEffect(() => {
    getTodayCount().then(setTodayCount);
  }, [getTodayCount]);

  const activeCount = reports.length;
  const alertDistricts = (districts || []).filter(
    (d) => d.alert_level !== 'green'
  ).length;

  const isLoading = reportsLoading || districtsLoading;

  return (
    <section id="stats-section">
      <div className="stats-row">
        <div className="stats-card">
          <span className="stats-card__icon">🌊</span>
          {isLoading ? (
            <Skeleton width="60px" height="2rem" />
          ) : (
            <span className="stats-card__value">{activeCount}</span>
          )}
          <span className="stats-card__label-ml">സജീവ റിപ്പോർട്ടുകൾ</span>
          <span className="stats-card__label-en">Active Reports</span>
        </div>

        <div className="stats-card">
          <span className="stats-card__icon">📊</span>
          {todayCount === null ? (
            <Skeleton width="60px" height="2rem" />
          ) : (
            <span className="stats-card__value">{todayCount}</span>
          )}
          <span className="stats-card__label-ml">ഇന്നത്തെ റിപ്പോർട്ടുകൾ</span>
          <span className="stats-card__label-en">Today&apos;s Reports</span>
        </div>

        <div className="stats-card">
          <span className="stats-card__icon">⚠️</span>
          {isLoading ? (
            <Skeleton width="60px" height="2rem" />
          ) : (
            <span className="stats-card__value">{alertDistricts}</span>
          )}
          <span className="stats-card__label-ml">ജില്ലകൾ അലർട്ടിൽ</span>
          <span className="stats-card__label-en">Districts on Alert</span>
        </div>
      </div>
    </section>
  );
}
