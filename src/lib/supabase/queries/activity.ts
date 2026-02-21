import { supabase } from '../client';
import {
  ActivityEventRow,
  ActivityFeedItem,
  LinkRow,
  PartyRow,
  ProfileRow,
} from '../../models';

export async function getActivityEventsByUserId(
  userId: string,
  limit = 50,
): Promise<ActivityEventRow[]> {
  const { data, error } = await supabase
    .from('activity_events')
    .select('*')
    .eq('recipient_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data;
}

export async function getUnreadActivityCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('activity_events')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_user_id', userId)
    .is('read_at', null);

  if (error) throw error;

  return count ?? 0;
}

export async function markActivityEventsRead(
  eventIds: string[],
): Promise<void> {
  if (eventIds.length === 0) return;

  const { error } = await supabase
    .from('activity_events')
    .update({ read_at: new Date().toISOString() })
    .in('id', eventIds)
    .is('read_at', null);

  if (error) throw error;

  return;
}

export async function getActivityFeedByUserId(
  userId: string,
  limit = 50,
): Promise<ActivityFeedItem[]> {
  const events = await getActivityEventsByUserId(userId, limit);

  const actorIds = [
    ...new Set(
      events.map((e) => e.actor_user_id).filter((id): id is string => !!id),
    ),
  ];
  const linkIds = [
    ...new Set(events.map((e) => e.link_id).filter((id): id is string => !!id)),
  ];
  const partyIds = [
    ...new Set(
      events.map((e) => e.party_id).filter((id): id is string => !!id),
    ),
  ];

  const [profilesRes, linksRes, partiesRes] = await Promise.all([
    actorIds.length
      ? supabase.from('profiles').select('id, name').in('id', actorIds)
      : Promise.resolve({ data: [] as ProfileRow[], error: null }),
    linkIds.length
      ? supabase.from('links').select('id, name').in('id', linkIds)
      : Promise.resolve({ data: [] as LinkRow[], error: null }),
    partyIds.length
      ? supabase.from('parties').select('id, name').in('id', partyIds)
      : Promise.resolve({ data: [] as PartyRow[], error: null }),
  ]);

  if (profilesRes.error) throw profilesRes.error;
  if (linksRes.error) throw linksRes.error;
  if (partiesRes.error) throw partiesRes.error;

  const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
  const linkMap = new Map((linksRes.data ?? []).map((l) => [l.id, l]));
  const partyMap = new Map((partiesRes.data ?? []).map((p) => [p.id, p]));

  return events.map((event) => {
    const meta =
      (event.metadata as { partyName?: string; linkName?: string }) ?? {};

    return {
      ...event,
      actorName: profileMap.get(event.actor_user_id)?.name ?? null,
      linkName: linkMap.get(event.link_id)?.name ?? meta.linkName ?? null,
      partyName: partyMap.get(event.party_id)?.name ?? meta.partyName ?? null,
    };
  });
}

export async function deleteAllActivityEvents(userId: string): Promise<void> {
  const { error } = await supabase
    .from('activity_events')
    .delete()
    .eq('recipient_user_id', userId);

  if (error) throw error;

  return;
}
