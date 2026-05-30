/**
 * expire-reports — Supabase Edge Function (JS)
 * Runs every hour via cron.
 * Cleans up expired reports and extends confirmed ones.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const now = new Date().toISOString();

    // 1. Delete expired reports with fewer than 3 confirmations
    const { data: deletedReports, error: deleteError } = await supabase
      .from('reports')
      .delete()
      .lt('expires_at', now)
      .lt('confirm_count', 3)
      .select('id');

    if (deleteError) console.error('Error deleting expired reports:', deleteError);

    // 2. Extend well-confirmed reports about to expire
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const sixHoursFromNow = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

    const { data: extendedReports, error: extendError } = await supabase
      .from('reports')
      .update({ expires_at: sixHoursFromNow })
      .gte('confirm_count', 3)
      .lt('expires_at', oneHourFromNow)
      .select('id');

    if (extendError) console.error('Error extending confirmed reports:', extendError);

    // 3. Delete old routes (older than 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: deletedRoutes, error: routeDeleteError } = await supabase
      .from('routes')
      .delete()
      .lt('created_at', twentyFourHoursAgo)
      .select('id');

    if (routeDeleteError) console.error('Error deleting old routes:', routeDeleteError);

    return new Response(
      JSON.stringify({
        success: true,
        reports_deleted: deletedReports?.length || 0,
        reports_extended: extendedReports?.length || 0,
        routes_deleted: deletedRoutes?.length || 0,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('expire-reports error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
