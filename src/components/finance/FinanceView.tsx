import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { FinancialTransaction } from '../../types/erp';
import {
  Receipt,
  Plus,
  CheckCircle2,
  Trash2,
  Lock,
  Building2,
  CreditCard,
  DollarSign,
  Wallet,
  AlertCircle,
  FileText,
  X
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const {
    transactions,
    addTransaction,
    approveTransaction,
    deleteTransaction,
    hasPermission,
    projects,
    currentRole,
    roleConfig
  } = useErp();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`CLM-LM-${Date.now().toString().slice(-4)}`);
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [recipientName, setRecipientName] = useState<string>('');
  const [category, setCategory] = useState<FinancialTransaction['category']>('subcontractor');
  const [amount, setAmount] = useState<number>(50000);
  const [notes, setNotes] = useState<string>('');

  const canCreate = hasPermission('canCreateInvoice');
  const canApprove = hasPermission('canApproveSubcontractorPayment');
  const canDelete = hasPermission('canDeleteRecords');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === projectId);
    const success = addTransaction({
      invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      projectId,
      projectName: proj?.nameAr || 'مشروع هندسي عام',
      recipientName,
      category,
      amount: Number(amount),
      vatAmount: Math.round(Number(amount) * 0.15),
      status: 'pending',
      notes
    });

    if (success) {
      setIsModalOpen(false);
      setRecipientName('');
      setNotes('');
      setInvoiceNumber(`CLM-LM-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const totalSpent = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const approvedTotal = transactions
    .filter((t) => t.status === 'approved')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const pendingTotal = transactions
    .filter((t) => t.status === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const filteredTransactions = transactions.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              الإدارة المالية ومستخلصات المقاولين
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            إدارة تدفقات الصندوق، فواتير المشتريات، واعتماد مستخلصات مقاولي الباطن لمشاريع لمسات المعمار.
          </p>
        </div>

        {/* Action: Add Invoice */}
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!canCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {canCreate ? (
            <>
              <Plus className="w-4 h-4" />
              إصدار مستخلص / سند صرف جديد
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              إصدار سند (مقيد لدورك)
            </>
          )}
        </button>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">إجمالي المصروفات والمستخلصات</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
            {totalSpent.toLocaleString()} <span className="text-xs text-slate-400 font-sans">د.ع</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">شاملة ضريبة القيمة المضافة 15%</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">المستخلصات المعتمدة والمسددة</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {approvedTotal.toLocaleString()} <span className="text-xs text-slate-400 font-sans">د.ع</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">معتمدة من الإدارة المالية والتنفيذية</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">مستخلصات قيد المراجعة والتدقيق</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {pendingTotal.toLocaleString()} <span className="text-xs text-slate-400 font-sans">د.ع</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">بانتظار موافقة الاستشاري والمهندس</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs">
        {[
          { id: 'all', label: 'كافة المعاملات المالية' },
          { id: 'subcontractor', label: 'مستخلصات مقاولي الباطن' },
          { id: 'materials', label: 'توريد المواد والخرسانة' },
          { id: 'petty_cash', label: 'العهد النقدية والمصاريف' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === tab.id
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold">
                <th className="p-4">رقم السند / المستخلص</th>
                <th className="p-4">المشروع الهندسي</th>
                <th className="p-4">المستفيد / المقاول</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4 text-left">المبلغ الصافي</th>
                <th className="p-4 text-center">حالة الاعتماد</th>
                <th className="p-4 text-center">الإجراءات الأمنية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-bold text-amber-400 block">{t.invoiceNumber}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{t.date}</span>
                  </td>
                  <td className="p-4 font-medium text-white">{t.projectName}</td>
                  <td className="p-4">{t.recipientName}</td>
                  <td className="p-4">
                    <span className="text-[11px] text-slate-400">
                      {t.category === 'subcontractor'
                        ? 'مستخلص مقاول'
                        : t.category === 'materials'
                        ? 'شراء مواد'
                        : 'عهدة نقدية'}
                    </span>
                  </td>
                  <td className="p-4 text-left font-mono font-bold text-white tabular-nums text-sm">
                    {t.amount.toLocaleString()} <span className="text-[10px] font-sans text-slate-400">د.ع</span>
                  </td>
                  <td className="p-4 text-center">
                    {t.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        معتمد للصرف
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px] bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        قيد المراجعة
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Approve Button */}
                      {t.status === 'pending' && (
                        <button
                          onClick={() => approveTransaction(t.id)}
                          disabled={!canApprove}
                          title={canApprove ? 'اعتماد المستخلص المالي' : 'صلاحية الاعتماد غير متوفرة لدورك'}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          اعتماد
                        </button>
                      )}

                      {/* Delete Button (Protected: Super Admin Only) */}
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        disabled={!canDelete}
                        title={
                          canDelete
                            ? 'حذف نهائي (صلاحية المدير العام فقط)'
                            : 'حذف السجلات محظور على المحاسب ومدخل البيانات لمنع التلاعب المالي'
                        }
                        className={`p-1.5 rounded-lg border transition-colors ${
                          canDelete
                            ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                            : 'border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {canDelete ? <Trash2 className="w-4 h-4" /> : <Lock className="w-4 h-4 text-slate-600" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-7 text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">إصدار مستخلص أو سند صرف مالي</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">المشروع المستهدف:</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم المقاول / الجهة المستفيدة:</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="مثال: شركة مصاعد القمة الهندسية"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نوع المعاملة:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="subcontractor">مستخلص مقاول باطن</option>
                    <option value="materials">توريد مواد ومعدات</option>
                    <option value="petty_cash">عهدة نقدية للموقع</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المبلغ (د.ع):</label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ملاحظات المستخلص والأعمال المنجزة:</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="تفاصيل التوريد أو الدفعة المستحقة حسب العقد..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20"
                >
                  حفظ وتسجيل السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
