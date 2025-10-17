import { supabase } from '../client';

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email: email.trim(), password });
}

export async function signUpWithEmail(email: string, password: string) {
  return supabase.auth.signUp({ email: email.trim(), password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function resetPassword(email: string, redirectTo?: string) {
  return supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
}

export async function signInWithGoogle(redirectTo?: string) {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
}
