import { db } from './firebase';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { normalizeInviteCode } from './session';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function createInvite(coupleId, createdByUid = null, partnerName = '') {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateCode();
    const inviteRef = doc(db, 'invites', code);
    const existing = await getDoc(inviteRef);

    if (existing.exists()) continue;

    await setDoc(inviteRef, {
      coupleId,
      createdAt: serverTimestamp(),
      createdByUid,
      partnerName: String(partnerName || '').trim(),
      used: false,
      usedAt: null,
      usedBy: null,
    });

    return code;
  }

  throw new Error('Não foi possível gerar um código de convite único.');
}

export async function lookupInvite(code) {
  const snap = await getDoc(doc(db, 'invites', normalizeInviteCode(code)));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function acceptInvite(code, uid) {
  await updateDoc(doc(db, 'invites', normalizeInviteCode(code)), {
    used: true,
    usedAt: serverTimestamp(),
    usedBy: uid,
  });
}

export function inviteHref(code, origin = '') {
  const normalized = normalizeInviteCode(code);
  return normalized ? `${origin}/invite/${normalized}` : '';
}
