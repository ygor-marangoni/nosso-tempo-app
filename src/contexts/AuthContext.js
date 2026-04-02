'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  reload,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  clearDemoSession,
  DEMO_CREDENTIALS,
  DEMO_USER,
  getDemoSession,
  isDemoCredentials,
  setDemoSession,
} from '@/lib/demoAccount';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(getDemoSession() ? DEMO_USER : currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    clearDemoSession();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    setUser(credential.user);
    return credential;
  }

  async function signInWithTestAccount() {
    setDemoSession();
    setUser(DEMO_USER);
    setLoading(false);
    return { user: DEMO_USER };
  }

  async function signInWithEmail(email, password) {
    if (isDemoCredentials(email, password)) {
      return signInWithTestAccount();
    }

    clearDemoSession();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    setUser(credential.user);
    return credential;
  }

  async function signUpWithEmail(email, password) {
    clearDemoSession();
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    try {
      await firebaseSendEmailVerification(credential.user);
    } catch {}

    setUser(credential.user);
    return credential;
  }

  async function sendVerificationEmail() {
    if (!auth.currentUser || user?.isDemo) return;
    await firebaseSendEmailVerification(auth.currentUser);
  }

  async function refreshUser() {
    if (!auth.currentUser || user?.isDemo) return user;
    await reload(auth.currentUser);
    setUser(auth.currentUser);
    return auth.currentUser;
  }

  async function sendPasswordReset(email) {
    return sendPasswordResetEmail(auth, email.trim());
  }

  async function signOut() {
    if (user?.isDemo) {
      clearDemoSession();
      setUser(null);
      return;
    }

    return firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signInWithTestAccount,
        sendPasswordReset,
        sendVerificationEmail,
        signOut,
        signUpWithEmail,
        refreshUser,
        testCredentials: DEMO_CREDENTIALS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
