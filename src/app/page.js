'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import CompareAfterIllustration from '@/components/landing/CompareAfterIllustration';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowStepArtwork from '@/components/landing/HowStepArtwork';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import {
  ArrowDownToLine,
  BarChart3,
  Frown,
  Smile,
  ChevronDown,
  Clock3,
  Gift,
  Heart,
  Image as ImageIcon,
  Lock,
  Menu,
  Moon,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Shield,
  Palette,
  Smartphone,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleMeta } from '@/contexts/CoupleContext';
import { getPendingCoupleSyncId, getPendingInviteCode } from '@/lib/session';

const NAV_ITEMS = [
  { id: 'funcionalidades', label: 'Funcionalidades', Icon: Sparkles },
  { id: 'como-funciona', label: 'Passo a Passo', Icon: Zap },
  { id: 'depoimentos', label: 'Testemunhos', Icon: Users },
];

const PROBLEM_ITEMS = [
  {
    icon: <Clock3 size={18} />,
    title: 'Tempo junto que passa sem registro',
    desc: 'Sem um lugar central, momentos importantes viram lembranças soltas e detalhes acabam se perdendo.',
  },
  {
    icon: <ImageIcon size={18} />,
    title: 'Fotos espalhadas em vários apps',
    desc: 'A história do casal fica fragmentada entre galeria, mensagens e redes, sem contexto de cada momento.',
  },
  {
    icon: <BarChart3 size={18} />,
    title: 'Falta visão do relacionamento',
    desc: 'É difícil enxergar evolução, rotina e marcos quando tudo está desconectado.',
  },
];

const ONBOARDING_STEPS = [
  {
    step: '01',
    title: 'Crie sua conta',
    desc: 'Entre com Google ou email e configure o espaço do casal em poucos segundos.',
  },
  {
    step: '02',
    title: 'Convide quem você ama',
    desc: 'Envie o convite e conecte as duas contas no mesmo ambiente privado.',
  },
  {
    step: '03',
    title: 'Registrem e acompanhem',
    desc: 'Adicionem momentos, fotos, marcos e acompanhem o recap mensal automaticamente.',
  },
];

const HOW_STEPS_RENDER = [
  {
    slug: 'account',
    step: '01',
    title: 'Crie sua conta',
    desc: 'Entre com Google ou email. Em poucos segundos vocês já têm o espaço do casal configurado e pronto pra usar.',
  },
  {
    slug: 'invite',
    step: '02',
    title: 'Convide quem você ama',
    desc: 'Envie o link privado pro seu amor. Quando aceitar, as duas contas se conectam no mesmo espaço, só de vocês.',
  },
  {
    slug: 'live',
    step: '03',
    title: 'Comecem a viver juntos',
    desc: 'Registrem momentos, guardem fotos, construam a timeline e deixem recados no mural. A história de vocês, num só lugar.',
  },
];

const HOW_CTA_LABEL = 'Criar nosso espaço grátis';
const HOW_CTA_NOTE = 'É simples assim.';


const RAW_FAQ_ITEMS = [
  {
    Icon: Gift,
    q: 'É realmente gratuito?',
    a: 'Sim, completamente. O Nosso Tempo é gratuito para sempre — sem plano pago escondido, sem período de teste, sem surpresas. Vocês usam tudo, sem limite.',
  },
  {
    Icon: Smartphone,
    q: 'Precisa baixar algum aplicativo?',
    a: 'Não. O Nosso Tempo funciona direto no navegador do celular ou computador. É só acessar o site e pronto — sem ocupar espaço no celular.',
  },
  {
    Icon: UserPlus,
    q: 'Meu parceiro(a) também precisa criar conta?',
    a: 'Sim, cada um cria a sua conta. Depois, vocês se conectam pelo link de convite em poucos segundos. A partir daí, os dois acessam o mesmo espaço.',
  },
  {
    Icon: Lock,
    q: 'Os nossos dados são privados?',
    a: 'Sim. Só vocês dois acessam o espaço do casal. Ninguém mais vê os registros, fotos, recados ou qualquer informação de vocês.',
  },
  {
    Icon: Clock3,
    q: 'Posso usar sozinho(a) até meu parceiro(a) entrar?',
    a: 'Claro. Comece registrando tudo e convide quando quiser. Quando seu amor entrar, vai encontrar tudo que você já registrou esperando.',
  },
  {
    Icon: Phone,
    q: 'Funciona bem no celular?',
    a: 'Perfeitamente. O sistema é totalmente responsivo — funciona em celular, tablet e computador com a mesma qualidade.',
  },
  {
    Icon: Palette,
    q: 'Dá pra mudar o tema de cores depois?',
    a: 'Sim, a qualquer momento. Nos ajustes vocês trocam a paleta de cores quando quiserem — o espaço sempre vai ter a cara de vocês.',
  },
];

