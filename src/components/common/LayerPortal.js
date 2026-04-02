'use client';

import { createPortal } from 'react-dom';

export default function LayerPortal({ children }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
