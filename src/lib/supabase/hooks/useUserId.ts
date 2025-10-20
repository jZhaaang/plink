import { useEffect, useState } from 'react';
import { supabase } from '../client';

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        setError(error);
        setUserId(null);
      } else {
        setUserId(data.user.id);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return { userId, loading, error };
}
