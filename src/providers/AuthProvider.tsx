import { Session } from '@supabase/supabase-js';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '../lib/supabase/client';
import { clearUser, setUser } from '../lib/telemetry/monitoring';
import { identifyUser, resetUser } from '../lib/telemetry/analytics';

type AuthContextValue = {
  session: Session | null;
  userId: string | null;
  ready: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  userId: null,
  ready: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);

      if (s?.user) {
        setUser(s.user.id, s.user.email ?? undefined);
        identifyUser(s.user.id, { email: s.user.email ?? '' });
      } else {
        clearUser();
        resetUser();
      }
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, userId: session?.user?.id ?? null, ready }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
