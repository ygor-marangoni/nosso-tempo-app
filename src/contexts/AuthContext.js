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
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isActive = true;
    let resolved = false;

    const finishBootstrap = (nextUser, nextError = null) => {
      if (!isActive || resolved) return;
      resolved = true;
      setUser(nextUser);
      setAuthError(nextError);
      setLoading(false);
    };

    const timeoutId = window.setTimeout(() => {
      const demoUser = getDemoSession() ? DEMO_USER : null;
      finishBootstrap(
        demoUser,
        demoUser
          ? null
          : {
              code: 'auth/bootstrap-timeout',
              message: 'A inicialização do Firebase Auth demorou mais do que o esperado.',
            },
      );
    }, 4500);

    const unsubscribe = onAuthStateChanged(
      auth,
      currentUser => {
        window.clearTimeout(timeoutId);
        finishBootstrap(getDemoSession() ? DEMO_USER : currentUser, null);
      },
      error => {
        window.clearTimeout(timeoutId);
        const demoUser = getDemoSession() ? DEMO_USER : null;
        finishBootstrap(demoUser, error);
      },
    );

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  async function signInWithGoogle() {
    setAuthError(null);
    clearDemoSession();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    setUser(credential.user);
    return credential;
  }

  async function signInWithTestAccount() {
    setAuthError(null);
    setDemoSession();
    setUser(DEMO_USER);
    setLoading(false);
    return { user: DEMO_USER };
  }

  async function signInWithEmail(email, password) {
    setAuthError(null);
    if (isDemoCredentials(email, password)) {
      return signInWithTestAccount();
    }

    clearDemoSession();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    setUser(credential.user);
    return credential;
  }

  async function signUpWithEmail(email, password) {
    setAuthError(null);
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
    setAuthError(null);
    return sendPasswordResetEmail(auth, email.trim());
  }

  async function signOut() {
    if (user?.isDemo) {
      setAuthError(null);
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
        authError,
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
