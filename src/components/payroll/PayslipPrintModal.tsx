import React from 'react';
import { X, Printer, CheckCircle, ShieldCheck, UserCheck, Building } from 'lucide-react';
import { MonthlySalarySlip, Employee } from '../../types/erp';
import { COMPANY_BILLING_INFO } from '../../services/dataService';
import { tafqeetSAR } from '../../utils/financialUtils';

interface PayslipPrintModalProps {
  slip: MonthlySalarySlip;
  employee?: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export const PayslipPrintModal: React.FC<PayslipPrintModalProps> = ({
  slip,
  employee,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalDeductions =
    slip.advancesDeduction + slip.absenceDeduction + slip.penaltiesDeduction;
  const totalGrossEarnings =
    slip.basicSalary + slip.totalAllowances + slip.overtimeAmount + slip.bonuses;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-8 print:m-0 print:border-none print:shadow-none print:bg-white print:w-full print:max-w-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700/60 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">معاينة مسير قسيمة الراتب الرسمية</h3>
              <p className="text-xs text-slate-400">قسيمة استحقاق رسمية قابلة للطباعة والتصدير بتصميم معتمد</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة القسيمة (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Payslip Sheet */}
        <div className="p-8 sm:p-10 bg-white text-slate-900 font-sans print:p-6 print:text-black">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-amber-600/40 pb-6 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">شركة لمسات المعمار</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  للمقاولات والتطوير
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">سجل تجاري: {COMPANY_BILLING_INFO.commercialReg}</p>
              <p className="text-xs text-slate-600 font-medium">الرقم الضريبي: {COMPANY_BILLING_INFO.vatNumber}</p>
              <p className="text-xs text-slate-500">{COMPANY_BILLING_INFO.address}</p>
            </div>

            <div className="text-center bg-slate-50 border border-slate-200 rounded-xl p-3 px-6 shadow-sm">
              <h2 className="text-lg font-black text-slate-900">قسيمة استحقاق وصرف راتب</h2>
              <p className="text-xs font-bold text-amber-700 mt-0.5">PAYROLL SALARY VOUCHER</p>
              <p className="text-xs text-slate-500 font-mono mt-1">الرقم: {slip.slipNumber}</p>
              <p className="text-xs text-slate-500">شهر: <strong className="text-slate-800">{slip.monthYear}</strong></p>
            </div>

            <div className="text-left space-y-1 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">تاريخ الإصدار: {slip.paidAt || '2026-09-25'}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{slip.status === 'paid' ? 'تم الصرف والتحويل' : 'معتمد للصرف'}</span>
              </div>
            </div>
          </div>

          {/* Employee Identity Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
            <div>
              <span className="text-slate-500 block">اسم الموظف:</span>
              <strong className="text-slate-900 text-sm">{slip.employeeName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">المسمى الوظيفي:</span>
              <strong className="text-slate-800">{slip.roleTitle}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">القسم / الإدارة:</span>
              <span className="text-slate-800 font-medium">{slip.departmentAr}</span>
            </div>
            <div>
              <span className="text-slate-500 block">رقم الهوية / الإقامة:</span>
              <span className="font-mono text-slate-800 font-semibold">{employee?.nationalId || '1088492019'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">البنك المحول إليه:</span>
              <span className="text-slate-800">{employee?.bankName || 'مصرف الراجحي'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block">رقم الحساب الدولي (IBAN):</span>
              <span className="font-mono text-slate-800 font-bold">{employee?.iban || 'SA4480000201608010009111'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">طريقة الدفع:</span>
              <span className="text-slate-800 font-bold">تحويل مصرفي (Bank Transfer)</span>
            </div>
          </div>

          {/* Breakdown Table: Earnings vs Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Earnings Column */}
            <div className="border border-emerald-200 rounded-xl overflow-hidden bg-emerald-50/20">
              <div className="bg-emerald-600/10 border-b border-emerald-200 px-4 py-2 flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-xs sm:text-sm">بنود الاستحقاقات والبدلات (Earnings)</span>
                <span className="text-xs font-semibold text-emerald-700">المبلغ (د.ع)</span>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-700">الراتب الأساسي (Basic Salary):</span>
                  <span className="font-mono font-bold text-slate-900">{slip.basicSalary.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100">
                  <span className="text-slate-700">إجمالي البدلات (سكن، نقل، اتصال):</span>
                  <span className="font-mono font-bold text-slate-900">{slip.totalAllowances.toLocaleString()} د.ع</span>
                </div>
                {slip.overtimeAmount > 0 && (
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-slate-700">العمل الإضافي ({slip.overtimeHours} ساعة):</span>
                    <span className="font-mono font-bold text-emerald-700">+{slip.overtimeAmount.toLocaleString()} د.ع</span>
                  </div>
                )}
                {slip.bonuses > 0 && (
                  <div className="flex justify-between py-1 border-b border-emerald-100">
                    <span className="text-slate-700">مكافآت وحوافز إنجاز:</span>
                    <span className="font-mono font-bold text-emerald-700">+{slip.bonuses.toLocaleString()} د.ع</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-emerald-950 font-bold text-sm">
                  <span>إجمالي الاستحقاق الإجمالي (Gross):</span>
                  <span className="font-mono">{totalGrossEarnings.toLocaleString()} د.ع</span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-rose-200 rounded-xl overflow-hidden bg-rose-50/20">
              <div className="bg-rose-600/10 border-b border-rose-200 px-4 py-2 flex items-center justify-between">
                <span className="font-bold text-rose-900 text-xs sm:text-sm">بنود الاستقطاعات والخصومات (Deductions)</span>
                <span className="text-xs font-semibold text-rose-700">المبلغ (د.ع)</span>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-700">استقطاع أقساط السلف المستلمة:</span>
                  <span className="font-mono font-bold text-rose-700">
                    {slip.advancesDeduction > 0 ? `-${slip.advancesDeduction.toLocaleString()} د.ع` : '0 د.ع'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-700">خصم غياب ({slip.absenceDays} يوم):</span>
                  <span className="font-mono font-bold text-rose-700">
                    {slip.absenceDeduction > 0 ? `-${slip.absenceDeduction.toLocaleString()} د.ع` : '0 د.ع'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100">
                  <span className="text-slate-700">جزاءات إدارية / تأخير:</span>
                  <span className="font-mono font-bold text-rose-700">
                    {slip.penaltiesDeduction > 0 ? `-${slip.penaltiesDeduction.toLocaleString()} د.ع` : '0 د.ع'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 text-rose-950 font-bold text-sm">
                  <span>إجمالي الاستقطاعات:</span>
                  <span className="font-mono">-{totalDeductions.toLocaleString()} د.ع</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Payable Banner */}
          <div className="p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-600/50 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-amber-900 block uppercase">صافي الراتب المستحق للصرف (Net Payable)</span>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                المبلغ كتابةً: <span className="font-bold text-slate-900">{tafqeetSAR(slip.netPayable)}</span>
              </p>
            </div>
            <div className="text-left">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {slip.netPayable.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-800 mr-2">دينار عراقي (IQD)</span>
            </div>
          </div>

          {/* Signatures & Approvals */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-center text-xs">
            <div className="space-y-12">
              <p className="text-slate-600 font-medium">إعداد الموارد البشرية (HR)</p>
              <div className="border-b border-slate-400 mx-auto w-32"></div>
              <p className="font-bold text-slate-800">أ. ريم الشمري</p>
            </div>
            <div className="space-y-12">
              <p className="text-slate-600 font-medium">اعتماد الإدارة المالية والحسابات</p>
              <div className="border-b border-slate-400 mx-auto w-32"></div>
              <p className="font-bold text-slate-800">أ. حسام المالي</p>
            </div>
            <div className="space-y-12">
              <p className="text-slate-600 font-medium">توقيع واستلام الموظف</p>
              <div className="border-b border-slate-400 mx-auto w-32"></div>
              <p className="font-bold text-slate-800">{slip.employeeName}</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            تم إصدار هذه الوثيقة آلياً من نظام إدارة الموارد المالية والتشغيلية المعتمد لشركة لمسات المعمار - جميع الحقوق محفوظة © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};
