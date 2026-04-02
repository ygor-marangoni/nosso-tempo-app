import {
  BarChart3,
  BookOpen,
  Home,
  Image as ImageIcon,
  Milestone,
  MoreHorizontal,
  Pencil,
  Settings,
} from 'lucide-react';

export const MAIN_NAV = [
  { href: '/app/home', label: 'Início', Icon: Home },
  { href: '/app/register', label: 'Registrar', Icon: Pencil },
  { href: '/app/history', label: 'Histórico', Icon: BookOpen },
  { href: '/app/album', label: 'Álbum', Icon: ImageIcon },
  { href: '/app/timeline', label: 'Linha do Tempo', Icon: Milestone },
  { href: '/app/reports', label: 'Relatórios', Icon: BarChart3 },
  { href: '/app/settings', label: 'Ajustes', Icon: Settings },
];

export const MOBILE_PRIMARY_NAV = [
  { href: '/app/home', label: 'Início', Icon: Home },
  { href: '/app/register', label: 'Registrar', Icon: Pencil },
  { href: '/app/history', label: 'Histórico', Icon: BookOpen },
  { href: '/app/album', label: 'Álbum', Icon: ImageIcon },
  { href: '/app/timeline', label: 'Linha do Tempo', Icon: Milestone },
];

export const MOBILE_MORE_NAV = [
  { href: '/app/reports', label: 'Relatórios', Icon: BarChart3 },
  { href: '/app/settings', label: 'Ajustes', Icon: Settings },
];

export const MORE_TRIGGER = {
  label: 'Mais',
  Icon: MoreHorizontal,
};

export const APP_TITLES = {
  '/app/home': 'Início',
  '/app/register': 'Registrar Momento',
  '/app/history': 'Memórias Compartilhadas',
  '/app/reports': 'Retratos do Tempo',
  '/app/album': 'Álbum de Memórias',
  '/app/timeline': 'Marcos da Nossa História',
  '/app/settings': 'Nosso Espaço',
};

export function isRouteActive(pathname, href) {
  return pathname === href || (href !== '/app/home' && pathname.startsWith(href));
}

export function getCurrentPageTitle(pathname) {
  return APP_TITLES[pathname] || 'Nosso Tempo';
}

export function getCoupleNames(name1 = '', name2 = '') {
  const first = name1.trim();
  const second = name2.trim();

  if (first && second) return `${first} & ${second}`;
  return first || second || 'Nosso Tempo';
}

export function getCoupleInitials(name1 = '', name2 = '') {
  const firstInitial = name1.trim().charAt(0).toUpperCase();
  const secondInitial = name2.trim().charAt(0).toUpperCase();

  return {
    first: firstInitial || 'N',
    second: secondInitial || 'T',
  };
}
