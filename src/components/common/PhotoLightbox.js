'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function PhotoLightbox({ item, onClose }) {
  useEffect(() => {
    if (!item || typeof document === 'undefined') return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [item]);

  if (!item || typeof document === 'undefined') return null;

  return createPortal(
    <div className="lightbox-overlay show" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Fechar visualização">
        <X size={20} />
      </button>
      <div className="lightbox-content" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true">
        <img
          src={item.src}
          alt={item.caption || item.title || 'Foto'}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="lightbox-info">
          <div className="lightbox-caption">{item.caption || item.title || ''}</div>
          <div className="lightbox-date">{item.dateLabel || ''}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
