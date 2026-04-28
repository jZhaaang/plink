import {
  LinkMediaInsert,
  LinkMediaRow,
  LinkMediaRowWithProfile,
} from '../../models';
import { supabase } from '../client';

export async function getLinkMediaByLinkId(
  linkId: string,
  page: number,
  pageSize: number = 20,
): Promise<LinkMediaRowWithProfile[]> {
  const offset = page * pageSize;

  const { data, error } = await supabase
    .from('link_media')
    .select('*, profiles (*)')
    .eq('link_id', linkId)
    .order('captured_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;

  return data;
}

export async function getLinkMediaByLocationId(
  linkId: string,
  locationId: string | null,
  page: number,
  pageSize: number = 12,
): Promise<LinkMediaRowWithProfile[]> {
  const offset = page * pageSize;

  const query = supabase
    .from('link_media')
    .select('*, profiles (*)')
    .order('captured_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .range(offset, offset + pageSize - 1);

  const { data, error } = await (locationId === null
    ? query.eq('link_id', linkId).is('location_id', null)
    : query.eq('location_id', locationId));

  if (error) throw error;
  return data ?? [];
}

export async function createLinkMedia(
  media: LinkMediaInsert,
): Promise<LinkMediaRow> {
  const { data, error } = await supabase
    .from('link_media')
    .insert(media)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function setLinkMediaLocation(
  mediaId: string,
  locationId: string | null,
): Promise<void> {
  const { data, error } = await supabase
    .from('link_media')
    .update({ location_id: locationId })
    .eq('id', mediaId);

  if (error) throw error;

  return data;
}

export async function deleteLinkMedia(mediaId: string): Promise<void> {
  const { error } = await supabase
    .from('link_media')
    .delete()
    .eq('id', mediaId);

  if (error) throw error;

  return;
}
