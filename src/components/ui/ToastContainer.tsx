import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/60 border-emerald-500/20 text-emerald-400',
          icon: <CheckCircle2 size={18} className="text-emerald-500" />
        };
      case 'error':
        return {
          bg: 'bg-red-950/60 border-red-500/20 text-red-400',
          icon: <AlertCircle size={18} className="text-red-500" />
        };
      case 'warning':
        return {
          bg: 'bg-yellow-950/60 border-yellow-500/20 text-yellow-400',
          icon: <AlertCircle size={18} className="text-yellow-500" />
        };
      default:
        return {
          bg: 'bg-blue-950/60 border-blue-500/20 text-blue-400',
          icon: <Info size={18} className="text-blue-500" />
        };
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type);
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-up ${styles.bg}`}
          >
            <div className="flex items-center gap-2.5">
              {styles.icon}
              <span className="text-sm font-semibold">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;