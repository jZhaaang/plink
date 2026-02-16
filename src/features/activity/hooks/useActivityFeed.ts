import { useMemo } from 'react';
import { ActivityFeedItem } from '../../../lib/models';
import { useAsync } from '../../../lib/supabase/hooks/useAync';
import {
  getActivityFeedByUserId,
  markActivityEventsRead,
} from '../../../lib/supabase/queries/activity';
import { formatDaySectionTitle, toDayKey } from '../../../lib/utils/formatTime';

export type ActivitySection = {
  title: string;
  data: ActivityFeedItem[];
};

export function activityLine(item: ActivityFeedItem): string {
  const actor = item.actorName ?? 'Someone';
  switch (item.type) {
    case 'link_created':
      return `${actor} started a link in ${item.partyName}!`;
    case 'link_ended':
      return `${item.linkName} has ended!`;
    case 'link_member_joined':
      return `${actor} joined ${item.linkName}.`;
    case 'link_member_left':
      return `${actor} left ${item.linkName}.`;
    case 'party_member_joined':
      return `${actor} joined ${item.partyName}!`;
    case 'party_member_left':
      return `${actor} left ${item.partyName}.`;
    default:
      return `${actor} had activity`;
  }
}

export function useActivityFeed(userId: string | null) {
  const { data, ...rest } = useAsync(async () => {
    if (!userId) return [];

    const items = await getActivityFeedByUserId(userId);
    const unreadIds = items.filter((i) => !i.read_at).map((i) => i.id);

    if (unreadIds.length) {
      await markActivityEventsRead(unreadIds);
      return items.map((item) =>
        unreadIds.includes(item.id)
          ? { ...item, read_at: new Date().toISOString() }
          : item,
      );
    }

    return items;
  }, [userId]);

  const sections = useMemo<ActivitySection[]>(() => {
    const groups = new Map<string, ActivityFeedItem[]>();

    for (const item of data ?? []) {
      const key = toDayKey(item.created_at);
      const arr = groups.get(key) ?? [];
      arr.push(item);
      groups.set(key, arr);
    }

    return [...groups.entries()].map(([key, group]) => ({
      title: formatDaySectionTitle(key),
      data: group,
    }));
  }, [data]);

  return {
    items: data ?? [],
    sections,
    ...rest,
  };
}
