import React, { useRef, useEffect, useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  LayoutDashboard,
  Building2,
  Vault,
  FileText,
  Briefcase,
  Truck,
  Receipt,
  Users,
  ShoppingBag,
  HardHat,
  FileSpreadsheet,
  Database,
  KeyRound,
  History,
  Lock,
  Grid,
  X,
  LogOut,
  Settings
} from 'lucide-react';

export const MobileBottomNavBar: React.FC = () => {
  const { currentTab, setCurrentTab, hasPermission, logout, currentRole } = useErp();
  const activeTabRef = useRef<HTMLButtonElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tabs = [
    {
      id: 'dashboard',
      label: 'الرئيسية',
      icon: LayoutDashboard,
      allowed: true
    },
    {
      id: 'projects',
      label: 'المشاريع',
      icon: Building2,
      allowed: true
    },
    {
      id: 'treasury',
      label: 'الخزينة',
      icon: Vault,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'محظور للمدير والمحاسب'
    },
    {
      id: 'invoices',
      label: 'الفواتير',
      icon: FileText,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'محظور للمدير والمحاسب'
    },
    {
      id: 'subcontractors',
      label: 'الموردين',
      icon: Briefcase,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'محظور للمدير والمحاسب'
    },
    {
      id: 'rental_machinery',
      label: 'الآليات',
      icon: Truck,
      allowed: hasPermission('canLogDailySiteOperations')
    },
    {
      id: 'expenses',
      label: 'المصاريف',
      icon: ShoppingBag,
      allowed: hasPermission('canLogDailySiteOperations')
    },
    {
      id: 'payroll',
      label: 'الرواتب',
      icon: Users,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'محظور للمدير والمحاسب'
    },
    {
      id: 'finance',
      label: 'المستخلصات',
      icon: Receipt,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'محظور للمدير والمحاسب'
    },
    {
      id: 'operations',
      label: 'الموقع',
      icon: HardHat,
      allowed: hasPermission('canLogDailySiteOperations')
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: FileSpreadsheet,
      allowed: hasPermission('canViewFinancialReports'),
      restrictedLabel: 'محظور للمدير والمحاسب'
    },
    {
      id: 'licensing',
      label: 'الترخيص',
      icon: KeyRound,
      allowed: true
    },
    {
      id: 'backup',
      label: 'النسخ',
      icon: Database,
      allowed: hasPermission('canAccessAuditLogs'),
      restrictedLabel: 'صلاحية مسؤول النظام'
    },
    {
      id: 'settings',
      label: 'إعدادات المدير',
      icon: Settings,
      allowed: currentRole === 'super_admin',
      restrictedLabel: 'حصري للمدير العام فقط'
    },
    {
      id: 'audit',
      label: 'الأمان',
      icon: History,
      allowed: hasPermission('canAccessAuditLogs'),
      restrictedLabel: 'محظور على مدخل البيانات'
    }
  ];

  // Auto-scroll the active tab into the center of the bottom bar
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentTab]);

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Full Sections Modal / Bottom Sheet */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/80 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative bg-[#0d1424] border-t border-amber-500/30 rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Grid className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-white">كافة أقسام وتبويبات النظام</h3>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                const isAllowed = tab.allowed;

                if (!isAllowed) {
                  return (
                    <div
                      key={tab.id}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/40 border border-slate-800/40 opacity-40 text-slate-500"
                    >
                      <Icon className="w-5 h-5 mb-1 text-slate-600" />
                      <span className="text-[11px] font-medium line-through">{tab.label}</span>
                      <Lock className="w-3 h-3 text-rose-500 mt-1" />
                    </div>
                  );
                }

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectTab(tab.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all border ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/25 scale-[1.02]'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isActive ? 'text-slate-950 stroke-[2.5]' : 'text-amber-400'}`} />
                    <span className="text-xs font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Logout / Lock Session in Mobile Drawer */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>قفل النظام وتسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Fixed Bottom Navigation Bar */}
      <nav
        aria-label="شريط التبويبات السفلي الثابت للهاتف"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#0a0f1d]/95 backdrop-blur-2xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.85)] px-2 pt-2 pb-2 safe-area-pb"
      >
        <div className="flex items-center gap-1.5">
          {/* Quick Grid Drawer Trigger Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="عرض جميع الأقسام"
            className={`flex flex-col items-center justify-center min-w-[54px] py-1.5 px-1 rounded-2xl border transition-all shrink-0 cursor-pointer ${
              isMenuOpen
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/90 text-amber-400 border-amber-500/30 hover:bg-slate-850'
            }`}
          >
            <Grid className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">الأقسام</span>
          </button>

          {/* Vertical divider */}
          <div className="w-[1px] h-8 bg-slate-800/80 shrink-0 mx-0.5" />

          {/* Horizontally Scrollable Smooth Tab Strip */}
          <div className="flex-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              const isAllowed = tab.allowed;

              if (!isAllowed) {
                return (
                  <div
                    key={tab.id}
                    title={tab.restrictedLabel || 'غير مصرح'}
                    className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-xl text-slate-600 opacity-40 bg-slate-900/30 border border-slate-800/40 cursor-not-allowed select-none shrink-0"
                  >
                    <div className="relative">
                      <Icon className="w-4 h-4 text-slate-600" />
                      <Lock className="w-2 h-2 text-rose-500 absolute -top-1 -right-1" />
                    </div>
                    <span className="text-[10px] mt-0.5 leading-none line-through">{tab.label}</span>
                  </div>
                );
              }

              return (
                <button
                  key={tab.id}
                  ref={isActive ? activeTabRef : null}
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex flex-col items-center justify-center min-w-[58px] py-1 px-2 rounded-2xl transition-all duration-200 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-1 ring-amber-300 scale-[1.03]'
                      : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 active:scale-95'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mb-0.5 transition-transform ${
                      isActive ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-[10.5px] font-bold tracking-tight whitespace-nowrap leading-tight">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
