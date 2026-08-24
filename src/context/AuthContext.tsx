import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase.ts';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userStats: any | null;
  authError: string | null;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<any | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchUserStats = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserStats(userDoc.data());
      } else {
        // Initialize user stats if they don't exist
        const initialStats = {
          uid: uid,
          pin: '0000',
          xp: 0,
          level: 1,
          currentStreak: 0,
          lastActiveDate: new Date().toISOString(),
          badges: []
        };
        await setDoc(doc(db, 'users', uid), initialStats);
        setUserStats(initialStats);
      }
    } catch (err: any) {
      setAuthError(
        err?.code === 'permission-denied'
          ? 'Signed in, but your account data was blocked by Firestore security rules. Check the deployed firestore.rules.'
          : err?.message || 'Failed to load account data.'
      );
      console.error('Firestore user-stats error:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserStats(currentUser.uid);
      } else {
        setUserStats(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const code = err?.code as string | undefined;
      if (code === 'auth/unauthorized-domain') {
        setAuthError(
          "This domain isn't authorized for sign-in yet. Add it under Firebase Console → Authentication → Settings → Authorized domains."
        );
      } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setAuthError('Sign-in was closed before completing. Try again.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Your browser blocked the sign-in popup. Allow popups for this site and try again.');
      } else {
        setAuthError(err?.message || 'Sign-in failed. Please try again.');
      }
      console.error('Sign-in error:', err);
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const refreshStats = async () => {
    if (user) await fetchUserStats(user.uid);
  };

  return (
    <AuthContext.Provider value={{ user, loading, userStats, authError, signIn, logOut, refreshStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
