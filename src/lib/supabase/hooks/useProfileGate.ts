import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { getUserProfile } from '../queries/users';

type Gate = 'loading' | 'auth' | 'needsProfile' | 'app';

export function useProfileGate(session: Session | null, ready: boolean) {
  const [gate, setGate] = useState<Gate>('loading');

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      setGate('auth');
      return;
    }

    let cancelled = false;
    setGate('loading');

    (async () => {
      const MAX_ATTEMPTS = 3;

      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        try {
          const profile = await getUserProfile(session.user.id);
          if (!cancelled)
            setGate(profile.name && profile.username ? 'app' : 'needsProfile');
          return;
        } catch {
          if (cancelled) return;
          if (attempt < MAX_ATTEMPTS - 1) {
            await new Promise((r) =>
              setTimeout(r, 500 * Math.pow(2, attempt - 1)),
            );
          }
        }
      }

      if (!cancelled) setGate('auth');
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, session?.user.id]);

  return gate;
}
