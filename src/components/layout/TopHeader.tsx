import React, { useState, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import { ArchitecturalLogo } from '../common/ArchitecturalLogo';
import {
  ShieldCheck,
  AlertOctagon,
  Users,
  Search,
  Bell,
  Globe,
  Lock,
  ChevronDown,
  LogOut
  ,Database
} from 'lucide-react';

export const TopHeader: React.FC = () => {
  const {
    currentTab,
    license,
    currentUser,
    currentRole,
    roleConfig,
    setIsRoleModalOpen,
    auditLogs,
    logout
    ,cloudSyncStatus
  } = useErp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabTitles: Record<string, string> = {
    dashboard: 'لوحة المؤشرات والرقابة التنفيذية',
    projects: 'المشاريع والمخططات الهندسية',
    finance: 'الإدارة المالية ومستخلصات المقاولين',
    operations: 'تشغيل الموقع واستهلاك الآليات والوقود',
    licensing: 'مركز التراخيص والأمان وربط النطاق',
    audit: 'سجل التدقيق الأمني ومنع التلاعب المالي'
  };

  const securityAlertsCount = auditLogs.filter((l) => l.severity === 'warning' || l.severity === 'critical').length;

  return (
    <header className="border-b border-slate-800/90 bg-[#0c121e]/95 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-black/40">
      {/* Main Top Header Bar */}
      <div className="h-16 sm:h-20 px-3 sm:px-6 flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Zone 1: Single Brand & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="md:hidden">
            <ArchitecturalLogo size="sm" />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="font-bold text-white tracking-wide">لمسات المعمار</span>
            <span className="text-slate-600">/</span>
            <span className="text-amber-400 font-medium truncate">{tabTitles[currentTab] || 'النظام'}</span>
          </div>
        </div>

        {/* Zone 2: Domain Verification & Security Tag (Clean unboxed) */}
        <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400">
          <div
            className={`flex items-center gap-1.5 font-semibold ${
              cloudSyncStatus === 'synced'
                ? 'text-emerald-400'
                : cloudSyncStatus === 'error'
                ? 'text-rose-400'
                : cloudSyncStatus === 'disabled'
                ? 'text-slate-500'
                : 'text-amber-400'
            }`}
            title="حالة مزامنة قاعدة بيانات Convex"
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {cloudSyncStatus === 'synced'
                ? 'قاعدة البيانات متزامنة'
                : cloudSyncStatus === 'saving'
                ? 'جاري حفظ البيانات'
                : cloudSyncStatus === 'loading'
                ? 'جاري تحميل البيانات'
                : cloudSyncStatus === 'error'
                ? 'تعذر اتصال القاعدة'
                : 'قاعدة البيانات غير مربوطة'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-[11px] truncate max-w-[140px]">
              {typeof window !== 'undefined' ? window.location.hostname : 'lamasat.sa'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="flex items-center gap-2">
            {license.status === 'active' ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ترخيص أصلي موثق</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400 font-semibold animate-pulse">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>تحذير في سلامة الترخيص</span>
              </span>
            )}
            <span className="text-slate-600">·</span>
            <span className="font-mono tabular-nums text-slate-400">{currentTime}</span>
          </div>
        </div>

        {/* Zone 3: Role Switcher Simulator, Notifications & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Role Switcher Pill Button (Task 2 Core Feature) */}
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              currentRole === 'super_admin'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                : currentRole === 'accountant'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20'
            }`}
            title="محاكي تبديل الأدوار وصلاحيات RBAC"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px] sm:max-w-[140px]">{roleConfig.nameAr.split(' ')[0]} {roleConfig.nameAr.split(' ')[1] || ''}</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Notifications & Security Alerts Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="التنبيهات وسجل الأمان"
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {securityAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-mono text-white flex items-center justify-center font-bold">
                  {securityAlertsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 z-50 text-right">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">إشعارات النظام والأمان</span>
                  <span className="text-[11px] font-mono text-amber-400 tabular-nums">
                    {auditLogs.length} عملية مسجلة
                  </span>
                </div>
                <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className={`p-2.5 rounded-lg border text-xs ${
                        log.severity === 'critical'
                          ? 'border-rose-500/30 bg-rose-500/10'
                          : log.severity === 'warning'
                          ? 'border-amber-500/30 bg-amber-500/10'
                          : 'border-slate-800 bg-slate-950/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{log.action}</span>
                        <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                          {log.timestamp.slice(11)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {log.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Capsule */}
          <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
              {currentUser.avatarLetter}
            </div>
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
                {currentUser.nameAr}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {currentUser.title}
              </span>
            </div>
          </div>

          {/* Lock / Logout Button */}
          <button
            onClick={logout}
            title="قفل النظام وتسجيل الخروج"
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline text-xs font-bold">قفل</span>
          </button>
        </div>
      </div>
    </header>
  );
};
