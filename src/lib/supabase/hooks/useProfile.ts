import { getUserProfile } from '../queries/users';
import { toProfileResolved } from '../../resolvers/profile';
import { useAsync } from './useAync';

export function useProfile(userId: string | null) {
  const { data: profile, ...rest } = useAsync(async () => {
    if (!userId) return null;
    const raw = await getUserProfile(userId);
    return raw ? toProfileResolved(raw) : null;
  }, [userId]);

  return { profile, ...rest };
}
