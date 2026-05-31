// ── Disaster Types ──────────────────────────────────────
export const DISASTER_TYPES = [
  { id: 'flood',     icon: '🌊', labelMl: 'വെള്ളപ്പൊക്കം',      labelEn: 'Flood',         color: '#2980b9' },
  { id: 'landslide', icon: '🏔️', labelMl: 'ഉരുൾപൊട്ടൽ',        labelEn: 'Landslide',     color: '#8e6f3e' },
  { id: 'storm',     icon: '🌀', labelMl: 'കൊടുങ്കാറ്റ്',       labelEn: 'Storm',         color: '#7f8c8d' },
  { id: 'lightning', icon: '⚡', labelMl: 'ഇടിമിന്നൽ',          labelEn: 'Lightning',     color: '#f1c40f' },
  { id: 'tide',      icon: '🌊', labelMl: 'കടൽക്ഷോഭം',          labelEn: 'High Tide',     color: '#1abc9c' },
  { id: 'road',      icon: '🚧', labelMl: 'റോഡ് തടസ്സം',        labelEn: 'Road Block',    color: '#e67e22' },
  { id: 'tree',      icon: '🌳', labelMl: 'മരം വീഴ്ച',           labelEn: 'Tree Fall',     color: '#27ae60' },
  { id: 'power',     icon: '⚡', labelMl: 'വൈദ്യുതി തകരാർ',     labelEn: 'Power Failure', color: '#e74c3c' },
];

// ── Map Config ──────────────────────────────────────────
export const MAP_CENTER = [10.8505, 76.2711];
export const MAP_ZOOM = 8;
export const MAP_MIN_ZOOM = 7;
export const MAP_MAX_ZOOM = 17;

// ── Kerala Bounding Box for Nominatim ───────────────────
export const KERALA_VIEWBOX = '74.8,8.2,77.6,12.8';

// ── OSRM Routing ────────────────────────────────────────
export const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

// ── Alert & Safety Thresholds ───────────────────────────
export const ALERT_RADIUS_METRES = 5000;
export const GEOFENCE_RADIUS_KM = 3;
export const REPORT_EXPIRY_HOURS = 6;
export const CONFIRM_THRESHOLD = 3;
export const RATE_LIMIT_SECONDS = 120;

// ── Alert Sound (Web Audio API) ─────────────────────────
export const ALERT_SOUND_FREQ = 880;
export const ALERT_SOUND_DURATION = 0.3;

// ── Severity Levels ─────────────────────────────────────
export const SEVERITY_LEVELS = [
  { id: 'low',  labelMl: 'കുറവ്',    labelEn: 'Low',    color: '#27ae60' },
  { id: 'med',  labelMl: 'മധ്യം',    labelEn: 'Medium', color: '#d35400' },
  { id: 'high', labelMl: 'ഉയർന്നത്', labelEn: 'High',   color: '#c0392b' },
];

// ── Alert Level Colors ──────────────────────────────────
export const ALERT_LEVEL_COLORS = {
  red:    '#c0392b',
  orange: '#d35400',
  yellow: '#f1c40f',
  green:  '#27ae60',
};

// ── Emergency Numbers ───────────────────────────────────
export const EMERGENCY_NUMBERS = [
  { number: '112',  labelMl: 'അടിയന്തര സഹായം',   labelEn: 'Emergency' },
  { number: '1077', labelMl: 'ദുരന്ത നിവാരണം',    labelEn: 'KSDMA' },
  { number: '1070', labelMl: 'ദേശീയ ദുരന്തം',      labelEn: 'NDRF' },
  { number: '101',  labelMl: 'അഗ്നിശമന സേന',       labelEn: 'Fire' },
  { number: '100',  labelMl: 'പോലീസ്',              labelEn: 'Police' },
  { number: '108',  labelMl: 'ആംബുലൻസ്',            labelEn: 'Ambulance' },
];

// ── Safety Tips ─────────────────────────────────────────
export const SAFETY_TIPS = [
  {
    type: 'flood',
    icon: '🌊',
    titleMl: 'വെള്ളത്തിൽ ഇറങ്ങരുത്',
    descMl: 'ഒഴുക്കുള്ള വെള്ളത്തിൽ ഇറങ്ങാൻ ശ്രമിക്കരുത്.',
    descEn: 'Never enter flowing floodwater — even 15cm can knock you down.',
  },
  {
    type: 'landslide',
    icon: '🏔️',
    titleMl: 'ഉരുൾ മേഖലകൾ ഒഴിവാക്കുക',
    descMl: 'ശക്തമായ മഴ സമയത്ത് മലഞ്ചരിവുകൾ ഒഴിവാക്കുക.',
    descEn: 'Avoid hillsides and slopes during heavy rain.',
  },
  {
    type: 'storm',
    icon: '🌀',
    titleMl: 'കെട്ടിടത്തിനകത്ത് നിൽക്കുക',
    descMl: 'കൊടുങ്കാറ്റ് സമയത്ത് പുറത്ത് ഇറങ്ങരുത്.',
    descEn: 'Stay indoors during storms. Secure loose objects outside.',
  },
  {
    type: 'lightning',
    icon: '⚡',
    titleMl: 'മരങ്ങൾക്കടിയിൽ നിൽക്കരുത്',
    descMl: 'ഇടിമിന്നൽ ഉള്ളപ്പോൾ മരങ്ങൾക്കടിയിൽ നിൽക്കരുത്.',
    descEn: 'Stay away from trees and metal objects during lightning.',
  },
  {
    type: 'tide',
    icon: '🌊',
    titleMl: 'കടൽക്കരയിൽ നിൽക്കരുത്',
    descMl: 'കടൽക്ഷോഭ സമയത്ത് ബീച്ചിൽ പോകരുത്.',
    descEn: 'Stay away from beaches and coastal areas during high tide warnings.',
  },
  {
    type: 'road',
    icon: '🚧',
    titleMl: 'ഇതര മാർഗ്ഗം ഉപയോഗിക്കുക',
    descMl: 'തടസ്സമുള്ള റോഡ് ഒഴിവാക്കി ഇതര വഴി ഉപയോഗിക്കുക.',
    descEn: 'Use alternate routes and check this map before travelling.',
  },
];

// ── Map Tiles ───────────────────────────────────────────
export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// ── District Name Mapping (legacy → canonical) ─────────
export const DISTRICT_NAME_MAP = {
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

// ── Photo Upload Config ─────────────────────────────────
export const PHOTO_MAX_WIDTH = 800;
export const PHOTO_QUALITY = 0.7;
export const PHOTO_BUCKET = 'report-photos';
