/**
 * sync-imd-alerts — Supabase Edge Function
 * 3-tier fallback chain for IMD weather data:
 *   1. Primary: imdkol.gov.in/StateDW/kerala.json
 *   2. Secondary: sdma.kerala.gov.in/feed/ (RSS XML)
 *   3. Tertiary: mausam.imd.gov.in/api/warning_bulletin
 *
 * Updates district alert levels in the districts table.
 * On RED upgrade: logs for push notification triggering.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const DISTRICT_NAME_MAP = {
  'Trivandrum': 'Thiruvananthapuram',
  'Quilon': 'Kollam',
  'Alleppey': 'Alappuzha',
  'Kochi': 'Ernakulam',
  'Trichur': 'Thrissur',
  'Palghat': 'Palakkad',
  'Calicut': 'Kozhikode',
  'Cannanore': 'Kannur',
  'Kasargod': 'Kasaragod',
  'Thiruvananthapuram': 'Thiruvananthapuram',
  'Kollam': 'Kollam',
  'Pathanamthitta': 'Pathanamthitta',
  'Alappuzha': 'Alappuzha',
  'Kottayam': 'Kottayam',
  'Idukki': 'Idukki',
  'Ernakulam': 'Ernakulam',
  'Thrissur': 'Thrissur',
  'Palakkad': 'Palakkad',
  'Malappuram': 'Malappuram',
  'Kozhikode': 'Kozhikode',
  'Wayanad': 'Wayanad',
  'Kannur': 'Kannur',
  'Kasaragod': 'Kasaragod',
};

function parseAlertLevel(warning) {
  if (!warning) return 'green';
  const lower = String(warning).toLowerCase();
  if (lower.includes('red')) return 'red';
  if (lower.includes('orange')) return 'orange';
  if (lower.includes('yellow')) return 'yellow';
  return 'green';
}

/**
 * Tier 1: IMD Kolkata GeoJSON — most reliable for district-level warnings
 */
async function fetchIMDKolkata() {
  const urls = [
    'https://imdkol.gov.in/StateDW/kerala.json',
    'https://imdkol.gov.in/warning.json',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'VellomKeriyo/1.0 (disaster-alert-kerala)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`Tier 1 success: ${url}`);
        return data;
      }
    } catch (err) {
      console.warn(`Tier 1 failed (${url}):`, err.message);
    }
  }
  return null;
}

/**
 * Tier 2: KSDMA RSS Feed — parse XML for district alerts
 */
async function fetchKSDMA() {
  try {
    const res = await fetch('https://sdma.kerala.gov.in/feed/', {
      headers: {
        'User-Agent': 'VellomKeriyo/1.0 (disaster-alert-kerala)',
        'Accept': 'application/xml, text/xml',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const xml = await res.text();
    console.log('Tier 2 success: KSDMA RSS');

    // Parse RSS items for district alerts
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title>(.*?)<\/title>/);
      const descMatch = itemXml.match(/<description>(.*?)<\/description>/);

      if (titleMatch) {
        items.push({
          title: titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
          description: descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '',
        });
      }
    }

    // Convert RSS items to district warnings
    const warnings = [];
    for (const item of items) {
      const text = `${item.title} ${item.description}`;
      for (const [name, canonical] of Object.entries(DISTRICT_NAME_MAP)) {
        if (text.toLowerCase().includes(name.toLowerCase())) {
          warnings.push({
            district: canonical,
            warning: text,
            message: item.description || item.title,
          });
        }
      }
    }

    return { warnings, source: 'ksdma' };
  } catch (err) {
    console.warn('Tier 2 failed (KSDMA):', err.message);
    return null;
  }
}

/**
 * Tier 3: IMD Mausam API — final fallback
 */
async function fetchMausam() {
  const urls = [
    'https://mausam.imd.gov.in/api/warning_bulletin?state=Kerala&format=json',
    'https://rsmcnewdelhi.imd.gov.in/api',
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'VellomKeriyo/1.0 (disaster-alert-kerala)',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`Tier 3 success: ${url}`);
        return data;
      }
    } catch (err) {
      console.warn(`Tier 3 failed (${url}):`, err.message);
    }
  }
  return null;
}

/**
 * Extract district warnings from various response formats
 */
function extractWarnings(data) {
  if (!data) return [];

  // KSDMA format
  if (data.source === 'ksdma' && data.warnings) {
    return data.warnings;
  }

  // IMD format — try various field names
  const raw = data.district_warnings || data.warnings || data.data || [];

  if (Array.isArray(raw)) {
    return raw.map((w) => ({
      district: w.district || w.name || w.district_name || '',
      warning: w.warning_color || w.warning || w.level || w.alert || '',
      message: w.message || w.description || w.text || w.warning_text || null,
    }));
  }

  // Object with district keys
  if (typeof raw === 'object') {
    return Object.entries(raw).map(([key, val]) => ({
      district: key,
      warning: typeof val === 'string' ? val : val?.level || val?.warning || '',
      message: typeof val === 'object' ? val?.message || val?.text || null : null,
    }));
  }

  return [];
}

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Fetch with 3-tier fallback
    let rawData = await fetchIMDKolkata();
    if (!rawData) rawData = await fetchKSDMA();
    if (!rawData) rawData = await fetchMausam();

    if (!rawData) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'All IMD/KSDMA API endpoints unavailable — keeping existing district data',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const warnings = extractWarnings(rawData);
    let updatedCount = 0;
    const upgradedToRed = [];

    // Get current levels for upgrade detection
    const { data: currentDistricts } = await supabase
      .from('districts')
      .select('name_en, alert_level');

    const previousLevels = {};
    (currentDistricts || []).forEach((d) => {
      previousLevels[d.name_en] = d.alert_level;
    });

    for (const warning of warnings) {
      const districtName = warning.district || '';
      const mappedName = DISTRICT_NAME_MAP[districtName] || DISTRICT_NAME_MAP[districtName.trim()];
      if (!mappedName) continue;

      const alertLevel = parseAlertLevel(warning.warning);
      const alertText = warning.message || null;

      const { error } = await supabase
        .from('districts')
        .update({
          alert_level: alertLevel,
          alert_text: alertText,
          updated_at: new Date().toISOString(),
        })
        .eq('name_en', mappedName);

      if (!error) {
        updatedCount++;

        // Detect RED upgrade
        if (alertLevel === 'red' && previousLevels[mappedName] !== 'red') {
          upgradedToRed.push(mappedName);
          console.log(`🔴 RED ALERT upgrade: ${mappedName}`);
        }
      }
    }

    // TODO: If upgradedToRed.length > 0, trigger push notifications
    // to all route subscribers passing through those districts
    // (requires calling find_routes_near_point or district spatial query)

    return new Response(
      JSON.stringify({
        success: true,
        warnings_processed: warnings.length,
        districts_updated: updatedCount,
        red_upgrades: upgradedToRed,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('sync-imd-alerts error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
