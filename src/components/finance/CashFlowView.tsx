import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { CashVoucher, CashVoucherType, PaymentMethod, DailySafeRegister } from '../../types/erp';
import { CASH_IN_CATEGORIES, CASH_OUT_CATEGORIES } from '../../services/dataService';
import { formatSAR, tafqeetSAR } from '../../utils/financialUtils';
import {
  Vault,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Scale,
  Search,
  Filter,
  Printer,
  Calendar,
  Building2,
  Wallet,
  Coins,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  CreditCard,
  Banknote,
  Receipt,
  Clock,
  User,
  ShieldCheck,
  ChevronDown,
  Trash2,
  Eye,
  X
} from 'lucide-react';

export const CashFlowView: React.FC = () => {
  const {
    cashVouchers,
    addCashVoucher,
    deleteCashVoucher,
    dailyRegisters,
    openingBalance,
    totalCashIn,
    totalCashOut,
    liveSafeBalance,
    closeDailyRegister,
    projects,
    currentUser,
    currentRole,
    hasPermission,
    companyBillingInfo
  } = useErp();

  // Active view tab inside Cash Flow: 'ledger' | 'closing_history'
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'closing_history'>('ledger');

  // Filter & Search states
  const [filterType, setFilterType] = useState<'all' | 'cash_in' | 'cash_out'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Timeframe for the chart: '7days' | '30days'
  const [chartTimeframe, setChartTimeframe] = useState<'7days' | '30days'>('7days');

  // Modals state
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false);
  const [voucherModalType, setVoucherModalType] = useState<CashVoucherType>('cash_in');

  const [isClosingModalOpen, setIsClosingModalOpen] = useState<boolean>(false);
  const [selectedVoucherForReceipt, setSelectedVoucherForReceipt] = useState<CashVoucher | null>(null);

  // New Voucher Form State
  const [amount, setAmount] = useState<number>(10000);
  const [partyName, setPartyName] = useState<string>('');
  const [category, setCategory] = useState<string>('contract_payment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [description, setDescription] = useState<string>('');
  const [referenceDocNumber, setReferenceDocNumber] = useState<string>('');

  // Daily Closing Form State
  const [physicalCountInput, setPhysicalCountInput] = useState<number>(liveSafeBalance);
  const [closingNotes, setClosingNotes] = useState<string>('');

  const canCreate = hasPermission('canCreateInvoice') || hasPermission('canApproveSubcontractorPayment');
  const canDelete = hasPermission('canDeleteRecords');

  // Open voucher modal with initial type
  const openNewVoucherModal = (type: CashVoucherType) => {
    setVoucherModalType(type);
    setCategory(type === 'cash_in' ? 'contract_payment' : 'materials');
    setPartyName('');
    setAmount(15000);
    setDescription('');
    setReferenceDocNumber('');
    setIsVoucherModalOpen(true);
  };

  // Open closing register modal
  const openClosingModal = () => {
    setPhysicalCountInput(liveSafeBalance);
    setClosingNotes('');
    setIsClosingModalOpen(true);
  };

  const handleVoucherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim() || amount <= 0) return;

    const proj = projects.find((p) => p.id === projectId);
    const catList = voucherModalType === 'cash_in' ? CASH_IN_CATEGORIES : CASH_OUT_CATEGORIES;
    const catObj = catList.find((c) => c.id === category);

    const success = addCashVoucher({
      type: voucherModalType,
      date: new Date().toISOString().split('T')[0],
      amount: Number(amount),
      category: category as any,
      categoryLabelAr: catObj ? catObj.label : 'حركة مالية',
      paymentMethod,
      partyName,
      projectId: projectId || undefined,
      projectName: proj?.nameAr || 'عام / المقر الرئيسي',
      description,
      referenceDocNumber: referenceDocNumber || undefined
    });

    if (success) {
      setIsVoucherModalOpen(false);
    }
  };

  const handleClosingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = closeDailyRegister(Number(physicalCountInput), closingNotes);
    if (result.success) {
      setIsClosingModalOpen(false);
      setActiveSubTab('closing_history');
    }
  };

  // Filter vouchers
  const filteredVouchers = useMemo(() => {
    return cashVouchers.filter((v) => {
      if (filterType !== 'all' && v.type !== filterType) return false;
      if (filterCategory !== 'all' && v.category !== filterCategory) return false;
      if (filterProject !== 'all' && v.projectId !== filterProject) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = v.voucherNumber.toLowerCase().includes(q);
        const matchParty = v.partyName.toLowerCase().includes(q);
        const matchDesc = v.description.toLowerCase().includes(q);
        const matchProj = v.projectName?.toLowerCase().includes(q);
        if (!matchNumber && !matchParty && !matchDesc && !matchProj) return false;
      }
      return true;
    });
  }, [cashVouchers, filterType, filterCategory, filterProject, searchQuery]);

  // Chart data simulation based on real vouchers
  const chartDays = useMemo(() => {
    const days = chartTimeframe === '7days' ? 7 : 14;
    const result: { dateStr: string; label: string; cashIn: number; cashOut: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('ar-SA', { weekday: 'short' });

      // sum for this date
      let dayIn = 0;
      let dayOut = 0;
      cashVouchers.forEach((v) => {
        if (v.date === iso) {
          if (v.type === 'cash_in') dayIn += v.amount;
          if (v.type === 'cash_out') dayOut += v.amount;
        }
      });

      result.push({
        dateStr: iso,
        label: `${dayName} ${d.getDate()}`,
        cashIn: dayIn,
        cashOut: dayOut
      });
    }
    return result;
  }, [cashVouchers, chartTimeframe]);

  const maxChartVal = useMemo(() => {
    let max = 50000;
    chartDays.forEach((d) => {
      if (d.cashIn > max) max = d.cashIn;
      if (d.cashOut > max) max = d.cashOut;
    });
    return max * 1.15; // 15% padding
  }, [chartDays]);

  // Difference in register close modal
  const liveClosingDiff = Number(physicalCountInput) - liveSafeBalance;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-800 to-slate-900 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/5">
            <Vault className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                إدارة الخزينة والسيولة النقدية
              </span>
              <span className="text-xs text-slate-400">| الخزينة المركزية (Safe #01)</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">نظام الصندوق والخزينة المباشرة</h1>
            <p className="text-sm text-slate-400">
              متابعة حركة المقبوضات والمصروفات النقدية، احتساب الأرصدة لحظياً، ومطابقة الجرد اليومي المعتمد.
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5 relative z-10">
          <button
            onClick={() => openNewVoucherModal('cash_in')}
            disabled={!canCreate}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${
              canCreate
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/30 hover:scale-[1.02]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-300" />
            <span>سند قبض / وارد (Cash In)</span>
          </button>

          <button
            onClick={() => openNewVoucherModal('cash_out')}
            disabled={!canCreate}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg ${
              canCreate
                ? 'bg-gradient-to-r from-rose-600 to-amber-700 hover:from-rose-500 hover:to-amber-600 text-white shadow-rose-900/30 hover:scale-[1.02]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-rose-300" />
            <span>سند صرف / صادر (Cash Out)</span>
          </button>

          <button
            onClick={openClosingModal}
            disabled={!canCreate}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all border ${
              canCreate
                ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-amber-500/40 hover:border-amber-400 shadow-md shadow-black/40'
                : 'bg-slate-800/50 text-slate-600 border-slate-700 cursor-not-allowed'
            }`}
          >
            <Scale className="w-4 h-4 text-amber-400" />
            <span>إغلاق الصندوق اليومي</span>
          </button>
        </div>
      </div>

      {/* Financial Health & Balances Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Live Safe Balance */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">الرصيد الفعلي الحالي للخزينة</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Vault className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {formatSAR(liveSafeBalance)}
            </div>
            <p className="text-xs text-amber-400/90 font-medium mt-1 truncate">
              {tafqeetSAR(liveSafeBalance)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> سيولة نشطة ومطابقة
            </span>
            <span>الخزينة الرئيسية</span>
          </div>
        </div>

        {/* Card 2: Total Cash In */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">إجمالي المقبوضات (الوارد)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              +{formatSAR(totalCashIn)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              عدد السندات:{' '}
              <span className="text-white font-mono">
                {cashVouchers.filter((v) => v.type === 'cash_in').length}
              </span>{' '}
              سندات قبض
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>دفعات عقود وتسديدات</span>
            <span className="text-emerald-400 font-mono">تدفق إيجابي</span>
          </div>
        </div>

        {/* Card 3: Total Cash Out */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">إجمالي المدفوعات (الصادر)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-rose-400 tracking-tight">
              -{formatSAR(totalCashOut)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              عدد السندات:{' '}
              <span className="text-white font-mono">
                {cashVouchers.filter((v) => v.type === 'cash_out').length}
              </span>{' '}
              سندات صرف
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>مواد ومقاولون وأجور</span>
            <span className="text-slate-400 font-mono">مصروفات مباشرة</span>
          </div>
        </div>

        {/* Card 4: Opening Balance & Last Verified Close */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">الرصيد الافتتاحي للجلسة</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-sky-300 tracking-tight">
              {formatSAR(openingBalance)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              آخر جرد معتمد: <span className="text-white">{dailyRegisters[0]?.date || 'اليوم'}</span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> جرد مكتمل 100%
            </span>
            <span className="text-slate-400">ترحيل دفتري</span>
          </div>
        </div>
      </div>

      {/* Interactive Visual Chart: Inflow vs Outflow */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              التحليل البصري لحركة السيولة والتدفقات النقدية (Inflow vs Outflow)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              مقارنة المقبوضات والمصروفات اليومية للخزينة وتحديد أوقات ذروة حركة الأموال.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setChartTimeframe('7days')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                chartTimeframe === '7days' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              آخر 7 أيام
            </button>
            <button
              onClick={() => setChartTimeframe('30days')}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                chartTimeframe === '30days' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              آخر 14 يوماً
            </button>
          </div>
        </div>

        {/* Custom SVG Interactive Chart */}
        <div className="h-64 w-full relative pt-4">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartDays.length * 80} 200`}>
            {/* Horizontal Grid lines */}
            <line x1="0" y1="20" x2={chartDays.length * 80} y2="20" stroke="rgba(148,163,184,0.1)" strokeDasharray="3 3" />
            <line x1="0" y1="80" x2={chartDays.length * 80} y2="80" stroke="rgba(148,163,184,0.1)" strokeDasharray="3 3" />
            <line x1="0" y1="140" x2={chartDays.length * 80} y2="140" stroke="rgba(148,163,184,0.1)" strokeDasharray="3 3" />
            <line x1="0" y1="190" x2={chartDays.length * 80} y2="190" stroke="rgba(148,163,184,0.2)" />

            {/* Bars for each day */}
            {chartDays.map((day, idx) => {
              const xCenter = idx * 80 + 40;
              const barWidth = 14;

              // Heights scaled to maxChartVal (available height ~ 160px from y=20 to y=180)
              const inHeight = Math.min(160, Math.max(4, (day.cashIn / maxChartVal) * 160));
              const outHeight = Math.min(160, Math.max(4, (day.cashOut / maxChartVal) * 160));

              const inY = 190 - inHeight;
              const outY = 190 - outHeight;

              return (
                <g key={day.dateStr} className="group cursor-pointer">
                  {/* Cash In Bar (Emerald) */}
                  <rect
                    x={xCenter - barWidth - 2}
                    y={inY}
                    width={barWidth}
                    height={inHeight}
                    rx="4"
                    fill="url(#emeraldGradient)"
                    className="transition-all duration-300 hover:brightness-125"
                  />
                  {/* Cash Out Bar (Rose) */}
                  <rect
                    x={xCenter + 2}
                    y={outY}
                    width={barWidth}
                    height={outHeight}
                    rx="4"
                    fill="url(#roseGradient)"
                    className="transition-all duration-300 hover:brightness-125"
                  />

                  {/* Day Label */}
                  <text
                    x={xCenter}
                    y="212"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="11"
                    className="select-none font-medium"
                  >
                    {day.label}
                  </text>

                  {/* Tooltip on hover */}
                  <title>{`${day.dateStr}\nوارد: ${day.cashIn.toLocaleString()} د.ع\nصادر: ${day.cashOut.toLocaleString()} د.ع`}</title>
                </g>
              );
            })}

            {/* Gradients */}
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-8 mt-6 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-slate-300 font-medium">سندات القبض (Cash In - الوارد)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span className="text-slate-300 font-medium">سندات الصرف (Cash Out - الصادر)</span>
          </div>
          <div className="text-slate-500">
            * اضغط أو مرر المؤشر فوق الأعمدة للاطلاع على القيم التفصيلية
          </div>
        </div>
      </div>

      {/* Sub Tabs: Ledger vs Closing History */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === 'ledger'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>سجل المعاملات اليومية (Transaction Ledger)</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 font-mono text-slate-300">
              {cashVouchers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('closing_history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === 'closing_history'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>أرشيف إغلاقات الصندوق اليومية (Closing Archive)</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 font-mono text-slate-300">
              {dailyRegisters.length}
            </span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: TRANSACTION LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterType === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setFilterType('cash_in')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    filterType === 'cash_in' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  وارد فقط
                </button>
                <button
                  onClick={() => setFilterType('cash_out')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    filterType === 'cash_out' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  صادر فقط
                </button>
              </div>

              {/* Project Filter */}
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">جميع المشاريع</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameAr}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث برقم السند، البيان، أو الاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Ledger Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">رقم السند والتاريخ</th>
                    <th className="py-3.5 px-4">النوع والحركة</th>
                    <th className="py-3.5 px-4">الطرف (المسدد / المستلم)</th>
                    <th className="py-3.5 px-4">المشروع والتصنيف</th>
                    <th className="py-3.5 px-4">طريقة الدفع</th>
                    <th className="py-3.5 px-4">المبلغ بالدينار (د.ع)</th>
                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Coins className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                        <p className="text-sm">لا توجد سندات مطابقة لمعايير البحث والفلترة</p>
                      </td>
                    </tr>
                  ) : (
                    filteredVouchers.map((voucher) => {
                      const isIn = voucher.type === 'cash_in';
                      return (
                        <tr
                          key={voucher.id}
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Number & Date */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-white flex items-center gap-1.5">
                              {voucher.voucherNumber}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{voucher.date}</span>
                              <span className="text-slate-600">|</span>
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{voucher.time}</span>
                            </div>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                isIn
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {isIn ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                              {isIn ? 'سند قبض / وارد' : 'سند صرف / صادر'}
                            </span>
                          </td>

                          {/* Party & Description */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="text-white font-semibold flex items-center gap-1.5 truncate">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{voucher.partyName}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate" title={voucher.description}>
                              {voucher.description}
                            </div>
                          </td>

                          {/* Project & Category */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-300 font-medium truncate flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="truncate">{voucher.projectName}</span>
                            </div>
                            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                              {voucher.categoryLabelAr}
                            </span>
                          </td>

                          {/* Payment Method */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              {voucher.paymentMethod === 'cash' && (
                                <>
                                  <Banknote className="w-3.5 h-3.5 text-amber-400" />
                                  <span>نقدي (Cash)</span>
                                </>
                              )}
                              {voucher.paymentMethod === 'bank_transfer' && (
                                <>
                                  <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                                  <span>تحويل بنكي</span>
                                </>
                              )}
                              {voucher.paymentMethod === 'check' && (
                                <>
                                  <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                                  <span>شيك بنكي</span>
                                </>
                              )}
                            </div>
                            {voucher.referenceDocNumber && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                مرجع: {voucher.referenceDocNumber}
                              </div>
                            )}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-mono font-bold text-sm">
                            <span className={isIn ? 'text-emerald-400' : 'text-rose-400'}>
                              {isIn ? '+' : '-'}
                              {voucher.amount.toLocaleString()} د.ع
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Print Receipt Button */}
                              <button
                                onClick={() => setSelectedVoucherForReceipt(voucher)}
                                title="طباعة إيصال السند"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete (Super Admin Only) */}
                              {canDelete && (
                                <button
                                  onClick={() => deleteCashVoucher(voucher.id)}
                                  title="حذف السند (صلاحية المدير العام)"
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: DAILY REGISTERS ARCHIVE */}
      {activeSubTab === 'closing_history' && (
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-amber-400" />
              سجل اعتمادات ومطابقات الصندوق اليومي (Safe Balancing & Audit Archive)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              أرشيف تاريخي غير قابل للتعديل يوثق كل عملية جرد نقدي فعلي في الخزينة مع توقيع المحاسب ورصد أي فائض أو عجز.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyRegisters.map((reg) => (
              <div
                key={reg.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono">{reg.date}</h4>
                      <p className="text-[11px] text-slate-400">{reg.closedAt}</p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      reg.status === 'balanced'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : reg.status === 'surplus'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {reg.status === 'balanced' && 'مطابق 100%'}
                    {reg.status === 'surplus' && `فائض (${reg.difference} د.ع)`}
                    {reg.status === 'shortage' && `عجز (${reg.difference} د.ع)`}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">رصيد افتتاحي</span>
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {formatSAR(reg.openingBalance, false)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">وارد اليوم</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +{formatSAR(reg.totalCashIn, false)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">صادر اليوم</span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      -{formatSAR(reg.totalCashOut, false)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">العد الفعلي</span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {formatSAR(reg.actualPhysicalCount, false)}
                    </span>
                  </div>
                </div>

                <div className="text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>أمين الخزينة المعتمد:</span>
                    <span className="text-white font-semibold">{reg.closedBy}</span>
                  </div>
                  <p className="text-slate-300 pt-1 text-[11px] leading-relaxed">
                    <span className="text-slate-500">ملاحظات الجرد:</span> {reg.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: NEW CASH VOUCHER (CASH IN / CASH OUT) */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsVoucherModalOpen(false)}
              className="absolute left-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  voucherModalType === 'cash_in'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {voucherModalType === 'cash_in' ? (
                  <ArrowDownLeft className="w-6 h-6" />
                ) : (
                  <ArrowUpRight className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {voucherModalType === 'cash_in' ? 'قيد سند قبض جديد (Cash In)' : 'قيد سند صرف جديد (Cash Out)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {voucherModalType === 'cash_in'
                    ? 'تسجيل مبالغ واردة لحساب الخزينة مع تحديد الجهة والبيان'
                    : 'تسجيل منصرفات نقدية فورية لموقع أو مقاول أو مورد'}
                </p>
              </div>
            </div>

            <form onSubmit={handleVoucherSubmit} className="space-y-4">
              {/* Amount & Currency */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  المبلغ المالي (بالدينار العراقي د.ع) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                    placeholder="0.00"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    د.ع
                  </span>
                </div>
                {amount > 0 && (
                  <p className="text-[11px] text-amber-400/80 mt-1 font-medium">{tafqeetSAR(amount)}</p>
                )}
              </div>

              {/* Party Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {voucherModalType === 'cash_in' ? 'اسم المسدد / العميل *' : 'اسم المستلم / جهة الصرف *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    voucherModalType === 'cash_in'
                      ? 'اسم العميل أو الجهة الواردة منها الدفعة'
                      : 'اسم المورد أو المقاول أو المستلم'
                  }
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    تصنيف المعاملة *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {(voucherModalType === 'cash_in' ? CASH_IN_CATEGORIES : CASH_OUT_CATEGORIES).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    طريقة الدفع *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="cash">نقدي (Cash)</option>
                    <option value="bank_transfer">تحويل بنكي (Bank Transfer)</option>
                    <option value="check">شيك مصرفي (Check)</option>
                  </select>
                </div>
              </div>

              {/* Project & Reference Doc */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    المشروع المرتبط
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">عام / الخزينة المركزية</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    رقم المستند / المرجع البنكي
                  </label>
                  <input
                    type="text"
                    placeholder="رقم المرجع أو الشيك"
                    value={referenceDocNumber}
                    onChange={(e) => setReferenceDocNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description & Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  البيان وتفاصيل العملية *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="اكتب شرحاً وافياً عن سبب الصرف أو القبض والمرحلة الإنشائية..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                    voucherModalType === 'cash_in'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30'
                  }`}
                >
                  حفظ وتأكيد السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DAILY SAFE CLOSING (REGISTER BALANCING) */}
      {isClosingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsClosingModalOpen(false)}
              className="absolute left-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">إغلاق واعتماد الصندوق اليومي</h3>
                <p className="text-xs text-slate-400">
                  مطابقة النقدية الفعلية في الدرج/الخزينة مع الرصيد الدفتري المسجل بالنظام
                </p>
              </div>
            </div>

            <form onSubmit={handleClosingSubmit} className="space-y-4">
              {/* System Calculated Expected Balance */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>الرصيد الدفتري المتوقع (نظامياً):</span>
                  <span className="font-mono text-base font-bold text-white">
                    {formatSAR(liveSafeBalance)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                  <div>
                    افتتاحي + وارد:{' '}
                    <span className="text-emerald-400 font-mono">
                      {(openingBalance + totalCashIn).toLocaleString()} د.ع
                    </span>
                  </div>
                  <div>
                    إجمالي الصادر:{' '}
                    <span className="text-rose-400 font-mono">
                      {totalCashOut.toLocaleString()} د.ع
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Cash Count Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  العد النقدي الفعلي في الخزينة (Physical Cash Count) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={physicalCountInput}
                    onChange={(e) => setPhysicalCountInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    د.ع
                  </span>
                </div>
              </div>

              {/* Difference Status Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  liveClosingDiff === 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : liveClosingDiff > 0
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {liveClosingDiff === 0 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  <span>
                    {liveClosingDiff === 0 && 'حالة الصندوق: مطابق تماماً ولا يوجد أي فارق نقدية.'}
                    {liveClosingDiff > 0 && `حالة الصندوق: يوجد فائض نقدية بقيمة (+${liveClosingDiff.toLocaleString()} د.ع)`}
                    {liveClosingDiff < 0 && `حالة الصندوق: يوجد عجز نقدية بقيمة (${liveClosingDiff.toLocaleString()} د.ع)`}
                  </span>
                </div>
                <span className="font-mono text-sm">{formatSAR(liveClosingDiff, false)}</span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ملاحظات وتوقيع الجرد
                </label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات أمين الصندوق، أسماء شهود الجرد..."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Auditor Info */}
              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                المعتمد للجرد:{' '}
                <span className="text-white font-semibold">{currentUser.nameAr}</span> ({currentUser.title})
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClosingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
                >
                  اعتماد وترحيل إغلاق الصندوق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VOUCHER RECEIPT PRINT PREVIEW */}
      {selectedVoucherForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white text-slate-900 rounded-2xl p-6 shadow-2xl relative max-h-[95vh] overflow-y-auto print:p-0 print:shadow-none">
            <button
              onClick={() => setSelectedVoucherForReceipt(null)}
              className="no-print absolute left-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header */}
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xl mb-2">
                LM
              </div>
              <h2 className="text-lg font-bold text-slate-900">شركة لمسات المعمار للمقاولات</h2>
              <p className="text-xs text-slate-500">
                سجل تجاري: {companyBillingInfo.commercialReg || 'غير مضاف'} | الرقم الضريبي: {companyBillingInfo.vatNumber || 'غير مضاف'}
              </p>
              <div className="mt-3 inline-block px-4 py-1 rounded-full text-xs font-bold border border-slate-300 bg-slate-50">
                {selectedVoucherForReceipt.type === 'cash_in' ? 'إيصال سند قبض نقدي' : 'إيصال سند صرف نقدي'}
              </div>
            </div>

            {/* Receipt Details */}
            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono">
                <span>رقم السند: {selectedVoucherForReceipt.voucherNumber}</span>
                <span>التاريخ: {selectedVoucherForReceipt.date} {selectedVoucherForReceipt.time}</span>
              </div>

              <div className="space-y-2 border-b border-slate-100 pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    {selectedVoucherForReceipt.type === 'cash_in' ? 'استلمنا من السيد/السادة:' : 'صرفنا إلى السيد/السادة:'}
                  </span>
                  <span className="font-bold text-slate-900">{selectedVoucherForReceipt.partyName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">المبلغ المرقوم:</span>
                  <span className="font-bold font-mono text-base text-slate-900">
                    {formatSAR(selectedVoucherForReceipt.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">فقط وقدره:</span>
                  <span className="font-medium text-slate-800 text-right">
                    {tafqeetSAR(selectedVoucherForReceipt.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">المشروع المرتبط:</span>
                  <span className="font-semibold text-slate-800">{selectedVoucherForReceipt.projectName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">طريقة الدفع والتصنيف:</span>
                  <span className="font-medium text-slate-800">
                    {selectedVoucherForReceipt.paymentMethod} ({selectedVoucherForReceipt.categoryLabelAr})
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-slate-500 block mb-0.5">وذلك لقاء (البيان):</span>
                  <p className="bg-slate-50 p-2 rounded border border-slate-200 text-slate-800 leading-relaxed">
                    {selectedVoucherForReceipt.description}
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs">
                <div>
                  <p className="text-slate-500">المستلم / المسدد</p>
                  <div className="mt-8 border-t border-slate-300 pt-1 text-slate-700 font-semibold">
                    {selectedVoucherForReceipt.partyName}
                  </div>
                </div>

                <div>
                  <p className="text-slate-500">أمين الصندوق والمحاسب</p>
                  <div className="mt-8 border-t border-slate-300 pt-1 text-slate-700 font-semibold">
                    {selectedVoucherForReceipt.recordedBy}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions for Print */}
            <div className="no-print mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedVoucherForReceipt(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                إغلاق
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                طباعة الإيصال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
