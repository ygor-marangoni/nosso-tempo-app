'use client';

import DynamicFavicon from '@/components/branding/DynamicFavicon';
import { AuthProvider }    from '@/contexts/AuthContext';
import { CoupleProvider }  from '@/contexts/CoupleContext';
import { ToastProvider }   from '@/contexts/ToastContext';
import { ConfirmProvider } from '@/contexts/ConfirmContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CoupleProvider>
        <DynamicFavicon />
        <ToastProvider>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </ToastProvider>
      </CoupleProvider>
    </AuthProvider>
  );
}
