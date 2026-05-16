import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase.ts';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userStats: any | null;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<any | null>(null);

  const fetchUserStats = async (uid: string) => {
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
    await signInWithPopup(auth, googleProvider);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const refreshStats = async () => {
    if (user) await fetchUserStats(user.uid);
  };

  return (
    <AuthContext.Provider value={{ user, loading, userStats, signIn, logOut, refreshStats }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
