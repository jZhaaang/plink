import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';
import { getLinkLocations } from '../../../lib/supabase/queries/linkLocations';

export function useLinkLocations(linkId: string) {
  return useQuery({
    queryKey: queryKeys.links.locations(linkId),
    queryFn: () => getLinkLocations(linkId),
    enabled: !!linkId,
  });
}
