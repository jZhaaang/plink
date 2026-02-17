import { useMemo } from 'react';
import { ActivityFeedItem } from '../../../lib/models';
import {
  getActivityFeedByUserId,
  markActivityEventsRead,
} from '../../../lib/supabase/queries/activity';
import { formatDaySectionTitle, toDayKey } from '../../../lib/utils/formatTime';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';

export type ActivitySection = {
  title: string;
  data: ActivityFeedItem[];
};

export function activityLine(item: ActivityFeedItem): string {
  const actor = item.actorName ?? 'Someone';
  const party = item.partyName ?? 'a deleted party';
  const link = item.linkName ?? 'a deleted link';

  switch (item.type) {
    case 'link_created':
      return `${actor} started a link in ${party}!`;
    case 'link_ended':
      return `${link} in ${party} has ended!`;
    case 'link_member_joined':
      return `${actor} joined ${link} in ${party}!`;
    case 'link_member_left':
      return `${actor} left ${link} in ${party}.`;
    case 'party_member_joined':
      return `${actor} joined ${party}!`;
    case 'party_member_left':
      return `${actor} left ${party}.`;
    default:
      return `${actor} had activity`;
  }
}

export function useActivityFeed(userId: string | null) {
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.activity.feed(userId),
    queryFn: async () => {
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
    },
    enabled: !!userId,
  });

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
    loading: rest.isLoading,
    error: rest.error,
    refetch: rest.refetch,
  };
}
