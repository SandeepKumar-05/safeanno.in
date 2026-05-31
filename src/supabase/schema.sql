-- വെള്ളം കേറിയോ? — Database Schema
-- Run this in Supabase SQL Editor after enabling PostGIS

CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- Reports table — community-submitted disaster reports
-- ============================================================
CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT now(),
  type          TEXT NOT NULL CHECK (type IN ('flood','landslide','storm','lightning','tide','road','tree','power')),
  severity      TEXT NOT NULL CHECK (severity IN ('low','med','high')),
  message       TEXT NOT NULL,
  location      GEOMETRY(Point, 4326) NOT NULL,
  place_name    TEXT,
  district      TEXT,
  session_id    TEXT NOT NULL,
  confirm_count INT DEFAULT 0,
  photo_url     TEXT,
  expires_at    TIMESTAMPTZ NOT NULL
);

-- ============================================================
-- Routes table — user-registered travel routes for alerts
-- ============================================================
CREATE TABLE routes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        TEXT NOT NULL,
  origin_name       TEXT,
  destination_name  TEXT,
  origin_lat        FLOAT,
  origin_lng        FLOAT,
  dest_lat          FLOAT,
  dest_lng          FLOAT,
  route             GEOMETRY(LineString, 4326),
  push_subscription JSONB,
  phone             TEXT,
  districts_on_route TEXT[],
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Confirmations table — crowdsource verification
-- ============================================================
CREATE TABLE confirmations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id  UUID REFERENCES reports(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(report_id, session_id)
);

-- ============================================================
-- Districts table — Kerala district alert levels from IMD
-- ============================================================
CREATE TABLE districts (
  id          SERIAL PRIMARY KEY,
  name_ml     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  alert_level TEXT DEFAULT 'green' CHECK (alert_level IN ('red','orange','yellow','green')),
  alert_text  TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Kerala district boundaries for spatial route queries
-- Download GeoJSON from: https://github.com/datameet/maps/tree/master/Districts
-- Filter for Kerala districts only
-- ============================================================
CREATE TABLE kerala_district_boundaries (
  id       SERIAL PRIMARY KEY,
  name_en  TEXT UNIQUE NOT NULL,
  boundary GEOMETRY(MultiPolygon, 4326)
);

CREATE INDEX idx_district_boundaries ON kerala_district_boundaries USING GIST(boundary);

-- ============================================================
-- Seed all 14 Kerala districts
-- ============================================================
INSERT INTO districts (name_ml, name_en) VALUES
('തിരുവനന്തപുരം','Thiruvananthapuram'),
('കൊല്ലം','Kollam'),
('പത്തനംതിട്ട','Pathanamthitta'),
('ആലപ്പുഴ','Alappuzha'),
('കോട്ടയം','Kottayam'),
('ഇടുക്കി','Idukki'),
('എറണാകുളം','Ernakulam'),
('തൃശൂർ','Thrissur'),
('പാലക്കാട്','Palakkad'),
('മലപ്പുറം','Malappuram'),
('കോഴിക്കോട്','Kozhikode'),
('വയനാട്','Wayanad'),
('കണ്ണൂർ','Kannur'),
('കാസർഗോഡ്','Kasaragod');

-- ============================================================
-- Spatial indexes for geo queries
-- ============================================================
CREATE INDEX idx_reports_location ON reports USING GIST(location);
CREATE INDEX idx_routes_route ON routes USING GIST(route);
CREATE INDEX idx_reports_expires ON reports(expires_at);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

-- ============================================================
-- Row Level Security — public read/write for anonymous users
-- ============================================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kerala_district_boundaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read reports" ON reports FOR SELECT USING (true);
CREATE POLICY "public insert reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "public read districts" ON districts FOR SELECT USING (true);
CREATE POLICY "public read routes" ON routes FOR SELECT USING (true);
CREATE POLICY "public insert routes" ON routes FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert confirmations" ON confirmations FOR INSERT WITH CHECK (true);
CREATE POLICY "public read confirmations" ON confirmations FOR SELECT USING (true);
CREATE POLICY "public read boundaries" ON kerala_district_boundaries FOR SELECT USING (true);

-- ============================================================
-- RPC to safely increment confirm count
-- ============================================================
CREATE OR REPLACE FUNCTION increment_confirm(report_id UUID)
RETURNS void AS $$
  UPDATE reports SET confirm_count = confirm_count + 1 WHERE id = report_id;
$$ LANGUAGE sql;

-- ============================================================
-- Function to find districts along a route geometry
-- ============================================================
CREATE OR REPLACE FUNCTION get_districts_for_route(route_geom GEOMETRY)
RETURNS TEXT[] AS $$
  SELECT ARRAY_AGG(DISTINCT name_en)
  FROM kerala_district_boundaries
  WHERE ST_Intersects(boundary, route_geom);
$$ LANGUAGE sql STABLE;

-- ============================================================
-- Function to find routes within radius of a point
-- ============================================================
CREATE OR REPLACE FUNCTION find_routes_near_point(
  point_geom GEOMETRY,
  radius_metres FLOAT DEFAULT 5000
)
RETURNS SETOF routes AS $$
  SELECT r.*
  FROM routes r
  WHERE ST_DWithin(
    r.route::geography,
    point_geom::geography,
    radius_metres
  );
$$ LANGUAGE sql STABLE;
