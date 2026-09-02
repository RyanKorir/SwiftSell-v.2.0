import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase.ts';

interface UserStats {
  uid: string;
  pin: string;
  xp: number;
  level: number;
  currentStreak: number;
  lastActiveDate: string;
  badges: any[];
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userStats: UserStats | null;
  authError: string | null;
  providerToken: string | null;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapUserRow(row: any): UserStats {
  return {
    uid: row.id,
    pin: row.pin,
    xp: row.xp,
    level: row.level,
    currentStreak: row.current_streak,
    lastActiveDate: row.last_active_date,
    badges: row.badges ?? [],
    displayName: row.display_name ?? null
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [providerToken, setProviderToken] = useState<string | null>(null);

  const fetchUserStats = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserStats(mapUserRow(data));
        return;
      }

      // Initialize user row if it doesn't exist yet
      const { data: created, error: insertError } = await supabase
        .from('users')
        .insert({ id: uid })
        .select()
        .single();

      if (insertError) throw insertError;
      setUserStats(mapUserRow(created));
    } catch (err: any) {
      setAuthError(
        err?.code === '42501' || err?.message?.includes('policy')
          ? 'Signed in, but your account data was blocked by Row Level Security. Check the policies on the users table.'
          : err?.message || 'Failed to load account data.'
      );
      console.error('Supabase user-stats error:', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setProviderToken(session?.provider_token ?? null);
      if (session?.user) {
        fetchUserStats(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setProviderToken(session?.provider_token ?? null);
      if (session?.user) {
        await fetchUserStats(session.user.id);
      } else {
        setUserStats(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          scopes: 'https://www.googleapis.com/auth/spreadsheets',
          queryParams: { access_type: 'offline', prompt: 'consent' }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      const message = err?.message || '';
      if (message.toLowerCase().includes('provider is not enabled')) {
        setAuthError(
          'Google sign-in is not enabled yet. Enable it under Supabase Dashboard → Authentication → Providers → Google.'
        );
      } else if (message.toLowerCase().includes('redirect')) {
        setAuthError(
          "This URL isn't in the allowed redirect list yet. Add it under Supabase Dashboard → Authentication → URL Configuration."
        );
      } else {
        setAuthError(message || 'Sign-in failed. Please try again.');
      }
      console.error('Sign-in error:', err);
    }
  };

  const logOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshStats = async () => {
    if (user) await fetchUserStats(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, loading, userStats, authError, providerToken, signIn, logOut, refreshStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
