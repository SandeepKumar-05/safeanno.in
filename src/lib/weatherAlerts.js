/**
 * Kerala District Weather Alerts
 * Uses Open-Meteo (free, no API key) to fetch real-time weather for
 * all 14 Kerala district HQ coordinates and converts to alert levels.
 *
 * Alert levels mirroring IMD colour code:
 *  RED    — Extremely heavy rain (>204mm/day) or severe thunderstorm/cyclone
 *  ORANGE — Very heavy rain (115-204mm/day) or strong storm
 *  YELLOW — Heavy rain (64-115mm/day) or moderate thunderstorm
 *  GREEN  — Normal / clear
 */

// District HQ coordinates [lat, lng]
export const KERALA_DISTRICTS = [
  { id: 1,  name_en: 'Thiruvananthapuram', name_ml: 'തിരുവനന്തപുരം', lat: 8.5241,  lng: 76.9366 },
  { id: 2,  name_en: 'Kollam',             name_ml: 'കൊല്ലം',        lat: 8.8932,  lng: 76.6141 },
  { id: 3,  name_en: 'Pathanamthitta',     name_ml: 'പത്തനംതിട്ട',   lat: 9.2648,  lng: 76.7870 },
  { id: 4,  name_en: 'Alappuzha',          name_ml: 'ആലപ്പുഴ',       lat: 9.4981,  lng: 76.3388 },
  { id: 5,  name_en: 'Kottayam',           name_ml: 'കോട്ടയം',       lat: 9.5916,  lng: 76.5222 },
  { id: 6,  name_en: 'Idukki',             name_ml: 'ഇടുക്കി',       lat: 9.9189,  lng: 77.1025 },
  { id: 7,  name_en: 'Ernakulam',          name_ml: 'എറണാകുളം',      lat: 10.0159, lng: 76.3419 },
  { id: 8,  name_en: 'Thrissur',           name_ml: 'തൃശൂർ',         lat: 10.5276, lng: 76.2144 },
  { id: 9,  name_en: 'Palakkad',           name_ml: 'പാലക്കാട്',     lat: 10.7867, lng: 76.6548 },
  { id: 10, name_en: 'Malappuram',         name_ml: 'മലപ്പുറം',      lat: 11.0730, lng: 76.0740 },
  { id: 11, name_en: 'Kozhikode',          name_ml: 'കോഴിക്കോട്',    lat: 11.2588, lng: 75.7804 },
  { id: 12, name_en: 'Wayanad',            name_ml: 'വയനാട്',         lat: 11.6854, lng: 76.1320 },
  { id: 13, name_en: 'Kannur',             name_ml: 'കണ്ണൂർ',        lat: 11.8745, lng: 75.3704 },
  { id: 14, name_en: 'Kasaragod',          name_ml: 'കാസർഗോഡ്',     lat: 12.4996, lng: 74.9869 },
];

/**
 * WMO Weather Code → alert level and human-readable description
 * Ref: https://open-meteo.com/en/docs#weathervariables
 */
