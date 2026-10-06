import { useEffect, useState } from 'react';
import { CheckCircle2, Download, Wifi, WifiOff, X } from 'lucide-react';
import { useErp } from '../../context/ErpContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  );
}

export function PwaInstallPrompt() {
  const { cloudSyncStatus } = useErp();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setIsInstalled(isStandaloneMode());

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
      setShowInstructions(false);
    };
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowInstructions(true);
      return;
    }

    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch {
      setShowInstructions(true);
    }
    setInstallPrompt(null);
  };

  return (
    <div className="fixed bottom-20 left-3 z-[80] flex max-w-[calc(100vw-1.5rem)] flex-col items-start gap-2 sm:bottom-5 sm:left-5" dir="rtl">
      {showInstructions && !isInstalled && (
        <div className="w-72 rounded-2xl border border-amber-200 bg-white p-4 text-right shadow-2xl" role="dialog" aria-label="طريقة تثبيت التطبيق">
          <button
            type="button"
            onClick={() => setShowInstructions(false)}
            className="float-left rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>
          <p className="mb-2 font-bold text-gray-900">تثبيت نظام لمسات المعمار</p>
          <p className="text-sm leading-6 text-gray-600">
            من قائمة المتصفح اختر <strong>تثبيت التطبيق</strong> أو <strong>إضافة إلى الشاشة الرئيسية</strong>. على آيفون افتح الرابط في Safari ثم اختر المشاركة وإضافة إلى الشاشة الرئيسية. افتح النظام مرة أونلاين ليحفظ ملفات التطبيق والبيانات على جهازك.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur" aria-live="polite">
        {isInstalled ? (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={18} />
            التطبيق مثبت
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstall}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <Download size={18} />
            تثبيت التطبيق
          </button>
        )}

        <div
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold ${
            isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
          }`}
          title={isOnline ? 'النظام متصل بالإنترنت' : 'النظام يعمل دون اتصال'}
        >
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOnline ? 'أونلاين' : 'أوفلاين'}
        </div>
      </div>
      {(!isOnline || cloudSyncStatus === 'error' || cloudSyncStatus === 'saving') && (
        <p className="max-w-72 rounded-xl bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-lg" role="status">
          {!isOnline ? 'أوفلاين: التعديلات تُحفظ على الجهاز وتُزامن عند عودة الإنترنت.' :
            cloudSyncStatus === 'error' ? 'المزامنة متوقفة: النسخة المحلية محفوظة. راجع التنبيه إن ظهر تعارض.' : 'جارٍ مزامنة التعديلات…'}
        </p>
      )}
    </div>
  );
}
