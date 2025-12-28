import { useEffect } from 'react';
import type { Toast as ToastType } from '../../hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const Toast = ({ toast, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const styles = {
    success: {
      bg: 'bg-gray-900/95 border-green-500/50',
      icon: 'text-green-400',
      iconBg: 'bg-green-500/10',
    },
    error: {
      bg: 'bg-gray-900/95 border-red-500/50',
      icon: 'text-red-400',
      iconBg: 'bg-red-500/10',
    },
    warning: {
      bg: 'bg-gray-900/95 border-amber-500/50',
      icon: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
    },
    info: {
      bg: 'bg-gray-900/95 border-cyan-500/50',
      icon: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10',
    },
  }[toast.type];

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div 
      className={`${styles.bg} backdrop-blur-xl border rounded-xl shadow-2xl flex items-center min-w-[320px] max-w-md animate-slide-in overflow-hidden`}
    >
      {/* Icon */}
      <div className={`${styles.iconBg} p-4`}>
        <div className={styles.icon}>
          {icons[toast.type]}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 px-4 py-3">
        <p className="text-white font-medium text-sm">{toast.message}</p>
      </div>
      
      {/* Close button */}
      <button
        onClick={() => onClose(toast.id)}
        className="p-4 text-gray-500 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};
