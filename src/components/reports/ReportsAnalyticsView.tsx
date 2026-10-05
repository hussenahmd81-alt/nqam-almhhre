import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { COMPANY_BILLING_INFO } from '../../services/dataService';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  Download,
  Building2,
  Receipt,
  Users,
  Truck,
  Vault,
  TrendingUp,
  Search,
  CheckCircle2,
  DollarSign,
  Layers,
  FileText,
  X
} from 'lucide-react';

type ReportType = 'treasury' | 'invoices' | 'vendors' | 'payroll' | 'procurement';

export const ReportsAnalyticsView: React.FC = () => {
  const {
    cashVouchers,
    invoices,
    vendors,
    vendorTransactions,
    employees,
    salarySlips,
    weeklyTimesheets,
    procurements,
    fuelLogs,
    officeExpenses,
    projects,
    userProfiles
  } = useErp();

  const [selectedReport, setSelectedReport] = useState<ReportType>('treasury');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'current_month' | 'last_30_days'>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Compute table rows based on selected report category
  const reportData = useMemo(() => {
    switch (selectedReport) {
      case 'treasury':
        return cashVouchers.map((v) => ({
          id: v.id,
          date: v.date,
          code: v.voucherNumber,
          title: v.description,
          party: v.partyName,
          category: v.categoryLabelAr,
          debit: v.type === 'cash_out' ? v.amount : 0,
          credit: v.type === 'cash_in' ? v.amount : 0,
          status: 'معتمد بالخزينة'
        }));

      case 'invoices':
        return invoices.map((inv) => ({
          id: inv.id,
          date: inv.date,
          code: inv.invoiceNumber,
          title: `فاتورة ${inv.type === 'sales' ? 'مبيعات' : 'مشتريات'}: ${inv.clientName}`,
          party: inv.clientName,
          category: inv.type === 'sales' ? 'إيرادات مبيعات' : 'توريد مشتريات',
          debit: inv.grandTotal - inv.paidAmount,
          credit: inv.paidAmount,
          status: inv.status === 'paid' ? 'مسددة بالكامل' : 'معلقة / جزئي'
        }));

      case 'vendors':
        return vendorTransactions.map((tx) => ({
          id: tx.id,
          date: tx.date,
          code: tx.referenceDocNumber || tx.transactionNumber,
          title: tx.description,
          party: tx.vendorName,
          category: tx.type === 'bill' ? 'فاتورة / مستخلص' : 'دفعة مسددة',
          debit: tx.type === 'payment' ? tx.amount : 0,
          credit: tx.type === 'bill' ? tx.amount : 0,
          status: `الرصيد: ${tx.balanceAfter.toLocaleString()} د.ع`
        }));

      case 'payroll':
        return salarySlips.map((slip) => ({
          id: slip.id,
          date: slip.monthYear,
          code: slip.slipNumber,
          title: `راتب شهر ${slip.monthYear} (${slip.roleTitle})`,
          party: slip.employeeName,
          category: slip.departmentAr,
          debit: slip.netPayable,
          credit: slip.basicSalary + slip.totalAllowances,
          status: slip.status === 'paid' ? 'تم الصرف' : 'معتمد للصرف'
        }));

      case 'procurement':
        return procurements.map((p) => ({
          id: p.id,
          date: p.date,
          code: p.purchaseNumber,
          title: p.itemName,
          party: p.supplierShop,
          category: p.categoryAr,
          debit: p.totalCost,
          credit: 0,
          status: p.paymentMethod === 'cash_safe' ? 'نقداً من الصندوق' : 'ائتمان / بنكي'
        }));

      default:
        return [];
    }
  }, [
    selectedReport,
    cashVouchers,
    invoices,
    vendorTransactions,
    salarySlips,
    procurements
  ]);

  // Aggregate metrics
  const totalDebit = reportData.reduce((acc, r) => acc + r.debit, 0);
  const totalCredit = reportData.reduce((acc, r) => acc + r.credit, 0);

  // Export to Excel (CSV with UTF-8 BOM for Arabic support)
  const exportToExcelCsv = () => {
    const headers = ['التاريخ', 'رقم المستند/المرجع', 'البيان/الشرح', 'الطرف المعني', 'التصنيف', 'المدين (د.ع)', 'الدائن (د.ع)', 'الحالة'];
    const rows = reportData.map((r) => [
      r.date,
      r.code,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.party.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      r.debit,
      r.credit,
      `"${r.status}"`
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lamasat_Report_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reportTitle = {
    treasury: 'تقرير حركة الخزينة والصندوق المالي (Cash Flow)',
    invoices: 'تقرير فواتير ومبيعات ZATCA والمستخلصات',
    vendors: 'تقرير كشوفات حسابات المجهزين ومقاولي الباطن',
    payroll: 'تقرير كشوفات الرواتب والأجور الشهرية',
    procurement: 'تقرير مشتريات المواقع والنفقات اللوجستية'
  }[selectedReport];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-slate-900 via-[#131d2e] to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              منظومة التقارير المحاسبية والتحليلات الشاملة
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              التقارير المالية والختامية
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              استخراج وتوليد كشوفات الحساب الشاملة، موازين المراجعة، تقارير التدفق النقدي، التصدير الفوري إلى Excel (CSV) بدعم كامل للغة العربية والطباعة الرسمية A4.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportToExcelCsv}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              تصدير إلى Excel (CSV)
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              معاينة وطباعة التقرير (A4)
            </button>
          </div>
        </div>
      </div>

      {/* Report Selection Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { key: 'treasury', label: 'حركة الخزينة', icon: Vault, desc: `${cashVouchers.length} سند مسجل` },
          { key: 'invoices', label: 'فواتير ومبيعات ZATCA', icon: Receipt, desc: `${invoices.length} فاتورة رسمية` },
          { key: 'vendors', label: 'المجهزون والمقاولون', icon: Users, desc: `${vendorTransactions.length} حركة ذمة` },
          { key: 'payroll', label: 'الرواتب والأجور', icon: DollarSign, desc: `${salarySlips.length} مسير راتب` },
          { key: 'procurement', label: 'مشتريات المواقع', icon: Truck, desc: `${procurements.length} عملية شراء` }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedReport === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedReport(tab.key as ReportType)}
              className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${isActive ? 'text-amber-400' : 'text-slate-300'}`}>
                  {tab.label}
                </span>
                <div
                  className={`p-2 rounded-xl ${
                    isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      {/* KPI Summary for Selected Report */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block mb-1">إجمالي الحركات والقيود</span>
          <span className="text-2xl font-bold font-mono text-white">
            {reportData.length} <span className="text-xs font-sans text-slate-500">سجل محاسبي</span>
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block mb-1">إجمالي المدين (المنصرف / الاستحقاق)</span>
          <span className="text-2xl font-bold font-mono text-rose-400">
            {totalDebit.toLocaleString()} <span className="text-xs font-sans text-slate-500">د.ع</span>
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 block mb-1">إجمالي الدائن (المقبوض / المسدد)</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">
            {totalCredit.toLocaleString()} <span className="text-xs font-sans text-slate-500">د.ع</span>
          </span>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">{reportTitle}</h3>
            <p className="text-xs text-slate-400">كافة السجلات المؤرخة والمعتمدة في دفتر الأستاذ</p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-slate-800 text-slate-300">
            {reportData.length} سجل
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">التاريخ</th>
                <th className="p-3.5">المرجع / الكود</th>
                <th className="p-3.5">البيان والشرح</th>
                <th className="p-3.5">الطرف / العميل</th>
                <th className="p-3.5">التصنيف</th>
                <th className="p-3.5 text-rose-400">مدين (د.ع)</th>
                <th className="p-3.5 text-emerald-400">دائن (د.ع)</th>
                <th className="p-3.5">الحالة / الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {reportData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">{row.date}</td>
                  <td className="p-3.5 font-mono font-bold text-white whitespace-nowrap">{row.code}</td>
                  <td className="p-3.5 text-slate-200 max-w-xs truncate" title={row.title}>
                    {row.title}
                  </td>
                  <td className="p-3.5 font-semibold text-slate-300 whitespace-nowrap">{row.party}</td>
                  <td className="p-3.5 text-slate-400 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-300">
                      {row.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-rose-400 whitespace-nowrap">
                    {row.debit > 0 ? `${row.debit.toLocaleString()} د.ع` : '-'}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400 whitespace-nowrap">
                    {row.credit > 0 ? `${row.credit.toLocaleString()} د.ع` : '-'}
                  </td>
                  <td className="p-3.5 text-xs text-slate-300 whitespace-nowrap">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT PREVIEW MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 print:hidden">
              <h2 className="text-base font-bold text-white">معاينة التقرير الرسمي للطباعة (A4)</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  طباعة الآن
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-slate-100 text-slate-900 overflow-y-auto print:p-0 print:bg-white" dir="rtl">
              <div className="max-w-[210mm] mx-auto bg-white p-8 shadow-sm border border-slate-300 print:border-none print:shadow-none font-sans">
                {/* Official Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
                  <div>
                    <h1 className="text-2xl font-black text-slate-950">{COMPANY_BILLING_INFO.nameAr}</h1>
                    <p className="text-xs text-slate-600 font-semibold">{COMPANY_BILLING_INFO.nameEn}</p>
                    <p className="text-xs text-slate-500">
                      س.ت: {COMPANY_BILLING_INFO.commercialReg} | الرقم الضريبي: {COMPANY_BILLING_INFO.vatNumber}
                    </p>
                  </div>
                  <div className="text-left">
                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded">
                      {reportTitle}
                    </span>
                    <p className="text-xs text-slate-500 font-mono mt-1">تاريخ الاستخراج: {new Date().toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>

                {/* KPI Ribbon */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-500 font-semibold">إجمالي السجلات</p>
                    <p className="text-base font-black text-slate-900 font-mono">{reportData.length}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-500 font-semibold">إجمالي المدين</p>
                    <p className="text-base font-black text-rose-700 font-mono">{totalDebit.toLocaleString()} د.ع</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-500 font-semibold">إجمالي الدائن</p>
                    <p className="text-base font-black text-emerald-700 font-mono">{totalCredit.toLocaleString()} د.ع</p>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-xs text-right border-collapse border border-slate-300 mb-8">
                  <thead>
                    <tr className="bg-slate-800 text-white font-bold">
                      <th className="p-2 border border-slate-700">التاريخ</th>
                      <th className="p-2 border border-slate-700">المرجع</th>
                      <th className="p-2 border border-slate-700">البيان</th>
                      <th className="p-2 border border-slate-700">الطرف</th>
                      <th className="p-2 border border-slate-700">مدين</th>
                      <th className="p-2 border border-slate-700">دائن</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.slice(0, 20).map((r, idx) => (
                      <tr key={r.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 border border-slate-200 font-mono">{r.date}</td>
                        <td className="p-2 border border-slate-200 font-mono font-semibold">{r.code}</td>
                        <td className="p-2 border border-slate-200">{r.title}</td>
                        <td className="p-2 border border-slate-200">{r.party}</td>
                        <td className="p-2 border border-slate-200 font-mono">{r.debit > 0 ? `${r.debit.toLocaleString()} د.ع` : '-'}</td>
                        <td className="p-2 border border-slate-200 font-mono">{r.credit > 0 ? `${r.credit.toLocaleString()} د.ع` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Signatures & Developer Footer */}
                <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-800 text-center text-xs">
                  <div className="space-y-8">
                    <p className="font-bold text-slate-800">إعداد المحاسب المسؤول</p>
                    <p className="text-slate-800 font-bold">{userProfiles.accountant?.nameAr || 'المحاسب المالي'}</p>
                  </div>
                  <div className="space-y-8">
                    <p className="font-bold text-slate-800">اعتماد الإدارة العامة</p>
                    <p className="text-slate-800 font-bold">{userProfiles.super_admin?.nameAr || 'المدير العام'}</p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
                  <span>تم توليد التقرير آلياً من نظام لمسات المعمار السحابي 2026</span>
                  <span className="font-medium text-amber-600">تمت برمجة وتطوير النظام بواسطة - شركة فن التقنية الحديثة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
