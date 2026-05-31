/**
 * alert-on-report — Supabase Edge Function
 * Triggered on report INSERT via database webhook.
 * Uses PostGIS ST_DWithin to find routes within 5km.
 * Sends push notifications and optional SMS.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const MSG91_KEY = Deno.env.get('MSG91_AUTH_KEY') || '';

const DISASTER_LABELS = {
  flood: '🌊 വെള്ളപ്പൊക്കം / Flood',
  landslide: '🏔️ ഉരുൾപൊട്ടൽ / Landslide',
  storm: '🌀 കൊടുങ്കാറ്റ് / Storm',
  lightning: '⚡ ഇടിമിന്നൽ / Lightning',
  tide: '🌊 കടൽക്ഷോഭം / High Tide',
  road: '🚧 റോഡ് തടസ്സം / Road Block',
  tree: '🌳 മരം വീഴ്ച / Tree Fall',
  power: '⚡ വൈദ്യുതി തകരാർ / Power Failure',
};

serve(async (req) => {
  try {
    const payload = await req.json();
    const report = payload.record || payload;

    if (!report || !report.location) {
      return new Response(JSON.stringify({ error: 'No report data' }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Extract coordinates from report location
    let lng, lat;
    if (report.location.coordinates) {
      [lng, lat] = report.location.coordinates;
    } else {
      const match = String(report.location).match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (!match) {
        return new Response(JSON.stringify({ error: 'Invalid location' }), { status: 400 });
      }
      lng = parseFloat(match[1]);
      lat = parseFloat(match[2]);
    }

    // Use PostGIS to find routes within 5km of report location
    const { data: routes, error: routeError } = await supabase
      .rpc('find_routes_near_point', {
        point_geom: `SRID=4326;POINT(${lng} ${lat})`,
        radius_metres: 5000,
      });

    if (routeError) {
      console.error('Route query error:', routeError);
      // Fallback: fetch all routes if spatial query fails
      const { data: allRoutes } = await supabase.from('routes').select('*');
      routes = allRoutes || [];
    }

    const matchingRoutes = routes || [];

    const title = '🌊 വെള്ളം കേറിയോ? — Alert!';
    const body = `${DISASTER_LABELS[report.type] || report.type} — ${report.place_name || 'Kerala'}`;
    let notificationsSent = 0;

    for (const route of matchingRoutes) {
      // Send push notification with enhanced payload
      if (route.push_subscription) {
        try {
          const subscription = typeof route.push_subscription === 'string'
            ? JSON.parse(route.push_subscription)
            : route.push_subscription;

          await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'TTL': '86400',
            },
            body: JSON.stringify({
              title,
              body,
              url: '/',
              reportId: report.id,
            }),
          });
          notificationsSent++;
        } catch (pushErr) {
          console.error('Push error:', pushErr);
        }
      }

      // Send SMS via MSG91 if configured
      if (route.phone && MSG91_KEY) {
        try {
          await fetch('https://api.msg91.com/api/v5/flow/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'authkey': MSG91_KEY,
            },
            body: JSON.stringify({
              flow_id: 'disaster_alert',
              mobiles: `91${route.phone}`,
              disaster_type: DISASTER_LABELS[report.type] || report.type,
              location: report.place_name || 'Kerala',
            }),
          });
        } catch (smsErr) {
          console.error('SMS error:', smsErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        routes_matched: matchingRoutes.length,
        notifications_sent: notificationsSent,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('alert-on-report error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
