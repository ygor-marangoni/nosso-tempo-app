'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Clock,
  Image as ImageIcon,
  Milestone,
  Shield,
  Gift,
  RefreshCw,
  UserPlus,
  Send,
  Check,
  Quote,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCouple } from '@/contexts/CoupleContext';
import { getPendingInviteCode } from '@/lib/session';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { coupleId, coupleLoading } = useCouple();
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (authLoading || coupleLoading || !user) return;
    const pendingInvite = getPendingInviteCode();
    if (pendingInvite && !coupleId) {
      router.replace(`/invite/${pendingInvite}`);
      return;
    }
    router.replace(coupleId ? '/app/home' : '/onboarding');
  }, [authLoading, coupleId, coupleLoading, router, user]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll('.lp-animate');
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('lp-visible'); }),
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="lp">

      {/* ── NAVBAR ──────────────────────────────── */}
      <nav className={`lp-nav${navScrolled ? ' lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-nav-logo">
            <Heart size={16} fill="var(--rosa-500)" stroke="var(--rosa-500)" />
            <span>Nosso Tempo</span>
          </div>

          <div className="lp-nav-links">
            <button className="lp-nav-link" onClick={() => scrollTo('funcionalidades')}>Funcionalidades</button>
            <button className="lp-nav-link" onClick={() => scrollTo('como-funciona')}>Como Funciona</button>
            <button className="lp-nav-link" onClick={() => scrollTo('depoimentos')}>Depoimentos</button>
          </div>

          <div className="lp-nav-actions">
            <Link href="/auth/login" className="lp-nav-link">Entrar</Link>
            <Link href="/auth/register" className="lp-btn lp-btn--primary lp-btn--sm">Comece agora</Link>
          </div>

          <button className="lp-hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menuOpen && (
          <div className="lp-mobile-menu">
            <button className="lp-mobile-link" onClick={() => scrollTo('funcionalidades')}>Funcionalidades</button>
            <button className="lp-mobile-link" onClick={() => scrollTo('como-funciona')}>Como Funciona</button>
            <button className="lp-mobile-link" onClick={() => scrollTo('depoimentos')}>Depoimentos</button>
            <Link href="/auth/login" className="lp-mobile-link" onClick={() => setMenuOpen(false)}>Entrar</Link>
            <Link href="/auth/register" className="lp-btn lp-btn--primary lp-mobile-cta" onClick={() => setMenuOpen(false)}>
              Comece agora
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ────────────────────────────────── */}
      <section className="lp-hero">
        <div className="lp-hero-content lp-animate">
          <div className="lp-badge">
            <Heart size={12} fill="var(--rosa-500)" stroke="var(--rosa-500)" />
            100% gratuito
          </div>

          <h1 className="lp-hero-title">
            Cada momento<br />
            <span className="lp-cursive">junto</span> merece<br />
            ser lembrado
          </h1>

          <p className="lp-hero-sub">
            O Nosso Tempo é o cantinho de vocês dois na internet. Registrem as horas juntos, guardem fotos, construam a linha do tempo do relacionamento — e vejam a história de vocês crescer.
          </p>

          <div className="lp-hero-btns">
            <Link href="/auth/register" className="lp-btn lp-btn--primary lp-btn--lg">
              <Heart size={16} fill="#fff" stroke="#fff" />
              Criar nosso espaço
            </Link>
            <button className="lp-btn lp-btn--ghost lp-btn--lg" onClick={() => scrollTo('como-funciona')}>
              <ChevronDown size={16} />
              Ver como funciona
            </button>
          </div>

          <p className="lp-hero-proof">
            <Heart size={12} fill="var(--rosa-400)" stroke="var(--rosa-400)" />
            Feito com amor para casais como vocês
          </p>
        </div>

        <div className="lp-hero-visual lp-animate lp-animate--delay">
          <div className="lp-mockup">
            <div className="lp-mockup-dots"><span /><span /><span /></div>
            <div className="lp-mockup-body">
              <div className="lp-mockup-greeting">Boa noite, vocês dois</div>
              <div className="lp-mockup-counter">
                <span className="lp-mockup-num">2</span>
                <span className="lp-mockup-sep">·</span>
                <span className="lp-mockup-num">4</span>
                <span className="lp-mockup-sep">·</span>
                <span className="lp-mockup-num">17</span>
              </div>
              <div className="lp-mockup-unit">anos · meses · dias juntos</div>
              <div className="lp-mockup-photo-ph">
                <Heart size={28} fill="var(--rosa-200)" stroke="none" />
              </div>
              <div className="lp-mockup-tags">
                <span>Assistir série</span>
                <span>Cozinhar</span>
                <span>Passear</span>
              </div>
            </div>
          </div>
          <span className="lp-deco lp-deco--1" aria-hidden="true">
            <Heart size={22} fill="var(--rosa-200)" stroke="none" />
          </span>
          <span className="lp-deco lp-deco--2" aria-hidden="true">
            <Heart size={13} fill="var(--rosa-300)" stroke="none" />
          </span>
          <span className="lp-deco lp-deco--3" aria-hidden="true">
            <Heart size={17} fill="var(--rosa-100)" stroke="var(--rosa-200)" />
          </span>
        </div>
      </section>

      {/* ── TRUST BAR ───────────────────────────── */}
      <div className="lp-trust-bar">
        <div className="lp-trust-inner">
          {[
            { icon: <Gift size={17} />, label: '100% Gratuito' },
            { icon: <Shield size={17} />, label: 'Dados Privados' },
            { icon: <Heart size={17} fill="var(--rosa-500)" stroke="var(--rosa-500)" />, label: 'Feito para Casais' },
            { icon: <RefreshCw size={17} />, label: 'Sincronização em Tempo Real' },
          ].map((item) => (
            <div className="lp-trust-item" key={item.label}>
              <span className="lp-trust-icon">{item.icon}</span>
              <span className="lp-trust-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ────────────────────────────── */}
      <section className="lp-section" id="funcionalidades">
        <div className="lp-section-inner">
          <div className="lp-section-header lp-animate">
            <h2 className="lp-section-title">
              Tudo que o <span className="lp-cursive">casal</span> precisa, num só lugar
            </h2>
          </div>
          <div className="lp-features-grid">
            {[
              {
                icon: <Clock size={24} />,
                title: 'Registrar Momentos',
                desc: 'Registrem cada hora juntos — do chamego no sofá até a viagem dos sonhos. Vejam o tempo de vocês se transformar em história.',
              },
              {
                icon: <ImageIcon size={24} />,
                title: 'Álbum de Fotos',
                desc: 'Guardem as fotos que fazem o coração apertar. Aquela selfie boba? Ela vale ouro daqui a 10 anos.',
              },
              {
                icon: <Milestone size={24} />,
                title: 'Linha do Tempo',
                desc: 'O primeiro beijo, o primeiro "eu te amo", a primeira viagem. Cada marco do relacionamento numa timeline linda.',
              },
            ].map((feat, i) => (
              <div className={`lp-feat-card lp-animate lp-animate--delay-${i + 1}`} key={feat.title}>
                <div className="lp-feat-icon">{feat.icon}</div>
                <h3 className="lp-feat-title">{feat.title}</h3>
                <p className="lp-feat-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ────────────────────────────── */}
      <section className="lp-section lp-section--alt">
        <div className="lp-section-inner">

          {/* A — texto à esquerda, mockup à direita */}
          <div className="lp-showcase lp-animate">
            <div className="lp-showcase-text">
              <h3 className="lp-showcase-title">Registrem o dia a dia sem esforço</h3>
              <p className="lp-showcase-desc">
                Simples e rápido: escolham as atividades de vocês, anotem uma observação, pronto. Os dois podem registrar do próprio celular.
              </p>
              <ul className="lp-showcase-bullets">
                {[
                  'Atividades pré-definidas e personalizáveis',
                  'Cada um registra do seu celular',
                  'Observações para nunca esquecer os detalhes',
                ].map((b) => (
                  <li key={b}><Check size={14} />{b}</li>
                ))}
              </ul>
            </div>
            <div className="lp-showcase-visual">
              <RegisterScreen />
            </div>
          </div>

          {/* B — mockup à esquerda, texto à direita */}
          <div className="lp-showcase lp-animate">
            <div className="lp-showcase-visual">
              <ReportsScreen />
            </div>
            <div className="lp-showcase-text">
              <h3 className="lp-showcase-title">Vejam a história de vocês crescer</h3>
              <p className="lp-showcase-desc">
                Relatórios e linha do tempo que mostram como o casal investe o tempo na relação — de um jeito visual e emocionante.
              </p>
              <ul className="lp-showcase-bullets">
                {[
                  'Gráficos que mostram como vocês aproveitam o tempo',
                  'Linha do tempo dos marcos mais importantes',
                  'Contador de quanto tempo estão juntos',
                ].map((b) => (
                  <li key={b}><Check size={14} />{b}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* C — texto à esquerda, mockup à direita */}
          <div className="lp-showcase lp-showcase--last lp-animate">
            <div className="lp-showcase-text">
              <h3 className="lp-showcase-title">Um álbum só de vocês dois</h3>
              <p className="lp-showcase-desc">
                Privado, bonito e organizado. Cada foto guardada com carinho num espaço que só vocês dois acessam.
              </p>
              <ul className="lp-showcase-bullets">
                {[
                  'Galeria organizada e elegante',
                  'Visualização em tela cheia',
                  'Fotos seguras e privadas',
                ].map((b) => (
                  <li key={b}><Check size={14} />{b}</li>
                ))}
              </ul>
            </div>
            <div className="lp-showcase-visual">
              <AlbumScreen />
            </div>
          </div>

        </div>
      </section>

      {/* ── COMO FUNCIONA ────────────────────────── */}
      <section className="lp-section" id="como-funciona">
        <div className="lp-section-inner">
          <div className="lp-section-header lp-animate">
            <h2 className="lp-section-title">
              Comecem em menos de <span className="lp-cursive">1 minuto</span>
            </h2>
          </div>
          <div className="lp-steps">
            {[
              { icon: <UserPlus size={22} />, step: '01', title: 'Crie sua conta', desc: 'Cadastro rápido com Google ou email. Sem burocracia.' },
              { icon: <Send size={22} />, step: '02', title: 'Convide seu amor', desc: 'Envie o link de convite. Quando aceitar, o espaço de vocês está pronto.' },
              { icon: <Heart size={22} />, step: '03', title: 'Comecem a registrar', desc: 'Cada momento juntos vira uma memória guardada para sempre.' },
            ].map((step, i) => (
              <div className={`lp-step lp-animate lp-animate--delay-${i + 1}`} key={step.step}>
                <div className="lp-step-icon">{step.icon}</div>
                <div className="lp-step-num">{step.step}</div>
                <h3 className="lp-step-title">{step.title}</h3>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ─────────────────────────── */}
      <section className="lp-section lp-section--alt" id="depoimentos">
        <div className="lp-section-inner">
          <div className="lp-section-header lp-animate">
            <h2 className="lp-section-title">
              O que <span className="lp-cursive">casais</span> estão dizendo
            </h2>
          </div>
          <div className="lp-testimonials">
            {[
              { text: 'A gente nem percebia quanto tempo passava junto até começar a registrar. Agora é nosso ritual favorito.', couple: 'Ana & Pedro', time: '3 anos juntos' },
              { text: 'Ver a linha do tempo crescendo dá uma sensação inexplicável. Cada marco me faz lembrar por que escolhi ele.', couple: 'Mariana & Lucas', time: '1 ano e meio juntos' },
              { text: 'É tipo o nosso diário de casal, mas muito mais bonito. E é de graça, o que é inacreditável.', couple: 'Sofia & Rafael', time: '5 anos juntos' },
            ].map((t, i) => (
              <div className={`lp-testimonial lp-animate lp-animate--delay-${i + 1}`} key={i}>
                <Quote size={30} className="lp-testimonial-quote" />
                <p className="lp-testimonial-text">{t.text}</p>
                <div className="lp-testimonial-author">
                  <span className="lp-testimonial-couple">{t.couple}</span>
                  <span className="lp-testimonial-time">{t.time}</span>
                </div>
                <div className="lp-testimonial-hearts">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Heart key={n} size={12} fill="var(--rosa-400)" stroke="none" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────── */}
      <section className="lp-cta-final lp-animate">
        <div className="lp-cta-final-inner">
          <h2 className="lp-cta-final-title">
            A história de <span className="lp-cursive">vocês</span> merece ser guardada
          </h2>
          <p className="lp-cta-final-sub">
            Crie o espaço do casal agora — é gratuito, leva menos de 1 minuto, e vocês vão agradecer no futuro.
          </p>
          <Link href="/auth/register" className="lp-btn lp-btn--primary lp-btn--xl">
            <Heart size={18} fill="#fff" stroke="#fff" />
            Começar agora — é grátis
          </Link>
          <p className="lp-cta-final-note">Sem cartão de crédito. Sem pegadinha. Só amor.</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-logo">
            <Heart size={14} fill="var(--rosa-400)" stroke="none" />
            <span>Nosso Tempo</span>
          </div>
          <div className="lp-footer-links">
            <Link href="/auth/login" className="lp-footer-link">Entrar</Link>
            <Link href="/auth/register" className="lp-footer-link">Criar Conta</Link>
          </div>
          <p className="lp-footer-made">
            Feito com{' '}
            <Heart size={11} fill="var(--rosa-400)" stroke="none" style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
            amor · 2025
          </p>
        </div>
      </footer>

    </div>
  );
}

/* ─── Mockup Screens ─────────────────────────────── */

function RegisterScreen() {
  return (
    <div className="lp-screen">
      <div className="lp-screen-bar"><span /><span /><span /></div>
      <div className="lp-screen-body">
        <div className="lp-mock-label">Registrar momento</div>
        <div className="lp-mock-field">Hoje, 14h — 18h</div>
        <div className="lp-mock-sublabel">O que fizeram?</div>
        <div className="lp-mock-tags-row">
          {['Assistir série', 'Cozinhar', 'Passear', 'Jogar'].map((t) => (
            <span key={t} className={`lp-mock-tag${t === 'Assistir série' ? ' lp-mock-tag--active' : ''}`}>{t}</span>
          ))}
        </div>
        <div className="lp-mock-textarea">Anote algo especial sobre hoje...</div>
        <div className="lp-mock-save-btn">Salvar momento</div>
      </div>
    </div>
  );
}

function ReportsScreen() {
  return (
    <div className="lp-screen">
      <div className="lp-screen-bar"><span /><span /><span /></div>
      <div className="lp-screen-body">
        <div className="lp-mock-label">Relatórios</div>
        <div className="lp-mock-stats-row">
          {[{ v: '142h', l: 'total' }, { v: '8h', l: 'semana' }, { v: '12', l: 'streak' }].map((s) => (
            <div className="lp-mock-stat" key={s.l}>
              <span className="lp-mock-stat-val">{s.v}</span>
              <span className="lp-mock-stat-lbl">{s.l}</span>
            </div>
          ))}
        </div>
        <div className="lp-mock-chart">
          {[38, 65, 50, 85, 60, 78, 42].map((h, i) => (
            <div key={i} className="lp-mock-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="lp-mock-chart-label">últimos 7 dias</div>
      </div>
    </div>
  );
}

function AlbumScreen() {
  const shades = ['#ffdce5', '#ffa0b8', '#DF99AA', '#fff0f4', '#ffdce5', '#ffa0b8'];
  return (
    <div className="lp-screen">
      <div className="lp-screen-bar"><span /><span /><span /></div>
      <div className="lp-screen-body">
        <div className="lp-mock-label">Álbum</div>
        <div className="lp-mock-album-grid">
          {shades.map((c, i) => (
            <div key={i} className="lp-mock-photo" style={{ background: c }}>
              <Heart size={13} fill="rgba(255,255,255,0.55)" stroke="none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
