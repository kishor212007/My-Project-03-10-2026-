import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
          {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
          {toast.type === 'error' && <AlertCircle size={18} className="text-rose-500" />}
          {(!toast.type || toast.type === 'info') && <Info size={18} className="text-indigo-500" />}
          <span>{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, marginLeft: 'auto' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
