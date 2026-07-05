import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast, type ToastType } from '../../contexts/ToastContext';

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-green-500" aria-hidden />,
  error:   <XCircle     size={18} className="text-red-500"   aria-hidden />,
  info:    <Info        size={18} className="text-indigo-500" aria-hidden />,
};

export default function Toaster() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-[72px] lg:bottom-6 right-4 z-[60] flex flex-col gap-2 max-w-[calc(100vw-2rem)] w-full sm:max-w-xs"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          style={{ animation: 'tf-slide-in-right 250ms cubic-bezier(0.32,0.72,0,1)' }}
          className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700 shadow-lg text-sm"
        >
          <span className="mt-px shrink-0">{ICONS[t.type]}</span>
          <p className="flex-1 text-gray-800 dark:text-gray-100">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss notification"
            className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
