'use client';

import { createContext, useContext, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import LayerPortal from '@/components/common/LayerPortal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, message: '', callback: null });

  function showConfirm(message, callback) {
    setState({ open: true, message, callback });
  }

  function doConfirm() {
    state.callback?.();
    setState({ open: false, message: '', callback: null });
  }

  function cancelConfirm() {
    setState({ open: false, message: '', callback: null });
  }

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {state.open && (
        <LayerPortal>
          <div className="modal-overlay show">
            <div className="modal confirm-modal" role="dialog" aria-modal="true">
              <div className="confirm-icon">
                <AlertTriangle size={36} color="var(--rosa-400)" />
              </div>
              <p>{state.message}</p>
              <div className="form-actions confirm-actions">
                <button className="btn btn-primary" onClick={doConfirm}>Confirmar</button>
                <button className="btn btn-secondary" onClick={cancelConfirm}>Cancelar</button>
              </div>
            </div>
          </div>
        </LayerPortal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
