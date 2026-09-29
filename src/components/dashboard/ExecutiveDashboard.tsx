import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  TrendingUp,
  Building2,
  Receipt,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Users,
  Compass,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Lock,
  ChevronLeft,
  CheckCircle2,
  Clock,
  KeyRound,
  ExternalLink,
  Vault,
  FileText,
  DollarSign,
  Fuel,
  ShoppingCart,
  Plus,
  Layers,
  ArrowRight,
  Calendar,
  Zap,
  BarChart3,
  PieChart
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const {
    currentRole,
    roleConfig,
    currentUser,
    license,
    projects,
    transactions,
    siteLogs,
    auditLogs,
    setCurrentTab,
    setIsRoleModalOpen,
    hasPermission,
    liveSafeBalance,
    totalCashIn,
    totalCashOut,
    invoices,
    vendors,
    rentalMachinery,
    salarySlips,
    procurements,
    fuelLogs,
    officeExpenses
  } = useErp();

  // Floating speed dial state
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);

  // Financial calculations
  const totalContractValue = projects.reduce((acc, p) => acc + p.totalBudget, 0);
  const totalProjectSpent = projects.reduce((acc, p) => acc + p.spentAmount, 0);
  const averageProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.progressPercent, 0) / projects.length)
    : 0;

  // Task 7: Total Supplier & Subcontractor Payables
  const totalVendorDebt = vendors.reduce((acc, v) => acc + v.currentBalance, 0);
  const totalRentalMachineryDue = rentalMachinery.reduce((acc, m) => acc + m.balanceDue, 0);
  const grandTotalPayables = totalVendorDebt + totalRentalMachineryDue;

  // Task 6 & 5: Monthly Operational Expenses (Salaries + Procurements + Fuel + Office)
  const currentMonthSalaries = salarySlips
    .filter((s) => s.status === 'paid' || s.status === 'approved')
    .reduce((acc, s) => acc + s.netPayable, 0);
  const totalProcurementExpenses = procurements.reduce((acc, p) => acc + p.totalCost, 0);
  const totalFuelExpenses = fuelLogs.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalOfficeExpenses = officeExpenses.reduce((acc, o) => acc + o.amount, 0);
  const totalMonthlyOperationalExpenses =
    currentMonthSalaries + totalProcurementExpenses + totalFuelExpenses + totalOfficeExpenses;

  // Invoiced Sales & Claims Revenue
  const totalInvoicedSales = invoices
    .filter((inv) => inv.type === 'sales')
    .reduce((acc, inv) => acc + inv.grandTotal, 0);
  const totalCollectedSales = invoices
    .filter((inv) => inv.type === 'sales')
    .reduce((acc, inv) => acc + inv.paidAmount, 0);

  const canViewFinancial = hasPermission('canViewFinancialReports');

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Luxury Architectural Welcome Hero */}
      <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900/95 via-[#0d1424] to-slate-950 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 architectural-grid opacity-30 pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-wider uppercase text-amber-400 font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Lamasat Al-Meamar ERP Cloud · 2026
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300">جمهورية العراق</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              لوحة القيادة والرقابة المركزية، {currentUser.nameAr}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              الإشراف المالي والهندسي المتكامل: الخزينة الفورية، أرصدة المجهزين ومقاولي الباطن، كشوفات الرواتب، النفقات التشغيلية والمستخلصات الضريبية.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs">
                <span className="text-slate-400">الدور النشط:</span>
                <span className="font-bold text-amber-400">{roleConfig.nameAr}</span>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(true)}
                className="text-xs text-amber-400 hover:text-amber-300 underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>تبديل الصلاحية (RBAC Matrix)</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {currentRole === 'super_admin' && (
                <button
                  onClick={() => setCurrentTab('settings')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>إعدادات الأسماء وكلمات السر</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick License & System Integrity Badge */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 lg:min-w-[280px] space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">ترخيص ومصادقة المنظومة:</span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> مرخص رسمي
              </span>
            </div>
            <div className="font-mono text-xs text-amber-300 font-bold truncate">
              {license.licenseKey}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>الصلاحية: {license.daysRemaining} يوم متبقي</span>
              <button
                onClick={() => setCurrentTab('licensing')}
                className="text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                فحص التفاصيل
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Interactive 3D Master Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: Live Treasury Safe Balance */}
        <div
          onClick={() => setCurrentTab('treasury')}
          className="group relative cursor-pointer rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 p-5 shadow-xl hover:border-amber-500/70 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300">رصيد الصندوق والخزينة المباشر</span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Vault className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
            {liveSafeBalance.toLocaleString()}{' '}
            <span className="text-xs font-sans text-amber-500/80 font-normal">د.ع</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ArrowDownLeft className="w-3.5 h-3.5" /> وارد: +{totalCashIn.toLocaleString()}
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> صادر: -{totalCashOut.toLocaleString()}
            </span>
          </div>
        </div>

        {/* CARD 2: Total Supplier & Subcontractor Payables */}
        <div
          onClick={() => setCurrentTab('subcontractors')}
          className="group relative cursor-pointer rounded-2xl border border-rose-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 p-5 shadow-xl hover:border-rose-500/70 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300">ديون الموردين ومقاولي الباطن</span>
            <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono tracking-tight">
            {grandTotalPayables.toLocaleString()}{' '}
            <span className="text-xs font-sans text-rose-500/80 font-normal">د.ع</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>موردون: {totalVendorDebt.toLocaleString()}</span>
            <span>آليات: {totalRentalMachineryDue.toLocaleString()}</span>
          </div>
        </div>

        {/* CARD 3: Current Month Operational Expenses */}
        <div
          onClick={() => setCurrentTab('expenses')}
          className="group relative cursor-pointer rounded-2xl border border-blue-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 p-5 shadow-xl hover:border-blue-500/70 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300">المصاريف التشغيلية للشهر</span>
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono tracking-tight">
            {totalMonthlyOperationalExpenses.toLocaleString()}{' '}
            <span className="text-xs font-sans text-blue-500/80 font-normal">د.ع</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>رواتب ومشتريات</span>
            <span className="text-blue-300 font-semibold">وقود ونثريات</span>
          </div>
        </div>

        {/* CARD 4: Net Sales & Claims Invoiced */}
        <div
          onClick={() => setCurrentTab('invoices')}
          className="group relative cursor-pointer rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 p-5 shadow-xl hover:border-emerald-500/70 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300">مبيعات ومستخلصات ZATCA</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {totalInvoicedSales.toLocaleString()}{' '}
            <span className="text-xs font-sans text-emerald-500/80 font-normal">د.ع</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="text-emerald-300">محصل: {totalCollectedSales.toLocaleString()}</span>
            <span>باقي: {(totalInvoicedSales - totalCollectedSales).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Floating Bar / Speed Dial Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-amber-500/20 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                أوامر العمل السريعة (Quick Action Bar)
              </h3>
              <p className="text-[11px] text-slate-400">
                تسجيل السندات والعمليات بنقرة واحدة مباشرة من لوحة التحكم
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentTab('invoices')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              فاتورة ضريبية
            </button>

            <button
              onClick={() => setCurrentTab('treasury')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-xs font-bold transition-all border border-emerald-500/30 cursor-pointer"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              سند قبض (Cash In)
            </button>

            <button
              onClick={() => setCurrentTab('treasury')}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-xl text-xs font-bold transition-all border border-rose-500/30 cursor-pointer"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              سند صرف (Cash Out)
            </button>

            <button
              onClick={() => setCurrentTab('expenses')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
              مشتريات موقع
            </button>

            <button
              onClick={() => setCurrentTab('subcontractors')}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 stroke-[3]" />
              مستخلص مقاول
            </button>
          </div>
        </div>
      </div>

      {/* Main Section: Projects Status & Operating Expenses Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Projects (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">مشاريع لمسات المعمار قيد التنفيذ</h3>
              <p className="text-xs text-slate-400">متابعة نسب الإنجاز والمصروف الفعلي للمشاريع الإنشائية</p>
            </div>
            <button
              onClick={() => setCurrentTab('projects')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {projects.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
                <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-medium text-slate-300">لا توجد مشاريع مسجلة حالياً (النظام مصفر وجاهز للعمل)</p>
                <p className="text-xs text-slate-500">يمكنك البدء في إدخال بيانات مشاريعك وعقودك الهندسية الجديدة الآن.</p>
                <button
                  onClick={() => setCurrentTab('projects')}
                  className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة أول مشروع هندسي
                </button>
              </div>
            ) : (
              projects.map((proj) => {
                const spentPercent = Math.min(100, Math.round((proj.spentAmount / proj.totalBudget) * 100));
                return (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 font-semibold">{proj.code}</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{proj.nameAr}</h4>
                        <span className="text-xs text-slate-400">{proj.clientName}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                          إنجاز {proj.progressPercent}%
                        </span>
                        <span className="text-[11px] block text-slate-400 mt-1 font-mono">
                          الميزانية: {(proj.totalBudget / 1000000).toFixed(2)} م.د.ع
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>المنصرف الفعلي: {proj.spentAmount.toLocaleString()} د.ع</span>
                        <span>نسبة الصرف: {spentPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${proj.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Operating Breakdown & Critical Alerts (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Operating Expense Distribution */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                توزيع النفقات والالتزامات الحالية
              </h4>
              <button
                onClick={() => setCurrentTab('expenses')}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                المصاريف
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Item 1: Payroll */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">كادر ورواتب الموظفين والعمال</span>
                    <span className="text-[10px] text-slate-400">سجلات الرواتب المعتمدة</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-white">
                  {currentMonthSalaries.toLocaleString()} د.ع
                </span>
              </div>

              {/* Item 2: Subcontractors & Vendors */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">مستحقات مقاولي الباطن والموردين</span>
                    <span className="text-[10px] text-slate-400">ذمم دائنة واجبة السداد</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-rose-400">
                  {totalVendorDebt.toLocaleString()} د.ع
                </span>
              </div>

              {/* Item 3: Procurements & Materials */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">مشتريات المواقع اليومية</span>
                    <span className="text-[10px] text-slate-400">فواتير مواد ونثريات</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-blue-400">
                  {totalProcurementExpenses.toLocaleString()} د.ع
                </span>
              </div>

              {/* Item 4: Rental Machinery */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">أجور الآليات والسيارات المؤجرة</span>
                    <span className="text-[10px] text-slate-400">مستحقات أصحاب المعدات</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {totalRentalMachineryDue.toLocaleString()} د.ع
                </span>
              </div>

              {/* Item 5: Fuel & Fleet */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">وقود أسطول الآليات والمشروع</span>
                    <span className="text-[10px] text-slate-400">محروقات الديزل والبنزين</span>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-purple-400">
                  {totalFuelExpenses.toLocaleString()} د.ع
                </span>
              </div>
            </div>
          </div>

          {/* Recent Audit / Security Event Log */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                سجل الرقابة المالية والتشغيلية الحي
              </h4>
              <button
                onClick={() => setCurrentTab('audit')}
                className="text-xs text-amber-400 hover:underline cursor-pointer"
              >
                سجل التدقيق
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {auditLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-200">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString('ar-SA')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
