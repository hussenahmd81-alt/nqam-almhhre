import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { SubcontractorVendor, VendorType } from '../../types/erp';
import { VendorStatementPrintModal } from './VendorStatementPrintModal';
import {
  Users,
  Building2,
  Receipt,
  CreditCard,
  Plus,
  Search,
  Filter,
  FileText,
  Printer,
  TrendingDown,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  Layers,
  ChevronRight,
  Building
} from 'lucide-react';

export const SubcontractorsView: React.FC = () => {
  const {
    vendors,
    vendorTransactions,
    projects,
    addVendor,
    addVendorBill,
    payVendor,
    hasPermission,
    liveSafeBalance
  } = useErp();

  // Active view tab: 'directory' | 'transactions'
  const [activeTab, setActiveTab] = useState<'directory' | 'transactions'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');

  // Modals state
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [isAddBillModalOpen, setIsAddBillModalOpen] = useState(false);
  const [isPayVendorModalOpen, setIsPayVendorModalOpen] = useState(false);
  const [selectedVendorForPayment, setSelectedVendorForPayment] = useState<string>('');
  const [vendorForStatementPrint, setVendorForStatementPrint] = useState<SubcontractorVendor | null>(null);

  // New Vendor Form
  const [newVendorForm, setNewVendorForm] = useState<{
    name: string;
    type: VendorType;
    specialty: string;
    phone: string;
    email: string;
    commercialReg: string;
    vatNumber: string;
    contactPerson: string;
    paymentTermDays: number;
    assignedProjectIds: string[];
    notes: string;
  }>({
    name: '',
    type: 'subcontractor',
    specialty: '',
    phone: '',
    email: '',
    commercialReg: '',
    vatNumber: '',
    contactPerson: '',
    paymentTermDays: 30,
    assignedProjectIds: [],
    notes: ''
  });

  // New Bill Form
  const [billForm, setBillForm] = useState<{
    vendorId: string;
    amount: number;
    description: string;
    referenceDocNumber: string;
    projectId: string;
  }>({
    vendorId: '',
    amount: 0,
    description: '',
    referenceDocNumber: '',
    projectId: ''
  });

  // Pay Vendor Form
  const [payForm, setPayForm] = useState<{
    vendorId: string;
    amount: number;
    paymentMethod: 'cash_safe' | 'bank_transfer' | 'check';
    description: string;
    referenceDocNumber: string;
  }>({
    vendorId: '',
    amount: 0,
    paymentMethod: 'cash_safe',
    description: '',
    referenceDocNumber: ''
  });

  // Computed summary metrics
  const totalBilled = vendors.reduce((acc, v) => acc + v.totalBilled, 0);
  const totalPaid = vendors.reduce((acc, v) => acc + v.totalPaid, 0);
  const totalBalanceDue = vendors.reduce((acc, v) => acc + v.currentBalance, 0);

  // Filtered vendors
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === 'all' || v.type === selectedTypeFilter;
    const matchesProject =
      selectedProjectFilter === 'all' || v.assignedProjectIds.includes(selectedProjectFilter);
    return matchesSearch && matchesType && matchesProject;
  });

  // Filtered transactions
  const filteredTransactions = vendorTransactions.filter((tx) => {
    const matchesSearch =
      tx.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.transactionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.referenceDocNumber && tx.referenceDocNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesProject = selectedProjectFilter === 'all' || tx.projectId === selectedProjectFilter;
    return matchesSearch && matchesProject;
  });

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorForm.name || !newVendorForm.specialty) return;

    let typeAr = 'مقاول باطن';
    if (newVendorForm.type === 'material_supplier') typeAr = 'مورّد مواد وتجهيزات';
    if (newVendorForm.type === 'equipment_lessor') typeAr = 'تأجير آليات ومعدات';
    if (newVendorForm.type === 'service_provider') typeAr = 'مزوّد خدمات هندسية';

    addVendor({
      name: newVendorForm.name,
      type: newVendorForm.type,
      typeAr,
      specialty: newVendorForm.specialty,
      phone: newVendorForm.phone || '+966 50 000 0000',
      email: newVendorForm.email,
      commercialReg: newVendorForm.commercialReg,
      vatNumber: newVendorForm.vatNumber,
      contactPerson: newVendorForm.contactPerson || 'المسؤول المالي',
      assignedProjectIds: newVendorForm.assignedProjectIds,
      paymentTermDays: Number(newVendorForm.paymentTermDays) || 30,
      status: 'active',
      notes: newVendorForm.notes
    });

    setIsAddVendorModalOpen(false);
    setNewVendorForm({
      name: '',
      type: 'subcontractor',
      specialty: '',
      phone: '',
      email: '',
      commercialReg: '',
      vatNumber: '',
      contactPerson: '',
      paymentTermDays: 30,
      assignedProjectIds: [],
      notes: ''
    });
  };

  const handleRecordBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billForm.vendorId || billForm.amount <= 0 || !billForm.description) return;

    addVendorBill(
      billForm.vendorId,
      Number(billForm.amount),
      billForm.description,
      billForm.referenceDocNumber || `INV-${Date.now().toString().slice(-4)}`,
      billForm.projectId || undefined
    );

    setIsAddBillModalOpen(false);
    setBillForm({
      vendorId: '',
      amount: 0,
      description: '',
      referenceDocNumber: '',
      projectId: ''
    });
  };

  const handlePayVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.vendorId || payForm.amount <= 0 || !payForm.description) return;

    const success = payVendor(
      payForm.vendorId,
      Number(payForm.amount),
      payForm.paymentMethod,
      payForm.description,
      payForm.referenceDocNumber || undefined
    );

    if (success) {
      setIsPayVendorModalOpen(false);
      setPayForm({
        vendorId: '',
        amount: 0,
        paymentMethod: 'cash_safe',
        description: '',
        referenceDocNumber: ''
      });
    }
  };

  const openPayModalForVendor = (vendorId: string) => {
    const v = vendors.find((x) => x.id === vendorId);
    setSelectedVendorForPayment(vendorId);
    setPayForm({
      vendorId,
      amount: v?.currentBalance || 0,
      paymentMethod: 'cash_safe',
      description: `سداد دفعة من رصيد ${v?.name || ''}`,
      referenceDocNumber: ''
    });
    setIsPayVendorModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-slate-900 via-[#0d1627] to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Briefcase className="w-3.5 h-3.5" />
              إدارة سلسلة الإمداد والعقود من الباطن
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              حسابات المجهزين ومقاولي الباطن
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              متابعة دقيقة لكشوفات حساب موردي الخرسانة والحديد، مقاولي الباطن، كشوفات المستخلصات (دائن) والدفعات الصادرة (مدين)، مع مطابقة فورية لأرصدة الذمم وتصدير كشوف الحسابات الرسمية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddBillModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600/70 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              قيد مستخلص / فاتورة (دائن)
            </button>

            <button
              onClick={() => {
                setSelectedVendorForPayment('');
                setIsPayVendorModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              سداد دفعة مالية (مدين)
            </button>

            <button
              onClick={() => setIsAddVendorModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-black transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              إضافة مورد / مقاول جديد
            </button>
          </div>
        </div>
      </div>

      {/* KPI 3D Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Payables Balance */}
        <div className="bg-slate-900/80 backdrop-blur border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">إجمالي ديون المجهزين (بذمة الشركة)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
            {totalBalanceDue.toLocaleString()}{' '}
            <span className="text-xs font-sans text-amber-500/80 font-normal">د.ع</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 inline" />
            صافي مستحقات الموردين والمقاولين الحالية
          </p>
        </div>

        {/* Total Billed */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">إجمالي الفواتير والمستخلصات</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {totalBilled.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">د.ع</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 inline" />
            إجمالي التوريدات والأعمال المنفذة
          </p>
        </div>

        {/* Total Paid */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">إجمالي الدفعات المسددة</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {totalPaid.toLocaleString()}{' '}
            <span className="text-xs font-sans text-emerald-500/80 font-normal">د.ع</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 inline" />
            تم صرفها نقداً أو عبر تحويلات بنكية
          </p>
        </div>

        {/* Active Accounts */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">الجهات والمقاولين المسجلين</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono tracking-tight">
            {vendors.length}{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">جهة معتمدة</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            {vendors.filter((v) => v.currentBalance > 0).length} جهة لديها أرصدة مستحقة للسداد
          </p>
        </div>
      </div>

      {/* Main Workspace: Tabs & Filtering */}
      <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
        {/* Navigation Tabs Bar & Search */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'directory'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              سجل بطاقات المجهزين ومقاولي الباطن ({vendors.length})
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              دفتر المعاملات والقيود المالية ({vendorTransactions.length})
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، التخصص، أو الكود..."
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {activeTab === 'directory' && (
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60"
              >
                <option value="all">كافة التخصصات والأنشطة</option>
                <option value="material_supplier">توريد مواد وإنشاءات</option>
                <option value="subcontractor">مقاول باطن (أعمال تنفيذ)</option>
                <option value="equipment_lessor">تأجير آليات ومعدات</option>
                <option value="service_provider">مزوّدو خدمات</option>
              </select>
            )}

            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60"
            >
              <option value="all">كافة المشاريع المعينة</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab 1: Vendor Cards & Accounts Directory */}
        {activeTab === 'directory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVendors.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm">لم يتم العثور على أي موردين مطابقين لمعايير البحث.</p>
              </div>
            ) : (
              filteredVendors.map((vendor) => {
                const hasDue = vendor.currentBalance > 0;
                return (
                  <div
                    key={vendor.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                              {vendor.vendorNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                vendor.type === 'subcontractor'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : vendor.type === 'equipment_lessor'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {vendor.typeAr}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                            {vendor.name}
                          </h3>
                        </div>

                        {/* Balance Badge */}
                        <div className="text-left">
                          <span className="text-[10px] block text-slate-400 font-medium">الرصيد المتبقي</span>
                          <span
                            className={`text-sm font-black font-mono ${
                              hasDue ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {vendor.currentBalance.toLocaleString()}{' '}
                            <span className="text-[10px] font-sans">د.ع</span>
                          </span>
                        </div>
                      </div>

                      {/* Specialty & Description */}
                      <p className="text-xs text-slate-300 mb-4 line-clamp-2 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                        {vendor.specialty}
                      </p>

                      {/* Contact & Meta Details */}
                      <div className="space-y-1.5 text-xs text-slate-400 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            مسؤول الاتصال:
                          </span>
                          <span className="font-semibold text-slate-200">{vendor.contactPerson}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            رقم الهاتف:
                          </span>
                          <span className="font-mono text-slate-300">{vendor.phone}</span>
                        </div>
                        {vendor.commercialReg && (
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Building className="w-3.5 h-3.5 text-slate-500" />
                              سجل تجاري:
                            </span>
                            <span className="font-mono text-slate-300">{vendor.commercialReg}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            أجل السداد:
                          </span>
                          <span className="text-slate-300 font-medium">{vendor.paymentTermDays} يوماً</span>
                        </div>
                      </div>

                      {/* Mini Financial Progress Bar */}
                      <div className="space-y-1 mb-4">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>المسدد: {vendor.totalPaid.toLocaleString()} د.ع</span>
                          <span>الإجمالي: {vendor.totalBilled.toLocaleString()} د.ع</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{
                              width: `${
                                vendor.totalBilled > 0
                                  ? Math.min(100, (vendor.totalPaid / vendor.totalBilled) * 100)
                                  : 0
                              }%`
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setVendorForStatementPrint(vendor)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        title="معاينة وطباعة كشف حساب تفصيلي رسمي A4"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        كشف حساب (A4)
                      </button>

                      <button
                        onClick={() => openPayModalForVendor(vendor.id)}
                        disabled={vendor.currentBalance <= 0}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          vendor.currentBalance > 0
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        سداد دفعة
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Transactions Ledger Table */}
        {activeTab === 'transactions' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">رقم القيد / المرجع</th>
                  <th className="p-3.5">التاريخ</th>
                  <th className="p-3.5">المورد / المقاول</th>
                  <th className="p-3.5">المشروع المعني</th>
                  <th className="p-3.5">البيان والشرح</th>
                  <th className="p-3.5 text-emerald-400">مسدد (مدين)</th>
                  <th className="p-3.5 text-amber-400">مستحق (دائن)</th>
                  <th className="p-3.5">الرصيد بعد الحركة</th>
                  <th className="p-3.5">المسجل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-500">
                      لا توجد قيود أو حركات مالية مطابقة لمعايير الفلترة.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isBill = tx.type === 'bill';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-white whitespace-nowrap">
                          {tx.referenceDocNumber || tx.transactionNumber}
                        </td>
                        <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">{tx.date}</td>
                        <td className="p-3.5 font-semibold text-slate-200 whitespace-nowrap">{tx.vendorName}</td>
                        <td className="p-3.5 text-slate-300 whitespace-nowrap">
                          {tx.projectName ? (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs">
                              {tx.projectName}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">عام / الإدارة</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-300 max-w-xs truncate" title={tx.description}>
                          {tx.description}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {!isBill ? `${tx.amount.toLocaleString()} د.ع` : '-'}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-amber-400 whitespace-nowrap">
                          {isBill ? `${tx.amount.toLocaleString()} د.ع` : '-'}
                        </td>
                        <td className="p-3.5 font-mono font-black text-white whitespace-nowrap">
                          {tx.balanceAfter.toLocaleString()} د.ع
                        </td>
                        <td className="p-3.5 text-slate-400 text-xs whitespace-nowrap">{tx.recordedBy}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Add New Vendor */}
      {isAddVendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              إضافة مورد / مقاول باطن جديد
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              تسجيل بطاقة جهة جديدة في قاعدة بيانات شركة لمسات المعمار لربط الفواتير والدفعات.
            </p>

            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  اسم الشركة / المؤسسة / المقاول *
                </label>
                <input
                  type="text"
                  required
                  value={newVendorForm.name}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, name: e.target.value })}
                  placeholder="اسم المورد أو المقاول"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">التصنيف الرئيسي *</label>
                  <select
                    value={newVendorForm.type}
                    onChange={(e) =>
                      setNewVendorForm({ ...newVendorForm, type: e.target.value as VendorType })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="subcontractor">مقاول باطن (أعمال تنفيذ)</option>
                    <option value="material_supplier">مورّد مواد وتجهيزات</option>
                    <option value="equipment_lessor">تأجير آليات ومعدات</option>
                    <option value="service_provider">مزوّد خدمات هندسية وفحص</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">أجل السداد (أيام)</label>
                  <input
                    type="number"
                    value={newVendorForm.paymentTermDays}
                    onChange={(e) =>
                      setNewVendorForm({ ...newVendorForm, paymentTermDays: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  التخصص الدقيق والمواد الموردة *
                </label>
                <input
                  type="text"
                  required
                  value={newVendorForm.specialty}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, specialty: e.target.value })}
                  placeholder="التخصص أو نوع الأعمال"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">مسؤول الاتصال</label>
                  <input
                    type="text"
                    value={newVendorForm.contactPerson}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, contactPerson: e.target.value })}
                    placeholder="م. طارق / أ. سعد"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم الهاتف *</label>
                  <input
                    type="text"
                    value={newVendorForm.phone}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, phone: e.target.value })}
                    placeholder="+966 50 123 4567"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">السجل التجاري</label>
                  <input
                    type="text"
                    value={newVendorForm.commercialReg}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, commercialReg: e.target.value })}
                    placeholder="1010XXXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">الرقم الضريبي (VAT)</label>
                  <input
                    type="text"
                    value={newVendorForm.vatNumber}
                    onChange={(e) => setNewVendorForm({ ...newVendorForm, vatNumber: e.target.value })}
                    placeholder="3XXXXXXXXXXXX03"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">ملاحظات وشروط الاتفاق</label>
                <textarea
                  rows={2}
                  value={newVendorForm.notes}
                  onChange={(e) => setNewVendorForm({ ...newVendorForm, notes: e.target.value })}
                  placeholder="أي شروط تعاقدية أو تسهيلات ائتمانية..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddVendorModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  حفظ وتسجيل المورد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Bill / Claim (Credit / دائن) */}
      {isAddBillModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              قيد فاتورة / مستخلص أعمال (دائن - بذمة الشركة)
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              إدراج مستحق مالي للمورد أو المقاول الثانوي يزيد من رصيده الدائن.
            </p>

            <form onSubmit={handleRecordBill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">اختر المورد أو المقاول *</label>
                <select
                  required
                  value={billForm.vendorId}
                  onChange={(e) => setBillForm({ ...billForm, vendorId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- اضغط للاختيار --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.typeAr}) - الحالي: {v.currentBalance.toLocaleString()} د.ع
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    المبلغ المستحق (د.ع) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={billForm.amount || ''}
                    onChange={(e) => setBillForm({ ...billForm, amount: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم الفاتورة / المستخلص</label>
                  <input
                    type="text"
                    value={billForm.referenceDocNumber}
                    onChange={(e) => setBillForm({ ...billForm, referenceDocNumber: e.target.value })}
                    placeholder="INV-XXXX أو CLM-01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">المشروع المعني</label>
                <select
                  value={billForm.projectId}
                  onChange={(e) => setBillForm({ ...billForm, projectId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">عام / مستودع الإدارة</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">بيان التوريد أو الأعمال *</label>
                <textarea
                  rows={3}
                  required
                  value={billForm.description}
                  onChange={(e) => setBillForm({ ...billForm, description: e.target.value })}
                  placeholder="وصف الفاتورة أو المستخلص"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBillModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  تأكيد وقيد الفاتورة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Pay Vendor / Subcontractor (Debit / مدين) */}
      {isPayVendorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              سداد دفعة للمورد / المقاول (مدين)
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              تسديد دفعة يخفض من رصيد الذمة الدائنة، مع إمكانية الصرف المباشر من صندوق الخزينة.
            </p>

            <form onSubmit={handlePayVendorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">اختر المورد أو المقاول *</label>
                <select
                  required
                  value={payForm.vendorId}
                  onChange={(e) => {
                    const vid = e.target.value;
                    const v = vendors.find((x) => x.id === vid);
                    setPayForm({
                      ...payForm,
                      vendorId: vid,
                      amount: v?.currentBalance || 0
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- اضغط للاختيار --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (المستحق بذمة الشركة: {v.currentBalance.toLocaleString()} د.ع)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    مبلغ الدفعة المراد سدادها (د.ع) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payForm.amount || ''}
                    onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">طريقة الدفع *</label>
                  <select
                    value={payForm.paymentMethod}
                    onChange={(e) =>
                      setPayForm({
                        ...payForm,
                        paymentMethod: e.target.value as 'cash_safe' | 'bank_transfer' | 'check'
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="cash_safe">نقداً من الخزينة والصندوق (Cash Out)</option>
                    <option value="bank_transfer">تحويل بنكي رسمي</option>
                    <option value="check">شيك مصرفي معتمد</option>
                  </select>
                </div>
              </div>

              {payForm.paymentMethod === 'cash_safe' && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
                  <span>الرصيد المتاح حالياً بالخزينة:</span>
                  <span className="font-mono font-bold">{liveSafeBalance.toLocaleString()} د.ع</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم السند أو إشعار التحويل</label>
                <input
                  type="text"
                  value={payForm.referenceDocNumber}
                  onChange={(e) => setPayForm({ ...payForm, referenceDocNumber: e.target.value })}
                  placeholder="TRF-XXXX أو CHK-091"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">البيان والشرح *</label>
                <textarea
                  rows={2}
                  required
                  value={payForm.description}
                  onChange={(e) => setPayForm({ ...payForm, description: e.target.value })}
                  placeholder="دفعة تحويل بنكي لحساب المستخلص الثاني..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPayVendorModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  صرف وسداد الدفعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* A4 PRINT MODAL: Vendor Statement */}
      {vendorForStatementPrint && (
        <VendorStatementPrintModal
          vendor={vendorForStatementPrint}
          transactions={vendorTransactions.filter((tx) => tx.vendorId === vendorForStatementPrint.id)}
          onClose={() => setVendorForStatementPrint(null)}
        />
      )}
    </div>
  );
};
