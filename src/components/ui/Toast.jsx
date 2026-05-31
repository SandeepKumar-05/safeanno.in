import React, { useEffect, useState } from 'react';
import { useToast } from '../../hooks/useToast';
import './Toast.css';

/**
 * Toast notification display.
 */
export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast--${toast.type || 'info'} ${exiting ? 'toast--exit' : ''}`}>
      <span className="toast__message">{toast.message}</span>
      <button className="toast__close" onClick={() => {
        setExiting(true);
        setTimeout(onClose, 300);
      }}>✕</button>
    </div>
  );
}
