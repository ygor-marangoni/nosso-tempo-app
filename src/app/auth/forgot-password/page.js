'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, SendHorizonal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getFirebaseSetupMessage, isFirebaseSetupError } from '@/lib/firebaseErrors';
import AuthShowcase from '@/components/auth/AuthShowcase';
import AuthBrandMark from '@/components/auth/AuthBrandMark';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { authError, sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const firebaseSetupMessage = isFirebaseSetupError(authError) ? getFirebaseSetupMessage(authError) : '';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (submissionError) {
      setError(
        submissionError?.code === 'auth/user-not-found'
          ? 'Não encontramos uma conta com esse e-mail.'
          : 'Não foi possível enviar o link agora.',
      );
    } finally {
      setLoading(false);
    }
  }

  function goToLogin() {
    router.push('/auth/login');
  }

  return (
    <div className="auth-split">
      <AuthShowcase />

      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <AuthBrandMark />

          {sent ? (
            <div className="auth-sent-state">
              <div className="auth-sent-icon">
                <Mail size={28} />
              </div>

              <h1 className="auth-split-title">Link enviado!</h1>

              <p className="auth-sent-desc">
                Enviamos as instruções de recuperação para
                <strong>{email}</strong>
              </p>

              <p className="auth-sent-hint">
                Não recebeu? Verifique a pasta de spam ou tente novamente.
              </p>

              <div className="auth-sent-actions">
                <button
                  type="button"
                  className="auth-sent-retry"
                  onClick={() => {
                    setSent(false);
                    setEmail('');
                  }}
                >
                  Tentar com outro e-mail
                </button>

                <button
                  type="button"
                  className="auth-back-link auth-back-link--centered"
                  onClick={goToLogin}
                >
                  <ArrowLeft size={14} />
                  Voltar para o login
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="auth-split-title">Esqueci a senha</h1>
              <p className="auth-forgot-desc">
                Digite seu e-mail e enviaremos um link para você criar uma nova senha.
              </p>

              {firebaseSetupMessage && (
                <div className="auth-banner" style={{ marginBottom: '24px' }}>
                  <strong>Firebase ainda não configurado</strong>
                  <span>{firebaseSetupMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label>
                    <span className="label-icon"><Mail size={13} /></span>
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    placeholder="voce@email.com"
                    required
                    autoFocus
                    disabled={loading || Boolean(firebaseSetupMessage)}
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button
                  type="submit"
                  className="btn btn-primary auth-submit"
                  disabled={loading || Boolean(firebaseSetupMessage)}
                >
                  {loading ? 'Enviando...' : (
                    <>
                      <SendHorizonal size={15} />
                      Enviar link de recuperação
                    </>
                  )}
                </button>
              </form>

              <button
                type="button"
                className="auth-back-link auth-back-link--centered"
                onClick={goToLogin}
                style={{ marginTop: 24 }}
              >
                <ArrowLeft size={14} />
                Voltar para o login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
