import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../lib/supabase/hooks/useAuth';
import { getActiveLinkByUserId } from '../../../lib/supabase/queries/links';
import { queryKeys } from '../../../lib/queryKeys';

export function useActiveLink() {
  const { session } = useAuth();
  const userId = session?.user?.id;

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
