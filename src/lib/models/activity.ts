import { Tables, TablesUpdate } from '../supabase/types';

export type ActivityEventRow = Tables<'activity_events'>;
export type ActivityEventUpdate = TablesUpdate<'activity_events'>;
export type ActivityType = ActivityEventRow['type'];

export type ActivityFeedItem = ActivityEventRow & {
  actorName: string | null;
  linkName: string | null;
  partyName: string | null;
};
