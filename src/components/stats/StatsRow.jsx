import React, { useState, useEffect } from 'react';
import { useReports } from '../../hooks/useReports';
import { useDistricts } from '../../hooks/useDistricts';

/**
 * Stats row showing live counts — today's reports and active district alerts.
 * Data comes from Supabase queries, not hardcoded.
 */
export default function StatsRow() {
  const { reports, getTodayCount } = useReports();
  const { activeAlertCount } = useDistricts();
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    getTodayCount().then(setTodayCount);
  }, [getTodayCount, reports.length]);

  const stats = [
    {
      icon: '📊',
      valueMl: todayCount.toString(),
      labelMl: 'ഇന്നത്തെ റിപ്പോർട്ടുകൾ',
      labelEn: "Today's Reports",
    },
    {
      icon: '🔴',
      valueMl: activeAlertCount.toString(),
      labelMl: 'സജീവ ജില്ലാ മുന്നറിയിപ്പുകൾ',
      labelEn: 'Active District Alerts',
    },
    {
      icon: '📍',
      valueMl: reports.length.toString(),
      labelMl: 'സജീവ റിപ്പോർട്ടുകൾ',
      labelEn: 'Active Reports',
    },
  ];

  return (
    <div className="stats-row" id="stats-row">
      {stats.map((stat, i) => (
        <div key={i} className="stats-card">
          <span className="stats-card__icon">{stat.icon}</span>
          <span className="stats-card__value">{stat.valueMl}</span>
          <span className="stats-card__label-ml">{stat.labelMl}</span>
          <span className="stats-card__label-en">{stat.labelEn}</span>
        </div>
      ))}
    </div>
  );
}
