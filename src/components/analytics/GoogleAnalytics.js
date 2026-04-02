'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function GoogleAnalytics({ trackingId }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!trackingId || typeof window === 'undefined') return;

    if (typeof window.gtag === 'function') return;

    const scriptId = `nt-ga-${trackingId}`;
    if (document.getElementById(scriptId)) return;

    const externalScript = document.createElement('script');
    externalScript.id = scriptId;
    externalScript.async = true;
    externalScript.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(externalScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', trackingId);
  }, [trackingId]);

  useEffect(() => {
    if (!trackingId || typeof window === 'undefined' || typeof window.gtag !== 'function') return;

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag('config', trackingId, {
      page_path: pagePath,
    });
  }, [pathname, searchParams, trackingId]);

  return null;
}
