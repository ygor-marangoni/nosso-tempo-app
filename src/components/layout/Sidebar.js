'use client';

import { memo, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useCoupleConfig } from '@/contexts/CoupleContext';
import {
  MAIN_NAV,
  getCoupleInitials,
  getCoupleNames,
  isRouteActive,
} from './navConfig';

function NavItem({ href, label, Icon, pathname }) {
  const active = isRouteActive(pathname, href);

  return (
    <li>
      <Link href={href} className={`nav-item${active ? ' active' : ''}`}>
        <span className="nav-icon"><Icon size={18} /></span>
        <span className="nav-label">{label}</span>
      </Link>
    </li>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { config } = useCoupleConfig();
  const { name1 = '', name2 = '' } = config;

  const names = useMemo(() => getCoupleNames(name1, name2), [name1, name2]);
  const initials = useMemo(() => getCoupleInitials(name1, name2), [name1, name2]);

  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <Link href="/app/home" className="logo-area">
        <div className="logo-monogram" aria-hidden="true">
          <Heart className="logo-monogram-heart-icon" fill="var(--rosa-500)" stroke="var(--rosa-500)" strokeWidth={1.6} />
          <span className="logo-monogram-content">
            <span className="logo-monogram-letter">{initials.first}</span>
            <span className="logo-monogram-sep">&</span>
            <span className="logo-monogram-letter">{initials.second}</span>
          </span>
        </div>

        <div className="logo-copy">
          <div className="logo-title">Nosso Tempo</div>
          <div className="logo-names">{names}</div>
        </div>
      </Link>

      <ul className="nav-menu">
        {MAIN_NAV.map(item => (
          <NavItem key={item.href} {...item} pathname={pathname} />
        ))}
      </ul>

      <div className="sidebar-footer">
        <p>
          feito com <Heart size={12} fill="var(--rosa-400)" stroke="var(--rosa-400)" /> amor
        </p>
      </div>
    </aside>
  );
}

export default memo(Sidebar);
