import { supabase } from '../client';
import { LinkRow, LinkInsert, LinkUpdate } from '../../models';

export async function getLinksByUserId(userId: string): Promise<LinkRow[]> {
  const { data, error } = await supabase
    .from('link_members')
    .select('links (*)')
    .eq('user_id', userId);

  if (error) throw error;

  return data.map((userLinks) => userLinks.links);
}

export async function getLinkById(linkId: string): Promise<LinkRow> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('id', linkId)
    .single();

  if (error) throw error;

  return data;
}

export async function getLinksByPartyId(partyId: string): Promise<LinkRow[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('party_id', partyId);

  if (error) throw error;

  return data;
}

export async function getPastLinksByPartyId(
  partyId: string,
  page: number,
  pageSize: number = 10,
) {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('party_id', partyId)
    .not('end_time', 'is', null)
    .order('end_time', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return data;
}

export async function getActiveLinkByUserId(
  userId: string,
): Promise<LinkRow | null> {
  const { data, error } = await supabase
    .from('link_members')
    .select('links!inner (*)')
    .eq('user_id', userId)
    .is('links.end_time', null);

  if (error) throw error;

  if (!data || data.length === 0 || !data[0]?.links) return null;
  return data[0].links;
}

export async function createLink(link: LinkInsert): Promise<LinkRow> {
  const { data, error } = await supabase
    .from('links')
    .insert(link)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateLinkById(
  linkId: string,
  linkUpdate: LinkUpdate,
): Promise<LinkRow> {
  const { data, error } = await supabase
    .from('links')
    .update(linkUpdate)
    .eq('id', linkId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteLink(linkId: string): Promise<void> {
  const { error } = await supabase.from('links').delete().eq('id', linkId);

  if (error) throw error;

  return;
}

export async function endLink(linkId: string): Promise<LinkRow> {
  const { data, error } = await supabase
    .from('links')
    .update({ end_time: new Date().toISOString() })
    .eq('id', linkId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getLinkDetailById(linkId: string) {
  const { data, error } = await supabase
    .from('links')
    .select(
      `*, link_members(user_id, profiles (*)), link_posts (*, link_post_media (*))`,
    )
    .eq('id', linkId)
    .order('created_at', { referencedTable: 'link_posts', ascending: false })
    .single();

  if (error) throw error;

  return data;
}

export async function getRecentLinksByUserId(
  userId: string,
  page: number,
  pageSize: number = 3,
) {
  const offset = page * pageSize;

  const { data: memberData, error: memberError } = await supabase
    .from('link_members')
    .select('link_id')
    .eq('user_id', userId);

  if (memberError) throw memberError;

  const linkIds = memberData.map((m) => m.link_id);
  if (linkIds.length === 0) return [];

  const { data, error } = await supabase
    .from('links')
    .select(
      `*, parties!inner (*), link_members (user_id, profiles (*)), link_posts (link_post_media (*))`,
    )
    .in('id', linkIds)
    .not('end_time', 'is', null)
    .order('end_time', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) throw error;
  return data;
}

export async function getActiveLinksByUserId(userId: string) {
  const { data: partyData, error: partyError } = await supabase
    .from('party_members')
    .select('party_id')
    .eq('user_id', userId);

  if (partyError) throw partyError;

  const partyIds = partyData.map((pm) => pm.party_id);
  if (partyIds.length === 0) return [];

  const { data, error } = await supabase
    .from('links')
    .select(
      `*, parties!inner (*), link_members (user_id, profiles(*)), link_posts (count)`,
    )
    .in('party_id', partyIds)
    .is('end_time', null);

  if (error) throw error;
  return data;
}
