import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  ShieldCheck,
  KeyRound,
  Server,
  Globe,
  Lock,
  Cpu,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Fingerprint,
  Calendar,
  Layers,
  RotateCcw
} from 'lucide-react';

export const LicenseManagementView: React.FC = () => {
  const {
    license,
    verifyLicense,
    resetDefaultLicense,
    hasPermission,
    currentRole,
    roleConfig,
    showNotification
  } = useErp();

  const [inputKey, setInputKey] = useState<string>(license.licenseKey);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  const canManage = hasPermission('canManageLicense');

  const handleVerify = (keyToTest?: string) => {
    const key = keyToTest || inputKey;
    setIsVerifying(true);
    setTimeout(() => {
      verifyLicense(key);
      setIsVerifying(false);
    }, 400);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(license.licenseKey);
    setCopiedKey(true);
    showNotification('تم النسخ', 'تم نسخ رمز ترخيص شركة لمسات المعمار إلى الحافظة.', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const isDomainAuthorized = license.status === 'active';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <KeyRound className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              نظام التراخيص والأمان وربط النطاق (Licensing & Anti-Piracy)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            آلية حماية الملكية الفكرية المشفرة المخصصة لشركة <span className="text-white font-semibold">"لمسات المعمار للمقاولات والهندسة"</span> مع ربط البصمة الرقمية والنطاق.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              license.status === 'active'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/5'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-300 shadow-lg shadow-rose-500/5'
            }`}
          >
            {license.status === 'active' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>الترخيص نشط وموثق رسمياً</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>حالة الترخيص: {license.status === 'expired' ? 'منتهي الصلاحية' : license.status === 'domain_mismatch' ? 'نطاق غير مصرح' : 'غير صالح'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Role Permission Alert if Restricted */}
      {!canManage && (
        <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3 text-xs text-amber-200">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">تنبيه صلاحيات (RBAC Active): </span>
            أنت تتصفح النظام بدور <span className="font-bold underline">{roleConfig.nameAr}</span>. يُسمح لك بمعاينة بيانات الأمان والترخيص، ولكن تعديل المفتاح أو تفعيله مقصور حصراً على <span className="font-bold">المدير العام (Super Admin)</span> لمنع التلاعب.
          </div>
        </div>
      )}

      {/* Main Grid: Certificate & Domain Binding */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Digital Architectural License Certificate (Left/Center 7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-[#0d1424]/90 to-slate-950 p-6 sm:p-7 relative overflow-hidden shadow-2xl">
          {/* Architectural Watermark Lines */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

          {/* Certificate Header */}
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                Official Digital Certificate
              </span>
              <h3 className="text-lg font-bold text-white mt-2">
                شهادة الترخيص الرقمي للمؤسسة
              </h3>
              <p className="text-xs text-slate-400">
                Lamasat Al-Meamar Proprietary Engineering ERP System
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>

          {/* Client & Company Credentials */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">الجهة المرخص لها:</span>
              <span className="font-bold text-white text-sm mt-0.5 block truncate">
                {license.clientName}
              </span>
              <span className="text-[11px] font-mono text-amber-400/90 mt-1 block">
                السجل التجاري: {license.commercialRegNumber}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">إصدار الترخيص:</span>
              <span className="font-bold text-white text-sm mt-0.5 block">
                {license.tier}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
                المقاعد: {license.activeSeats} مستخدم نشط من أصل {license.maxSeats}
              </span>
            </div>
          </div>

          {/* License Key Display & Copy */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                مفتاح الترخيص المشفر (Cryptographic Key):
              </span>
              <button
                onClick={handleCopyKey}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'تم النسخ' : 'نسخ المفتاح'}</span>
              </button>
            </div>
            <div className="font-mono text-amber-300 text-sm sm:text-base font-bold tracking-wider break-all bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/20 text-center">
              {license.licenseKey}
            </div>
          </div>

          {/* Dates & Validity Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">تاريخ الإصدار</span>
              <span className="font-mono font-semibold text-slate-200 mt-0.5 block">{license.issuedAt}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">تاريخ الانتهاء</span>
              <span className="font-mono font-semibold text-slate-200 mt-0.5 block">{license.expiresAt}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">الصلاحية المتبقية</span>
              <span className={`font-mono font-bold mt-0.5 block ${license.daysRemaining > 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {license.daysRemaining} يوم
              </span>
            </div>
          </div>

          {/* Enabled Modules List */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2.5">
              الوحدات البرمجية المعتمدة بالترخيص لشركة لمسات المعمار:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {license.enabledModules.map((mod, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{mod}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Binding & Anti-Piracy Architecture (Right 5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Domain Binding Card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">ربط النطاق (Domain Binding)</h4>
                <p className="text-[11px] text-slate-400">حماية النظام من النسخ والتشغيل في خوادم غير مصرح بها</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[11px] block">النطاق الحالي (Current Host):</span>
                  <span className="font-mono text-white font-bold">{currentHost}</span>
                </div>
                {isDomainAuthorized ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" /> نطاق موثق
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-400 font-semibold text-[11px] bg-rose-500/10 px-2 py-1 rounded-lg">
                    <XCircle className="w-3.5 h-3.5" /> غير مصرح
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-slate-300 font-semibold block mb-1">النطاقات المربوطة والمصرحة:</span>
                <div className="space-y-1 font-mono text-[10px] text-amber-400/90 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                  {license.authorizedDomains.map((d, idx) => (
                    <div key={idx}>• {d}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Machine Key & Hardware Fingerprint */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">البصمة الرقمية للجهاز (Hardware ID)</h4>
                <p className="text-[11px] text-slate-400">Machine Binding لمنع الاستنساخ غير المشروع</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-slate-300 text-center text-xs">
                {license.hardwareFingerprint}
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                <span className="text-slate-300 font-semibold">بصمة التوقيع الرقمي (SHA256 Checksum):</span>
                <div className="font-mono text-[10px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800 mt-1 break-all">
                  {license.signatureChecksum}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Verification Lab & Key Testing Engine */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              مختبر فحص التراخيص واختبار الحماية (License Verification Engine)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              أدخل مفتاح الترخيص المعتمد عند توفر خدمة التحقق المركزية.
            </p>
          </div>

          <button
            onClick={resetDefaultLicense}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            استعادة ترخيص لمسات المعمار الافتراضي
          </button>
        </div>

        {/* Input Form */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            disabled={!canManage}
            placeholder="أدخل رمز الترخيص"
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => handleVerify()}
            disabled={!canManage || isVerifying}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                التحقق والاعتماد الآن
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
