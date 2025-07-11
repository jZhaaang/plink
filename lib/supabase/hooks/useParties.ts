import { Party } from '@/types/models';
import { useEffect, useState } from 'react';
import { getUserParties } from '../queries';
import { useUserId } from './useUserId';

export default function useParties() {
  const { userId, loading: userLoading } = useUserId();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || userLoading) return;
    const fetchData = async () => {
      try {
        const { data: userParties, error: partiesError } = await getUserParties(userId);
        if (!userParties || partiesError) throw partiesError;

        setParties(userParties);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, userLoading]);

  return { parties, loading, error };
}