function weatherCodeToAlert(code, precipMm) {
  // Thunderstorm codes
  if ([95, 96, 99].includes(code)) {
    return { level: 'red', text: 'Severe thunderstorm — Extremely dangerous' };
  }
  if ([91, 92, 93, 94].includes(code)) {
    return { level: 'orange', text: 'Thunderstorm with rain — Take shelter' };
  }

  // Heavy rain / snow codes
  if ([65, 67, 75, 82].includes(code)) {
    // Extremely heavy rain (>204mm potential)
    if (precipMm >= 115) {
      return { level: 'red', text: `Extremely heavy rain — ${precipMm.toFixed(0)}mm expected` };
    }
    return { level: 'orange', text: `Very heavy rain — ${precipMm.toFixed(0)}mm expected` };
  }
  if ([63, 73, 81].includes(code)) {
    return { level: 'orange', text: `Heavy rain — ${precipMm.toFixed(0)}mm expected` };
  }
  if ([61, 71, 80].includes(code)) {
    return { level: 'yellow', text: `Moderate rain — ${precipMm.toFixed(0)}mm expected` };
  }
  if ([51, 53, 55, 56, 57].includes(code)) {
    return { level: 'yellow', text: 'Light drizzle — Slippery roads' };
  }

  // Precipitation-based fallback (even if weather code is mild)
  if (precipMm >= 204) {
    return { level: 'red', text: `Extremely heavy rainfall — ${precipMm.toFixed(0)}mm` };
  }
  if (precipMm >= 115) {
    return { level: 'red', text: `Very heavy rainfall — ${precipMm.toFixed(0)}mm` };
  }
  if (precipMm >= 64) {
    return { level: 'orange', text: `Heavy rainfall — ${precipMm.toFixed(0)}mm` };
  }
  if (precipMm >= 20) {
    return { level: 'yellow', text: `Moderate rainfall — ${precipMm.toFixed(0)}mm` };
  }

  // Fog / haze
  if ([45, 48].includes(code)) {
    return { level: 'yellow', text: 'Dense fog — Reduced visibility' };
  }

  return { level: 'green', text: 'Normal weather conditions' };
}

/**
 * Fetch weather for a single district from Open-Meteo
 * Returns precipitation sum for next 24h and current weather code
 */
async function fetchDistrictWeather(district) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', district.lat);
  url.searchParams.set('longitude', district.lng);
  // Hourly: precip + weather code for next 24h
  url.searchParams.set('hourly', 'precipitation,weather_code');
  url.searchParams.set('daily', 'precipitation_sum,weather_code_max');
  url.searchParams.set('timezone', 'Asia/Kolkata');
  url.searchParams.set('forecast_days', '1');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Weather fetch failed for ${district.name_en}`);
  return res.json();
}

/**
 * Parse Open-Meteo response and extract today's worst alert
 */
function parseWeatherResponse(data) {
  const precipSum = data.daily?.precipitation_sum?.[0] ?? 0;
  const weatherCodeMax = data.daily?.weather_code_max?.[0] ?? 0;

  return weatherCodeToAlert(weatherCodeMax, precipSum);
}

/**
 * Fetch weather alerts for all 14 Kerala districts in parallel
 * @returns {Promise<Array>} array of district objects with alert_level and alert_text
 */
export async function fetchKeralaWeatherAlerts() {
  const results = await Promise.allSettled(
    KERALA_DISTRICTS.map((d) => fetchDistrictWeather(d))
  );

  return KERALA_DISTRICTS.map((district, i) => {
    const result = results[i];
    if (result.status === 'fulfilled') {
      const { level, text } = parseWeatherResponse(result.value);
      return {
        ...district,
        alert_level: level,
        alert_text: text,
        updated_at: new Date().toISOString(),
        source: 'open-meteo',
      };
    } else {
      // Fallback: green if fetch failed
      console.warn(`Weather fetch failed for ${district.name_en}:`, result.reason);
      return {
        ...district,
        alert_level: 'green',
        alert_text: 'Weather data unavailable',
        updated_at: new Date().toISOString(),
        source: 'fallback',
      };
    }
  });
}

/**
 * Get alert level for a list of district names
 * @param {string[]} districtNames - array of district name_en
 * @param {Array} allDistricts - fetched district alert array
 * @returns {{ level: string, districts: Array }} highest alert and list of districts on alert
 */
export function getRouteAlertLevel(districtNames, allDistricts) {
  const order = { red: 3, orange: 2, yellow: 1, green: 0 };
  let highestLevel = 'green';
  const alertingDistricts = [];

  for (const name of districtNames) {
    const district = allDistricts.find(
      (d) => d.name_en.toLowerCase() === name.toLowerCase()
    );
    if (district && district.alert_level !== 'green') {
      if ((order[district.alert_level] || 0) > (order[highestLevel] || 0)) {
        highestLevel = district.alert_level;
      }
      alertingDistricts.push(district);
    }
  }

  return { level: highestLevel, districts: alertingDistricts };
}
