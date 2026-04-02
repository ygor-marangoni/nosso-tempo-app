'use client';

import { memo, useMemo } from 'react';
import { Heart } from 'lucide-react';
import { useCouple } from '@/contexts/CoupleContext';

function MobileHeader() {
  const { config } = useCouple();
  const { name1 = '', name2 = '' } = config;

  const firstName = useMemo(() => name1.trim(), [name1]);
  const secondName = useMemo(() => name2.trim(), [name2]);
  const hasBothNames = Boolean(firstName && secondName);
  const fallbackName = firstName || secondName || 'Nosso Tempo';

  return (
    <header className="mobile-header">
      <div className="mobile-brand">
        <div className="mobile-brand-monogram" aria-hidden="true">
          <Heart className="mobile-brand-heart" size={10} fill="currentColor" stroke="currentColor" />
          {hasBothNames ? (
            <span className="mobile-brand-monogram-names">
              <span className="mobile-brand-name">{firstName}</span>
              <span className="mobile-brand-amp">&</span>
              <span className="mobile-brand-name">{secondName}</span>
            </span>
          ) : (
            <span className="mobile-brand-monogram-names">
              <span className="mobile-brand-name">{fallbackName}</span>
            </span>
          )}
          <Heart className="mobile-brand-heart" size={10} fill="currentColor" stroke="currentColor" />
        </div>
      </div>
    </header>
  );
}

export default memo(MobileHeader);
