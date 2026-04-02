'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Loader } from 'lucide-react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useCouple } from '@/contexts/CoupleContext';
import { db } from '@/lib/firebase';
import { acceptInvite, lookupInvite } from '@/lib/invite';
import { ensureUserAccount } from '@/lib/account';
import { clearAuthFlow, clearPendingInviteCode, setAuthFlow, setPendingInviteCode } from '@/lib/session';
import { getPreferredUserName } from '@/lib/userName';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = Array.isArray(params.code) ? params.code[0] : params.code;
  const { user, loading: authLoading } = useAuth();
  const { coupleId, coupleLoading } = useCouple();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!code || authLoading || coupleLoading || status === 'joining' || status === 'done') return;

    if (!user) {
      setPendingInviteCode(code);
      setAuthFlow('join');
      router.replace('/auth/register');
      return;
    }

    handleInvite();
  }, [authLoading, code, coupleId, coupleLoading, router, status, user]);

  async function handleInvite() {
    setStatus('loading');
    setMessage('');

    try {
      const invite = await lookupInvite(code);

      if (!invite) {
        setStatus('invalid');
        setMessage('Este convite não existe ou não está mais disponível.');
        return;
      }

      if (coupleId) {
        if (coupleId === invite.coupleId) {
          clearAuthFlow();
          clearPendingInviteCode();
          setStatus('done');
          setMessage('Você já faz parte deste espaço. Redirecionando...');
          setTimeout(() => router.replace('/app/home'), 1200);
          return;
        }

        setStatus('error');
        setMessage('Sua conta já está vinculada a outro casal.');
        return;
      }

      if (invite.used && invite.usedBy && invite.usedBy !== user.uid) {
        setStatus('used');
        setMessage('Esse convite já foi aceito por outra pessoa.');
        return;
      }

      setStatus('joining');

      const configRef = doc(db, 'couples', invite.coupleId, 'config', invite.coupleId);
      const configSnap = await getDoc(configRef);
      const config = configSnap.exists() ? configSnap.data() : {};
      const partnerName = config.name2 || getPreferredUserName(user, 'Amor');

      await setDoc(
        doc(db, 'users', user.uid),
        {
          coupleId: invite.coupleId,
          email: user.email || '',
          joinedAt: serverTimestamp(),
          name: partnerName,
          role: 'partner',
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      await setDoc(
        doc(db, 'couples', invite.coupleId),
        {
          partnerUid: user.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      await setDoc(
        doc(db, 'couples', invite.coupleId, 'members', user.uid),
        {
          uid: user.uid,
          email: user.email || '',
          joinedAt: serverTimestamp(),
          name: partnerName,
          role: 'partner',
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      await setDoc(configRef, { name2: partnerName, updatedAt: serverTimestamp() }, { merge: true });
      await acceptInvite(code, user.uid);
      await ensureUserAccount(user, { coupleId: invite.coupleId, name: partnerName, role: 'partner' });

      clearAuthFlow();
      clearPendingInviteCode();
      setStatus('done');
      setMessage('Convite aceito. Redirecionando para o app...');
      setTimeout(() => router.replace('/app/home'), 1200);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Não foi possível aceitar esse convite agora.');
    }
  }

  const icon =
    status === 'loading' || status === 'joining' ? (
      <Loader size={44} color="var(--rosa-400)" className="spin" />
    ) : (
      <Heart
        size={44}
        fill={status === 'done' ? 'var(--rosa-500)' : 'transparent'}
        stroke={status === 'done' ? 'var(--rosa-500)' : 'var(--rosa-300)'}
      />
    );

  const titleMap = {
    loading: 'Verificando convite...',
    joining: 'Entrando no espaço de vocês...',
    invalid: 'Convite inválido',
    used: 'Convite já utilizado',
    done: 'Tudo certo',
    error: 'Não foi possível continuar',
  };

  return (
    <div className="auth-bg">
      <div className="auth-card auth-card-center">
        <div style={{ marginBottom: 10 }}>{icon}</div>
        <h1 className="auth-title">{titleMap[status]}</h1>
        {message && <p className="auth-sub">{message}</p>}
      </div>
    </div>
  );
}
