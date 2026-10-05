import React, { useState } from 'react';
import {
  ShoppingBag,
  Fuel,
  Building,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Truck,
  FileText,
  Camera,
  Image as ImageIcon,
  Gauge,
  Activity,
  Layers,
  PieChart,
  Eye,
  X,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Receipt
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import {
  DailyProcurementItem,
  FuelFleetLog,
  OfficeOverheadExpense,
  ProcurementCategory,
  FuelType,
  OfficeExpenseCategory
} from '../../types/erp';
import { calculateFuelMetrics, calculateQuantityTotal } from '../../utils/financialUtils';

export const OperationalExpensesView: React.FC = () => {
  const {
    procurements,
    fuelLogs,
    officeExpenses,
    projects,
    addProcurementItem,
    addFuelLog,
    addOfficeExpense,
    currentUser
  } = useErp();

  const [activeTab, setActiveTab] = useState<'procurement' | 'fuel' | 'office'>('procurement');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  // Preview Image Modal
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

  // New Procurement Modal
  const [isProcModalOpen, setIsProcModalOpen] = useState(false);
  const [procItemName, setProcItemName] = useState('');
  const [procCategory, setProcCategory] = useState<ProcurementCategory>('site_materials');
  const [procCategoryAr, setProcCategoryAr] = useState('مواد ومستهلكات موقع');
  const [procQuantity, setProcQuantity] = useState('1');
  const [procUnit, setProcUnit] = useState('طقم');
  const [procUnitPrice, setProcUnitPrice] = useState('');
  const [procSupplier, setProcSupplier] = useState('');
  const [procBuyer, setProcBuyer] = useState(currentUser.nameAr);
  const [procProjectId, setProcProjectId] = useState(projects[0]?.id || '');
  const [procIsOffice, setProcIsOffice] = useState(false);
  const [procPaymentMethod, setProcPaymentMethod] = useState<'cash_safe' | 'bank_transfer' | 'petty_cash'>('cash_safe');
  const [procInvoicePhoto, setProcInvoicePhoto] = useState<string>('');
  const [procNotes, setProcNotes] = useState('');

  // New Fuel Modal
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [fuelVehicleName, setFuelVehicleName] = useState('');
  const [fuelPlateNumber, setFuelPlateNumber] = useState('');
  const [fuelVehicleType, setFuelVehicleType] = useState<'truck' | 'pickup' | 'passenger_van' | 'heavy_machinery' | 'generator'>('truck');
  const [fuelDriver, setFuelDriver] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('diesel');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelCostPerLiter, setFuelCostPerLiter] = useState('');
  const [fuelCurrentOdo, setFuelCurrentOdo] = useState('');
  const [fuelPrevOdo, setFuelPrevOdo] = useState('');
  const [fuelBenchmark, setFuelBenchmark] = useState('');
  const [fuelGasStation, setFuelGasStation] = useState('');
  const [fuelProjectId, setFuelProjectId] = useState(projects[0]?.id || '');
  const [fuelPaymentMethod, setFuelPaymentMethod] = useState<'cash_safe' | 'fuel_card' | 'bank_transfer'>('cash_safe');

  // New Office Expense Modal
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [officeCategory, setOfficeCategory] = useState<OfficeExpenseCategory>('hospitality');
  const [officeCategoryAr, setOfficeCategoryAr] = useState('ضيافة العملاء وكبار الشخصيات');
  const [officeTitle, setOfficeTitle] = useState('');
  const [officeAmount, setOfficeAmount] = useState('');
  const [officeVendor, setOfficeVendor] = useState('');
  const [officeDocRef, setOfficeDocRef] = useState('');
  const [officePaymentMethod, setOfficePaymentMethod] = useState<'cash_safe' | 'bank_transfer' | 'check'>('cash_safe');
  const [officeNotes, setOfficeNotes] = useState('');

  // Calculations for KPI Cards
  const totalProcurementCost = procurements.reduce((sum, p) => sum + p.totalCost, 0);
  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.totalAmount, 0);
  const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
  const fuelAnomaliesCount = fuelLogs.filter((f) => f.isAnomaly).length;
  const totalOfficeExpenses = officeExpenses.reduce((sum, o) => sum + o.amount, 0);
  const totalOverallExpenses = totalProcurementCost + totalFuelCost + totalOfficeExpenses;

  // Handlers
  const handleCreateProcurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procItemName.trim()) return;
    const qty = parseFloat(procQuantity) || 1;
    const price = parseFloat(procUnitPrice) || 0;
    const total = calculateQuantityTotal(qty, price);
    const proj = projects.find((p) => p.id === procProjectId);

    addProcurementItem({
      date: new Date().toISOString().split('T')[0],
      itemName: procItemName,
      category: procCategory,
      categoryAr: procCategoryAr,
      quantity: qty,
      unit: procUnit,
      unitPrice: price,
      totalCost: total,
      supplierShop: procSupplier,
      buyerName: procBuyer || currentUser.nameAr,
      projectId: procIsOffice ? undefined : proj?.id,
      projectName: procIsOffice ? 'المقر الرئيسي' : proj?.nameAr,
      isInternalOffice: procIsOffice,
      paymentMethod: procPaymentMethod,
      hasInvoicePhoto: Boolean(procInvoicePhoto),
      invoicePhotoUrl: procInvoicePhoto,
      notes: procNotes
    });

    setIsProcModalOpen(false);
    setProcItemName('');
  };

  const handleCreateFuelLog = (e: React.FormEvent) => {
    e.preventDefault();
    const ltr = parseFloat(fuelLiters) || 0;
    const costLtr = parseFloat(fuelCostPerLiter) || 0;
    const curOdo = parseFloat(fuelCurrentOdo) || 0;
    const prevOdo = parseFloat(fuelPrevOdo) || 0;
    const bench = parseFloat(fuelBenchmark) || 0;
    const proj = projects.find((p) => p.id === fuelProjectId);
    const metrics = calculateFuelMetrics({
      liters: ltr,
      costPerLiter: costLtr,
      currentOdometer: curOdo,
      previousOdometer: prevOdo,
      isHourly: fuelVehicleType === 'heavy_machinery' || fuelVehicleType === 'generator',
      standardBenchmarkRate: bench
    });

    addFuelLog({
      date: new Date().toISOString().split('T')[0],
      vehicleName: fuelVehicleName,
      plateNumber: fuelPlateNumber,
      vehicleType: fuelVehicleType,
      driverOrOperator: fuelDriver,
      fuelType,
      liters: ltr,
      costPerLiter: costLtr,
      totalAmount: metrics.totalAmount,
      currentOdometer: curOdo,
      previousOdometer: prevOdo,
      standardBenchmarkRate: bench,
      gasStation: fuelGasStation,
      projectId: proj?.id || '',
      projectName: proj?.nameAr || '',
      paymentMethod: fuelPaymentMethod
    });

    setIsFuelModalOpen(false);
  };

  const handleCreateOfficeExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officeTitle.trim()) return;
    const amt = parseFloat(officeAmount) || 0;

    addOfficeExpense({
      date: new Date().toISOString().split('T')[0],
      category: officeCategory,
      categoryAr: officeCategoryAr,
      title: officeTitle,
      amount: amt,
      paymentMethod: officePaymentMethod,
      recipientOrVendor: officeVendor,
      receiptDocRef: officeDocRef,
      notes: officeNotes
    });

    setIsOfficeModalOpen(false);
    setOfficeTitle('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProcInvoicePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative rounded-2xl bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 border border-amber-500/25 p-6 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                العمليات الميدانية واللوجستيات
              </span>
              <span className="text-xs text-slate-400 font-mono">SITE EXPENSES & LOGISTICS</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <span>المصاريف التشغيلية واللوجستية</span>
              <Truck className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              إدارة مشتريات المواد النثرية للمواقع، تتبع استهلاك وقود الآليات والمعدات مع التنبيه الذكي للهدر، ومصاريف ونثريات المقر العام.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsProcModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل مشتريات عاجلة</span>
            </button>
            <button
              onClick={() => setIsFuelModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm border border-amber-500/30 transition cursor-pointer"
            >
              <Fuel className="w-4 h-4" />
              <span>تعبئة وقود آلية</span>
            </button>
            <button
              onClick={() => setIsOfficeModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition cursor-pointer"
            >
              <Building className="w-4 h-4" />
              <span>مصروف إداري / مقر</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700/60 mt-6 gap-2">
          <button
            onClick={() => setActiveTab('procurement')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              activeTab === 'procurement'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>المشتريات اليومية ومواد المواقع</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-mono">
              {procurements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fuel')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              activeTab === 'fuel'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span>تتبع استهلاك الوقود والآليات</span>
            {fuelAnomaliesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 animate-pulse">
                {fuelAnomaliesCount} تنبيه هدر
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('office')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              activeTab === 'office'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>مصروفات ونثريات المقر العام</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-mono">
              {officeExpenses.length}
            </span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow">
          <span className="text-xs text-slate-400 block mb-1">إجمالي مشتريات المواد النثرية</span>
          <div className="text-xl font-black text-amber-400 font-mono">
            {totalProcurementCost.toLocaleString()} <span className="text-xs text-slate-400 font-normal">د.ع</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">أدوات، مسامير، معدات سلامة</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow">
          <span className="text-xs text-slate-400 block mb-1">فاتورة وقود الأسطول والآليات</span>
          <div className="text-xl font-black text-white font-mono">
            {totalFuelCost.toLocaleString()} <span className="text-xs text-slate-400 font-normal">د.ع</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {totalFuelLiters.toLocaleString()} لتر ديزل وبنزين
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow">
          <span className="text-xs text-slate-400 block mb-1">مصاريف المقر والإدارة العامة</span>
          <div className="text-xl font-black text-white font-mono">
            {totalOfficeExpenses.toLocaleString()} <span className="text-xs text-slate-400 font-normal">د.ع</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">إيجار، كهرباء، ضيافة، برمجيات</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow">
          <span className="text-xs text-slate-400 block mb-1">إجمالي المنصرف التشغيلي</span>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {totalOverallExpenses.toLocaleString()} <span className="text-xs text-slate-400 font-normal">د.ع</span>
          </div>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">مقيدة بالخزينة والصندوق</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DAILY PROCUREMENT & SITE MATERIALS */}
      {/* ========================================================= */}
      {activeTab === 'procurement' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Procurement Table */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800/60 border-b border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>سجل المشتريات اليومية ومواد الموقع والعهدة</span>
              </h3>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="all">جميع المشاريع والمقر</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.nameAr}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
                    <th className="p-3">رقم السند</th>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">المادة / الغرض</th>
                    <th className="p-3">التصنيف</th>
                    <th className="p-3">الكمية</th>
                    <th className="p-3">سعر الوحدة</th>
                    <th className="p-3 font-bold text-amber-300">الإجمالي</th>
                    <th className="p-3">المورد / المحل</th>
                    <th className="p-3">المشروع</th>
                    <th className="p-3 text-center">وصل الشراء</th>
                    <th className="p-3">القائم بالشراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {procurements
                    .filter((p) => selectedProjectId === 'all' || p.projectId === selectedProjectId)
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono text-slate-400">{item.purchaseNumber}</td>
                        <td className="p-3 font-mono text-slate-300">{item.date}</td>
                        <td className="p-3">
                          <strong className="text-white block text-sm">{item.itemName}</strong>
                          {item.notes && <span className="text-[11px] text-slate-400">{item.notes}</span>}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                            {item.categoryAr}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-3 font-mono text-slate-300">{item.unitPrice} د.ع</td>
                        <td className="p-3 font-mono font-black text-amber-400 text-sm">
                          {item.totalCost.toLocaleString()} د.ع
                        </td>
                        <td className="p-3 text-slate-300 font-medium">{item.supplierShop}</td>
                        <td className="p-3 text-slate-300">{item.projectName || 'استخدام عام'}</td>
                        <td className="p-3 text-center">
                          {item.hasInvoicePhoto && item.invoicePhotoUrl ? (
                            <button
                              onClick={() =>
                                setPreviewImage({
                                  title: `وصل شراء: ${item.itemName}`,
                                  url: item.invoicePhotoUrl!
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold hover:bg-amber-500/20 transition cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>معاينة الوصل</span>
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">{item.buyerName}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: FUEL & FLEET LOGISTICS */}
      {/* ========================================================= */}
      {activeTab === 'fuel' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Anomaly Alerts if any */}
          {fuelAnomaliesCount > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border-2 border-rose-500/40 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
                <span>نظام المراقبة الذكي: تم رصد معدل استهلاك وقود مرتفع وغير طبيعي!</span>
              </div>
              <p className="text-xs text-rose-200/90 leading-relaxed">
                اكتشف النظام تجاوزاً لمعدل الاستهلاك المعياري في إحدى الآليات (+60%). يُرجى التحقق من سجل عدادات الكيلومتر، فحص محرك الآلية أو فلتر الديزل، والتأكد من عدم وجود تسريب أو تشغيل محرك الآلية أثناء التوقف (Idling).
              </p>
            </div>
          )}

          {/* Fuel Fleet Table */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Fuel className="w-5 h-5 text-amber-400" />
                <span>سجل استهلاك الوقود للسيارات ومعدات المشاريع</span>
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span>مؤشر ذكي لاحتساب (لتر / 100 كم) أو (لتر / ساعة تشغيل)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
                    <th className="p-3">رقم السجل</th>
                    <th className="p-3">الآلية / السيارة</th>
                    <th className="p-3">رقم اللوحة</th>
                    <th className="p-3">السائق / المشغل</th>
                    <th className="p-3">نوع الوقود</th>
                    <th className="p-3">الكمية</th>
                    <th className="p-3 font-bold text-amber-300">المبلغ الإجمالي</th>
                    <th className="p-3">العداد الحالي</th>
                    <th className="p-3">المسافة / الساعات</th>
                    <th className="p-3 text-center">معدل الاستهلاك الفعلي</th>
                    <th className="p-3 text-center">المؤشر والحالة</th>
                    <th className="p-3">محطة التعبئة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {fuelLogs.map((log) => {
                    const isHourly = log.vehicleType === 'heavy_machinery' || log.vehicleType === 'generator';
                    const unitLabel = isHourly ? 'لتر/ساعة' : 'لتر/100كم';

                    return (
                      <tr
                        key={log.id}
                        className={`transition ${
                          log.isAnomaly ? 'bg-rose-950/20 hover:bg-rose-950/30' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="p-3 font-mono text-slate-400">{log.logNumber}</td>
                        <td className="p-3">
                          <strong className="text-white block text-sm">{log.vehicleName}</strong>
                          <span className="text-[11px] text-slate-400">{log.projectName}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">{log.plateNumber}</td>
                        <td className="p-3 text-slate-300">{log.driverOrOperator}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                            {log.fuelType === 'diesel' ? 'ديزل (Diesel)' : log.fuelType === 'gasoline_91' ? 'بنزين 91' : 'بنزين 95'}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-white">{log.liters} لتر</td>
                        <td className="p-3 font-mono font-black text-amber-400 text-sm">
                          {log.totalAmount.toLocaleString()} د.ع
                        </td>
                        <td className="p-3 font-mono text-slate-300">{log.currentOdometer.toLocaleString()}</td>
                        <td className="p-3 font-mono text-slate-300">
                          {log.distanceOrHours} {isHourly ? 'ساعة' : 'كم'}
                        </td>
                        <td className="p-3 text-center font-mono font-bold">
                          <span className={log.isAnomaly ? 'text-rose-400 font-black' : 'text-slate-200'}>
                            {log.consumptionRate} {unitLabel}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            المعياري: {log.standardBenchmarkRate} {unitLabel}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {log.isAnomaly ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>استهلاك غير طبيعي</span>
                              </span>
                              {log.anomalyReason && (
                                <span className="text-[10px] text-rose-300/80 block mt-1 max-w-xs mx-auto truncate" title={log.anomalyReason}>
                                  {log.anomalyReason}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>معدل طبيعي</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 text-[11px]">{log.gasStation}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: OFFICE & OVERHEAD EXPENSES */}
      {/* ========================================================= */}
      {activeTab === 'office' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Breakdown by Category Visual Bar */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>توزيع نفقات المقر الرئيسي والإدارة العامة</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs text-slate-400 block">إيجار المكاتب والمقار</span>
                <strong className="text-white font-mono text-base">35,000 د.ع</strong>
                <span className="text-[10px] text-amber-400 block mt-0.5">73.4% من الإجمالي</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs text-slate-400 block">برمجيات ورخص Autodesk</span>
                <strong className="text-white font-mono text-base">5,400 د.ع</strong>
                <span className="text-[10px] text-amber-400 block mt-0.5">11.3% من الإجمالي</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs text-slate-400 block">الكهرباء والمياه</span>
                <strong className="text-white font-mono text-base">3,420 د.ع</strong>
                <span className="text-[10px] text-amber-400 block mt-0.5">7.2% من الإجمالي</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-xs text-slate-400 block">الاتصالات والإنترنت والضيافة</span>
                <strong className="text-white font-mono text-base">3,970 د.ع</strong>
                <span className="text-[10px] text-amber-400 block mt-0.5">8.1% من الإجمالي</span>
              </div>
            </div>
          </div>

          {/* Office Expenses Table */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-400" />
                <span>جدول نفقات ومصاريف الإدارة والمقر</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
                    <th className="p-3">رقم السند</th>
                    <th className="p-3">التاريخ</th>
                    <th className="p-3">البند والوصف</th>
                    <th className="p-3">التصنيف</th>
                    <th className="p-3 font-bold text-amber-300">المبلغ</th>
                    <th className="p-3">طريقة السداد</th>
                    <th className="p-3">المستلم / الجهة</th>
                    <th className="p-3">رقم الفاتورة / المستند</th>
                    <th className="p-3">المسجل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {officeExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono text-slate-400">{exp.expenseNumber}</td>
                      <td className="p-3 font-mono text-slate-300">{exp.date}</td>
                      <td className="p-3">
                        <strong className="text-white block text-sm">{exp.title}</strong>
                        {exp.notes && <span className="text-[11px] text-slate-400">{exp.notes}</span>}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 text-[11px]">
                          {exp.categoryAr}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-black text-amber-400 text-sm">
                        {exp.amount.toLocaleString()} د.ع
                      </td>
                      <td className="p-3">
                        <span className="text-slate-300">
                          {exp.paymentMethod === 'cash_safe' ? 'صندوق الخزينة' : exp.paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'شيك مصرفي'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">{exp.recipientOrVendor}</td>
                      <td className="p-3 font-mono text-slate-400">{exp.receiptDocRef || '-'}</td>
                      <td className="p-3 text-slate-400 text-[11px]">{exp.recordedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NEW PROCUREMENT */}
      {/* ========================================================= */}
      {isProcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>تسجيل مشتريات ومواد موقع عاجلة</span>
            </h3>

            <form onSubmit={handleCreateProcurement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم المادة / البند المشترى *</label>
                <input
                  type="text"
                  required
                  value={procItemName}
                  onChange={(e) => setProcItemName(e.target.value)}
                  placeholder="اسم المادة أو المستهلك"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">التصنيف</label>
                  <select
                    value={procCategory}
                    onChange={(e) => {
                      const val = e.target.value as ProcurementCategory;
                      setProcCategory(val);
                      const map: Record<ProcurementCategory, string> = {
                        site_materials: 'مواد ومستهلكات موقع',
                        tools: 'عدد وأدوات تشغيل',
                        safety: 'أدوات سلامة مهنية (HSE)',
                        consumables: 'مستهلكات مكتب وهندسة',
                        emergency: 'شراء طارئ واستثنائي'
                      };
                      setProcCategoryAr(map[val] || 'مواد');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="site_materials">مواد ومستهلكات موقع</option>
                    <option value="tools">عدد وأدوات تشغيل</option>
                    <option value="safety">أدوات سلامة مهنية (HSE)</option>
                    <option value="consumables">مستهلكات مكتب وهندسة</option>
                    <option value="emergency">شراء طارئ واستثنائي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">طريقة السداد</label>
                  <select
                    value={procPaymentMethod}
                    onChange={(e) => setProcPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="cash_safe">نقداً من الخزينة (سند صرف آلي)</option>
                    <option value="petty_cash">من العهدة الميدانية</option>
                    <option value="bank_transfer">تحويل بنكي فوري</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الكمية *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={procQuantity}
                    onChange={(e) => setProcQuantity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الوحدة</label>
                  <input
                    type="text"
                    value={procUnit}
                    onChange={(e) => setProcUnit(e.target.value)}
                    placeholder="كرتون، حبة، طقم..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">سعر الوحدة (د.ع) *</label>
                  <input
                    type="number"
                    required
                    value={procUnitPrice}
                    onChange={(e) => setProcUnitPrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">المحل / المورد</label>
                  <input
                    type="text"
                    value={procSupplier}
                    onChange={(e) => setProcSupplier(e.target.value)}
                    placeholder="اسم المحل أو الشركة"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المشروع المستفيد</label>
                  <select
                    value={procProjectId}
                    onChange={(e) => setProcProjectId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.nameAr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Upload or Preset Preview */}
              <div>
                <label className="block text-slate-400 mb-1">إرفاق صورة الفاتورة / الوصل الورقي</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer text-xs font-bold transition">
                    <Camera className="w-4 h-4" />
                    <span>تحميل صورة الفاتورة</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {procInvoicePhoto && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم إرفاق صورة الوصل بنجاح</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ملاحظات الشراء</label>
                <textarea
                  rows={2}
                  value={procNotes}
                  onChange={(e) => setProcNotes(e.target.value)}
                  placeholder="سبب الشراء ومكان الاستخدام..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProcModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  تسجيل المشتريات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NEW FUEL LOG */}
      {/* ========================================================= */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Fuel className="w-5 h-5 text-amber-400" />
              <span>تسجيل تعبئة وقود لآلية أو سيارة</span>
            </h3>

            <form onSubmit={handleCreateFuelLog} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">اسم الآلية / السيارة *</label>
                  <input
                    type="text"
                    required
                    value={fuelVehicleName}
                    onChange={(e) => setFuelVehicleName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم اللوحة / المعرف *</label>
                  <input
                    type="text"
                    required
                    value={fuelPlateNumber}
                    onChange={(e) => setFuelPlateNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">نوع الآلية</label>
                  <select
                    value={fuelVehicleType}
                    onChange={(e) => setFuelVehicleType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="truck">قلاب نقل (شاحنة)</option>
                    <option value="pickup">وانيت إشراف (هايلكس)</option>
                    <option value="passenger_van">باص نقل كادر</option>
                    <option value="heavy_machinery">معدة ثقيلة (حفار/بلدوزر)</option>
                    <option value="generator">مولدة موقع كهربائية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">نوع الوقود</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="diesel">ديزل (Diesel)</option>
                    <option value="gasoline_91">بنزين 91</option>
                    <option value="gasoline_95">بنزين 95</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">كمية الوقود (لتر) *</label>
                  <input
                    type="number"
                    required
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">قراءة العداد الحالية (كم أو ساعة) *</label>
                  <input
                    type="number"
                    required
                    value={fuelCurrentOdo}
                    onChange={(e) => setFuelCurrentOdo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">قراءة العداد السابقة</label>
                  <input
                    type="number"
                    required
                    value={fuelPrevOdo}
                    onChange={(e) => setFuelPrevOdo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">المعدل المعياري للآلية (لتر/100كم أو لتر/ساعة)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fuelBenchmark}
                    onChange={(e) => setFuelBenchmark(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">السائق / المشغل</label>
                  <input
                    type="text"
                    value={fuelDriver}
                    onChange={(e) => setFuelDriver(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">محطة الوقود</label>
                  <input
                    type="text"
                    value={fuelGasStation}
                    onChange={(e) => setFuelGasStation(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">طريقة الدفع</label>
                  <select
                    value={fuelPaymentMethod}
                    onChange={(e) => setFuelPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="cash_safe">نقداً من الخزينة (سند صرف آلي)</option>
                    <option value="fuel_card">بطاقة وقود مسبقة الدفع</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  تسجيل الوقود
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NEW OFFICE EXPENSE */}
      {/* ========================================================= */}
      {isOfficeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-400" />
              <span>تسجيل مصروف إداري / مقر عام</span>
            </h3>

            <form onSubmit={handleCreateOfficeExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">بند المصروف *</label>
                <input
                  type="text"
                  required
                  value={officeTitle}
                  onChange={(e) => setOfficeTitle(e.target.value)}
                  placeholder="وصف المصروف"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">التصنيف</label>
                  <select
                    value={officeCategory}
                    onChange={(e) => {
                      const val = e.target.value as OfficeExpenseCategory;
                      setOfficeCategory(val);
                      const map: Record<OfficeExpenseCategory, string> = {
                        rent: 'إيجار المقر والمعارض',
                        electricity_water: 'الكهرباء والمياه والمرافق',
                        internet_telecom: 'الاتصالات والألياف البصرية',
                        hospitality: 'ضيافة العملاء وكبار الشخصيات',
                        it_software: 'تراخيص البرامج والأنظمة',
                        maintenance: 'صيانة المقر والنظافة',
                        government_fees: 'رسوم وتراخيص حكومية',
                        stationery: 'قرطاسية ومطبوعات'
                      };
                      setOfficeCategoryAr(map[val] || 'مصروف');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="hospitality">ضيافة العملاء والاجتماعات</option>
                    <option value="electricity_water">الكهرباء والمياه</option>
                    <option value="internet_telecom">الاتصالات والإنترنت</option>
                    <option value="it_software">تراخيص البرمجيات والأنظمة</option>
                    <option value="maintenance">صيانة المقر والنظافة</option>
                    <option value="rent">إيجار المكاتب</option>
                    <option value="stationery">قرطاسية ومطبوعات</option>
                    <option value="government_fees">رسوم حكومية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">المبلغ (د.ع) *</label>
                  <input
                    type="number"
                    required
                    value={officeAmount}
                    onChange={(e) => setOfficeAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">المستلم / المورد</label>
                  <input
                    type="text"
                    value={officeVendor}
                    onChange={(e) => setOfficeVendor(e.target.value)}
                    placeholder="الجهة أو الشركة"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الفاتورة / السند</label>
                  <input
                    type="text"
                    value={officeDocRef}
                    onChange={(e) => setOfficeDocRef(e.target.value)}
                    placeholder="رقم الفاتورة المرجعي"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">طريقة السداد</label>
                <select
                  value={officePaymentMethod}
                  onChange={(e) => setOfficePaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="cash_safe">نقداً من الخزينة (سند صرف آلي)</option>
                  <option value="bank_transfer">تحويل بنكي</option>
                  <option value="check">شيك مصرفي</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ملاحظات إضافية</label>
                <textarea
                  rows={2}
                  value={officeNotes}
                  onChange={(e) => setOfficeNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOfficeModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  تسجيل المصروف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: IMAGE PREVIEW */}
      {/* ========================================================= */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-xl w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <span className="font-bold text-white text-sm">{previewImage.title}</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden max-h-[70vh] flex items-center justify-center bg-black">
              <img src={previewImage.url} alt={previewImage.title} className="w-full h-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
