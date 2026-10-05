import React from 'react';
import { X, Printer, CheckCircle, HardHat, FileSpreadsheet } from 'lucide-react';
import { WeeklyLaborTimesheet } from '../../types/erp';
import { COMPANY_BILLING_INFO } from '../../services/dataService';
import { tafqeetSAR } from '../../utils/financialUtils';
import { useErp } from '../../context/ErpContext';

interface WeeklyTimesheetPrintModalProps {
  timesheet: WeeklyLaborTimesheet;
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyTimesheetPrintModal: React.FC<WeeklyTimesheetPrintModalProps> = ({
  timesheet,
  isOpen,
  onClose
}) => {
  const { userProfiles } = useErp();
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 print:m-0 print:border-none print:shadow-none print:bg-white print:w-full print:max-w-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">معاينة كشف أجور العمالة الميدانية الأسبوعية (A4)</h3>
              <p className="text-xs text-slate-400">كشف رسمي معتمد مزود بخانات التوقيع وبصمة الإبهام لكل عامل</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف الصرف الميداني</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Sheet */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 font-sans print:p-4 print:text-black">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
            <div className="space-y-0.5">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">شركة لمسات المعمار للمقاولات العامة</h1>
              <p className="text-xs text-slate-600 font-medium">إدارة التنفيذ والمشاريع الإنشائية | قسم أجور العمالة</p>
              <p className="text-xs text-slate-500">سجل تجاري: {COMPANY_BILLING_INFO.commercialReg}</p>
            </div>

            <div className="text-center border-2 border-slate-800 rounded-lg px-6 py-2 bg-slate-50">
              <h2 className="text-base font-black text-slate-900">مسير وكشف أجور عمالة المياومة</h2>
              <p className="text-xs font-bold text-amber-800">WEEKLY LABOR PAYROLL & ATTENDANCE SHEET</p>
              <p className="text-xs font-mono font-bold text-slate-800 mt-0.5">{timesheet.weekCode}</p>
            </div>

            <div className="text-left text-xs space-y-1">
              <p><strong>تاريخ الكشف:</strong> {timesheet.weekStartDate} إلى {timesheet.weekEndDate}</p>
              <p><strong>حالة الصرف:</strong> {timesheet.status === 'paid' ? 'تم الصرف نقدياً' : 'قيد الصرف والتسليم'}</p>
            </div>
          </div>

          {/* Project & Supervisor Info Bar */}
          <div className="grid grid-cols-3 gap-4 p-3 bg-slate-100 rounded-lg border border-slate-300 mb-4 text-xs">
            <div>
              <span className="text-slate-500 block">المشروع / الموقع:</span>
              <strong className="text-slate-900 text-sm">{timesheet.projectName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">المشرف الميداني المسؤول:</span>
              <strong className="text-slate-900 text-sm">{timesheet.supervisorName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">عدد العمالة المسجلة:</span>
              <strong className="text-slate-900 text-sm">{timesheet.entries.length} عمال</strong>
            </div>
          </div>

          {/* Laborers Attendance & Dues Table */}
          <div className="overflow-x-auto mb-4 border border-slate-300 rounded-lg">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white font-bold border-b border-slate-300">
                  <th className="p-2 border-l border-slate-600 text-center w-8">#</th>
                  <th className="p-2 border-l border-slate-600">اسم العامل</th>
                  <th className="p-2 border-l border-slate-600">المهنة / الحرفة</th>
                  <th className="p-2 border-l border-slate-600 text-center">اليومية (د.ع)</th>
                  <th className="p-1 border-l border-slate-600 text-center w-7">سبت</th>
                  <th className="p-1 border-l border-slate-600 text-center w-7">أحد</th>
                  <th className="p-1 border-l border-slate-600 text-center w-7">اثنين</th>
                  <th className="p-1 border-l border-slate-600 text-center w-7">ثلاثاء</th>
                  <th className="p-1 border-l border-slate-600 text-center w-7">أربعاء</th>
                  <th className="p-1 border-l border-slate-600 text-center w-7">خميس</th>
                  <th className="p-1 border-l border-slate-600 text-center w-7">جمعة</th>
                  <th className="p-2 border-l border-slate-600 text-center font-bold bg-slate-700">الأيام</th>
                  <th className="p-2 border-l border-slate-600 text-center">إضافي (د.ع)</th>
                  <th className="p-2 border-l border-slate-600 text-center text-rose-300">سلف (د.ع)</th>
                  <th className="p-2 border-l border-slate-600 text-center font-bold bg-amber-500 text-slate-950">صافي المستحق</th>
                  <th className="p-2 text-center w-36">التوقيع / البصمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {timesheet.entries.map((entry, idx) => (
                  <tr key={entry.workerId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2 text-center border-l border-slate-200 font-mono">{idx + 1}</td>
                    <td className="p-2 font-bold text-slate-900 border-l border-slate-200 whitespace-nowrap">{entry.workerName}</td>
                    <td className="p-2 text-slate-700 border-l border-slate-200">{entry.craft}</td>
                    <td className="p-2 text-center font-mono border-l border-slate-200">{entry.dailyRate}</td>
                    <td className="p-1 text-center font-mono border-l border-slate-200">{entry.days.sat || '-'}</td>
                    <td className="p-1 text-center font-mono border-l border-slate-200">{entry.days.sun || '-'}</td>
                    <td className="p-1 text-center font-mono border-l border-slate-200">{entry.days.mon || '-'}</td>
                    <td className="p-1 text-center font-mono border-l border-slate-200">{entry.days.tue || '-'}</td>
                    <td className="p-1 text-center font-mono border-l border-slate-200">{entry.days.wed || '-'}</td>
                    <td className="p-1 text-center font-mono border-l border-slate-200">{entry.days.thu || '-'}</td>
                    <td className="p-1 text-center font-mono border-l border-slate-200">{entry.days.fri || '-'}</td>
                    <td className="p-2 text-center font-bold font-mono border-l border-slate-200 bg-slate-100">{entry.totalDays}</td>
                    <td className="p-2 text-center font-mono border-l border-slate-200 text-emerald-800">
                      {entry.overtimeAmount > 0 ? `+${entry.overtimeAmount}` : '-'}
                    </td>
                    <td className="p-2 text-center font-mono border-l border-slate-200 text-rose-700">
                      {entry.advances > 0 ? `-${entry.advances}` : '-'}
                    </td>
                    <td className="p-2 text-center font-black font-mono border-l border-slate-200 bg-amber-50 text-slate-900">
                      {entry.netPayable.toLocaleString()}
                    </td>
                    <td className="p-2 text-center h-12 align-middle">
                      <div className="h-9 w-28 border border-dashed border-slate-400 rounded mx-auto flex items-center justify-center text-[10px] text-slate-400">
                        توقيع / بصمة
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-200 font-bold border-t-2 border-slate-400">
                  <td colSpan={11} className="p-2 text-left font-bold border-l border-slate-300">
                    المجاميع الإجمالية للكشف:
                  </td>
                  <td className="p-2 text-center font-mono border-l border-slate-300">
                    {timesheet.entries.reduce((sum, e) => sum + e.totalDays, 0)} يوم
                  </td>
                  <td className="p-2 text-center font-mono border-l border-slate-300 text-emerald-800">
                    +{timesheet.entries.reduce((sum, e) => sum + e.overtimeAmount, 0).toLocaleString()}
                  </td>
                  <td className="p-2 text-center font-mono border-l border-slate-300 text-rose-700">
                    -{timesheet.totalWeeklyAdvances.toLocaleString()}
                  </td>
                  <td className="p-2 text-center font-black font-mono border-l border-slate-300 bg-amber-200 text-slate-950 text-sm">
                    {timesheet.totalWeeklyNetPayable.toLocaleString()} د.ع
                  </td>
                  <td className="p-2 text-center text-xs text-slate-500 font-normal">
                    مطابقة الخزينة
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount in Arabic words & Cash Delivery Note */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg mb-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900 block">إجمالي صافي المبلغ الواجب صرفه نقدياً:</span>
              <p className="text-slate-800 font-semibold mt-0.5">
                فقط وقدره: <strong className="text-slate-950 underline">{tafqeetSAR(timesheet.totalWeeklyNetPayable)}</strong> لا غير.
              </p>
            </div>
            <div className="text-left font-mono font-black text-slate-900 text-lg">
              {timesheet.totalWeeklyNetPayable.toLocaleString()} د.ع
            </div>
          </div>

          {/* Signatures of Authorization */}
          <div className="grid grid-cols-3 gap-6 pt-4 border-t-2 border-slate-800 text-center text-xs">
            <div className="space-y-10">
              <p className="font-bold text-slate-800">مهندس الموقع والمشرف الميداني</p>
              <div className="border-b border-slate-500 mx-auto w-36"></div>
              <p className="font-semibold text-slate-700">{timesheet.supervisorName}</p>
            </div>
            <div className="space-y-10">
              <p className="font-bold text-slate-800">أمين الصندوق (مسؤول الصرف الميداني)</p>
              <div className="border-b border-slate-500 mx-auto w-36"></div>
              <p className="font-semibold text-slate-700">{userProfiles.accountant.nameAr}</p>
            </div>
            <div className="space-y-10">
              <p className="font-bold text-slate-800">اعتماد مدير المشاريع العام</p>
              <div className="border-b border-slate-500 mx-auto w-36"></div>
              <p className="font-semibold text-slate-700">{userProfiles.super_admin.nameAr}</p>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
            تنبيه: يُحفظ هذا الكشف بعد إتمام الصرف والتوقيع والبصمة لدى الإدارة المالية بالملف الخاص بمشروع ({timesheet.projectName}).
          </div>
        </div>
      </div>
    </div>
  );
};
