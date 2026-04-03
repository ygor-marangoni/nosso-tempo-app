'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowRight, Heart, Loader } from 'lucide-react';
import Link from 'next/link';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import AuthBrandMark from '@/components/auth/AuthBrandMark';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleMeta } from '@/contexts/CoupleContext';
import { ensureUserAccount } from '@/lib/account';
import { db } from '@/lib/firebase';
import { acceptInvite, lookupInvite } from '@/lib/invite';
import { clearAuthFlow, clearPendingCoupleSyncId, clearPendingInviteCode, setAuthFlow, setPendingCoupleSyncId, setPendingInviteCode } from '@/lib/session';
import { getPreferredUserName } from '@/lib/userName';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const code = Array.isArray(params.code) ? params.code[0] : params.code;
  const { user, loading: authLoading } = useAuth();
  const { coupleId, coupleLoading } = useCoupleMeta();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const isHandlingRef = useRef(false);
  const redirectTimeoutRef = useRef(null);

  useEffect(() => {
    if (!code || authLoading || coupleLoading || isHandlingRef.current) return;

    if (!user) {
      setPendingInviteCode(code);
      setAuthFlow('join');
      router.replace('/auth/register');
      return;
    }

    handleInvite();
  }, [authLoading, code, coupleId, coupleLoading, router, user]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  async function handleInvite() {
    isHandlingRef.current = true;
    setStatus('loading');
    setMessage('');

    try {
      const invite = await lookupInvite(code);

      if (!invite) {
        clearAuthFlow();
        clearPendingInviteCode();
        setStatus('invalid');
        setMessage('Este convite não existe ou não está mais disponível.');
        return;
      }

      if (coupleId) {
        if (coupleId === invite.coupleId) {
          clearAuthFlow();
          clearPendingCoupleSyncId();
          clearPendingInviteCode();
          setStatus('done');
          setMessage('Você já faz parte deste espaço. Redirecionando...');
          redirectTimeoutRef.current = setTimeout(() => router.replace('/app/home'), 1200);
          return;
        }

        clearAuthFlow();
        clearPendingInviteCode();
        setStatus('error');
        setMessage('Sua conta já está vinculada a outro casal.');
        return;
      }

      if (invite.used && invite.usedBy && invite.usedBy !== user.uid) {
        clearAuthFlow();
        clearPendingInviteCode();
        setStatus('used');
        setMessage('Esse convite já foi aceito por outra pessoa.');
        return;
      }

      setStatus('joining');

      const partnerName = String(invite.partnerName || '').trim() || getPreferredUserName(user, 'Amor');

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

      await acceptInvite(code, user.uid);
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
      await ensureUserAccount(user, { coupleId: invite.coupleId, name: partnerName, role: 'partner' });

      clearAuthFlow();
      setPendingCoupleSyncId(invite.coupleId);
      clearPendingInviteCode();
      setStatus('done');
      setMessage('Convite aceito. Redirecionando para o app...');
      redirectTimeoutRef.current = setTimeout(() => router.replace('/app/home'), 1200);
    } catch (error) {
      console.error(error);
      clearAuthFlow();
      clearPendingInviteCode();
      setStatus('error');
      setMessage('Não foi possível aceitar esse convite agora.');
    } finally {
      isHandlingRef.current = false;
    }
  }

  const isLoading = status === 'loading' || status === 'joining';
  const isError = status === 'invalid' || status === 'used' || status === 'error';
  const isDone = status === 'done';

  const titleMap = {
    loading: 'Verificando convite...',
    joining: 'Entrando no espaço de vocês...',
    invalid: 'Convite inválido',
    used: 'Convite já utilizado',
    done: 'Tudo certo!',
    error: 'Não foi possível continuar',
  };

  return (
    <div className="invite-wrap">
      <AuthBrandMark />

      <div className="invite-card">
        <div className={`invite-icon-wrap${isDone ? ' invite-icon-wrap--done' : isError ? ' invite-icon-wrap--error' : ''}`}>
          {isLoading && <Loader size={28} className="spin" />}
          {isDone && <Heart size={28} fill="var(--rosa-500)" stroke="var(--rosa-500)" />}
          {isError && <AlertCircle size={28} />}
        </div>

        <h2 className="invite-title">{titleMap[status]}</h2>
        {message && <p className="invite-message">{message}</p>}

        {isError && (
          <Link href="/" className="btn btn-primary invite-cta">
            Ir para o início
            <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}
