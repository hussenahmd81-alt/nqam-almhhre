import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { RentalMachinery, RentalMachineryType, RentalRateType } from '../../types/erp';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CreditCard,
  Clock,
  Calendar,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Phone,
  User,
  Fuel,
  Wrench,
  FileText,
  MapPin,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';

export const RentalMachineryView: React.FC = () => {
  const {
    rentalMachinery,
    rentalWorkLogs,
    rentalPayments,
    projects,
    addRentalMachinery,
    logRentalWork,
    payRentalMachinery,
    liveSafeBalance
  } = useErp();

  const [activeTab, setActiveTab] = useState<'fleet' | 'work_logs' | 'payments'>('fleet');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');

  // Modals state
  const [isAddMachineModalOpen, setIsAddMachineModalOpen] = useState(false);
  const [isLogWorkModalOpen, setIsLogWorkModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');

  // Add Machine Form
  const [machineForm, setMachineForm] = useState<{
    machineryName: string;
    type: RentalMachineryType;
    plateOrSerialNumber: string;
    ownerName: string;
    ownerPhone: string;
    rateType: RentalRateType;
    unitRate: number;
    fuelCoveredBy: 'company' | 'owner';
    operatorIncluded: boolean;
    assignedProjectId?: string;
    notes?: string;
  }>({
    machineryName: '',
    type: 'excavator',
    plateOrSerialNumber: '',
    ownerName: '',
    ownerPhone: '',
    rateType: 'hourly',
    unitRate: 150,
    fuelCoveredBy: 'company',
    operatorIncluded: true,
    assignedProjectId: '',
    notes: ''
  });

  // Log Work Form
  const [workForm, setWorkForm] = useState<{
    machineryId: string;
    unitsWorked: number;
    workDescription: string;
    date: string;
    siteSupervisor: string;
  }>({
    machineryId: '',
    unitsWorked: 8,
    workDescription: '',
    date: new Date().toISOString().split('T')[0],
    siteSupervisor: 'م. راشد - مهندس الموقع'
  });

  // Pay Form
  const [payForm, setPayForm] = useState<{
    machineryId: string;
    amount: number;
    paymentMethod: 'cash_safe' | 'bank_transfer' | 'check';
    notes: string;
  }>({
    machineryId: '',
    amount: 0,
    paymentMethod: 'cash_safe',
    notes: ''
  });

  // KPI Metrics
  const totalAccruedCost = rentalMachinery.reduce((acc, m) => acc + m.totalAccruedCost, 0);
  const totalPaid = rentalMachinery.reduce((acc, m) => acc + m.totalPaid, 0);
  const totalBalanceDue = rentalMachinery.reduce((acc, m) => acc + m.balanceDue, 0);
  const totalUnitsWorked = rentalMachinery.reduce((acc, m) => acc + m.totalUnitsWorked, 0);

  // Filtered Machinery
  const filteredMachinery = rentalMachinery.filter((m) => {
    const matchesSearch =
      m.machineryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.plateOrSerialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.machineryNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === 'all' || m.type === selectedTypeFilter;
    const matchesProject =
      selectedProjectFilter === 'all' || m.assignedProjectId === selectedProjectFilter;
    return matchesSearch && matchesType && matchesProject;
  });

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!machineForm.machineryName || !machineForm.ownerName || machineForm.unitRate <= 0) return;

    let typeAr = 'حفار مجنزر/دولاب';
    if (machineForm.type === 'crane') typeAr = 'رافعة هيدروليكية';
    if (machineForm.type === 'bobcat') typeAr = 'بوبكات / ميني لودر';
    if (machineForm.type === 'dump_truck') typeAr = 'شاحنة قلاب / تريلا';
    if (machineForm.type === 'water_tanker') typeAr = 'صهريج مياه (وايت)';
    if (machineForm.type === 'supervisor_pickup') typeAr = 'وانيت / سيارة إشراف';
    if (machineForm.type === 'other') typeAr = 'معدة / آلية مساندة';

    let rateTypeAr = 'بالساعة';
    if (machineForm.rateType === 'daily') rateTypeAr = 'باليوم';
    if (machineForm.rateType === 'monthly') rateTypeAr = 'شهرياً';
    if (machineForm.rateType === 'per_trip') rateTypeAr = 'بالرد / النقلة';

    const prj = projects.find((p) => p.id === machineForm.assignedProjectId);

    addRentalMachinery({
      machineryName: machineForm.machineryName,
      type: machineForm.type,
      typeAr,
      plateOrSerialNumber: machineForm.plateOrSerialNumber || 'بدون لوحة',
      ownerName: machineForm.ownerName,
      ownerPhone: machineForm.ownerPhone || '+966 50 000 0000',
      rentalRateType: machineForm.rateType,
      rateTypeAr,
      unitRate: Number(machineForm.unitRate),
      fuelCoveredBy: machineForm.fuelCoveredBy,
      operatorProvided: machineForm.operatorIncluded,
      operatorIncluded: machineForm.operatorIncluded,
      assignedProjectId: machineForm.assignedProjectId || 'general',
      assignedProjectName: prj?.nameAr || 'متحرك بين المشاريع',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      notes: machineForm.notes
    });

    setIsAddMachineModalOpen(false);
    setMachineForm({
      machineryName: '',
      type: 'excavator',
      plateOrSerialNumber: '',
      ownerName: '',
      ownerPhone: '',
      rateType: 'hourly',
      unitRate: 150,
      fuelCoveredBy: 'company',
      operatorIncluded: true,
      assignedProjectId: '',
      notes: ''
    });
  };

  const handleLogWorkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workForm.machineryId || workForm.unitsWorked <= 0 || !workForm.workDescription) return;

    logRentalWork(
      workForm.machineryId,
      Number(workForm.unitsWorked),
      workForm.workDescription,
      workForm.date,
      workForm.siteSupervisor
    );

    setIsLogWorkModalOpen(false);
    setWorkForm({
      machineryId: '',
      unitsWorked: 8,
      workDescription: '',
      date: new Date().toISOString().split('T')[0],
      siteSupervisor: 'م. راشد - مهندس الموقع'
    });
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.machineryId || payForm.amount <= 0) return;

    const success = payRentalMachinery(
      payForm.machineryId,
      Number(payForm.amount),
      payForm.paymentMethod,
      payForm.notes
    );

    if (success) {
      setIsPayModalOpen(false);
      setPayForm({
        machineryId: '',
        amount: 0,
        paymentMethod: 'cash_safe',
        notes: ''
      });
    }
  };

  const openLogWorkModal = (machineId: string) => {
    setSelectedMachineId(machineId);
    setWorkForm((prev) => ({ ...prev, machineryId: machineId }));
    setIsLogWorkModalOpen(true);
  };

  const openPayModal = (machineId: string) => {
    const m = rentalMachinery.find((x) => x.id === machineId);
    setSelectedMachineId(machineId);
    setPayForm({
      machineryId: machineId,
      amount: m?.balanceDue || 0,
      paymentMethod: 'cash_safe',
      notes: `سداد أجور تشغيل ${m?.machineryName || ''}`
    });
    setIsPayModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner & Title */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-slate-900 via-[#101b2e] to-slate-900 border border-slate-700/60 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Truck className="w-3.5 h-3.5" />
              إدارة الآليات والمعدات وسيارات الإشراف المؤجرة
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              أجور الآليات والسيارات المؤجرة
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              تسجيل ومتابعة عقود إيجار الحفارات، الرافعات، الشاحنات والوانيتات، احتساب تكلفة الساعات والنقلات الميدانية تلقائياً، والربط المباشر مع حركة الخزينة لصرف المستحقات.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setSelectedMachineId('');
                setIsLogWorkModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600/70 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              تسجيل ساعات / عمل ميداني
            </button>

            <button
              onClick={() => {
                setSelectedMachineId('');
                setIsPayModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              سداد أجور المؤجر
            </button>

            <button
              onClick={() => setIsAddMachineModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-black transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              تسجيل آلية مؤجرة جديدة
            </button>
          </div>
        </div>
      </div>

      {/* 3D KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Due to Lessors */}
        <div className="bg-slate-900/80 backdrop-blur border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-amber-500/60 transition-all">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">إجمالي مستحقات المؤجرين (بذمة الشركة)</span>
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
            صافي المتبقي لأصحاب الآليات والسيارات
          </p>
        </div>

        {/* Total Accrued Cost */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">إجمالي تكلفة التشغيل المحتسبة</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {totalAccruedCost.toLocaleString()}{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">د.ع</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400 inline" />
            بناءً على الساعات والنقلات الميدانية
          </p>
        </div>

        {/* Total Paid */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">إجمالي الأجور المسددة</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {totalPaid.toLocaleString()}{' '}
            <span className="text-xs font-sans text-emerald-500/80 font-normal">د.ع</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            صرفت عبر الخزينة أو التحويلات الرسمية
          </p>
        </div>

        {/* Total Working Fleet */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/60 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400">أسطول الآليات والسيارات</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono tracking-tight">
            {rentalMachinery.length}{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">آلية مؤجرة</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            إجمالي ساعات ونقلات التشغيل: {totalUnitsWorked} وحدة
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
        {/* Tabs Bar & Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'fleet'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              بطاقات الآليات المؤجرة ({rentalMachinery.length})
            </button>

            <button
              onClick={() => setActiveTab('work_logs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'work_logs'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              سجل ساعات ونقلات التشغيل ({rentalWorkLogs.length})
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              سجل الدفعات المسددة ({rentalPayments.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالمعدة، المؤجر، أو اللوحة..."
                className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {activeTab === 'fleet' && (
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60"
              >
                <option value="all">كافة أنواع المعدات</option>
                <option value="excavator">حفارات مجنزرة</option>
                <option value="crane">رافعات هيدروليكية</option>
                <option value="bobcat">بوبكات ولودرات</option>
                <option value="dump_truck">شاحنات قلاب</option>
                <option value="water_tanker">تناكر مياه</option>
                <option value="supervisor_pickup">سيارات إشراف</option>
              </select>
            )}

            <select
              value={selectedProjectFilter}
              onChange={(e) => setSelectedProjectFilter(e.target.value)}
              className="bg-slate-950/70 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60"
            >
              <option value="all">كافة المشاريع</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab 1: Machinery Cards */}
        {activeTab === 'fleet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMachinery.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400">
                <Truck className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-sm">لم يتم العثور على أي آليات مؤجرة مطابقة للبحث.</p>
              </div>
            ) : (
              filteredMachinery.map((m) => {
                const hasDue = m.balanceDue > 0;
                return (
                  <div
                    key={m.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                              {m.machineryNumber}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              {m.typeAr}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                            {m.machineryName}
                          </h3>
                        </div>

                        {/* Balance Due */}
                        <div className="text-left">
                          <span className="text-[10px] block text-slate-400">المستحق للمؤجر</span>
                          <span
                            className={`text-sm font-black font-mono ${
                              hasDue ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {m.balanceDue.toLocaleString()}{' '}
                            <span className="text-[10px] font-sans">د.ع</span>
                          </span>
                        </div>
                      </div>

                      {/* Plate and Specs Badge */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-200">
                          اللوحة: {m.plateOrSerialNumber}
                        </span>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                          معدل الأجر: {m.unitRate} د.ع / {m.rateTypeAr}
                        </span>
                      </div>

                      {/* Owner & Project Info */}
                      <div className="space-y-1.5 text-xs text-slate-400 mb-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            المؤجر / المالك:
                          </span>
                          <span className="font-semibold text-slate-200">{m.ownerName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            هاتف المؤجر:
                          </span>
                          <span className="font-mono text-slate-300">{m.ownerPhone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            المشروع المعين:
                          </span>
                          <span className="text-slate-300 font-semibold">{m.assignedProjectName || 'متحرك بين المشاريع'}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                          <span className="flex items-center gap-1.5">
                            <Fuel className="w-3.5 h-3.5 text-slate-500" />
                            شروط الوقود والسائق:
                          </span>
                          <span className="text-slate-300">
                            {m.fuelCoveredBy === 'company' ? 'وقود على الشركة' : 'وقود على المؤجر'} (
                            {m.operatorIncluded ? 'شامل السائق' : 'بدون سائق'})
                          </span>
                        </div>
                      </div>

                      {/* Working Stats Ribbon */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-center mb-4">
                        <div>
                          <span className="text-[10px] text-slate-500 block">إجمالي وحدات التشغيل</span>
                          <span className="text-xs font-bold font-mono text-slate-200">
                            {m.totalUnitsWorked} {m.rateTypeAr}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">التكلفة الإجمالية</span>
                          <span className="text-xs font-bold font-mono text-amber-400">
                            {m.totalAccruedCost.toLocaleString()} د.ع
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openLogWorkModal(m.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        تسجيل تشغيل
                      </button>

                      <button
                        onClick={() => openPayModal(m.id)}
                        disabled={m.balanceDue <= 0}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          m.balanceDue > 0
                            ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        سداد أجور
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Daily Work Logs Table */}
        {activeTab === 'work_logs' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">رقم السجل</th>
                  <th className="p-3.5">التاريخ</th>
                  <th className="p-3.5">الآلية المؤجرة</th>
                  <th className="p-3.5">المشروع</th>
                  <th className="p-3.5">وصف العمل المنفذ</th>
                  <th className="p-3.5">وحدات العمل</th>
                  <th className="p-3.5">معدل الأجر</th>
                  <th className="p-3.5 text-amber-400">الإجمالي المستحق</th>
                  <th className="p-3.5">مشرف الموقع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rentalWorkLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-500">
                      لا توجد سجلات تشغيل مدخلة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  rentalWorkLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-white whitespace-nowrap">
                        {log.logNumber}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">{log.date}</td>
                      <td className="p-3.5 font-semibold text-slate-200 whitespace-nowrap">
                        {log.machineryName}
                      </td>
                      <td className="p-3.5 text-slate-300 whitespace-nowrap">
                        {log.projectName || 'عام'}
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-xs truncate" title={log.workDescription}>
                        {log.workDescription}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-200 whitespace-nowrap">
                        {log.unitsWorked}
                      </td>
                      <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap">
                        {log.unitRate.toLocaleString()} د.ع
                      </td>
                      <td className="p-3.5 font-mono font-black text-amber-400 whitespace-nowrap">
                        {log.totalAmount.toLocaleString()} د.ع
                      </td>
                      <td className="p-3.5 text-slate-400 text-xs whitespace-nowrap">
                        {log.siteSupervisor}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Payments Table */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">رقم سند الصرف</th>
                  <th className="p-3.5">التاريخ</th>
                  <th className="p-3.5">الآلية</th>
                  <th className="p-3.5">المؤجر / المستلم</th>
                  <th className="p-3.5">طريقة الدفع</th>
                  <th className="p-3.5 text-emerald-400">المبلغ المصروف</th>
                  <th className="p-3.5">ملاحظات</th>
                  <th className="p-3.5">المسجل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rentalPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500">
                      لا توجد دفعات أجور مسجلة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  rentalPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-white whitespace-nowrap">
                        {p.paymentNumber}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">{p.date}</td>
                      <td className="p-3.5 font-semibold text-slate-200 whitespace-nowrap">
                        {p.machineryName}
                      </td>
                      <td className="p-3.5 text-slate-300 whitespace-nowrap">{p.ownerName}</td>
                      <td className="p-3.5 text-slate-300 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-xs">
                          {p.paymentMethod === 'cash_safe'
                            ? 'نقداً من الخزينة'
                            : p.paymentMethod === 'bank_transfer'
                            ? 'تحويل بنكي'
                            : 'شيك'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-black text-emerald-400 whitespace-nowrap">
                        {p.amount.toLocaleString()} د.ع
                      </td>
                      <td className="p-3.5 text-slate-400 text-xs max-w-xs truncate">{p.notes || '-'}</td>
                      <td className="p-3.5 text-slate-400 text-xs whitespace-nowrap">{p.recordedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Add Rental Machinery */}
      {isAddMachineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-400" />
              تسجيل آلية أو سيارة مؤجرة جديدة
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              قيد عقد إيجار آلية مع تحديد معدل الأجر المتفق عليه مع المالك.
            </p>

            <form onSubmit={handleAddMachine} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  اسم أو مسمى الآلية / السيارة *
                </label>
                <input
                  type="text"
                  required
                  value={machineForm.machineryName}
                  onChange={(e) => setMachineForm({ ...machineForm, machineryName: e.target.value })}
                  placeholder="اسم الآلية أو المركبة"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">نوع المعدة *</label>
                  <select
                    value={machineForm.type}
                    onChange={(e) =>
                      setMachineForm({ ...machineForm, type: e.target.value as RentalMachineryType })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="excavator">حفار مجنزر/دولاب</option>
                    <option value="crane">رافعة هيدروليكية (كرين)</option>
                    <option value="bobcat">بوبكات / ميني لودر</option>
                    <option value="dump_truck">شاحنة قلاب / تريلا</option>
                    <option value="water_tanker">صهريج مياه (وايت)</option>
                    <option value="supervisor_pickup">وانيت / سيارة إشراف</option>
                    <option value="other">معدة مساندة أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم اللوحة / الهيكل</label>
                  <input
                    type="text"
                    value={machineForm.plateOrSerialNumber}
                    onChange={(e) =>
                      setMachineForm({ ...machineForm, plateOrSerialNumber: e.target.value })
                    }
                    placeholder="رقم اللوحة أو الرقم التسلسلي"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">اسم المؤجر / المالك *</label>
                  <input
                    type="text"
                    required
                    value={machineForm.ownerName}
                    onChange={(e) => setMachineForm({ ...machineForm, ownerName: e.target.value })}
                    placeholder="مؤسسة الرمال أو فلان الفلاني"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">هاتف المؤجر *</label>
                  <input
                    type="text"
                    value={machineForm.ownerPhone}
                    onChange={(e) => setMachineForm({ ...machineForm, ownerPhone: e.target.value })}
                    placeholder="+966 50 000 0000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">نظام الاحتساب والأجر *</label>
                  <select
                    value={machineForm.rateType}
                    onChange={(e) =>
                      setMachineForm({ ...machineForm, rateType: e.target.value as RentalRateType })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="hourly">بالساعة (Hourly)</option>
                    <option value="daily">باليوم (Daily)</option>
                    <option value="monthly">شهرياً (Monthly)</option>
                    <option value="per_trip">بالرد / بالنقلة (Per Trip)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    معدل الأجر للوحدة (د.ع) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={machineForm.unitRate}
                    onChange={(e) => setMachineForm({ ...machineForm, unitRate: Number(e.target.value) })}
                    placeholder="150"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">تأمين الوقود (الديزل/البنزين)</label>
                  <select
                    value={machineForm.fuelCoveredBy}
                    onChange={(e) =>
                      setMachineForm({
                        ...machineForm,
                        fuelCoveredBy: e.target.value as 'company' | 'owner'
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="company">الوقود على الشركة (لمسات المعمار)</option>
                    <option value="owner">الوقود على المؤجر / المالك</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">المشروع المعين</label>
                  <select
                    value={machineForm.assignedProjectId}
                    onChange={(e) => setMachineForm({ ...machineForm, assignedProjectId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">متحرك بين المشاريع</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={machineForm.operatorIncluded}
                    onChange={(e) => setMachineForm({ ...machineForm, operatorIncluded: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-xs text-slate-300 font-semibold">
                    شامل السائق / المشغل من طرف المؤجر
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMachineModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  تسجيل الآلية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Log Work */}
      {isLogWorkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              تسجيل ساعات / نقلات عمل ميداني
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              إدخال وحدات التشغيل الفعلية ليتم احتساب المبلغ المستحق للمؤجر تلقائياً.
            </p>

            <form onSubmit={handleLogWorkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">اختر الآلية المؤجرة *</label>
                <select
                  required
                  value={workForm.machineryId}
                  onChange={(e) => setWorkForm({ ...workForm, machineryId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- اضغط للاختيار --</option>
                  {rentalMachinery.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.machineryName} ({m.ownerName}) - {m.unitRate} د.ع/{m.rateTypeAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">التاريخ *</label>
                  <input
                    type="date"
                    required
                    value={workForm.date}
                    onChange={(e) => setWorkForm({ ...workForm, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    وحدات العمل (ساعات / نقلات) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={workForm.unitsWorked}
                    onChange={(e) => setWorkForm({ ...workForm, unitsWorked: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">مشرف الموقع / المعتمد *</label>
                <input
                  type="text"
                  required
                  value={workForm.siteSupervisor}
                  onChange={(e) => setWorkForm({ ...workForm, siteSupervisor: e.target.value })}
                  placeholder="م. راشد - مهندس الموقع"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">بيان العمل المنفذ بالتفصيل *</label>
                <textarea
                  rows={3}
                  required
                  value={workForm.workDescription}
                  onChange={(e) => setWorkForm({ ...workForm, workDescription: e.target.value })}
                  placeholder="أعمال حفر الأساسات في الجزء الشمالي ونقل نواتج الحفر..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogWorkModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-black shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  تأكيد واحتساب الأجر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Pay Rental Machinery */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              سداد أجور تأجير آلية / سيارة
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              صرف دفعة للمؤجر، مع خصم المبلغ من الرصيد المستحق وقيده في الخزينة إذا كان الدفع نقداً.
            </p>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">اختر الآلية المؤجرة *</label>
                <select
                  required
                  value={payForm.machineryId}
                  onChange={(e) => {
                    const mid = e.target.value;
                    const m = rentalMachinery.find((x) => x.id === mid);
                    setPayForm({
                      ...payForm,
                      machineryId: mid,
                      amount: m?.balanceDue || 0
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- اضغط للاختيار --</option>
                  {rentalMachinery.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.machineryName} ({m.ownerName}) - المستحق: {m.balanceDue.toLocaleString()} د.ع
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    مبلغ الدفعة (د.ع) *
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">طريقة الصرف *</label>
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
                    <option value="cash_safe">نقداً من الخزينة (Cash Out)</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                    <option value="check">شيك مصرفي</option>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">ملاحظات وسند الصرف</label>
                <textarea
                  rows={2}
                  value={payForm.notes}
                  onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })}
                  placeholder="سداد أجور تشغيل شهر سبتمبر..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  صرف وسداد الأجر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
