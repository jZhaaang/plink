import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { queryKeys } from '../../../lib/queryKeys';

export function useThumbnailSubscription(
  linkId: string,
  mediaIds: string[],
  onComplete: () => void,
) {
  const queryClient = useQueryClient();
  const remaining = useRef(new Set<string>());

  // effect dependency
  const mediaIdsKey = mediaIds.join(',');

  useEffect(() => {
    if (mediaIds.length === 0) return;

    remaining.current = new Set(mediaIds);

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('link_media')
        .select('id, thumbnail_path')
        .in('id', [...remaining.current]);

      if (!data) return;

      let changed = false;
      for (const row of data) {
        if (row.thumbnail_path) {
          remaining.current.delete(row.id);
          changed = true;
        }
      }

      if (changed) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.links.detail(linkId),
        });
      }

      if (remaining.current.size === 0) {
        clearInterval(interval);
        onComplete();
      }
    }, 2000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      onComplete();
    }, 15_000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [mediaIdsKey]);
}
