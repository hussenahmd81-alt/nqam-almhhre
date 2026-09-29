import React from 'react';
import { useErp } from '../../context/ErpContext';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notificationMessage, closeNotification } = useErp();

  if (!notificationMessage) return null;

  const { title, message, type } = notificationMessage;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
  };

  const borders = {
    success: 'border-emerald-500/30 bg-slate-900/95 text-slate-100 shadow-emerald-500/10',
    warning: 'border-amber-500/30 bg-slate-900/95 text-slate-100 shadow-amber-500/10',
    error: 'border-rose-500/30 bg-slate-900/95 text-slate-100 shadow-rose-500/10'
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-200">
      <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${borders[type]}`}>
        {icons[type]}
        <div className="flex-1 min-w-0 pr-1 text-right">
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={closeNotification}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
