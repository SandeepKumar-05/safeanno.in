import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/**
 * Hook to access toast notifications
 * @returns {{ toasts: Array, addToast: Function, removeToast: Function }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
