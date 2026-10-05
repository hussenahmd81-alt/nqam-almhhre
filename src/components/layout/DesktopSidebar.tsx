import React from 'react';
import { useErp } from '../../context/ErpContext';
import { ArchitecturalLogo } from '../common/ArchitecturalLogo';
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Truck,
  ShieldCheck,
  History,
  ChevronRight,
  ChevronLeft,
  KeyRound,
  UserCheck,
  Lock,
  Vault,
  FileText,
  Users,
  HardHat,
  ShoppingBag,
  FileSpreadsheet,
  Database,
  Briefcase,
  LogOut,
  Settings
} from 'lucide-react';

export const DesktopSidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    sidebarCollapsed,
    toggleSidebar,
    license,
    currentRole,
    roleConfig,
    setIsRoleModalOpen,
    hasPermission,
    logout
  } = useErp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة القيادة والمؤشرات',
      sub: 'الرؤية التنفيذية والمالية',
      icon: LayoutDashboard,
      allowed: true
    },
    {
      id: 'projects',
      label: 'المشاريع والمخططات',
      sub: 'العقود ومراحل الإنجاز',
      icon: Building2,
      allowed: true
    },
    {
      id: 'treasury',
      label: 'الصندوق والخزينة',
      sub: 'حركة السيولة والقبض والصرف',
      icon: Vault,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'مقيد للمدير والمحاسب فقط'
    },
    {
      id: 'invoices',
      label: 'محرك الفواتير ZATCA',
      sub: 'الفواتير الضريبية والمستخلصات',
      icon: FileText,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'مقيد للمدير والمحاسب فقط'
    },
    {
      id: 'subcontractors',
      label: 'المجهزون ومقاولو الباطن',
      sub: 'كشوفات الحساب والذمم الدائنة',
      icon: Briefcase,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'مقيد للمدير والمحاسب فقط'
    },
    {
      id: 'rental_machinery',
      label: 'الآليات والسيارات المؤجرة',
      sub: 'أجور التشغيل وساعات العمل',
      icon: Truck,
      allowed: hasPermission('canLogDailySiteOperations')
    },
    {
      id: 'finance',
      label: 'المستخلصات والمالية',
      sub: 'مطالبات المقاولين المعتمدة',
      icon: Receipt,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'مقيد للمدير والمحاسب فقط'
    },
    {
      id: 'payroll',
      label: 'الرواتب والعمالة',
      sub: 'مسيرات الكادر وأجور المياومة',
      icon: Users,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'مقيد للمدير والمحاسب فقط'
    },
    {
      id: 'expenses',
      label: 'المصاريف واللوجستيات',
      sub: 'مشتريات المواقع ووقود الآليات',
      icon: ShoppingBag,
      allowed: hasPermission('canLogDailySiteOperations')
    },
    {
      id: 'operations',
      label: 'سجل العمليات الميدانية',
      sub: 'يوميات الموقع والمعدات',
      icon: HardHat,
      allowed: hasPermission('canLogDailySiteOperations')
    },
    {
      id: 'reports',
      label: 'التقارير والمطابقات',
      sub: 'التقارير الختامية وتصدير Excel',
      icon: FileSpreadsheet,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'مقيد للمدير والمحاسب فقط'
    },
    {
      id: 'backup',
      label: 'النسخ الاحتياطي والأمان',
      sub: 'تصدير واسترجاع بيانات النظام',
      icon: Database,
      allowed: hasPermission('canAccessAuditLogs'),
      restrictedLabel: 'صلاحية مسؤول النظام فقط'
    },
    {
      id: 'licensing',
      label: 'ترخيص النظام والأمان',
      sub: 'حماية الملكية وربط النطاق',
      icon: KeyRound,
      allowed: true
    },
    {
      id: 'settings',
      label: currentRole === 'super_admin' ? 'إدارة الحسابات وكلمات السر' : 'إعدادات حسابي',
      sub: 'تعديل الاسم ورمز الدخول',
      icon: Settings,
      allowed: true
    },
    {
      id: 'audit',
      label: 'سجل التدقيق والرقابة',
      sub: 'تتبع العمليات ومنع التلاعب',
      icon: History,
      allowed: hasPermission('canAccessAuditLogs'),
      restrictedLabel: 'محظور على مدخل البيانات'
    }
  ];

  return (
    <aside
      className={`hidden md:flex flex-col border-l border-slate-800/80 bg-[#0c121e]/95 backdrop-blur-xl transition-all duration-300 ease-in-out relative z-30 shrink-0 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/60">
        <ArchitecturalLogo collapsed={sidebarCollapsed} />
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          {sidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isAllowed = item.allowed;

          if (!isAllowed) {
            return (
              <div
                key={item.id}
                title={item.restrictedLabel || 'لا تملك صلاحية الوصول لهذا القسم في دورك الحالي'}
                className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 opacity-60 cursor-not-allowed select-none transition-colors border border-transparent"
              >
                <div className="relative">
                  <Icon className="w-4 h-4 text-slate-600" />
                  <Lock className="w-3 h-3 text-rose-500 absolute -top-1 -right-1" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500 line-through truncate">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-rose-400/80 font-semibold px-1 rounded bg-rose-500/10">
                        مقيد
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-600 block truncate">
                      {item.restrictedLabel || 'مطلوب ترقية الصلاحية'}
                    </span>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-right cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-l from-amber-500/15 to-transparent text-amber-300 font-semibold border-r-4 border-amber-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-r-4 border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold block truncate">{item.label}</span>
                  <span className="text-[10px] text-slate-500 font-normal block truncate">
                    {item.sub}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Role Switcher & Live License Badge Footer */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-950/40 space-y-2">
        {/* Interactive Role Switcher Banner */}
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className={`w-full flex items-center gap-2.5 p-2 rounded-xl border transition-all duration-200 text-right cursor-pointer ${
            currentRole === 'super_admin'
              ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300'
              : currentRole === 'accountant'
              ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-300'
              : 'border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 text-sky-300'
          }`}
          title="انقر لتبديل الأدوار واختبار نظام الصلاحيات"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">{roleConfig.nameAr}</span>
                <span className="text-[10px] text-amber-400 underline decoration-dotted font-medium">تبديل</span>
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                انقر للتبديل إلى حساب آخر بعد التحقق
              </span>
            </div>
          )}
        </button>

        {/* License Status Widget */}
        <button
          onClick={() => setCurrentTab('licensing')}
          className={`w-full flex items-center gap-2 p-2 rounded-lg border text-right transition-colors cursor-pointer ${
            license.status === 'active'
              ? 'border-emerald-500/20 bg-emerald-950/20 hover:bg-emerald-950/30 text-emerald-400'
              : 'border-rose-500/30 bg-rose-950/30 hover:bg-rose-950/40 text-rose-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold truncate">
                  {license.status === 'active' ? 'ترخيص رسمي معتمد' : 'تحذير في الترخيص'}
                </span>
                <span className="text-[10px] font-mono tabular-nums opacity-80">
                  {license.status === 'active' ? `${license.daysRemaining} يوم` : 'غير صالح'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                لمسات المعمار للمقاولات
              </span>
            </div>
          )}
        </button>

        {/* Lock System / Logout Button */}
        <button
          onClick={logout}
          title="قفل النظام وتسجيل الخروج"
          className="w-full flex items-center gap-2 p-2 rounded-lg border border-rose-500/20 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 hover:text-rose-300 text-right transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-[11px] font-bold truncate">
              قفل النظام وتسجيل الخروج
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
