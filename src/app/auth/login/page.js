'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCouple } from '@/contexts/CoupleContext';
import { ensureUserAccount } from '@/lib/account';
import { getPendingInviteCode } from '@/lib/session';
import AuthShowcase from '@/components/auth/AuthShowcase';
import AuthBrandMark from '@/components/auth/AuthBrandMark';

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    signInWithEmail,
    signInWithTestAccount,
    testCredentials,
  } = useAuth();
  const { coupleId, coupleLoading } = useCouple();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingInviteCode, setPendingInviteCodeState] = useState('');

  useEffect(() => {
    setPendingInviteCodeState(getPendingInviteCode());
  }, []);

  useEffect(() => {
    if (authLoading || coupleLoading || !user) return;
    if (pendingInviteCode && !coupleId) {
      router.replace(`/invite/${pendingInviteCode}`);
      return;
    }
    router.replace(coupleId ? '/app/home' : '/onboarding');
  }, [authLoading, coupleId, coupleLoading, pendingInviteCode, router, user]);

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credential = await signInWithEmail(email, password);
      await ensureUserAccount(credential.user);
      if (pendingInviteCode && !credential.user?.isDemo) {
        router.push(`/invite/${pendingInviteCode}`);
        return;
      }
      router.push('/app/home');
    } catch (submissionError) {
      setError(
        submissionError.code === 'auth/invalid-credential' || submissionError.code === 'auth/wrong-password'
          ? 'E-mail ou senha incorretos.'
          : 'Não foi possível entrar agora.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setLoading(true);
    try {
      const credential = await signInWithGoogle();
      await ensureUserAccount(credential.user);
      if (pendingInviteCode) {
        router.push(`/invite/${pendingInviteCode}`);
        return;
      }
      router.push('/app/home');
    } catch {
      setError('Não foi possível entrar com Google.');
    } finally {
      setLoading(false);
    }
  }

  async function handleTestLogin() {
    setError('');
    setLoading(true);
    try {
      await signInWithTestAccount();
      router.push('/app/home');
    } catch {
      setError('Não foi possível abrir a conta teste.');
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

          <h1 className="auth-split-title">Entrar</h1>

          {pendingInviteCode && (
            <div className="auth-banner" style={{ marginBottom: '24px' }}>
              <strong>Convite pendente</strong>
              <span>Depois do login, você será levado direto para o convite do casal.</span>
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
                onChange={e => setEmail(e.target.value)}
                placeholder="você@email.com"
                required
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
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="auth-inline-link-row">
              <Link href="/auth/forgot-password" className="auth-inline-link">
                Esqueci minha senha
              </Link>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-divider"><span>ou</span></div>

          <button className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
            <Chrome size={18} />
            Entrar com Google
          </button>

          <div className="auth-test-row">
            <button onClick={handleTestLogin} disabled={loading}>Entrar com Conta Teste</button>
            <span>· {testCredentials.email} · {testCredentials.password}</span>
          </div>

          <p className="auth-footer-link">
            Ainda não tem conta? <Link href="/auth/register">Criar conta</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
