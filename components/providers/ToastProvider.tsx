'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { m, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#1DB954] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-[#1DB954]/30',
    error: 'border-red-400/30',
    info: 'border-blue-400/30',
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <LazyMotion features={domAnimation}>
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
          <AnimatePresence>
            {toasts.map(t => (
              <m.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className={`flex items-center gap-3 px-4 py-3 bg-[#282828]/95 backdrop-blur-xl border ${borders[t.type]} rounded-xl shadow-2xl`}
              >
                {icons[t.type]}
                <p className="text-sm text-white flex-1">{t.message}</p>
                <button onClick={() => removeToast(t.id)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      </LazyMotion>
    </ToastContext.Provider>
  );
}
