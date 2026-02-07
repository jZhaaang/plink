import { getUserProfile } from '../queries/users';
import { resolveProfile } from '../../resolvers/profile';
import { useAsync } from './useAync';

export function useProfile(userId: string | null) {
  const { data: profile, ...rest } = useAsync(async () => {
    if (!userId) return null;
    const raw = await getUserProfile(userId);
    return raw ? resolveProfile(raw) : null;
  }, [userId]);

  return { profile, ...rest };
}
