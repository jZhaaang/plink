import { supabase } from '../client';
import { logger } from '../../telemetry/logger';
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

  if (error) {
    logger.error('Error fetching activity events:', error.message);
    throw error;
  }

  return data;
}

export async function getUnreadActivityCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('activity_events')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_user_id', userId)
    .is('read_at', null);

  if (error) {
    logger.error('Error fetching unread activity count:', error.message);
    throw error;
  }

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

  if (error) {
    logger.error('Error marking activity events as read:', error.message);
    throw error;
  }

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

  if (profilesRes.error) {
    logger.error('Error fetching actor profiles:', profilesRes.error.message);
    throw profilesRes.error;
  }
  if (linksRes.error) {
    logger.error('Error fetching links for activity:', linksRes.error.message);
    throw linksRes.error;
  }
  if (partiesRes.error) {
    logger.error(
      'Error fetching parties for activity:',
      partiesRes.error.message,
    );
    throw partiesRes.error;
  }

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
