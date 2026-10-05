import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  History,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Lock,
  User,
  Clock,
  Download,
  AlertCircle
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const {
    auditLogs,
    hasPermission,
    roleConfig
  } = useErp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const canAccess = hasPermission('canAccessAuditLogs');

  if (!canAccess) {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-slate-900/90 backdrop-blur-xl p-12 text-center max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">وصول محظور لدورك الحالي</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          سجل التدقيق الأمني والرقابة المالية متاح حصراً للمدير العام والمحاسب المالي. دورك الحالي ({roleConfig.nameAr}) مقيد لحماية سرية العمليات.
        </p>
      </div>
    );
  }

  const filteredLogs = auditLogs.filter((log) => {
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              سجل التدقيق الأمني والرقابة المالية (Audit Trail)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            سجل محلي يتابع الحركات المالية وتعديلات الحسابات ومحاولات الوصول، وسيُنقل إلى قاعدة البيانات عند ربطها.
          </p>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في السجلات بالعملية، الاسم أو التفاصيل..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Category Filters (Interactive buttons compliant with anti-pill discipline) */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400">التصنيف:</span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'financial', label: 'مالي' },
            { id: 'license', label: 'تراخيص' },
            { id: 'security', label: 'أمان وتلاعب' },
            { id: 'operations', label: 'تشغيل ميداني' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-white">السجلات المعتمدة ({filteredLogs.length})</span>
          <span className="font-mono text-slate-400">سجل محلي بانتظار الربط المركزي</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredLogs.map((log) => {
            const isCritical = log.severity === 'critical';
            const isWarning = log.severity === 'warning';

            return (
              <div
                key={log.id}
                className={`p-4 sm:p-5 transition-colors text-right flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isCritical
                    ? 'bg-rose-950/20 hover:bg-rose-950/30'
                    : isWarning
                    ? 'bg-amber-950/15 hover:bg-amber-950/25'
                    : 'hover:bg-slate-800/20'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                        : isWarning
                        ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                        : 'bg-slate-800 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : isWarning ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-white text-sm">{log.action}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-amber-400 font-semibold">{log.userName}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-400 text-[11px] font-mono">{log.ipAddress}</span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {log.details}
                    </p>

                    {/* Diff Inspection if Available */}
                    {log.diff && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 font-mono text-[11px] space-y-1">
                        <div className="text-slate-400 text-[10px] font-sans font-semibold">
                          فحص التغيير الحساس (Field: {log.diff.field}):
                        </div>
                        <div className="text-rose-400">- القيمة السابقة: {log.diff.oldVal}</div>
                        <div className="text-emerald-400">+ القيمة المحاولة: {log.diff.newVal}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Column (Clean unboxed text) */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 text-left w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                  <span className="font-mono text-xs font-semibold text-slate-200 tabular-nums">
                    {log.timestamp}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{log.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
