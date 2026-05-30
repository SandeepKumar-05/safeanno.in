# 🌊 വെള്ളം കേറിയോ? (Vellam Keriyo?)

**Real-time community disaster alert system for Kerala, India.**

A production-ready web application where citizens can report disasters (floods, landslides, storms, etc.) on a live map, get route-based push notifications, and view IMD weather alerts — all in Malayalam & English.

---

## 🚀 Features

- **Live Map** — Leaflet + OpenStreetMap showing real-time disaster reports
- **Community Reports** — Submit flood, landslide, storm, lightning, tide, road block, tree fall, or power failure reports
- **Real-time Updates** — Supabase Realtime WebSocket for instant feed updates
- **Route Alerts** — Subscribe to push notifications for disasters along your travel route
- **IMD Integration** — India Meteorological Department weather warnings synced every 30 minutes
- **14 Kerala Districts** — Live alert levels from IMD (Red / Orange / Yellow / Green)
- **Emergency Numbers** — Quick-dial to KSDMA (1077), NDRF (1070), Fire (101), Police (100), Ambulance (108)
- **Safety Tips** — Bilingual disaster safety guidelines
- **Anonymous** — No login required, no personal data collected
- **Responsive** — Works on iPhone SE (375px) to desktop (1440px)
- **Dark Monsoon Theme** — Animated rain background, glassmorphism UI

---

## 📋 Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [Supabase](https://supabase.com/) account (free tier works)

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/vellam-keriyo.git
cd vellam-keriyo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Supabase project

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Select **Singapore** region (closest to Kerala)
3. Note your **Project URL** and **anon key** from Settings → API

### 4. Enable PostGIS

In the Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 5. Run the database schema

Copy the contents of `src/supabase/schema.sql` and run it in the Supabase SQL Editor. This creates:
- `reports` table with PostGIS geometry
- `routes` table for alert subscriptions
- `confirmations` table for crowdsource verification
- `districts` table seeded with all 14 Kerala districts
- Row Level Security policies
- Spatial indexes
- `increment_confirm` RPC function

### 6. Enable Realtime

In the Supabase Dashboard:
1. Go to **Database → Replication**
2. Enable Realtime for the `reports` and `districts` tables

### 7. Generate VAPID keys

```bash
npx web-push generate-vapid-keys
```

Save the public and private keys.

### 8. Configure environment

```bash
cp .env.example .env
```

Fill in all values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VITE_IMD_API_URL=https://weather.imd.gov.in/api/warning
```

### 9. Deploy Edge Functions (optional)

```bash
supabase functions deploy alert-on-report
supabase functions deploy sync-imd-alerts
supabase functions deploy expire-reports
```

Set up database webhooks in Supabase to trigger `alert-on-report` on `reports` INSERT.

Set up cron schedules:
- `sync-imd-alerts`: every 30 minutes
- `expire-reports`: every hour

### 10. Run locally

```bash
npm run dev
```

App runs at **http://localhost:5173**

### 11. Build for production with Docker

```bash
docker-compose up --build
```

App runs at **http://localhost:3000**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser                        │
│  React 18 + Leaflet Map + Web Push               │
├─────────────────────────────────────────────────┤
│               Supabase                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │PostgreSQL │  │ Realtime │  │Edge Functions │  │
│  │ + PostGIS │  │WebSocket │  │  (Deno)       │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
├─────────────────────────────────────────────────┤
│              External APIs                       │
│  ┌────────┐  ┌──────────┐  ┌────────┐          │
│  │  IMD   │  │Nominatim │  │ MSG91  │          │
│  │Weather │  │Geocoding │  │  SMS   │          │
│  └────────┘  └──────────┘  └────────┘          │
└─────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
├── package.json
├── vite.config.js
├── index.html
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── .env.example
├── public/
│   └── sw.js                    # Service worker for push notifications
└── src/
    ├── main.jsx                 # React entry point
    ├── App.jsx                  # Root component
    ├── index.css                # Global styles (CSS variables, rain animation)
    ├── lib/
    │   ├── supabase.js          # Supabase client
    │   ├── constants.js         # Disaster types, emergency numbers, etc.
    │   ├── push.js              # Web Push utilities
    │   ├── geocode.js           # Nominatim geocoding
    │   ├── formatters.js        # Time-ago, type lookups
    │   └── spamGuard.js         # Rate limiting
    ├── context/
    │   ├── SessionContext.jsx   # Anonymous session
    │   └── ToastContext.jsx     # Toast notifications
    ├── hooks/
    │   ├── useReports.js        # Realtime reports
    │   ├── useDistricts.js      # Realtime district alerts
    │   ├── useSession.js        # Session ID
    │   ├── useGeolocation.js    # GPS
    │   ├── usePushAlert.js      # Push subscription
    │   ├── useRateLimit.js      # Submission cooldown
    │   └── useToast.js          # Toast notifications
    ├── components/
    │   ├── layout/              # Header, AlertBanner, Footer
    │   ├── map/                 # MapView, IncidentMarker, MapControls
    │   ├── report/              # ReportForm, CalamitySelector, SeverityPicker
    │   ├── feed/                # LiveFeed, FeedCard
    │   ├── alerts/              # RouteAlert, PushManager
    │   ├── districts/           # DistrictGrid, DistrictCard
    │   ├── tips/                # SafetyTips, TipCard
    │   ├── emergency/           # EmergencyNumbers
    │   ├── stats/               # StatsRow
    │   └── ui/                  # Toast, RainBackground, LiveBadge
    └── supabase/
        ├── schema.sql           # Database schema
        └── edge-functions/
            ├── alert-on-report/ # Push alerts on new reports
            ├── sync-imd-alerts/ # IMD weather sync (cron)
            └── expire-reports/  # Cleanup expired data (cron)
```

---

## 🌐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Custom CSS with CSS Variables |
| Map | Leaflet.js + react-leaflet + OpenStreetMap |
| Database | Supabase (PostgreSQL + PostGIS) |
| Real-time | Supabase Realtime (WebSocket) |
| Push | Web Push API + VAPID |
| Geocoding | Nominatim (free) |
| Weather | IMD Public API |
| Fonts | Noto Serif Malayalam + Noto Sans Malayalam |
| Deploy | Docker (Nginx) |

---

## 📄 License

MIT — Built with ❤️ for Kerala.
