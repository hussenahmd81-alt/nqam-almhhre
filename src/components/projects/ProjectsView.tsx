import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Project } from '../../types/erp';
import {
  Building2,
  Calendar,
  MapPin,
  User,
  Compass,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  X,
  AlertCircle
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const { projects, addProject, deleteProject, hasPermission } = useErp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    code: '',
    nameAr: '',
    clientName: '',
    location: '',
    type: 'tower' as Project['type'],
    totalBudget: 0,
    spentAmount: 0,
    progressPercent: 0,
    leadArchitect: '',
    status: 'in_progress' as Project['status'],
    startDate: new Date().toISOString().split('T')[0],
    deliveryDate: ''
  });

  const canViewConfidential = hasPermission('canViewConfidentialMargins');
  const canCreate = hasPermission('canCreateInvoice');
  const canDelete = hasPermission('canDeleteRecords');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.nameAr.trim()) return;

    addProject({
      ...newProject,
      code: newProject.code.trim() || `PRJ-${Math.floor(100 + Math.random() * 900)}`
    });

    setIsAddModalOpen(false);
    setNewProject({
      code: '',
      nameAr: '',
      clientName: '',
      location: '',
      type: 'tower',
      totalBudget: 0,
      spentAmount: 0,
      progressPercent: 0,
      leadArchitect: '',
      status: 'in_progress',
      startDate: new Date().toISOString().split('T')[0],
      deliveryDate: ''
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              المشاريع والمخططات الهندسية
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            سجل العقود الإنشائية، الإشراف المعماري، ومراحل تقدم الأعمال الميدانية لشركة لمسات المعمار.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            إجمالي المشاريع: <span className="font-bold text-amber-400">{projects.length}</span>
          </div>

          {canCreate && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة مشروع جديد
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl max-w-xl mx-auto space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">لا توجد مشاريع مسجلة حالياً</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            تم تصفير النظام من السجلات والبيانات التجريبية بنجاح. يمكنك الآن البدء في تسجيل وتوثيق أول مشاريعك الهندسية والعقود الإنشائية.
          </p>
          {canCreate && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              تسجيل أول مشروع الآن
            </button>
          )}
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => {
            const remainingBudget = project.totalBudget - project.spentAmount;
            const isHighProgress = project.progressPercent >= 75;

            return (
              <div
                key={project.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 hover:border-amber-500/30 transition-all duration-200 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {project.code}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
                        {project.nameAr}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{project.location || 'غير محدد'}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-300">{project.clientName || 'العميل'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canDelete && (
                        <button
                          onClick={() => deleteProject(project.id)}
                          title="حذف المشروع"
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-amber-400 group-hover:scale-105 transition-transform">
                        <Compass className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">نسبة الإنجاز الفعلي المعتمد:</span>
                      <span className="font-mono font-bold text-white tabular-nums">
                        {project.progressPercent}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHighProgress
                            ? 'bg-gradient-to-l from-emerald-400 to-emerald-600'
                            : 'bg-gradient-to-l from-amber-400 to-amber-600'
                        }`}
                        style={{ width: `${project.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="mt-5 grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">إجمالي قيمة العقد:</span>
                      <span className="font-mono font-bold text-white text-sm tabular-nums mt-0.5 block">
                        {project.totalBudget.toLocaleString()} <span className="text-[10px] font-sans text-slate-400">د.ع</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block">المصروف حتى تاريخه:</span>
                      <span className="font-mono font-bold text-amber-400 text-sm tabular-nums mt-0.5 block">
                        {project.spentAmount.toLocaleString()} <span className="text-[10px] font-sans text-slate-400">د.ع</span>
                      </span>
                    </div>
                  </div>

                  {/* Confidential Margin Preview (Super Admin Only) */}
                  {canViewConfidential && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between text-amber-300">
                      <span className="font-semibold text-[11px]">هامش الربح التقديري (سري للمدير العام):</span>
                      <span className="font-mono font-bold tabular-nums">
                        +{Math.round(remainingBudget * 0.35).toLocaleString()} د.ع
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Meta */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">المهندس: {project.leadArchitect || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>التسليم: {project.deliveryDate || 'قيد التحديد'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                إضافة مشروع هندسي جديد
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اسم المشروع *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: برج لمسات المعمار"
                    value={newProject.nameAr}
                    onChange={(e) => setNewProject({ ...newProject, nameAr: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رمز المشروع (Code)</label>
                  <input
                    type="text"
                    placeholder="مثال: LM-TOWER"
                    value={newProject.code}
                    onChange={(e) => setNewProject({ ...newProject, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">العميل / الجهة المالكة</label>
                  <input
                    type="text"
                    placeholder="مثال: شركة التطوير العقاري"
                    value={newProject.clientName}
                    onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الموقع / المدينة</label>
                  <input
                    type="text"
                    placeholder="مثال: الرياض - حي الملقا"
                    value={newProject.location}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">إجمالي قيمة العقد (د.ع)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProject.totalBudget || ''}
                    onChange={(e) => setNewProject({ ...newProject, totalBudget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المصروف الفعلي (د.ع)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newProject.spentAmount || ''}
                    onChange={(e) => setNewProject({ ...newProject, spentAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نسبة الإنجاز (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={newProject.progressPercent || ''}
                    onChange={(e) => setNewProject({ ...newProject, progressPercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المهندس المشرف</label>
                  <input
                    type="text"
                    placeholder="اسم المهندس"
                    value={newProject.leadArchitect}
                    onChange={(e) => setNewProject({ ...newProject, leadArchitect: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تاريخ التسليم</label>
                  <input
                    type="date"
                    value={newProject.deliveryDate}
                    onChange={(e) => setNewProject({ ...newProject, deliveryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  حفظ المشروع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
