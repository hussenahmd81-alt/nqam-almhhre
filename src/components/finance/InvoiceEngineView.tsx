import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { Invoice, InvoiceItem, InvoiceType, InvoiceStatus } from '../../types/erp';
import { formatSAR, tafqeetSAR, roundMoney } from '../../utils/financialUtils';
import { OfficialInvoicePrintModal } from './OfficialInvoicePrintModal';
import {
  FileText,
  Plus,
  Printer,
  Trash2,
  Search,
  Filter,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ChevronDown,
  Layers,
  Coins,
  ShieldAlert,
  Percent,
  Calculator,
  X,
  Eye,
  Check
} from 'lucide-react';

const COMMON_UNITS = ['م²', 'م.ط', 'عدد', 'طن', 'مقطوعية', 'ساعة', 'م³', 'برميل', 'كجم'];

export const InvoiceEngineView: React.FC = () => {
  const {
    invoices,
    addInvoice,
    updateInvoiceStatus,
    deleteInvoice,
    projects,
    currentUser,
    hasPermission,
    selectedInvoiceForPrint,
    setSelectedInvoiceForPrint
  } = useErp();

  // Filter & Search states
  const [filterType, setFilterType] = useState<'all' | InvoiceType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | InvoiceStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(0);

  // Form State: New Invoice
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('sales');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientVatNumber, setClientVatNumber] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('');
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [contractRef, setContractRef] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [paymentTerms, setPaymentTerms] = useState<string>(
    'دفعة 50% عند التوقيع، والمتبقي خلال 30 يوماً من إتمام الفحص الهندسي.'
  );
  const [notes, setNotes] = useState<string>(
    'تخضع هذه الفاتورة لمتطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).'
  );
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(15);

  // Items State
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'itm-1',
      description: 'أعمال الهيكل الخرساني والتشطيبات المعمارية المعتمدة',
      unit: 'م²',
      quantity: 100,
      unitPrice: 250,
      total: 25000
    }
  ]);

  const canCreate = hasPermission('canCreateInvoice');
  const canEdit = hasPermission('canEditInvoice');
  const canDelete = hasPermission('canDeleteRecords');

  // Dynamic Item row updates
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const q = field === 'quantity' ? Number(value) : item.quantity;
        const p = field === 'unitPrice' ? Number(value) : item.unitPrice;
        item.total = roundMoney(q * p);
      }
      next[index] = item;
      return next;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `itm-${Date.now()}`,
        description: '',
        unit: 'م²',
        quantity: 1,
        unitPrice: 100,
        total: 100
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Live Totals Computation for Form
  const formTotals = useMemo(() => {
    const subtotal = roundMoney(items.reduce((sum, item) => sum + (Number(item.total) || 0), 0));
    const discountAmount = roundMoney(subtotal * (discountPercent / 100));
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = roundMoney(taxableAmount * (taxRate / 100));
    const grandTotal = roundMoney(taxableAmount + taxAmount);

    return {
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal
    };
  }, [items, discountPercent, taxRate]);

  // Submit New Invoice
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || items.length === 0 || formTotals.grandTotal <= 0) return;

    const proj = projects.find((p) => p.id === projectId);
    const success = addInvoice({
      type: invoiceType,
      date: new Date().toISOString().split('T')[0],
      dueDate,
      clientName,
      clientPhone: clientPhone || undefined,
      clientVatNumber: clientVatNumber || undefined,
      clientAddress: clientAddress || undefined,
      projectId: projectId || undefined,
      projectName: proj?.nameAr || 'مشروع هندسي عام',
      contractRef: contractRef || undefined,
      items,
      subtotal: formTotals.subtotal,
      discountPercent: Number(discountPercent),
      discountAmount: formTotals.discountAmount,
      taxRate: Number(taxRate),
      taxAmount: formTotals.taxAmount,
      grandTotal: formTotals.grandTotal,
      paidAmount: 0,
      remainingAmount: formTotals.grandTotal,
      status: 'pending',
      paymentTerms,
      notes
    });

    if (success) {
      setIsCreateModalOpen(false);
      // Reset form
      setClientName('');
      setClientPhone('');
      setClientVatNumber('');
      setContractRef('');
      setDiscountPercent(0);
      setItems([
        {
          id: 'itm-1',
          description: '',
          unit: 'م²',
          quantity: 1,
          unitPrice: 100,
          total: 100
        }
      ]);
    }
  };

  // Quick Payment Modal handler
  const openPaymentModal = (invoice: Invoice) => {
    setPaymentModalInvoice(invoice);
    setPaymentAmountInput(invoice.remainingAmount);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;

    const amt = Number(paymentAmountInput);
    const totalPaidSoFar = roundMoney(paymentModalInvoice.paidAmount + amt);
    const newRemaining = roundMoney(Math.max(0, paymentModalInvoice.grandTotal - totalPaidSoFar));
    const newStatus: InvoiceStatus = newRemaining <= 0 ? 'paid' : 'partially_paid';

    updateInvoiceStatus(paymentModalInvoice.id, newStatus, totalPaidSoFar);
    setPaymentModalInvoice(null);
  };

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (filterType !== 'all' && inv.type !== filterType) return false;
      if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
        const matchClient = inv.clientName.toLowerCase().includes(q);
        const matchProj = inv.projectName?.toLowerCase().includes(q);
        const matchItem = inv.items.some((it) => it.description.toLowerCase().includes(q));
        if (!matchNum && !matchClient && !matchProj && !matchItem) return false;
      }
      return true;
    });
  }, [invoices, filterType, filterStatus, searchQuery]);

  // Overall Metrics
  const metrics = useMemo(() => {
    let totalSales = 0;
    let totalPurchases = 0;
    let totalPaid = 0;
    let totalRemaining = 0;
    let totalVat = 0;

    invoices.forEach((inv) => {
      if (inv.status !== 'cancelled') {
        if (inv.type === 'sales') totalSales += inv.grandTotal;
        else totalPurchases += inv.grandTotal;

        totalPaid += inv.paidAmount;
        totalRemaining += inv.remainingAmount;
        totalVat += inv.taxAmount;
      }
    });

    return {
      totalSales: roundMoney(totalSales),
      totalPurchases: roundMoney(totalPurchases),
      totalPaid: roundMoney(totalPaid),
      totalRemaining: roundMoney(totalRemaining),
      totalVat: roundMoney(totalVat)
    };
  }, [invoices]);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-800 to-slate-900 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/5">
            <FileText className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                منظومة الفوترة والمستخلصات الذكية
              </span>
              <span className="text-xs text-slate-400">| متوافق مع هيئة ZATCA الضريبية</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">محرك الفواتير والمستخلصات المعتمدة</h1>
            <p className="text-sm text-slate-400">
              إنشاء فواتير المبيعات والتوريد، احتساب الضرائب والخصومات، وتوليد قوالب الطباعة الرسمية مع الختم الرقمي والتفقيط.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!canCreate}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-xl ${
              canCreate
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 hover:scale-[1.02] cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>إنشاء فاتورة جديدة (New Invoice)</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Sales Invoiced */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">إجمالي مستخلصات المبيعات</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white tracking-tight">
              {formatSAR(metrics.totalSales)}
            </div>
            <p className="text-xs text-amber-400/90 mt-1">
              {invoices.filter((i) => i.type === 'sales').length} فواتير مبيعات صادرة
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>عقود المقاولات والتنفيذ</span>
            <span className="text-emerald-400 font-mono">معتمد</span>
          </div>
        </div>

        {/* Metric 2: Total Paid Collections */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">المحصل والمقبوض فعلياً</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              {formatSAR(metrics.totalPaid)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              نسبة التحصيل:{' '}
              <span className="text-white font-mono font-bold">
                {metrics.totalSales > 0 ? Math.round((metrics.totalPaid / metrics.totalSales) * 100) : 0}%
              </span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>تدفقات نقدية داخلة</span>
            <span className="text-emerald-400">مكتمل التحصيل</span>
          </div>
        </div>

        {/* Metric 3: Outstanding Receivables */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">المتبقي المطلوب تحصيله (ذمم)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-rose-400 tracking-tight">
              {formatSAR(metrics.totalRemaining)}
            </div>
            <p className="text-xs text-slate-400 mt-1">مستحقات آجلة قيد المطالبة</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>متابعة التحصيل الدوري</span>
            <span className="text-rose-400 font-mono">مستحق</span>
          </div>
        </div>

        {/* Metric 4: VAT Tax Total */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">إجمالي ضريبة القيمة المضافة (15%)</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-sky-300 tracking-tight">
              {formatSAR(metrics.totalVat)}
            </div>
            <p className="text-xs text-slate-400 mt-1">إقرار ضريبي إلكتروني ZATCA</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>الرقم الضريبي الموحد</span>
            <span className="text-slate-300 font-mono text-[10px]">310294857200003</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
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
              جميع الفواتير
            </button>
            <button
              onClick={() => setFilterType('sales')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === 'sales' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              مبيعات ومستخلصات
            </button>
            <button
              onClick={() => setFilterType('purchase')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === 'purchase' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              مشتريات وتوريد
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">جميع حالات السداد</option>
            <option value="paid">مدفوعة بالكامل (Paid)</option>
            <option value="partially_paid">مسددة جزئياً (Partially Paid)</option>
            <option value="pending">معلقة / مستحقة (Pending)</option>
            <option value="cancelled">ملغاة (Cancelled)</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث برقم الفاتورة، العميل، أو البند..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/80 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">رقم الفاتورة والنوع</th>
                <th className="py-3.5 px-4">العميل / المورد</th>
                <th className="py-3.5 px-4">المشروع الهندسي</th>
                <th className="py-3.5 px-4">التواريخ والاستحقاق</th>
                <th className="py-3.5 px-4">المبلغ الإجمالي</th>
                <th className="py-3.5 px-4">حالة السداد</th>
                <th className="py-3.5 px-4 text-center">الإجراءات والطباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm">لا توجد فواتير مطابقة لمعايير البحث والفلترة</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isSales = inv.type === 'sales';
                  return (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Invoice Number & Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-white flex items-center gap-1.5">
                          {inv.invoiceNumber}
                        </div>
                        <span
                          className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isSales
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          }`}
                        >
                          {isSales ? 'مستخلص مبيعات' : 'شراء وتوريد'}
                        </span>
                      </td>

                      {/* Client Name */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-white font-semibold truncate">{inv.clientName}</div>
                        {inv.clientVatNumber && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            الرقم الضريبي: {inv.clientVatNumber}
                          </div>
                        )}
                      </td>

                      {/* Project */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-300 font-medium flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{inv.projectName}</span>
                        </div>
                        {inv.contractRef && (
                          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                            عقد: {inv.contractRef}
                          </span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-400 space-y-0.5 font-mono">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">إصدار:</span>
                          <span className="text-slate-300">{inv.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-500">استحقاق:</span>
                          <span className="text-amber-400/90">{inv.dueDate}</span>
                        </div>
                      </td>

                      {/* Totals */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-sm text-white">{formatSAR(inv.grandTotal)}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          شامل ضريبة 15% ({formatSAR(inv.taxAmount, false)})
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : inv.status === 'partially_paid'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : inv.status === 'pending'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {inv.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                          {inv.status === 'partially_paid' && <Clock className="w-3 h-3" />}
                          {inv.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                          {inv.status === 'paid' && 'مسددة بالكامل'}
                          {inv.status === 'partially_paid' && `مسددة جزئياً (${formatSAR(inv.paidAmount, false)})`}
                          {inv.status === 'pending' && 'معلقة / غير مسددة'}
                          {inv.status === 'cancelled' && 'ملغاة'}
                        </span>
                        {inv.remainingAmount > 0 && inv.status !== 'pending' && (
                          <div className="text-[10px] text-rose-400 font-mono mt-1">
                            متبقي: {formatSAR(inv.remainingAmount)}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Print / Preview Official Template */}
                          <button
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            title="معاينة وطباعة الفاتورة الرسمية A4"
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>طباعة</span>
                          </button>

                          {/* Quick Payment Button */}
                          {inv.remainingAmount > 0 && canEdit && (
                            <button
                              onClick={() => openPaymentModal(inv)}
                              title="تسجيل دفعة سريعة"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>سداد</span>
                            </button>
                          )}

                          {/* Delete (Super Admin only) */}
                          {canDelete && (
                            <button
                              onClick={() => deleteInvoice(inv.id)}
                              title="حذف الفاتورة (المدير العام)"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
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

      {/* MODAL 1: NEW INVOICE CREATION */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute left-6 top-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">إصدار فاتورة رسمية معتمدة (ZATCA)</h3>
                <p className="text-xs text-slate-400">
                  إدخال بنود الأعمال المعمارية، احتساب الضريبة والتفقيط، وإصدار الفاتورة فورياً.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              {/* Type Switcher & Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    نوع الفاتورة *
                  </label>
                  <select
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="sales">فاتورة مبيعات / مستخلص أعمال (Sales)</option>
                    <option value="purchase">فاتورة شراء وتوريد مواد (Purchase)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    المشروع المرتبط *
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    رقم مرجع العقد / التعميد
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: CONT-LM-2026-09"
                    value={contractRef}
                    onChange={(e) => setContractRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Client / Supplier Information */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {invoiceType === 'sales' ? 'بيانات العميل المستفيد' : 'بيانات المورد / المقاول'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      اسم العميل / الجهة *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مجموعة استثمار الأفق العقارية"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      الرقم الضريبي للعميل (VAT #)
                    </label>
                    <input
                      type="text"
                      placeholder="310XXXXXXXXXXX"
                      value={clientVatNumber}
                      onChange={(e) => setClientVatNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      رقم الهاتف / الجوال
                    </label>
                    <input
                      type="text"
                      placeholder="+966 50 XXX XXXX"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    جدول البنود المعمارية والمواد (Invoice Items)
                  </h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة بند جديد</span>
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">وصف البند / الخدمة</th>
                        <th className="py-2.5 px-2 w-28 text-center">الوحدة</th>
                        <th className="py-2.5 px-2 w-24 text-center">الكمية</th>
                        <th className="py-2.5 px-2 w-28 text-center">سعر المفرد</th>
                        <th className="py-2.5 px-3 w-32 text-left">الإجمالي</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-900/40">
                          {/* Description */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              required
                              placeholder="وصف البند المعماري..."
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                          </td>

                          {/* Unit */}
                          <td className="py-2 px-2 text-center">
                            <select
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-amber-500"
                            >
                              {COMMON_UNITS.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Quantity */}
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono text-center text-white focus:outline-none focus:border-amber-500"
                            />
                          </td>

                          {/* Unit Price */}
                          <td className="py-2 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                              className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono text-center text-amber-400 focus:outline-none focus:border-amber-500"
                            />
                          </td>

                          {/* Line Total */}
                          <td className="py-2 px-3 text-left font-mono font-bold text-white">
                            {formatSAR(item.total, false)}
                          </td>

                          {/* Delete */}
                          <td className="py-2 px-2 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItemRow(index)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculations & Discounts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start pt-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        نسبة الخصم (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        نسبة الضريبة (VAT %)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      تاريخ الاستحقاق *
                    </label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Tafqeet Preview Callout */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <span className="text-[10px] text-amber-400 font-bold block mb-1">
                      المبلغ المرقوم تفقيطاً باللغة العربية:
                    </span>
                    <p className="text-white font-medium">{tafqeetSAR(formTotals.grandTotal)}</p>
                  </div>
                </div>

                {/* Totals Summary Panel */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>المجموع الفرعي (قبل الخصم):</span>
                    <span className="text-white font-bold">{formatSAR(formTotals.subtotal)}</span>
                  </div>

                  {formTotals.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>قيمة الخصم ({discountPercent}%):</span>
                      <span>-{formatSAR(formTotals.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>ضريبة القيمة المضافة ({taxRate}%):</span>
                    <span className="text-sky-400 font-bold">+{formatSAR(formTotals.taxAmount)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                    <span>الصافي الإجمالي النهائي:</span>
                    <span className="text-base text-amber-400">{formatSAR(formTotals.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  تأكيد وإصدار الفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK PAYMENT RECORD */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={() => setPaymentModalInvoice(null)}
              className="absolute left-5 top-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">تسجيل دفعة سداد للفاتورة</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {paymentModalInvoice.invoiceNumber}
                </p>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>إجمالي الفاتورة:</span>
                  <span className="text-white font-mono">{formatSAR(paymentModalInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>المسدد سابقاً:</span>
                  <span className="text-emerald-400 font-mono">{formatSAR(paymentModalInvoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-bold pt-1 border-t border-slate-900">
                  <span>المتبقي المطلوب:</span>
                  <span className="text-rose-400 font-mono">{formatSAR(paymentModalInvoice.remainingAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  المبلغ المسدد الآن (د.ع) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={paymentModalInvoice.remainingAmount}
                  step="0.01"
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  تأكيد وقيد السداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: OFFICIAL PRINT PREVIEW MODAL */}
      <OfficialInvoicePrintModal
        invoice={selectedInvoiceForPrint}
        onClose={() => setSelectedInvoiceForPrint(null)}
      />
    </div>
  );
};
