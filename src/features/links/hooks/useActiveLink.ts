import { useAuth } from '../../../lib/supabase/hooks/useAuth';
import { useAsync } from '../../../lib/supabase/hooks/useAync';
import { getActiveLinkByUserId } from '../../../lib/supabase/queries/links';

export function useActiveLink() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data, ...rest } = useAsync(
    async () =>
      userId ? getActiveLinkByUserId(userId) : Promise.resolve(null),
    [userId],
  );

  return { activeLink: data ?? null, ...rest };
}
