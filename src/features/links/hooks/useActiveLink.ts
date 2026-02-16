import { useQuery } from '@tanstack/react-query';
import { getActiveLinkByUserId } from '../../../lib/supabase/queries/links';
import { queryKeys } from '../../../lib/queryKeys';
import { useAuth } from '../../../providers/AuthProvider';

export function useActiveLink() {
  const { userId } = useAuth();

  const { data, ...rest } = useQuery({
    queryKey: queryKeys.links.active(userId),
    queryFn: async () =>
      userId ? getActiveLinkByUserId(userId) : Promise.resolve(null),
    enabled: !!userId,
  });

  return {
    activeLink: data ?? null,
    loading: rest.isLoading,
    error: rest.isError,
    refetch: rest.refetch,
  };
}
