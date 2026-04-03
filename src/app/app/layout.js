'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCoupleAlbum,
  useCoupleConfig,
  useCoupleEntries,
  useCoupleMeta,
  useCouplePhrases,
  useCoupleTimeline,
} from '@/contexts/CoupleContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import BottomNav from '@/components/layout/BottomNav';
import HeartsBackground from '@/components/layout/HeartsBackground';
import MobileHeader from '@/components/layout/MobileHeader';
import Sidebar from '@/components/layout/Sidebar';
import { APP_TITLES } from '@/components/layout/navConfig';
import { clearPendingCoupleSyncId, getPendingCoupleSyncId, getPendingInviteCode } from '@/lib/session';

const APP_ROUTES = [
  '/app/home',
  '/app/register',
  '/app/history',
  '/app/reports',
  '/app/album',
  '/app/timeline',
  '/app/settings',
];

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { coupleId, coupleLoading } = useCoupleMeta();
  const { config } = useCoupleConfig();
  const { ensureEntriesLoaded } = useCoupleEntries();
  const { ensureAlbumLoaded } = useCoupleAlbum();
  const { ensureTimelineLoaded } = useCoupleTimeline();
  const { ensurePhrasesLoaded } = useCouplePhrases();
  const warmupStartedRef = useRef(false);
  const [pendingCoupleSyncId, setPendingCoupleSyncId] = useState(() => getPendingCoupleSyncId());

  useEffect(() => {
    setPendingCoupleSyncId(getPendingCoupleSyncId());
  }, [pathname, user?.uid]);

  useEffect(() => {
    if (!user) {
      clearPendingCoupleSyncId();
      setPendingCoupleSyncId('');
      return;
    }

    if (coupleId && pendingCoupleSyncId) {
      clearPendingCoupleSyncId();
      setPendingCoupleSyncId('');
    }
  }, [coupleId, pendingCoupleSyncId, user]);

  const waitingForCoupleSync = Boolean(user && pendingCoupleSyncId && !coupleId);

  useEffect(() => {
    const palette = config?.palette;
    if (palette) document.documentElement.dataset.palette = palette;
  }, [config?.palette]);

  useEffect(() => {
    if (authLoading || coupleLoading) return;

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    if (!coupleId) {
      if (pendingCoupleSyncId) {
        return;
      }

      const pendingInvite = getPendingInviteCode();
      if (pendingInvite) {
        router.replace(`/invite/${pendingInvite}`);
        return;
      }

      router.replace('/onboarding');
    }
  }, [authLoading, coupleId, coupleLoading, pendingCoupleSyncId, router, user]);

  useEffect(() => {
    if (authLoading || coupleLoading || !user || !coupleId || warmupStartedRef.current) {
      return undefined;
    }

    warmupStartedRef.current = true;

    const connection = typeof navigator !== 'undefined' ? navigator.connection : null;
    const shouldLimitWarmup = Boolean(
      connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g',
    );

    const routesToWarm = APP_ROUTES.filter(route => route !== pathname);
    const timers = [];
    const idleHandle =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? window.requestIdleCallback(runWarmup, { timeout: 2500 })
        : window.setTimeout(runWarmup, 350);

    function queueTask(callback, delay) {
      timers.push(window.setTimeout(callback, delay));
    }

    function runWarmup() {
      routesToWarm.forEach((route, index) => {
        queueTask(() => router.prefetch(route), index * 180);
      });

      queueTask(() => ensureEntriesLoaded(), 120);
      queueTask(() => ensurePhrasesLoaded(), 650);

      if (!shouldLimitWarmup) {
        queueTask(() => ensureAlbumLoaded(), 1300);
        queueTask(() => ensureTimelineLoaded(), 2000);
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle);
      } else {
        window.clearTimeout(idleHandle);
      }

      timers.forEach(timer => window.clearTimeout(timer));
    };
  }, [
    authLoading,
    coupleId,
    coupleLoading,
    ensureAlbumLoaded,
    ensureEntriesLoaded,
    ensurePhrasesLoaded,
    ensureTimelineLoaded,
    pathname,
    router,
    user,
  ]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const name1 = config?.name1?.trim() || '';
    const name2 = config?.name2?.trim() || '';
    const coupleNames = [name1, name2].filter(Boolean).join(' & ') || 'Nosso Tempo';
    const pageTitle = pathname === '/app/home' ? '' : APP_TITLES[pathname];

    document.title = pageTitle ? `${pageTitle} | ${coupleNames}` : coupleNames;
  }, [config?.name1, config?.name2, pathname]);

  if (authLoading || coupleLoading || waitingForCoupleSync) {
    return (
      <div id="loading-screen">
        <div className="loading-heart">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="var(--rosa-500)" stroke="var(--rosa-500)" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <p className="loading-text">Carregando o espaço de vocês...</p>
      </div>
    );
  }

  if (!user || !coupleId) return null;

  return (
    <ThemeProvider>
      <HeartsBackground />
      <MobileHeader />
      <Sidebar />
      <main className="main">{children}</main>
      <BottomNav />
    </ThemeProvider>
  );
}
