'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chrome, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCouple } from '@/contexts/CoupleContext';
import { ensureUserAccount } from '@/lib/account';
import { clearAuthFlow, getPendingInviteCode, setAuthFlow } from '@/lib/session';
import AuthShowcase from '@/components/auth/AuthShowcase';
import AuthBrandMark from '@/components/auth/AuthBrandMark';

export default function RegisterPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    signInWithTestAccount,
    signUpWithEmail,
    testCredentials,
  } = useAuth();
  const { coupleId, coupleLoading } = useCouple();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
        clearAuthFlow();
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
        clearAuthFlow();
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

  async function handleTestAccount() {
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

          <h1 className="auth-split-title">Criar conta</h1>

          {pendingInviteCode && (
            <div className="auth-banner" style={{ marginBottom: '24px' }}>
              <strong>Convite detectado</strong>
              <span>Você vai entrar automaticamente no espaço compartilhado ao concluir o cadastro.</span>
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
                  placeholder="mínimo de 6 caracteres"
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

            <div className="auth-field">
              <label>
                <span className="label-icon"><Lock size={13} /></span>
                Confirmar senha
              </label>
              <div className="auth-password-wrap">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="repita sua senha"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowConfirm(v => !v)}
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Criando Conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="auth-divider"><span>ou</span></div>

          <button className="btn-google" onClick={handleGoogleRegister} disabled={loading}>
            <Chrome size={18} />
            Continuar com Google
          </button>

          <div className="auth-test-row">
            <button onClick={handleTestAccount} disabled={loading}>Usar Conta Teste</button>
            <span>· {testCredentials.email} · {testCredentials.password}</span>
          </div>

          <p className="auth-footer-link">
            Já tem conta? <Link href="/auth/login">Entrar</Link>
          </p>

        </div>
      </div>
    </div>
  );
}
