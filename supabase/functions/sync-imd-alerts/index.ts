/**
 * sync-imd-alerts — Supabase Edge Function (JS)
 * Runs every 30 minutes via cron.
 * Fetches IMD weather warnings and updates district alert levels.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const IMD_URLS = [
  'https://weather.imd.gov.in/api/warning',
  'https://rsmcnewdelhi.imd.gov.in/api',
  'https://mausam.imd.gov.in/api/warning_bulletin',
];

const DISTRICT_NAME_MAP = {
  'Thiruvananthapuram': 'Thiruvananthapuram',
  'Trivandrum': 'Thiruvananthapuram',
  'Kollam': 'Kollam',
  'Quilon': 'Kollam',
  'Pathanamthitta': 'Pathanamthitta',
  'Alappuzha': 'Alappuzha',
  'Alleppey': 'Alappuzha',
  'Kottayam': 'Kottayam',
  'Idukki': 'Idukki',
  'Ernakulam': 'Ernakulam',
  'Kochi': 'Ernakulam',
  'Thrissur': 'Thrissur',
  'Trichur': 'Thrissur',
  'Palakkad': 'Palakkad',
  'Palghat': 'Palakkad',
  'Malappuram': 'Malappuram',
  'Kozhikode': 'Kozhikode',
  'Calicut': 'Kozhikode',
  'Wayanad': 'Wayanad',
  'Kannur': 'Kannur',
  'Cannanore': 'Kannur',
  'Kasaragod': 'Kasaragod',
  'Kasargod': 'Kasaragod',
};

async function fetchIMDData() {
  for (const url of IMD_URLS) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'VellamKeriyo/1.0 (disaster-alert-app)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) {
        console.log(`IMD data fetched from: ${url}`);
        return await response.json();
      }
    } catch (err) {
      console.warn(`IMD API unavailable (${url}):`, err.message);
    }
  }
  console.error('All IMD API endpoints unavailable');
  return null;
}

function parseAlertLevel(warning) {
  if (!warning) return 'green';
  const lower = warning.toLowerCase();
  if (lower.includes('red')) return 'red';
  if (lower.includes('orange')) return 'orange';
  if (lower.includes('yellow')) return 'yellow';
  return 'green';
}

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const imdData = await fetchIMDData();

    if (!imdData) {
      return new Response(
        JSON.stringify({ success: false, message: 'IMD API unavailable — keeping existing district data' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const warnings = imdData.warnings || imdData.data || [];
    let updatedCount = 0;

    const { data: currentDistricts } = await supabase
      .from('districts')
      .select('name_en, alert_level');

    const previousLevels = {};
    (currentDistricts || []).forEach((d) => {
      previousLevels[d.name_en] = d.alert_level;
    });

    for (const warning of warnings) {
      const districtName = warning.district || warning.name || '';
      const mappedName = DISTRICT_NAME_MAP[districtName];
      if (!mappedName) continue;

      const alertLevel = parseAlertLevel(warning.warning || warning.level || warning.alert);
      const alertText = warning.message || warning.description || warning.text || null;

      const { error } = await supabase
        .from('districts')
        .update({ alert_level: alertLevel, alert_text: alertText, updated_at: new Date().toISOString() })
        .eq('name_en', mappedName);

      if (!error) {
        updatedCount++;
        if (alertLevel === 'red' && previousLevels[mappedName] !== 'red') {
          console.log(`Red Alert upgrade for ${mappedName}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, warnings_processed: warnings.length, districts_updated: updatedCount }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('sync-imd-alerts error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
