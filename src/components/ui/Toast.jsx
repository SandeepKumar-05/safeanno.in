import React from 'react';
import { useToast } from '../../hooks/useToast';
import './Toast.css';

const ICONS = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="alert" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          id={`toast-${toast.id}`}
        >
          <span className="toast__icon">{ICONS[toast.type] || ICONS.info}</span>
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__close"
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