const FAQ_ITEMS = RAW_FAQ_ITEMS.map(item => ({
  ...item,
  a: item.a.replace(/(?:—|â€”|Ã¢â‚¬â€)/g, ','),
}));

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildDemoEntries() {
  const now = new Date();
  now.setHours(12, 0, 0, 0);

  const templates = [
    { hours: 1.5, activities: ['Assistir série', 'Conversar'] },
    { hours: 2.25, activities: ['Jantar', 'Cozinhar'] },
    { hours: 3.1, activities: ['Passear', 'Café'] },
    { hours: 1.75, activities: ['Treinar juntos'] },
    { hours: 2.8, activities: ['Cinema', 'Jantar'] },
    { hours: 1.2, activities: ['Caminhar'] },
  ];

  const entries = [];

  for (let offset = 44; offset >= 0; offset -= 1) {
    if (offset % 5 === 0) continue;

    const date = new Date(now);
    date.setDate(now.getDate() - offset);

    const template = templates[offset % templates.length];
    entries.push({
      id: `demo-${offset}`,
      date: toDateKey(date),
      hours: template.hours,
      activities: template.activities,
    });
  }

  return entries;
}

export default function LandingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { coupleId, coupleLoading } = useCoupleMeta();

  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTheme, setActiveTheme] = useState('rosa');

  const demoEntries = useMemo(() => buildDemoEntries(), []);
