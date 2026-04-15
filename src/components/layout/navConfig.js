import {
  BarChart3,
  BookOpen,
  Home,
  Image as ImageIcon,
  Milestone,
  MoreHorizontal,
  Pencil,
  Pin,
  Settings,
} from 'lucide-react';

export const MAIN_NAV = [
  { href: '/app/home', label: 'In\u00edcio', Icon: Home },
  { href: '/app/register', label: 'Registrar', Icon: Pencil },
  { href: '/app/history', label: 'Hist\u00f3rico', Icon: BookOpen },
  { href: '/app/mural', label: 'Mural', Icon: Pin },
  { href: '/app/album', label: '\u00c1lbum', Icon: ImageIcon },
  { href: '/app/timeline', label: 'Linha do Tempo', Icon: Milestone },
  { href: '/app/reports', label: 'Relat\u00f3rios', Icon: BarChart3 },
  { href: '/app/settings', label: 'Ajustes', Icon: Settings },
];

export const MOBILE_PRIMARY_NAV = [
  { href: '/app/home', label: 'In\u00edcio', Icon: Home },
  { href: '/app/register', label: 'Registrar', Icon: Pencil },
  { href: '/app/mural', label: 'Mural', Icon: Pin },
  { href: '/app/album', label: '\u00c1lbum', Icon: ImageIcon },
  { href: '/app/timeline', label: 'Linha do Tempo', Icon: Milestone },
];

export const MOBILE_MORE_NAV = [
  { href: '/app/history', label: 'Hist\u00f3rico', Icon: BookOpen },
  { href: '/app/reports', label: 'Relat\u00f3rios', Icon: BarChart3 },
  { href: '/app/settings', label: 'Ajustes', Icon: Settings },
];

export const MORE_TRIGGER = {
  label: 'Mais',
  Icon: MoreHorizontal,
};

export const APP_TITLES = {
  '/app/home': 'In\u00edcio',
  '/app/register': 'Registrar Momento',
  '/app/history': 'Mem\u00f3rias Compartilhadas',
  '/app/reports': 'Retratos do Tempo',
  '/app/album': '\u00c1lbum de Mem\u00f3rias',
  '/app/timeline': 'Marcos da Nossa Hist\u00f3ria',
  '/app/mural': 'Mural do Casal',
  '/app/settings': 'Nosso Espa\u00e7o',
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
