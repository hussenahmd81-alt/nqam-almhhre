import React, { useState } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertTriangle,
  HardHat,
  Search,
  Filter,
  UserCheck,
  ChevronDown,
  Building2,
  FileSpreadsheet,
  Coins,
  ShieldCheck,
  ArrowUpRight,
  TrendingDown,
  UserPlus
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { Employee, MonthlySalarySlip, ProjectWorker, WeeklyLaborTimesheet } from '../../types/erp';
import { PayslipPrintModal } from './PayslipPrintModal';
import { WeeklyTimesheetPrintModal } from './WeeklyTimesheetPrintModal';

export const PayrollWorkforceView: React.FC = () => {
  const {
    employees,
    salarySlips,
    projectWorkers,
    weeklyTimesheets,
    projects,
    addEmployee,
    addSalarySlip,
    approveAndDisburseSalary,
    addProjectWorker,
    updateWorkerAttendance,
    updateWorkerOvertimeAndAdvances,
    approveAndDisburseWeeklyTimesheet,
    hasPermission,
    currentRole
  } = useErp();

  const [activeTab, setActiveTab] = useState<'monthly' | 'weekly' | 'directory'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'PRJ-101');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Print Modals State
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<MonthlySalarySlip | null>(null);
  const [selectedTimesheetForPrint, setSelectedTimesheetForPrint] = useState<WeeklyLaborTimesheet | null>(null);

  // Form Modals State
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [isAddSlipModalOpen, setIsAddSlipModalOpen] = useState(false);

  // New Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpNationalId, setNewEmpNationalId] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpDept, setNewEmpDept] = useState<'projects' | 'engineering' | 'finance' | 'administration' | 'logistics'>('projects');
  const [newEmpDeptAr, setNewEmpDeptAr] = useState('إدارة المشاريع الميدانية');
  const [newEmpBasic, setNewEmpBasic] = useState('10000');
  const [newEmpHousing, setNewEmpHousing] = useState('2000');
  const [newEmpTransport, setNewEmpTransport] = useState('1000');
  const [newEmpOther, setNewEmpOther] = useState('500');
  const [newEmpBank, setNewEmpBank] = useState('مصرف الراجحي');
  const [newEmpIban, setNewEmpIban] = useState('SA');
  const [newEmpPhone, setNewEmpPhone] = useState('+966 5');
  const [newEmpProject, setNewEmpProject] = useState(projects[0]?.id || '');

  // New Worker Form State
  const [newWrkName, setNewWrkName] = useState('');
  const [newWrkCraft, setNewWrkCraft] = useState('نجار مسلح');
  const [newWrkPhone, setNewWrkPhone] = useState('+966 5');
  const [newWrkNationalId, setNewWrkNationalId] = useState('');
  const [newWrkDailyRate, setNewWrkDailyRate] = useState('180');
  const [newWrkProject, setNewWrkProject] = useState(projects[0]?.id || 'PRJ-101');

  // New Slip Form State
  const [newSlipEmpId, setNewSlipEmpId] = useState(employees[0]?.id || '');
  const [newSlipOvertimeHours, setNewSlipOvertimeHours] = useState('0');
  const [newSlipOvertimeAmount, setNewSlipOvertimeAmount] = useState('0');
  const [newSlipBonuses, setNewSlipBonuses] = useState('0');
  const [newSlipAdvances, setNewSlipAdvances] = useState('0');
  const [newSlipAbsenceDays, setNewSlipAbsenceDays] = useState('0');
  const [newSlipAbsenceDeduction, setNewSlipAbsenceDeduction] = useState('0');
  const [newSlipPenalties, setNewSlipPenalties] = useState('0');
  const [newSlipNotes, setNewSlipNotes] = useState('');

  // Active Timesheet
  const currentTimesheet = weeklyTimesheets.find((ts) => ts.projectId === selectedProjectId) || weeklyTimesheets[0];

  // Calculations for Monthly Payroll Stats
  const filteredSlips = salarySlips.filter((s) => s.monthYear === selectedMonth);
  const totalMonthlyGross = filteredSlips.reduce((sum, s) => sum + (s.basicSalary + s.totalAllowances + s.overtimeAmount + s.bonuses), 0);
  const totalMonthlyNet = filteredSlips.reduce((sum, s) => sum + s.netPayable, 0);
  const totalMonthlyDeductions = filteredSlips.reduce((sum, s) => sum + (s.advancesDeduction + s.absenceDeduction + s.penaltiesDeduction), 0);
  const paidSlipsCount = filteredSlips.filter((s) => s.status === 'paid').length;
  const pendingSlipsCount = filteredSlips.filter((s) => s.status !== 'paid').length;

  // Handlers
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpRole.trim()) return;

    const basic = parseFloat(newEmpBasic) || 0;
    const housing = parseFloat(newEmpHousing) || 0;
    const transport = parseFloat(newEmpTransport) || 0;
    const other = parseFloat(newEmpOther) || 0;
    const totalPkg = basic + housing + transport + other;
    const proj = projects.find((p) => p.id === newEmpProject);

    addEmployee({
      nameAr: newEmpName,
      nationalId: newEmpNationalId,
      roleTitle: newEmpRole,
      department: newEmpDept,
      departmentAr: newEmpDeptAr,
      basicSalary: basic,
      housingAllowance: housing,
      transportAllowance: transport,
      otherAllowances: other,
      totalMonthlyPackage: totalPkg,
      bankName: newEmpBank,
      iban: newEmpIban,
      hireDate: new Date().toISOString().split('T')[0],
      phone: newEmpPhone,
      status: 'active',
      assignedProjectId: proj?.id,
      assignedProjectName: proj?.nameAr
    });

    setIsAddEmployeeModalOpen(false);
    setNewEmpName('');
    setNewEmpRole('');
  };

  const handleCreateWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWrkName.trim()) return;
    const proj = projects.find((p) => p.id === newWrkProject);

    addProjectWorker({
      nameAr: newWrkName,
      craft: newWrkCraft,
      phone: newWrkPhone,
      nationalId: newWrkNationalId,
      dailyRate: parseFloat(newWrkDailyRate) || 150,
      projectId: proj?.id || 'PRJ-101',
      projectName: proj?.nameAr || 'الموقع العام',
      status: 'active'
    });

    setIsAddWorkerModalOpen(false);
    setNewWrkName('');
  };

  const handleCreateSalarySlip = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === newSlipEmpId);
    if (!emp) return;

    const otHours = parseFloat(newSlipOvertimeHours) || 0;
    const otAmount = parseFloat(newSlipOvertimeAmount) || 0;
    const bonuses = parseFloat(newSlipBonuses) || 0;
    const advances = parseFloat(newSlipAdvances) || 0;
    const absDays = parseFloat(newSlipAbsenceDays) || 0;
    const absDeduct = parseFloat(newSlipAbsenceDeduction) || 0;
    const penalties = parseFloat(newSlipPenalties) || 0;

    const totalAllowances = emp.housingAllowance + emp.transportAllowance + emp.otherAllowances;
    const net = Math.max(0, emp.basicSalary + totalAllowances + otAmount + bonuses - (advances + absDeduct + penalties));

    addSalarySlip({
      employeeId: emp.id,
      employeeName: emp.nameAr,
      roleTitle: emp.roleTitle,
      departmentAr: emp.departmentAr,
      monthYear: selectedMonth,
      basicSalary: emp.basicSalary,
      totalAllowances,
      overtimeHours: otHours,
      overtimeAmount: otAmount,
      bonuses,
      advancesDeduction: advances,
      absenceDays: absDays,
      absenceDeduction: absDeduct,
      penaltiesDeduction: penalties,
      netPayable: net,
      status: 'draft',
      notes: newSlipNotes
    });

    setIsAddSlipModalOpen(false);
  };

  // Quick Attendance Toggle: 0 -> 1 -> 0.5 -> 0
  const toggleAttendanceValue = (timesheetId: string, workerId: string, day: 'sat'|'sun'|'mon'|'tue'|'wed'|'thu'|'fri', currentVal: number) => {
    let nextVal = 1;
    if (currentVal === 1) nextVal = 0.5;
    else if (currentVal === 0.5) nextVal = 0;
    else nextVal = 1;
    updateWorkerAttendance(timesheetId, workerId, day, nextVal);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 border border-amber-500/25 p-6 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                إدارة الموارد البشرية والعمالة
              </span>
              <span className="text-xs text-slate-400 font-mono">HR & WORKFORCE PAYROLL</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <span>إدارة الرواتب الشهرية والأجور الأسبوعية</span>
              <Coins className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              نظام متكامل لاحتساب رواتب الكادر الثابت، وإدارة حضور وأجور عمالة المشاريع الميدانية، والربط المالي الآلي المباشر بالخزينة والصندوق.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddSlipModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار مسير راتب جديد</span>
            </button>
            <button
              onClick={() => setIsAddWorkerModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm border border-amber-500/30 transition cursor-pointer"
            >
              <HardHat className="w-4 h-4" />
              <span>تسجيل عامل مياومة</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700/60 mt-6 gap-2">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              activeTab === 'monthly'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>مسير الرواتب الشهرية للكادر</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-mono">
              {filteredSlips.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              activeTab === 'weekly'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>أجور عمال المشاريع الأسبوعية</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-amber-400 font-mono">
              {currentTimesheet?.entries.length || 0} عمال
            </span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              activeTab === 'directory'
                ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>دليل الكادر والعمالة المسجلة</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-800 text-slate-300 font-mono">
              {employees.length + projectWorkers.length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MONTHLY STAFF PAYROLL */}
      {/* ========================================================= */}
      {activeTab === 'monthly' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Month Filter & Summary KPI Cards */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold">شهر المسير:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="2026-09">سبتمبر 2026 (September)</option>
                <option value="2026-08">أغسطس 2026 (August)</option>
                <option value="2026-07">يوليو 2026 (July)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>الصرف مرتبط تلقائياً بنظام الصندوق لإنشاء سندات صرف الخزينة</span>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow">
              <span className="text-xs text-slate-400 block mb-1">إجمالي المستحق الشهري (Gross)</span>
              <div className="text-xl font-black text-white font-mono">{totalMonthlyGross.toLocaleString()} <span className="text-xs text-slate-400 font-normal">د.ع</span></div>
              <span className="text-[11px] text-slate-500 mt-1 block">الرواتب الأساسية + البدلات</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow">
              <span className="text-xs text-slate-400 block mb-1">صافي الرواتب واجبة الصرف</span>
              <div className="text-xl font-black text-amber-400 font-mono">{totalMonthlyNet.toLocaleString()} <span className="text-xs text-slate-400 font-normal">د.ع</span></div>
              <span className="text-[11px] text-amber-500/80 mt-1 block">بعد احتساب الاستقطاعات</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow">
              <span className="text-xs text-slate-400 block mb-1">إجمالي الخصومات والسلف</span>
              <div className="text-xl font-black text-rose-400 font-mono">-{totalMonthlyDeductions.toLocaleString()} <span className="text-xs text-slate-400 font-normal">د.ع</span></div>
              <span className="text-[11px] text-rose-400/80 mt-1 block">استقطاعات سلف وغيابات</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow">
              <span className="text-xs text-slate-400 block mb-1">حالة الاعتماد والصرف</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                  {paidSlipsCount} تم الصرف
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20">
                  {pendingSlipsCount} بانتظار الصرف
                </span>
              </div>
            </div>
          </div>

          {/* Salary Slips Table */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <span>جدول مسيرات الرواتب لشهر {selectedMonth}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-mono">
                  {filteredSlips.length} مسير
                </span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-800/90 text-slate-400 font-semibold border-b border-slate-700">
                    <th className="p-3.5">رقم القسيمة</th>
                    <th className="p-3.5">الموظف والوظيفة</th>
                    <th className="p-3.5">الأساسي</th>
                    <th className="p-3.5">البدلات</th>
                    <th className="p-3.5">إضافي / مكافأة</th>
                    <th className="p-3.5 text-rose-400">سلف وغياب</th>
                    <th className="p-3.5 font-bold text-amber-300">صافي المستحق</th>
                    <th className="p-3.5 text-center">الحالة</th>
                    <th className="p-3.5 text-center">الإجراءات والطباعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredSlips.map((slip) => {
                    const emp = employees.find((e) => e.id === slip.employeeId);
                    const totalDeductions = slip.advancesDeduction + slip.absenceDeduction + slip.penaltiesDeduction;
                    const additions = slip.overtimeAmount + slip.bonuses;

                    return (
                      <tr key={slip.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono text-slate-400">{slip.slipNumber}</td>
                        <td className="p-3.5">
                          <strong className="text-white block text-sm">{slip.employeeName}</strong>
                          <span className="text-xs text-slate-400">{slip.roleTitle}</span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-300">{slip.basicSalary.toLocaleString()} د.ع</td>
                        <td className="p-3.5 font-mono text-slate-300">+{slip.totalAllowances.toLocaleString()} د.ع</td>
                        <td className="p-3.5 font-mono text-emerald-400">
                          {additions > 0 ? `+${additions.toLocaleString()} د.ع` : '-'}
                        </td>
                        <td className="p-3.5 font-mono text-rose-400">
                          {totalDeductions > 0 ? `-${totalDeductions.toLocaleString()} د.ع` : '0 د.ع'}
                        </td>
                        <td className="p-3.5 font-mono font-black text-amber-400 text-sm">
                          {slip.netPayable.toLocaleString()} د.ع
                        </td>
                        <td className="p-3.5 text-center">
                          {slip.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>تم الصرف</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              <Clock className="w-3.5 h-3.5" />
                              <span>جاهز للصرف</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {slip.status !== 'paid' && (
                              <button
                                onClick={() => approveAndDisburseSalary(slip.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow cursor-pointer"
                                title="صرف الراتب وتوليد سند صرف آلي بالخزينة"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>صرف الراتب</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedSlipForPrint(slip)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs transition cursor-pointer"
                              title="معاينة وطباعة قسيمة الراتب الرسمية A4"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>طباعة القسيمة</span>
                            </button>
                          </div>
                        </td>
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
      {/* TAB 2: WEEKLY LABOR & TIMESHEETS */}
      {/* ========================================================= */}
      {activeTab === 'weekly' && currentTimesheet && (
        <div className="space-y-6 animate-fadeIn">
          {/* Project & Week Selector Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">المشروع:</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-amber-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.nameAr}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">الأسبوع:</span>
                <span className="font-mono text-amber-400 font-bold text-sm bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                  {currentTimesheet.weekCode} ({currentTimesheet.weekStartDate} إلى {currentTimesheet.weekEndDate})
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>المشرف الميداني:</span>
                <strong className="text-white">{currentTimesheet.supervisorName}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTimesheetForPrint(currentTimesheet)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة كشف الصرف والتوقيعات (A4)</span>
              </button>

              {currentTimesheet.status !== 'paid' && (
                <button
                  onClick={() => approveAndDisburseWeeklyTimesheet(currentTimesheet.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>صرف أجور الكشف نقدياً من الخزينة</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Attendance Interactive Help */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>ميزة التحضير السريع: اضغط على خانة اليوم للتبديل السريع بين: (1 = يوم كامل، 0.5 = نصف يوم، 0 = غياب). الحساب تلقائي لحظي!</span>
            </div>
            <div className="hidden sm:flex items-center gap-3 font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">1 يوم</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">0.5 يوم</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">0 غائب</span>
            </div>
          </div>

          {/* Interactive Weekly Attendance & Wage Grid */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                    <th className="p-3 border-l border-slate-700 text-center w-8">#</th>
                    <th className="p-3 border-l border-slate-700 min-w-44">اسم العامل</th>
                    <th className="p-3 border-l border-slate-700">الحرفة / التخصص</th>
                    <th className="p-3 border-l border-slate-700 text-center">الأجر (د.ع/يوم)</th>
                    <th className="p-2 border-l border-slate-700 text-center w-12">السبت</th>
                    <th className="p-2 border-l border-slate-700 text-center w-12">الأحد</th>
                    <th className="p-2 border-l border-slate-700 text-center w-12">الاثنين</th>
                    <th className="p-2 border-l border-slate-700 text-center w-12">الثلاثاء</th>
                    <th className="p-2 border-l border-slate-700 text-center w-12">الأربعاء</th>
                    <th className="p-2 border-l border-slate-700 text-center w-12">الخميس</th>
                    <th className="p-2 border-l border-slate-700 text-center w-12">الجمعة</th>
                    <th className="p-3 border-l border-slate-700 text-center font-bold bg-slate-800/80">مجموع الأيام</th>
                    <th className="p-3 border-l border-slate-700 text-center min-w-28">إضافي (ساعات)</th>
                    <th className="p-3 border-l border-slate-700 text-center min-w-28 text-rose-300">سلف (د.ع)</th>
                    <th className="p-3 text-center font-bold bg-amber-500/20 text-amber-300">صافي المستحق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {currentTimesheet.entries.map((entry, idx) => (
                    <tr key={entry.workerId} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 text-center border-l border-slate-800 font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-3 border-l border-slate-800">
                        <strong className="text-white block">{entry.workerName}</strong>
                      </td>
                      <td className="p-3 border-l border-slate-800 text-slate-300">{entry.craft}</td>
                      <td className="p-3 text-center border-l border-slate-800 font-mono font-bold text-slate-200">
                        {entry.dailyRate}
                      </td>

                      {/* Day Cells with Click-to-Toggle */}
                      {(['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const).map((day) => {
                        const val = entry.days[day];
                        let bgClass = 'bg-slate-800/60 text-slate-500 hover:border-slate-500';
                        if (val === 1) bgClass = 'bg-emerald-500/20 text-emerald-300 font-bold border-emerald-500/40';
                        else if (val === 0.5) bgClass = 'bg-amber-500/20 text-amber-300 font-bold border-amber-500/40';

                        return (
                          <td key={day} className="p-1.5 text-center border-l border-slate-800">
                            <button
                              type="button"
                              onClick={() => toggleAttendanceValue(currentTimesheet.id, entry.workerId, day, val)}
                              className={`w-full py-2 rounded border transition text-center font-mono cursor-pointer ${bgClass}`}
                              title="اضغط للتغيير: 1 -> 0.5 -> 0"
                            >
                              {val === 0 ? '-' : val}
                            </button>
                          </td>
                        );
                      })}

                      <td className="p-3 text-center border-l border-slate-800 font-bold font-mono text-white bg-slate-800/30">
                        {entry.totalDays}
                      </td>

                      {/* Overtime input */}
                      <td className="p-2 border-l border-slate-800 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={entry.overtimeHours}
                            onChange={(e) => {
                              const hrs = parseFloat(e.target.value) || 0;
                              updateWorkerOvertimeAndAdvances(currentTimesheet.id, entry.workerId, hrs, entry.advances);
                            }}
                            className="w-14 bg-slate-800 border border-slate-700 text-center rounded py-1 font-mono text-white text-xs focus:outline-none focus:border-amber-400"
                          />
                          <span className="text-[10px] text-slate-400">ساعة</span>
                        </div>
                      </td>

                      {/* Advances input */}
                      <td className="p-2 border-l border-slate-800 text-center">
                        <input
                          type="number"
                          min="0"
                          value={entry.advances}
                          onChange={(e) => {
                            const adv = parseFloat(e.target.value) || 0;
                            updateWorkerOvertimeAndAdvances(currentTimesheet.id, entry.workerId, entry.overtimeHours, adv);
                          }}
                          className="w-16 bg-slate-800 border border-rose-500/30 text-center rounded py-1 font-mono text-rose-300 text-xs focus:outline-none focus:border-rose-400"
                        />
                      </td>

                      {/* Net Payable */}
                      <td className="p-3 text-center font-black font-mono text-amber-400 text-sm bg-amber-500/10">
                        {entry.netPayable.toLocaleString()} د.ع
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-800/90 font-bold border-t-2 border-slate-700 text-white">
                    <td colSpan={11} className="p-3 text-left">
                      مجاميع كشف الأجور الأسبوعية:
                    </td>
                    <td className="p-3 text-center font-mono text-amber-400">
                      {currentTimesheet.entries.reduce((sum, e) => sum + e.totalDays, 0)} يوم
                    </td>
                    <td className="p-3 text-center font-mono text-emerald-400">
                      +{currentTimesheet.entries.reduce((sum, e) => sum + e.overtimeAmount, 0).toLocaleString()} د.ع
                    </td>
                    <td className="p-3 text-center font-mono text-rose-400">
                      -{currentTimesheet.totalWeeklyAdvances.toLocaleString()} د.ع
                    </td>
                    <td className="p-3 text-center font-mono text-amber-400 font-black text-base bg-amber-500/20">
                      {currentTimesheet.totalWeeklyNetPayable.toLocaleString()} د.ع
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: WORKFORCE DIRECTORY (Staff & Laborers) */}
      {/* ========================================================= */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Permanent Staff Section */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <span>الكادر الوظيفي والهندسي الدائم</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">المهندسون، المحاسبون، ومديرو المشاريع الثابتون</p>
              </div>
              <button
                onClick={() => setIsAddEmployeeModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:brightness-110 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة موظف جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <div key={emp.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{emp.nameAr}</h4>
                      <p className="text-xs text-amber-400 font-medium">{emp.roleTitle}</p>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                      {emp.code}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-400 border-t border-slate-700/60 pt-2">
                    <div className="flex justify-between">
                      <span>القسم:</span>
                      <strong className="text-slate-300">{emp.departmentAr}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>إجمالي الحزمة الشهرية:</span>
                      <strong className="text-amber-400 font-mono">{emp.totalMonthlyPackage.toLocaleString()} د.ع</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>البنك:</span>
                      <span className="text-slate-300">{emp.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الهاتف:</span>
                      <span className="font-mono text-slate-300">{emp.phone}</span>
                    </div>
                    {emp.assignedProjectName && (
                      <div className="flex justify-between text-amber-300/90 pt-1">
                        <span>المشروع المشرف عليه:</span>
                        <span className="truncate">{emp.assignedProjectName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Laborers Section */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-amber-400" />
                  <span>سجل عمالة المياومة في مواقع المشاريع</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">النجارون، الحدادون، البناؤون، وفنيو التشغيل بالمواقع</p>
              </div>
              <button
                onClick={() => setIsAddWorkerModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 text-amber-300 border border-amber-500/30 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل عامل مياومة جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {projectWorkers.map((wrk) => (
                <div key={wrk.id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-xs">{wrk.nameAr}</h4>
                      <p className="text-[11px] text-amber-400">{wrk.craft}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                      {wrk.code}
                    </span>
                  </div>

                  <div className="text-[11px] space-y-1 text-slate-400 border-t border-slate-700/60 pt-1.5">
                    <div className="flex justify-between">
                      <span>الأجر اليومي:</span>
                      <strong className="text-amber-300 font-mono">{wrk.dailyRate} د.ع/يوم</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>المشروع:</span>
                      <span className="text-slate-300 truncate">{wrk.projectName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>رقم الهوية:</span>
                      <span className="font-mono text-slate-300">{wrk.nationalId}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW EMPLOYEE */}
      {/* ========================================================= */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <span>تسجيل موظف جديد في الكادر الدائم</span>
            </h3>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    placeholder="مثال: م. أحمد الغامدي"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المسمى الوظيفي *</label>
                  <input
                    type="text"
                    required
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    placeholder="مثال: مهندس موقع أول"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">القسم / الإدارة</label>
                  <select
                    value={newEmpDept}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNewEmpDept(val);
                      const labels: Record<string, string> = {
                        projects: 'إدارة المشاريع الميدانية',
                        engineering: 'قسم التصميم المعماري',
                        finance: 'الإدارة المالية والحسابات',
                        administration: 'الموارد البشرية والإدارة',
                        logistics: 'الخدمات اللوجستية والمشتريات'
                      };
                      setNewEmpDeptAr(labels[val] || 'الإدارة');
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="projects">إدارة المشاريع الميدانية</option>
                    <option value="engineering">قسم التصميم المعماري</option>
                    <option value="finance">الإدارة المالية والحسابات</option>
                    <option value="administration">الموارد البشرية والإدارة</option>
                    <option value="logistics">الخدمات اللوجستية والمشتريات</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الهوية / الإقامة *</label>
                  <input
                    type="text"
                    required
                    value={newEmpNationalId}
                    onChange={(e) => setNewEmpNationalId(e.target.value)}
                    placeholder="10XXXXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الراتب الأساسي (د.ع) *</label>
                  <input
                    type="number"
                    required
                    value={newEmpBasic}
                    onChange={(e) => setNewEmpBasic(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">بدل السكن (د.ع)</label>
                  <input
                    type="number"
                    value={newEmpHousing}
                    onChange={(e) => setNewEmpHousing(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">بدل النقل (د.ع)</label>
                  <input
                    type="number"
                    value={newEmpTransport}
                    onChange={(e) => setNewEmpTransport(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">بدلات أخرى (اتصال، إعاشة)</label>
                  <input
                    type="number"
                    value={newEmpOther}
                    onChange={(e) => setNewEmpOther(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">اسم البنك</label>
                  <input
                    type="text"
                    value={newEmpBank}
                    onChange={(e) => setNewEmpBank(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الحساب الدولي (IBAN)</label>
                  <input
                    type="text"
                    value={newEmpIban}
                    onChange={(e) => setNewEmpIban(e.target.value)}
                    placeholder="SA448000..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المشروع المعين عليه</label>
                  <select
                    value={newEmpProject}
                    onChange={(e) => setNewEmpProject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">بدون مشروع (إدارة عامة ومقر)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.nameAr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  حفظ الموظف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD DAILY WORKER */}
      {/* ========================================================= */}
      {isAddWorkerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-400" />
              <span>تسجيل عامل مياومة في مشاريع لمسات المعمار</span>
            </h3>

            <form onSubmit={handleCreateWorker} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم العامل الرباعي *</label>
                <input
                  type="text"
                  required
                  value={newWrkName}
                  onChange={(e) => setNewWrkName(e.target.value)}
                  placeholder="مثال: صالح عمر بارباع"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">الحرفة / المهنة *</label>
                  <select
                    value={newWrkCraft}
                    onChange={(e) => setNewWrkCraft(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="نجار مسلح (معلم خشب)">نجار مسلح</option>
                    <option value="حداد تسليح (قص وتشكيل)">حداد تسليح</option>
                    <option value="بناء طابوق وبلوك إنشائي">بناء طابوق</option>
                    <option value="مليس حجر وتكسية واجهات">مليس حجر وتكسية</option>
                    <option value="فني كهرباء تمديدات إنشائية">فني كهرباء</option>
                    <option value="سباك شبكات وتغذية مياه">سباك وتغذية</option>
                    <option value="عامل تشغيل وصب خرسانة">عامل تشغيل وصب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">الأجر اليومي (د.ع) *</label>
                  <input
                    type="number"
                    required
                    value={newWrkDailyRate}
                    onChange={(e) => setNewWrkDailyRate(e.target.value)}
                    placeholder="180"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">المشروع التابع له</label>
                  <select
                    value={newWrkProject}
                    onChange={(e) => setNewWrkProject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">رقم الهوية / الإقامة</label>
                  <input
                    type="text"
                    value={newWrkNationalId}
                    onChange={(e) => setNewWrkNationalId(e.target.value)}
                    placeholder="24XXXXXXXX"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={newWrkPhone}
                  onChange={(e) => setNewWrkPhone(e.target.value)}
                  placeholder="+966 5XXXXXXXX"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  إضافة العامل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD SALARY SLIP */}
      {/* ========================================================= */}
      {isAddSlipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>إصدار قسيمة راتب شهرية جديدة</span>
            </h3>

            <form onSubmit={handleCreateSalarySlip} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اختر الموظف *</label>
                <select
                  value={newSlipEmpId}
                  onChange={(e) => setNewSlipEmpId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500 text-sm font-semibold"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nameAr} - {emp.roleTitle} (الأساسي: {emp.basicSalary.toLocaleString()} د.ع)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">ساعات العمل الإضافي</label>
                  <input
                    type="number"
                    value={newSlipOvertimeHours}
                    onChange={(e) => {
                      const h = parseFloat(e.target.value) || 0;
                      setNewSlipOvertimeHours(e.target.value);
                      setNewSlipOvertimeAmount(String(h * 100)); // Default 100/hr
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">مبلغ الإضافي (د.ع)</label>
                  <input
                    type="number"
                    value={newSlipOvertimeAmount}
                    onChange={(e) => setNewSlipOvertimeAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono text-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">مكافآت وحوافز إنجاز (د.ع)</label>
                  <input
                    type="number"
                    value={newSlipBonuses}
                    onChange={(e) => setNewSlipBonuses(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">استقطاع قسط سلفة (د.ع)</label>
                  <input
                    type="number"
                    value={newSlipAdvances}
                    onChange={(e) => setNewSlipAdvances(e.target.value)}
                    className="w-full bg-slate-800 border border-rose-500/30 rounded-lg p-2 text-white font-mono text-rose-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">أيام الغياب</label>
                  <input
                    type="number"
                    value={newSlipAbsenceDays}
                    onChange={(e) => {
                      const d = parseFloat(e.target.value) || 0;
                      setNewSlipAbsenceDays(e.target.value);
                      const emp = employees.find((x) => x.id === newSlipEmpId);
                      const dailyRate = (emp?.basicSalary || 12000) / 30;
                      setNewSlipAbsenceDeduction(String(Math.round(d * dailyRate)));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">خصم الغياب (د.ع)</label>
                  <input
                    type="number"
                    value={newSlipAbsenceDeduction}
                    onChange={(e) => setNewSlipAbsenceDeduction(e.target.value)}
                    className="w-full bg-slate-800 border border-rose-500/30 rounded-lg p-2 text-white font-mono text-rose-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ملاحظات ومسوغات الاعتماد</label>
                <textarea
                  rows={2}
                  value={newSlipNotes}
                  onChange={(e) => setNewSlipNotes(e.target.value)}
                  placeholder="مثال: مكافأة إنهاء المخططات التنفيذية وتسليم المستخلص..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSlipModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  إنشاء المسير
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRINT PREVIEW MODALS */}
      {/* ========================================================= */}
      {selectedSlipForPrint && (
        <PayslipPrintModal
          slip={selectedSlipForPrint}
          employee={employees.find((e) => e.id === selectedSlipForPrint.employeeId)}
          isOpen={true}
          onClose={() => setSelectedSlipForPrint(null)}
        />
      )}

      {selectedTimesheetForPrint && (
        <WeeklyTimesheetPrintModal
          timesheet={selectedTimesheetForPrint}
          isOpen={true}
          onClose={() => setSelectedTimesheetForPrint(null)}
        />
      )}
    </div>
  );
};
