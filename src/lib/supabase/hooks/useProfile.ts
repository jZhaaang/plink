import { useCallback, useEffect, useState } from 'react';
import { ProfileResolved } from '../../models';
import { getUserProfile } from '../queries/users';
import { toProfileResolved } from '../../resolvers/profile';

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<ProfileResolved | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const raw = await getUserProfile(userId);
      if (raw) {
        setProfile(await toProfileResolved(raw));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { profile, loading, error, refetch: fetch };
}
