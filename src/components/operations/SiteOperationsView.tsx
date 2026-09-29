import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Truck,
  Plus,
  Fuel,
  Users,
  CheckCircle2,
  Calendar,
  Building2,
  HardHat,
  X
} from 'lucide-react';

export const SiteOperationsView: React.FC = () => {
  const { siteLogs, addSiteLog, projects, currentUser, hasPermission } = useErp();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [equipmentType, setEquipmentType] = useState<string>('حفار هيدروليكي CAT 330');
  const [machineryId, setMachineryId] = useState<string>('EQ-EXC-05');
  const [fuelLiters, setFuelLiters] = useState<number>(120);
  const [workersCount, setWorkersCount] = useState<number>(18);
  const [workDescription, setWorkDescription] = useState<string>('');

  const canLog = hasPermission('canLogDailySiteOperations');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const proj = projects.find((p) => p.id === projectId);
    const fuelCost = fuelLiters * 750; // Iraqi Diesel rate approx 750 IQD/L (د.ع/لتر)

    const success = addSiteLog({
      date: new Date().toISOString().split('T')[0],
      projectId,
      projectName: proj?.nameAr || 'مشروع هندسي',
      equipmentType,
      machineryId,
      fuelLiters,
      fuelCost,
      workersCount,
      workDescription,
      verifiedBySupervisor: true
    });

    if (success) {
      setIsModalOpen(false);
      setWorkDescription('');
    }
  };

  const totalFuelLiters = siteLogs.reduce((acc, curr) => acc + curr.fuelLiters, 0);
  const totalFuelCost = siteLogs.reduce((acc, curr) => acc + curr.fuelCost, 0);
  const totalWorkers = siteLogs.reduce((acc, curr) => acc + curr.workersCount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Truck className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              تشغيل الموقع ورصد استهلاك الآليات والوقود
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            تسجيل يوميات المشاريع الميدانية، متابعة حركة المحروقات، وتشغيل المعدات الثقيلة لشركة لمسات المعمار.
          </p>
        </div>

        {/* Action: Add Site Log */}
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!canLog}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-4 h-4" />
          تسجيل يومية موقع / استهلاك وقود
        </button>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">إجمالي استهلاك الديزل والوقود</span>
            <Fuel className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
            {totalFuelLiters.toLocaleString()} <span className="text-xs text-slate-400 font-sans">لتر</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            التكلفة التقديرية: {totalFuelCost.toLocaleString()} د.ع
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">سجل عمالة ومقاولي التنفيذ الميداني</span>
            <HardHat className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-sky-400 tabular-nums">
            {totalWorkers} <span className="text-xs text-slate-400 font-sans">عامل وفني</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">توزيع على الوردية النهارية والمسائية</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">نسبة مطابقة كفاءة التشغيل للآليات</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            96.8%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">مطابق للجداول الزمنية المعتمدة</div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-white">سجلات التشغيل الميدانية الأخيرة</span>
          <span>معتمدة ببصمة مهندس الموقع</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {siteLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 sm:p-5 hover:bg-slate-800/20 transition-colors text-right flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Truck className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-white text-sm">{log.equipmentType}</span>
                    <span className="text-slate-500">·</span>
                    <span className="font-mono text-amber-400 font-semibold">{log.machineryId}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-300">{log.projectName}</span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {log.workDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 mt-2 font-mono">
                    <span className="text-amber-300">الوقود: {log.fuelLiters} لتر ({log.fuelCost} د.ع)</span>
                    <span>العمالة: {log.workersCount} عامل</span>
                    <span className="text-slate-400 font-sans">الراصد: {log.loggedBy}</span>
                  </div>
                </div>
              </div>

              <div className="text-left shrink-0">
                <span className="font-mono text-xs text-slate-400 tabular-nums">{log.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add Site Log */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-right">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">تسجيل يومية تشغيل وآليات</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">المشروع الهندسي:</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نوع الآلية / المعدة:</label>
                  <input
                    type="text"
                    required
                    value={equipmentType}
                    onChange={(e) => setEquipmentType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">كود الآلية (ID):</label>
                  <input
                    type="text"
                    required
                    value={machineryId}
                    onChange={(e) => setMachineryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">كمية الوقود المستهلك (لتر):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">عدد العمال والفنيين:</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={workersCount}
                    onChange={(e) => setWorkersCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">بيان الأعمال المنجزة:</label>
                <textarea
                  rows={3}
                  required
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="وصف دقيق للأعمال (مثل: رفع حديد، حفر قواعد، صب خرسانة الدور 18...)"
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
                  حفظ التقرير الميداني
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
