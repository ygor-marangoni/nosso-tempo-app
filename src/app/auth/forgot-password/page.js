'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Mail, SendHorizonal } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthShowcase from '@/components/auth/AuthShowcase';
import AuthBrandMark from '@/components/auth/AuthBrandMark';

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

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
                Enviamos as instruções de recuperação para<br />
                <strong>{email}</strong>
              </p>
              <p className="auth-sent-hint">
                Não recebeu? Verifique a pasta de spam ou tente novamente.
              </p>
              <button
                className="auth-sent-retry"
                onClick={() => { setSent(false); setEmail(''); }}
              >
                Tentar com outro e-mail
              </button>
              <Link href="/auth/login" className="auth-back-link" style={{ justifyContent: 'center', marginTop: 20 }}>
                <ArrowLeft size={14} />
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="auth-split-title">Esqueci a senha</h1>
              <p className="auth-forgot-desc">
                Digite seu e-mail e enviaremos um link para você criar uma nova senha.
              </p>

              <form onSubmit={handleSubmit} className="auth-form">
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
                    autoFocus
                  />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                  {loading ? 'Enviando...' : (
                    <>
                      <SendHorizonal size={15} />
                      Enviar link de recuperação
                    </>
                  )}
                </button>
              </form>

              <Link href="/auth/login" className="auth-back-link" style={{ justifyContent: 'center', marginTop: 24 }}>
                <ArrowLeft size={14} />
                Voltar para o login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
