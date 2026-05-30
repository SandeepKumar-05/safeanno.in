/**
 * PushManager — handles push notification UI logic
 * Not a React component, but a utility module used by RouteAlert
 */
import { supabase } from '../../lib/supabase';

/**
 * Save a push subscription + route to the database
 * @param {object} params
 * @param {string} params.sessionId
 * @param {object} params.subscription - PushSubscription JSON
 * @param {string} params.originName
 * @param {string} params.destinationName
 * @param {number} params.originLat
 * @param {number} params.originLng
 * @param {number} params.destLat
 * @param {number} params.destLng
 * @param {string} [params.phone]
 */
export async function saveRouteAlert({
  sessionId,
  subscription,
  originName,
  destinationName,
  originLat,
  originLng,
  destLat,
  destLng,
  phone,
}) {
  // Build a LineString from origin to destination
  const routeWKT = `SRID=4326;LINESTRING(${originLng} ${originLat}, ${destLng} ${destLat})`;

  const { data, error } = await supabase.from('routes').insert({
    session_id: sessionId,
    origin_name: originName,
    destination_name: destinationName,
    origin_lat: originLat,
    origin_lng: originLng,
    dest_lat: destLat,
    dest_lng: destLng,
    route: routeWKT,
    push_subscription: subscription ? JSON.parse(JSON.stringify(subscription)) : null,
    phone: phone || null,
  });

  if (error) throw error;
  return data;
}

/**
 * Confirm a report (increment confirm_count)
 * @param {string} reportId
 * @param {string} sessionId
 */
export async function confirmReport(reportId, sessionId) {
  // Insert confirmation (unique constraint prevents duplicates)
  const { error: confError } = await supabase.from('confirmations').insert({
    report_id: reportId,
    session_id: sessionId,
  });

  if (confError) {
    if (confError.code === '23505') {
      throw new Error('നിങ്ങൾ ഇത് ഇതിനകം സ്ഥിരീകരിച്ചു (Already confirmed)');
    }
    throw confError;
  }

  // Increment count via RPC
  const { error: rpcError } = await supabase.rpc('increment_confirm', {
    report_id: reportId,
  });

  if (rpcError) throw rpcError;
}
