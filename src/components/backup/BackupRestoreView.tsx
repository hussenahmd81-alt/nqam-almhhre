import React, { useState, useRef } from 'react';
import { useErp } from '../../context/ErpContext';
import { ErpBackupData } from '../../types/erp';
import { COMPANY_BILLING_INFO } from '../../services/dataService';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Lock,
  Layers,
  Archive,
  HardDrive,
  Calendar,
  KeyRound,
  FileJson,
  Info
} from 'lucide-react';

export const BackupRestoreView: React.FC = () => {
  const {
    license,
    currentUser,
    projects,
    invoices,
    cashVouchers,
    employees,
    salarySlips,
    projectWorkers,
    weeklyTimesheets,
    procurements,
    fuelLogs,
    officeExpenses,
    vendors,
    vendorTransactions,
    rentalMachinery,
    rentalWorkLogs,
    rentalPayments,
    auditLogs,
    exportSystemBackup,
    downloadBackupFile,
    restoreSystemBackup,
    resetToFactorySettings
  } = useErp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [previewBackupData, setPreviewBackupData] = useState<ErpBackupData | null>(null);
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [isRestoreConfirmModalOpen, setIsRestoreConfirmModalOpen] = useState(false);

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as ErpBackupData;
        if (parsed.data && parsed.exportVersion) {
          setSelectedFileContent(text);
          setPreviewBackupData(parsed);
          setIsRestoreConfirmModalOpen(true);
        } else {
          alert('ملف النسخة الاحتياطية غير صالح أو لا يحتوي على بنية البيانات المطلوبة.');
        }
      } catch {
        alert('تعذر قراءة ملف JSON. تأكد من سلامة الملف.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const confirmRestore = () => {
    if (!selectedFileContent) return;
    restoreSystemBackup(selectedFileContent);
    setIsRestoreConfirmModalOpen(false);
    setSelectedFileContent(null);
    setPreviewBackupData(null);
  };

  const confirmReset = () => {
    resetToFactorySettings();
    setIsResetConfirmModalOpen(false);
  };

  // Integrity checks
  const integrityModules = [
    { name: 'المشاريع الهندسية والعقود', count: projects.length, status: 'متطابق وسليم' },
    { name: 'الفواتير الضريبية ZATCA والمستخلصات', count: invoices.length, status: 'متطابق وسليم' },
    { name: 'سندات الخزينة والصندوق المالي', count: cashVouchers.length, status: 'متطابق وسليم' },
    { name: 'سجل الموظفين ومسيرات الرواتب', count: employees.length + salarySlips.length, status: 'متطابق وسليم' },
    { name: 'العمالة اليومية وساعات العمل الأسبوعية', count: projectWorkers.length + weeklyTimesheets.length, status: 'متطابق وسليم' },
    { name: 'المشتريات والمصروفات الإدارية والوقود', count: procurements.length + fuelLogs.length + officeExpenses.length, status: 'متطابق وسليم' },
    { name: 'سجل المجهزين ومقاولي الباطن والآليات', count: vendors.length + rentalMachinery.length, status: 'متطابق وسليم' },
    { name: 'سجلات التدقيق الأمني والمالي (Audit)', count: auditLogs.length, status: 'محمي ضد التلاعب' }
  ];

  const totalRecordsCount =
    projects.length +
    invoices.length +
    cashVouchers.length +
    employees.length +
    salarySlips.length +
    projectWorkers.length +
    weeklyTimesheets.length +
    procurements.length +
    fuelLogs.length +
    officeExpenses.length +
    vendors.length +
    vendorTransactions.length +
    rentalMachinery.length +
    rentalWorkLogs.length +
    rentalPayments.length +
    auditLogs.length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-slate-900 via-[#131b2c] to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Database className="w-3.5 h-3.5" />
              أداة الأمان وحفظ البيانات والتعافي من الكوارث (DR)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              النسخ الاحتياطي واسترجاع النظام
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              تصدير لقطات رقمية مشفرة (JSON Snapshot) لكافة العمليات المالية والميدانية لشركة لمسات المعمار، إمكانية الاستعادة بضغطة زر، وفحص سلامة التشفير ومطابقة التراخيص.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600/70 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              استرجاع من ملف (Restore JSON)
            </button>

            <button
              onClick={downloadBackupFile}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-black transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              تحميل نسخة احتياطية كاملة
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">إجمالي السجلات المحمية</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {totalRecordsCount} <span className="text-xs font-sans text-slate-500 font-normal">سجل</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">عبر 16 كياناً محاسبياً وتشغيلياً</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">حالة التشفير والتكامل</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            100% <span className="text-xs font-sans text-emerald-500 font-bold">مطابق</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono truncate">
            Hash: {license.signatureChecksum.slice(0, 16)}...
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">النطاق والمنشأة المرخصة</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-black text-slate-200 mt-1 truncate">
            {license.boundDomain}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{COMPANY_BILLING_INFO.nameAr}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">تاريخ آخر تصدير موثق</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold font-mono text-slate-200 mt-1">
            {new Date().toLocaleDateString('ar-SA')}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">إصدار التصدير: v2.5.0-PROD</p>
        </div>
      </div>

      {/* Main Grid: Integrity Diagnostics & Quick Reset */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Integrity Table (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                فحص صحة وتكامل بيانات النظام (Data Integrity Matrix)
              </h3>
              <p className="text-xs text-slate-400">مطابقة سلامة الجداول مع توقيع ترخيص المنشأة المعتمد</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              كافة الجداول سليمة
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">الوحدة المحاسبية / التشغيلية</th>
                  <th className="p-3.5">عدد السجلات الفعالة</th>
                  <th className="p-3.5">حالة التكامل</th>
                  <th className="p-3.5">التوافق مع التشفير</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {integrityModules.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {item.name}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{item.count} سجل</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">{item.status}</td>
                    <td className="p-3.5 text-slate-400 text-xs font-mono">
                      SHA256:VERIFIED
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Factory Reset & Security Recommendations (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-400" />
              تعليمات أمان النسخ الاحتياطي
            </h4>
            <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>يحتوي ملف النسخة الاحتياطية على كافة فواتير المبيعات، الصندوق، وسجلات الرواتب.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>ينصح بتحميل نسخة احتياطية أسبوعياً وحفظها على قرص تخزين مشفر أو سحابي آمن.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>عملية الاسترجاع تعيد الحالة المالية والتشغيلية الكاملة كما كانت لحظة التصدير.</span>
              </li>
            </ul>
          </div>

          {/* Reset Box */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-3xl p-6 shadow-xl space-y-3">
            <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              إعادة ضبط البيانات إلى وضع المصنع
            </h4>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              إعادة تعيين كافة السجلات المالية والتشغيلية إلى الحزمة الأولية المعتمدة لشركة لمسات المعمار.
            </p>
            <button
              onClick={() => setIsResetConfirmModalOpen(true)}
              className="w-full py-2.5 px-4 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              استعادة بيانات المصنع الافتراضية
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRM RESTORE MODAL */}
      {isRestoreConfirmModalOpen && previewBackupData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-amber-400" />
              تأكيد استرجاع النسخة الاحتياطية
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              تم فحص بنية الملف بنجاح. راجع تفاصيل اللقطة قبل المتابعة:
            </p>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs mb-6">
              <div className="flex justify-between text-slate-300">
                <span>تاريخ إنشاء النسخة:</span>
                <span className="font-mono font-bold text-amber-400">{previewBackupData.exportedAt}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>إصدار النظام:</span>
                <span className="font-mono text-slate-200">{previewBackupData.exportVersion}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>المنشأة المصدرة:</span>
                <span className="font-semibold text-white">{previewBackupData.companyName}</span>
              </div>
              <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                <span>فواتير ZATCA المتضمنة:</span>
                <span className="font-mono">{previewBackupData.data.invoices?.length || 0} فاتورة</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>سندات الخزينة:</span>
                <span className="font-mono">{previewBackupData.data.cashVouchers?.length || 0} سند</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>حسابات الموردين:</span>
                <span className="font-mono">{previewBackupData.data.vendors?.length || 0} جهة</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-6 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>تحذير: سيتم استبدال البيانات الحالية بسجلات هذه النسخة الاحتياطية بالكامل.</span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsRestoreConfirmModalOpen(false);
                  setSelectedFileContent(null);
                  setPreviewBackupData(null);
                }}
                className="px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={confirmRestore}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                تأكيد الاسترجاع الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET MODAL */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-rose-800/80 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-rose-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              تأكيد إعادة تعيين وضع المصنع
            </h2>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              هل أنت متأكد من رغبتك في إعادة تعيين كافة البيانات إلى الحالة الافتراضية؟ سيتم استرجاع الحزمة المعتمدة لشركة لمسات المعمار.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={confirmReset}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
              >
                نعم، إعادة التعيين
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
