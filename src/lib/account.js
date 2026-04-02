import { db } from './firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

function definedEntries(data) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

export async function ensureUserAccount(user, overrides = {}) {
  if (!user || user.isDemo) return;

  const fallbackName = user.displayName || user.email?.split('@')[0] || '';
  const providers = Array.from(new Set((user.providerData || []).map(provider => provider?.providerId).filter(Boolean)));

  const payload = definedEntries({
    uid: user.uid,
    email: user.email || '',
    photoURL: user.photoURL || '',
    displayName: fallbackName,
    authProviders: providers,
    updatedAt: serverTimestamp(),
    ...overrides,
  });

  await setDoc(
    doc(db, 'users', user.uid),
    payload,
    { merge: true },
  );
}
