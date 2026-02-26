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
      try {
        const profile = await getUserProfile(session.user.id);
        if (!cancelled)
          setGate(profile.name && profile.username ? 'app' : 'needsProfile');
      } catch {
        if (!cancelled) setGate('auth');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, session?.user.id]);

  return gate;
}
