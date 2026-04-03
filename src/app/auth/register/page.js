'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleMeta } from '@/contexts/CoupleContext';
import { ensureUserAccount } from '@/lib/account';
import { getFirebaseSetupMessage, isFirebaseSetupError } from '@/lib/firebaseErrors';
import { getPendingCoupleSyncId, getPendingInviteCode, setAuthFlow } from '@/lib/session';
import AuthShowcase from '@/components/auth/AuthShowcase';
import AuthBrandMark from '@/components/auth/AuthBrandMark';

export default function RegisterPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    authError,
    signInWithGoogle,
    signUpWithEmail,
  } = useAuth();
  const { coupleId, coupleLoading } = useCoupleMeta();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingInviteCode, setPendingInviteCodeState] = useState(() => getPendingInviteCode());

  useEffect(() => {
    setPendingInviteCodeState(getPendingInviteCode());
  }, [user?.uid]);

  const firebaseSetupMessage = isFirebaseSetupError(authError) ? getFirebaseSetupMessage(authError) : '';
  const disableRealAuth = Boolean(firebaseSetupMessage);

  useEffect(() => {
    const pendingCoupleSyncId = getPendingCoupleSyncId();
    if (authLoading || coupleLoading || !user) return;
    if (pendingCoupleSyncId && !coupleId) return;
    if (pendingInviteCode && !coupleId) {
      router.replace(`/invite/${pendingInviteCode}`);
      return;
    }
    router.replace(coupleId ? '/app/home' : '/onboarding');
  }, [authLoading, coupleId, coupleLoading, pendingInviteCode, router, user]);

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const credential = await signUpWithEmail(email, password);
      await ensureUserAccount(credential.user);

      if (pendingInviteCode) {
        router.push(`/invite/${pendingInviteCode}`);
        return;
      }

      setAuthFlow('create');
      router.push('/onboarding');
    } catch (submissionError) {
      setError(
        submissionError.code === 'auth/email-already-in-use'
          ? 'Este e-mail já está em uso.'
          : 'Não foi possível criar a conta agora.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    setError('');
    setLoading(true);

    try {
      const credential = await signInWithGoogle();
      await ensureUserAccount(credential.user);

      if (pendingInviteCode) {
        router.push(`/invite/${pendingInviteCode}`);
        return;
      }

      setAuthFlow('create');
      router.push('/onboarding');
    } catch {
      setError('Não foi possível continuar com Google.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-split">
      <AuthShowcase />
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <AuthBrandMark />

          <h1 className="auth-split-title">Criar conta</h1>

          {pendingInviteCode && (
            <div className="auth-banner" style={{ marginBottom: '24px' }}>
              <strong>Convite detectado</strong>
              <span>Você vai entrar automaticamente no espaço compartilhado ao concluir o cadastro.</span>
            </div>
          )}

          {firebaseSetupMessage && (
            <div className="auth-banner" style={{ marginBottom: '24px' }}>
              <strong>Firebase ainda não configurado</strong>
              <span>{firebaseSetupMessage}</span>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="auth-form">
            <div className="auth-field">
              <label>
                <span className="label-icon"><Mail size={13} /></span>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="você@email.com"
                required
                disabled={disableRealAuth || loading}
              />
            </div>

            <div className="auth-field">
              <label>
                <span className="label-icon"><Lock size={13} /></span>
                Senha
              </label>
              <div className="auth-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="mínimo de 6 caracteres"
                  required
                  disabled={disableRealAuth || loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(value => !value)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label>
                <span className="label-icon"><Lock size={13} /></span>
                Confirmar senha
              </label>
              <div className="auth-password-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  placeholder="repita sua senha"
                  required
                  disabled={disableRealAuth || loading}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirm(value => !value)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading || disableRealAuth}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="auth-divider"><span>ou</span></div>

          <button className="btn-google" onClick={handleGoogleRegister} disabled={loading || disableRealAuth}>
            <Chrome size={18} />
            Continuar com Google
          </button>

          <p className="auth-footer-link">
            Já tem conta? <Link href="/auth/login">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
