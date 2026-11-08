import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const borderClass =
    toast.type === 'error'
      ? 'border-red-500 bg-red-950/90 text-red-100'
      : toast.type === 'success'
      ? 'border-stone-400 bg-stone-900 text-stone-100 dark:border-stone-600 dark:bg-stone-100 dark:text-stone-900'
      : 'border-stone-500 bg-stone-800 text-stone-200';

  return (
    <div
      onClick={onDismiss}
      className={`cursor-pointer border px-4 py-3 shadow-lg font-mono text-xs transition-all hover:opacity-80 ${borderClass}`}
    >
      <div className="flex items-center justify-between space-x-3">
        <span>{toast.text}</span>
        <span className="text-stone-400 hover:text-white">✕</span>
      </div>
    </div>
  );
};
