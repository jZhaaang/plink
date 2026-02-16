import { getUserProfile } from '../../../lib/supabase/queries/users';
import { resolveProfile } from '../../../lib/resolvers/profile';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/queryKeys';

export function useProfile(userId: string | null) {
  const { data: profile, ...rest } = useQuery({
    queryKey: queryKeys.profile.detail(userId),
    queryFn: async () => {
      if (!userId) return null;
      const raw = await getUserProfile(userId);
      return raw ? resolveProfile(raw) : null;
    },
    enabled: !!userId,
  });

  return {
    profile,
    loading: rest.isLoading,
    error: rest.error,
    refetch: rest.refetch,
  };
}
