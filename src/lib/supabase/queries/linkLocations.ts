import {
  LinkLocationInsert,
  LinkLocationRow,
  LinkLocationUpdate,
} from '../../models';
import { supabase } from '../client';

const R = 6371000;
const toRad = (x: number) => (x * Math.PI) / 180;

export function haversineDistance(
  lat1: number,
  long1: number,
  lat2: number,
  long2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLong = toRad(long2 - long1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLong / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function getLinkLocations(
  linkId: string,
): Promise<LinkLocationRow[]> {
  const { data, error } = await supabase
    .from('link_locations')
    .select('*')
    .eq('link_id', linkId)
    .order('order_index', { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function findNearestLinkLocation(
  linkId: string,
  latitude: number,
  longitude: number,
  radiusMeters = 100,
): Promise<LinkLocationRow | null> {
  const locations = await getLinkLocations(linkId);
  let nearest: LinkLocationRow | null = null;
  let nearestDist = Infinity;

  for (const loc of locations) {
    const dist = haversineDistance(
      latitude,
      longitude,
      loc.latitude,
      loc.longitude,
    );
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = loc;
    }
  }

  return nearest && nearestDist <= radiusMeters ? nearest : null;
}

export async function createLinkLocation(
  location: LinkLocationInsert,
): Promise<LinkLocationRow> {
  const { data, error } = await supabase
    .from('link_locations')
    .insert(location)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateLinkLocation(
  locationId: string,
  location: LinkLocationUpdate,
): Promise<LinkLocationRow> {
  const { data, error } = await supabase
    .from('link_locations')
    .update(location)
    .eq('id', locationId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function confirmLinkLocation(locationId: string): Promise<void> {
  const { error } = await supabase
    .from('link_locations')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('id', locationId);

  if (error) throw error;

  return;
}

export async function upsertLinkLocations(
  linkId: string,
  locations: LinkLocationUpdate[],
): Promise<void> {
  await supabase.from('link_locations').delete().eq('link_id', linkId);
  if (locations.length === 0) return;
  const { error } = await supabase.from('link_locations').insert(
    locations.map((loc, i) => ({
      link_id: linkId,
      order_index: i,
      name: loc.name,
      address: loc.address,
      latitude: loc.latitude,
      longitude: loc.longitude,
      mapbox_id: loc.mapbox_id,
    })),
  );
  if (error) throw error;
}

export async function deleteLinkLocation(locationId: string): Promise<void> {
  const { error } = await supabase
    .from('link_locations')
    .delete()
    .eq('id', locationId);

  if (error) throw error;

  return;
}
