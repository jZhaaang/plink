import { LinkLocationRow, LinkLocationUpdate } from '../../models';
import { supabase } from '../client';

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
