'use client';

import { memo, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MOBILE_MORE_NAV,
  MOBILE_PRIMARY_NAV,
  MORE_TRIGGER,
  isRouteActive,
} from './navConfig';

function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const moreRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  const isMoreActive = MOBILE_MORE_NAV.some(({ href }) => isRouteActive(pathname, href));

  useEffect(() => {
    setMoreOpen(false);
    setHidden(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return undefined;

    function handleOutside(event) {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setMoreOpen(false);
    }

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    lastScrollYRef.current = window.scrollY || 0;

    function updateVisibility() {
      const currentY = window.scrollY || 0;
      const delta = currentY - lastScrollYRef.current;

      if (currentY <= 16) {
        setHidden(false);
      } else if (delta > 10) {
        setHidden(true);
      } else if (delta < -10) {
        setHidden(false);
      }

      lastScrollYRef.current = currentY;
      tickingRef.current = false;
    }

    function handleScroll() {
      if (tickingRef.current) return;

      tickingRef.current = true;
      window.requestAnimationFrame(updateVisibility);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (moreOpen) setHidden(false);
  }, [moreOpen]);

  return (
    <nav
      className={`bottom-nav${hidden && !moreOpen ? ' is-hidden' : ''}`}
      aria-label="Navegação mobile"
    >
      {MOBILE_PRIMARY_NAV.map(({ href, label, Icon }) => {
        const active = isRouteActive(pathname, href);

        return (
          <Link
            key={href}
            href={href}
            className={`bn-item${active ? ' active' : ''}`}
            aria-label={label}
            title={label}
          >
            <span className="bn-icon"><Icon size={20} strokeWidth={active ? 2.2 : 1.9} /></span>
          </Link>
        );
      })}

      <div ref={moreRef} className="bn-more-wrap">
        {moreOpen && (
          <div className="bn-more-sheet">
            {MOBILE_MORE_NAV.map(({ href, label, Icon }) => {
              const active = isRouteActive(pathname, href);

              return (
                <Link key={href} href={href} className={`bn-sheet-item${active ? ' active' : ''}`}>
                  <span className="bn-sheet-icon"><Icon size={17} /></span>
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        )}

        <button
          type="button"
          className={`bn-item${isMoreActive || moreOpen ? ' active' : ''}`}
          aria-label="Mais opções"
          title={MORE_TRIGGER.label}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen(open => !open)}
        >
          <span className="bn-icon"><MORE_TRIGGER.Icon size={20} strokeWidth={1.9} /></span>
        </button>
      </div>
    </nav>
  );
}

export default memo(BottomNav);