const demoStats = useMemo(() => {
    const totalHours = demoEntries.reduce((sum, entry) => sum + entry.hours, 0);
    const totalDays = new Set(demoEntries.map(entry => entry.date)).size;
    return {
      totalHours: Math.round(totalHours),
      totalDays,
      avgPerDay: totalDays ? (totalHours / totalDays).toFixed(1) : '0',
      moments: demoEntries.length,
    };
  }, [demoEntries]);

  useEffect(() => {
    const forceLanding =
      typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('landing') === '1';
    const pendingCoupleSyncId = getPendingCoupleSyncId();

    if (authLoading || coupleLoading || !user || forceLanding) return;
    if (pendingCoupleSyncId && !coupleId) return;
    const pendingInvite = getPendingInviteCode();
    if (pendingInvite && !coupleId) {
      router.replace(`/invite/${pendingInvite}`);
      return;
    }
    router.replace(coupleId ? '/app/home' : '/onboarding');
  }, [authLoading, coupleId, coupleLoading, router, user]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1000 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [menuOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const savedPalette =
      document.documentElement.dataset.palette ||
      localStorage.getItem('nt_palette') ||
      'rosa';

    setActiveTheme(savedPalette);
    document.documentElement.dataset.palette = savedPalette;
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll('.lp-animate');
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('lp-visible');
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    nodes.forEach(node => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.96) {
        node.classList.add('lp-visible');
      }
      observer.observe(node);
    });
    return () => observer.disconnect();
  });

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="lp">
      <header className={`lp-nav${navScrolled ? ' lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <Link href="/?landing=1" className="lp-nav-logo" onClick={() => setMenuOpen(false)}>
            <svg className="lp-nav-logo-icon" width="23" height="23" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M10.5267 1.13883C12.6572 0.949772 14.5051 1.90623 15.9593 3.40836C17.2881 4.78102 18.3 6.62033 18.9241 8.50114C20.1506 6.1775 21.6273 4.06222 23.8362 2.74625L23.8382 2.74528C25.9134 1.5304 28.3308 1.29975 30.5579 2.10661H30.5569C32.6345 2.84866 33.9141 4.36112 34.5013 6.215C35.0861 8.06201 34.9834 10.2413 34.3206 12.34C32.0426 19.5535 25.6027 25.5417 19.8431 29.0265C20.2978 29.2716 20.7442 29.5306 21.1898 29.7834C21.6122 30.023 22.0364 30.2579 22.4739 30.4748L22.9163 30.6847L22.9232 30.6886C23.4309 30.9417 23.9475 31.1699 24.47 31.4025C24.9908 31.6344 25.517 31.87 26.0335 32.1369C26.2974 32.2732 26.5147 32.4611 26.6351 32.7189C26.7564 32.9789 26.7648 33.2793 26.6702 33.6105C26.5932 33.8803 26.4858 34.0931 26.3441 34.2482C26.1989 34.4068 26.0256 34.4959 25.8372 34.5295C25.486 34.5919 25.1008 34.4554 24.763 34.3127C24.5886 34.2626 24.246 34.1167 23.9251 33.9738C23.5862 33.8228 23.2445 33.6638 23.0872 33.591V33.59C21.1021 32.6841 19.1719 31.631 17.3079 30.4386C17.2937 30.4457 17.2802 30.4541 17.2659 30.4611C13.2746 32.4257 8.89712 33.7188 4.51007 33.7414H4.49933C4.25734 33.731 3.95009 33.7498 3.58527 33.7531C3.23486 33.7562 2.84799 33.7444 2.50519 33.6652C2.16421 33.5864 1.83047 33.4318 1.63116 33.1222C1.42946 32.8089 1.40002 32.3908 1.54816 31.8634C1.69728 31.3331 2.22016 31.1796 2.6546 31.1369C3.09742 31.0934 3.60661 31.1514 3.86066 31.1593C7.72749 31.2795 11.2519 30.2363 14.8655 28.7726C14.456 28.4983 14.0088 28.1395 13.5726 27.7677C12.9933 27.2741 12.416 26.7415 11.9593 26.3361C9.23435 23.917 6.44982 20.2128 4.94171 16.1701C3.43349 12.1267 3.19187 7.71224 5.60968 3.91325C6.69566 2.20683 8.71355 1.33519 10.5228 1.13883H10.5267ZM10.6868 3.68864C9.28734 3.91281 8.1779 4.38426 7.32257 5.6525C6.20665 7.30714 5.95666 9.91702 6.26495 11.924C7.29296 18.6155 12.111 23.6709 16.9661 27.1984C17.0654 27.2705 17.1559 27.3414 17.2542 27.4006C17.3315 27.447 17.3921 27.4707 17.4378 27.4797C17.6075 27.4116 17.8401 27.2833 18.0892 27.131C18.2219 27.0498 18.3547 26.9649 18.4808 26.8849C18.606 26.8055 18.7255 26.7298 18.8275 26.6681C21.941 24.7849 25.7975 21.5864 28.1194 18.5744L28.1204 18.5724C30.2829 15.8298 32.6061 12.1782 32.5355 8.38883C32.4913 6.83606 31.8135 5.76723 30.8577 5.09977C29.8939 4.42688 28.6325 4.1525 27.4241 4.23063C25.7884 4.33649 24.3893 5.20548 23.2181 6.465C22.0462 7.72528 21.1164 9.36317 20.4241 10.967C20.3622 11.1106 20.2871 11.3167 20.1937 11.5627C20.1021 11.8036 19.9959 12.0748 19.8753 12.3293C19.7556 12.5818 19.6158 12.8305 19.4564 13.0207C19.3012 13.2057 19.0945 13.3744 18.8343 13.3849C18.4636 13.4 18.1826 13.2142 17.9759 12.9543C17.7743 12.7005 17.6285 12.3604 17.514 12.0158C17.3987 11.669 17.308 11.294 17.2239 10.964C17.1377 10.6253 17.0606 10.343 16.9749 10.1525L16.972 10.1447L16.9691 10.1359C16.3756 8.48593 15.6421 6.83144 14.6312 5.60954C13.6281 4.3971 12.3631 3.6224 10.6868 3.68864Z" fill="currentColor" stroke="currentColor" strokeWidth="0.45"/>
            </svg>
            <span className="lp-nav-logo-text">Nosso Tempo</span>
          </Link>

          <nav className="lp-nav-links" aria-label="Navegação principal">
            {NAV_ITEMS.map(({ id, label, Icon }) => (
              <button key={id} type="button" className="lp-nav-link" onClick={() => scrollTo(id)}>
                <Icon size={13} strokeWidth={2} aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>

          <div className="lp-nav-actions">
            <Link href="/auth/login" className="lp-nav-login">Login</Link>
            <Link href="/auth/register" className="lp-btn lp-btn--primary lp-nav-cta">Teste gratuito</Link>
          </div>

          <button className={`lp-hamburger${menuOpen ? ' lp-hamburger--open' : ''}`} onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
            <span className="lp-hamburger-bar" />
            <span className="lp-hamburger-bar" />
            <span className="lp-hamburger-bar" />
          </button>
        </div>

        {menuOpen && (
          <div className="lp-mobile-menu" role="dialog" aria-modal="true">
            <nav className="lp-mobile-nav">
              {NAV_ITEMS.map(({ id, label, Icon }) => (
                <button key={id} type="button" className="lp-mobile-link" onClick={() => scrollTo(id)}>
                  <span className="lp-mobile-link-icon" aria-hidden="true">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  {label}
                </button>
              ))}
            </nav>

            <div className="lp-mobile-menu-footer">
              <Link href="/auth/login" className="lp-btn lp-btn--ghost lp-mobile-cta" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link href="/auth/register" className="lp-btn lp-btn--primary lp-mobile-cta" onClick={() => setMenuOpen(false)}>
                Teste gratuito
              </Link>
            </div>
          </div>
        )}
      </header>

      <section className="lp-hero" id="topo">
        {/* Ondas de fundo */}
        <div className="lp-hero-bg" aria-hidden="true">
          <svg viewBox="0 0 1440 520" className="lp-hero-wave" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,320 C150,120 350,480 600,260 C850,40 1050,420 1300,240 C1420,170 1500,200 1540,200" fill="none" stroke="var(--rosa-100)" strokeWidth="90" strokeLinecap="round" opacity="0.55" />
            <path d="M-100,300 C180,100 380,460 620,240 C860,20 1070,400 1320,220 C1430,160 1510,190 1540,185" fill="none" stroke="var(--rosa-200)" strokeWidth="100" strokeLinecap="round" opacity="0.18" />
            <path d="M-100,340 C160,140 360,500 610,280 C860,60 1060,440 1310,260 C1430,190 1510,215 1540,210" fill="none" stroke="var(--rosa-300)" strokeWidth="100" strokeLinecap="round" opacity="0.10" />
          </svg>
          <div className="lp-hero-wave-fade" />
        </div>

        {/* Copy central */}
        <div className="lp-hero-copy lp-animate">
          <h1 className="lp-hero-title">
            O seu tempo juntos<br />
            merece <span className="lp-cursive">ser lembrado!</span>
          </h1>
          <p className="lp-hero-sub">
            O Nosso Tempo é o cantinho de vocês dois na internet. Registrem as horas juntos, guardem fotos e vejam a história crescer.
          </p>
          <div className="lp-hero-actions">
            <Link href="/auth/register" className="lp-btn lp-btn--primary lp-btn--lg">
              <Heart size={16} />
              Criar nosso espaço
            </Link>
            <button type="button" className="lp-btn lp-btn--ghost lp-btn--lg" onClick={() => scrollTo('como-funciona')}>
              <ArrowDownToLine size={16} />
              Ver passo a passo
            </button>
          </div>
          <div className="lp-hero-badges">
            <span><Shield size={13} /> Privado</span>
            <span className="lp-hero-dot">·</span>
            <span><RefreshCw size={13} /> Sincronizado</span>
            <span className="lp-hero-dot">·</span>
            <span><Heart size={13} /> Feito para casais</span>
          </div>
        </div>

        {/* Visual */}
        <div className="lp-hero-visual lp-animate lp-animate--delay">
          {/* Card tema ? esquerda */}
          <div className="lp-hero-theme-card">
            <div className="lp-hero-theme-label">
              <Palette size={12} />
              Tema
            </div>
            {[
              { palette: 'rosa',     name: 'Rosa de Cinema',     c1: '#ff7a9c', c2: '#ef5087', c3: '#ffdce5' },
              { palette: 'lavanda',  name: 'Rosé Veludo',        c1: '#b56c8d', c2: '#9a5475', c3: '#f0d8e4' },
              { palette: 'pessego',  name: 'Coral do Entardecer', c1: '#df6652', c2: '#c35140', c3: '#ffd3cb' },
            ].map(t => (
              <button
                key={t.palette}
                type="button"
                className={`lp-hero-theme-item${activeTheme === t.palette ? ' lp-hero-theme-item--active' : ''}`}
                onClick={() => {
                  setActiveTheme(t.palette);
                  document.documentElement.dataset.palette = t.palette;
                  localStorage.setItem('nt_palette', t.palette);
                  window.dispatchEvent(
                    new CustomEvent('nt:palette-change', {
                      detail: { palette: t.palette },
                    })
                  );
                }}
              >
                <div className="lp-hero-theme-swatches">
                  <span style={{ background: t.c1 }} />
                  <span style={{ background: t.c2 }} />
                  <span style={{ background: t.c3 }} />
                </div>
                <span>{t.name}</span>
              </button>
            ))}
          </div>

          {/* Mockup do celular */}
          <div className="lp-hero-phone">
            <Image
              src="/mockup-hero-section.webp"
              alt="Preview do app Nosso Tempo"
              width={260}
              height={530}
              className="lp-hero-phone-img"
              priority
            />
          </div>

          {/* Card de registro ? direita */}
          <div className="lp-hero-entry-card">
            <div className="lp-hero-entry-date">
              <span className="lp-hero-entry-day">1</span>
              <span className="lp-hero-entry-month">ABR</span>
            </div>
            <div className="lp-hero-entry-body">
              <div className="lp-hero-entry-actions">
                <Pencil size={13} />
                <Trash2 size={13} />
              </div>
              <div className="lp-hero-entry-time">
                <span className="lp-cursive">2h 30min</span>
                <small>juntos</small>
              </div>
              <div className="lp-hero-entry-tags">
                <span><Phone size={11} /> Callzinha</span>
                <span><Moon size={11} /> Dormir juntos</span>
              </div>
              <p className="lp-hero-entry-note">"Teve soninho e teve conversas"</p>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider" aria-hidden="true">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="1440" height="48" className="lp-divider-bg" />
          <path d="M0,24 C240,48 480,0 720,24 C960,48 1200,0 1440,24 L1440,48 L0,48 Z" className="lp-divider-wave" />
        </svg>
      </div>

      <section className="lp-section lp-compare-section" id="problema">
        <div className="lp-section-inner">
          <div className="lp-section-header lp-animate">
            <h2 className="lp-compare-title">
              O que muda quando vocês<br />
              decidem <span className="lp-cursive">registrar</span>
            </h2>
          </div>

          <div className="lp-compare">
            <div className="lp-compare-card lp-compare-card--before lp-animate lp-animate--delay-1">
              <div className="lp-compare-art lp-compare-art--before" aria-hidden="true">
                <Image
                  src="/image-card-before.svg"
                  alt=""
                  width={659}
                  height={646}
                  className="lp-compare-art-img lp-compare-art-img--before"
                />
              </div>
              <div className="lp-compare-card-header lp-compare-card-header--before">
                <h3 className="lp-compare-card-title lp-compare-card-title--before">Sem registrar...</h3>
              </div>
              <ul className="lp-compare-list lp-compare-list--before">
                <li><span className="lp-compare-icon-wrap"><Frown size={16} /></span><span>"Terça passada? Não lembro o que a gente fez."</span></li>
                <li><span className="lp-compare-icon-wrap"><Frown size={16} /></span><span>As fotos ficam perdidas entre memes e prints</span></li>
                <li><span className="lp-compare-icon-wrap"><Frown size={16} /></span><span>Primeiro beijo? Sei que foi em março... ou abril</span></li>
                <li><span className="lp-compare-icon-wrap"><Frown size={16} /></span><span>A gente se vê todo dia mas não sabe quanto</span></li>
              </ul>
            </div>

            <div className="lp-compare-arrow" aria-hidden="true">
              <div className="lp-compare-arrow-inner">
                <ChevronDown size={20} className="lp-compare-arrow-mobile" />
                <svg className="lp-compare-arrow-desktop" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </div>

            <div className="lp-compare-card lp-compare-card--after lp-animate lp-animate--delay-2">
              <div className="lp-compare-art lp-compare-art--after" aria-hidden="true">
                <CompareAfterIllustration className="lp-compare-art-img lp-compare-art-img--after" />
              </div>
              <div className="lp-compare-card-header lp-compare-card-header--after">
                <h3 className="lp-compare-card-title lp-compare-card-title--after">Com o Nosso Tempo...</h3>
              </div>
              <ul className="lp-compare-list lp-compare-list--after">
                <li><span className="lp-compare-icon-wrap"><Smile size={16} /></span><span>"Terça? Ficamos 3h juntos assistindo série"</span></li>
                <li><span className="lp-compare-icon-wrap"><Smile size={16} /></span><span>Nossas fotos estão num álbum só nosso</span></li>
                <li><span className="lp-compare-icon-wrap"><Smile size={16} /></span><span>Primeiro beijo: 14 de março, no parque, às 19h</span></li>
                <li><span className="lp-compare-icon-wrap"><Smile size={16} /></span><span>Essa semana foram 12h juntos, nosso recorde!</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="lp-divider lp-divider--flip lp-divider--from-compare" aria-hidden="true">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="1440" height="48" className="lp-divider-bg" />
          <path d="M0,24 C240,48 480,0 720,24 C960,48 1200,0 1440,24 L1440,48 L0,48 Z" className="lp-divider-wave" />
        </svg>
      </div>

      <FeaturesSection />

      <div className="lp-divider lp-divider--to-compare" aria-hidden="true">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="1440" height="48" className="lp-divider-bg" />
          <path d="M0,24 C240,48 480,0 720,24 C960,48 1200,0 1440,24 L1440,48 L0,48 Z" className="lp-divider-wave" />
        </svg>
      </div>

      <section className="lp-section lp-section--compare lp-section--waved" id="como-funciona">
        <div className="lp-section-inner lp-how">
          <div className="lp-section-header lp-how-header lp-animate">
            <h2 className="lp-section-title">
              Tudo pronto em <span className="lp-cursive">1 minuto</span>
            </h2>
          </div>

          <div className="lp-how-grid">
            {HOW_STEPS_RENDER.map((step, index) => (
              <article
                key={step.step}
                className="lp-how-card lp-animate"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <span className="lp-how-step">{step.step}</span>
                <HowStepArtwork slug={step.slug} />
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>

          <div className="lp-how-cta lp-animate" style={{ transitionDelay: '520ms' }}>
            <Link href="/auth/register" className="lp-btn lp-btn--primary lp-btn--lg">
              <Heart size={16} />
              {HOW_CTA_LABEL}
            </Link>
            <p>{HOW_CTA_NOTE}</p>
          </div>
        </div>
      </section>

      <div className="lp-divider lp-divider--from-compare" aria-hidden="true">
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="1440" height="48" className="lp-divider-bg" />
          <path d="M0,24 C240,0 480,48 720,24 C960,0 1200,48 1440,24 L1440,0 L0,0 Z" className="lp-divider-wave" />
        </svg>
      </div>

      <section className="lp-section lp-section--alt" id="provas">
        <div className="lp-section-inner">
          <div className="lp-proof-grid lp-animate">
            <div className="lp-proof-item">
              <strong>+{demoStats.moments}</strong>
              <span>momentos de exemplo processados</span>
            </div>
            <div className="lp-proof-item">
              <strong>{demoStats.totalHours}h</strong>
              <span>em registros analisados</span>
            </div>
            <div className="lp-proof-item">
              <strong>100%</strong>
              <span>foco em privacidade do casal</span>
            </div>
            <div className="lp-proof-item">
              <strong>2 contas</strong>
              <span>sincronizadas no mesmo espaço</span>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section" id="depoimentos">
        <div className="lp-section-inner">
          <div className="lp-section-header lp-animate">
            <h2 className="lp-section-title">Casais que já vivem isso</h2>
            <p className="lp-section-sub">
              Histórias reais de quem decidiu parar de deixar o tempo passar.
            </p>
          </div>
        </div>
        <div className="lp-section-inner lp-section-inner--depoimentos-head">
          <div className="lp-section-header lp-section-header--split lp-animate">
            <h2 className="lp-section-title lp-section-title--split lp-section-title--split-new">
              Casais que já vivem isso <span className="lp-cursive">hoje</span>
            </h2>
            <p className="lp-section-sub lp-section-sub--split lp-section-sub--split-new">
              Histórias reais de quem decidiu registrar o relacionamento
              e começou a viver o tempo a dois com mais intenção.
            </p>
            <h2 className="lp-section-title lp-section-title--split">
              Casais que já vivem isso <span className="lp-cursive">de verdade</span>
            </h2>
            <p className="lp-section-sub lp-section-sub--split">
              Histórias reais de quem decidiu parar de deixar o tempo passar
              e começou a viver o relacionamento com mais intenção.
            </p>
          </div>
        </div>
        <TestimonialsSection />
      </section>

      <section className="lp-section lp-section--alt" id="faq">
        <div className="lp-section-inner lp-faq-wrap">
          <div className="lp-section-header lp-animate">
            <h2 className="lp-section-title">Perguntas frequentes</h2>
          </div>

          <div className="lp-faq-list">
            {FAQ_ITEMS.map((item, index) => {
              const open = openFaq === index;
              return (
                <article key={item.q} className={`lp-faq-item lp-animate lp-animate--delay-${(index % 3) + 1}${open ? ' lp-faq-item--open' : ''}`} onClick={() => setOpenFaq(current => (current === index ? -1 : index))}>
                  <button
                    type="button"
                    className="lp-faq-question"
                    aria-expanded={open}
                  >
                    <span className="lp-faq-question__left">
                      <span className="lp-faq-question__ico" aria-hidden="true">
                        <item.Icon size={16} />
                      </span>
                      <span>{item.q}</span>
                    </span>
                    <span className="lp-faq-icon" aria-hidden="true">
                      <Plus size={16} className="lp-faq-icon__plus" />
                    </span>
                  </button>
                  <div className="lp-faq-body" aria-hidden={!open}>
                    <p className="lp-faq-answer">{item.a}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <div className="lp-footer-stack lp-animate">
          <div className="lp-divider lp-divider--to-footer-cta" aria-hidden="true">
            <svg viewBox="0 0 1440 48" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lp-footer-cta-divider-base" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" className="lp-divider-wave-base-stop lp-divider-wave-base-stop--start" />
                  <stop offset="50.41%" className="lp-divider-wave-base-stop lp-divider-wave-base-stop--mid" />
                  <stop offset="100%" className="lp-divider-wave-base-stop lp-divider-wave-base-stop--end" />
                </linearGradient>
                <radialGradient id="lp-footer-cta-divider-glow" cx="50%" cy="0%" r="72%">
                  <stop offset="0%" className="lp-divider-wave-glow-stop lp-divider-wave-glow-stop--start" />
                  <stop offset="100%" className="lp-divider-wave-glow-stop lp-divider-wave-glow-stop--end" />
                </radialGradient>
              </defs>
            <rect x="0" y="0" width="1440" height="48" className="lp-divider-bg" />
            <path d="M0,24 C240,48 480,0 720,24 C960,48 1200,0 1440,24 L1440,48 L0,48 Z" className="lp-divider-wave-base" />
            <path d="M0,24 C240,48 480,0 720,24 C960,48 1200,0 1440,24 L1440,48 L0,48 Z" className="lp-divider-wave-glow" />
          </svg>
        </div>

        <footer className="lp-footer">
        {/* CTA + footer como um único bloco */}
        <div className="lp-footer-cta">

          {/* Mockup 3 celulares */}
          <div className="lp-cta-phones" aria-hidden="true">
            {/* Celular esquerdo — Mural */}
            <div className="lp-cta-phone lp-cta-phone--side lp-cta-phone--left">
              <div className="lp-cta-phone-screen">
                <div className="lp-cta-phone-header">
                  <span className="lp-cta-phone-title-bar">Mural</span>
                </div>
                <div className="lp-cta-phone-mural">
                  {[
                    { color: '#fef08a', text: 'Te amo muito', rotate: -4, top: 12, left: 10 },
                    { color: '#fbcfe8', text: 'Nosso dia favorito', rotate: 3, top: 14, left: 110 },
                    { color: '#bbf7d0', text: 'Saudades de você', rotate: -2, top: 110, left: 28 },
                    { color: '#bae6fd', text: 'Juntos pra sempre', rotate: 5, top: 105, left: 118 },
                  ].map((note, i) => (
                    <div
                      key={i}
                      className="lp-cta-postit"
                      style={{
                        background: note.color,
                        transform: `rotate(${note.rotate}deg)`,
                        top: note.top,
                        left: note.left,
                      }}
                    >
                      <div className="lp-cta-postit-pin" />
                      <p>{note.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Celular central — Home */}
            <div className="lp-cta-phone lp-cta-phone--center">
              <div className="lp-cta-phone-screen">
                <div className="lp-cta-phone-header lp-cta-phone-header--home">
                  <span className="lp-cta-phone-title-bar">Nosso Tempo</span>
                </div>
                <div className="lp-cta-phone-home">
                  <div className="lp-cta-home-couple">
                    <div className="lp-cta-home-avatar">Y</div>
                    <Heart size={14} className="lp-cta-home-heart" />
                    <div className="lp-cta-home-avatar lp-cta-home-avatar--b">J</div>
                  </div>
                  <p className="lp-cta-home-names">Ygor &amp; Julianne</p>
                  <div className="lp-cta-home-counter">
                    <span className="lp-cta-home-counter-num lp-cursive">736</span>
                    <span className="lp-cta-home-counter-label">dias juntos</span>
                  </div>
                  <div className="lp-cta-home-stats">
                    <div className="lp-cta-home-stat">
                      <strong>124</strong>
                      <small>momentos</small>
                    </div>
                    <div className="lp-cta-home-stat-divider" />
                    <div className="lp-cta-home-stat">
                      <strong>18</strong>
                      <small>marcos</small>
                    </div>
                    <div className="lp-cta-home-stat-divider" />
                    <div className="lp-cta-home-stat">
                      <strong>9</strong>
                      <small>álbuns</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Celular direito — Timeline */}
            <div className="lp-cta-phone lp-cta-phone--side lp-cta-phone--right">
              <div className="lp-cta-phone-screen">
                <div className="lp-cta-phone-header">
                  <span className="lp-cta-phone-title-bar">Linha do Tempo</span>
                </div>
                <div className="lp-cta-phone-timeline">
                  <div className="lp-cta-tl-line" />
                  {[
                    { label: 'Primeiro encontro', date: 'Mar 2022', color: 'var(--rosa-500)' },
                    { label: 'Viagem a SP', date: 'Jul 2022', color: 'var(--rosa-400)' },
                    { label: '1 ano juntos', date: 'Mar 2023', color: 'var(--rosa-500)' },
                    { label: 'Pedido de namoro', date: 'Dez 2023', color: 'var(--rosa-600)' },
                  ].map((item, i) => (
                    <div key={i} className="lp-cta-tl-item">
                      <div className="lp-cta-tl-dot" style={{ background: item.color }} />
                      <div className="lp-cta-tl-content">
                        <span className="lp-cta-tl-event">{item.label}</span>
                        <span className="lp-cta-tl-date">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lp-cta-visual" aria-hidden="true">
            <div className="lp-cta-visual-shell">
              <Image
                src="/cta-image.webp"
                alt=""
                fill
                sizes="(max-width: 700px) 88vw, (max-width: 1100px) 72vw, 760px"
                className="lp-cta-visual-image"
              />
            </div>
          </div>

          <h2 className="lp-cta-final-title">
            A história de <span className="lp-cursive">vocês</span> merece ser lembrada
          </h2>
          <p className="lp-cta-final-sub">
            Criem o espaço do casal agora e comecem a registrar o que realmente importa.
          </p>
          <Link href="/auth/register" className="lp-btn lp-btn--primary lp-btn--lg lp-btn-cta">
            <Heart size={16} />
            Criar nosso espaço
          </Link>
           <div className="lp-hero-badges">
            <span><Shield size={13} /> Privado</span>
            <span className="lp-hero-dot">·</span>
            <span><RefreshCw size={13} /> Sincronizado</span>
            <span className="lp-hero-dot">·</span>
            <span><Heart size={13} /> Feito para casais</span>
          </div>
        </div>

        {/* Nav links */}
        <div className="lp-footer-body">
          <div className="lp-footer-brand" role="img" aria-label="Nosso Tempo">
            <span className="lp-footer-brand-mark" aria-hidden="true" />
          </div>
          <nav className="lp-footer-nav" aria-label="Navegação do rodapé">
            <button type="button" className="lp-footer-nav-link" onClick={() => scrollTo('funcionalidades')}>
              <Sparkles size={13} aria-hidden="true" />
              <span>Funcionalidades</span>
            </button>
            <button type="button" className="lp-footer-nav-link" onClick={() => scrollTo('como-funciona')}>
              <Zap size={13} aria-hidden="true" />
              <span>Passo a Passo</span>
            </button>
            <button type="button" className="lp-footer-nav-link" onClick={() => scrollTo('depoimentos')}>
              <Users size={13} aria-hidden="true" />
              <span>Testemunhos</span>
            </button>
            <button type="button" className="lp-footer-nav-link" onClick={() => scrollTo('faq')}>
              <Shield size={13} aria-hidden="true" />
              <span>Dúvidas</span>
            </button>
            <Link href="/auth/login" className="lp-footer-nav-link">
              <Lock size={13} aria-hidden="true" />
              <span>Entrar</span>
            </Link>
            <Link href="/auth/register" className="lp-footer-nav-link">
              <UserPlus size={13} aria-hidden="true" />
              <span>Criar conta</span>
            </Link>
          </nav>
        </div>

        {/* Barra inferior */}
        <div className="lp-footer-bottom">
          <div className="lp-footer-bottom-inner">
            <span className="lp-footer-copy">© 2026 Copyright - Nosso Tempo App</span>
            <div className="lp-footer-bottom-links">
              <Link href="/" className="lp-footer-bottom-link">Instagram</Link>
              <Link href="/" className="lp-footer-bottom-link">Tiktok</Link>
            </div>
          </div>
        </div>
        </footer>
      </div>
    </div>
  );
}
