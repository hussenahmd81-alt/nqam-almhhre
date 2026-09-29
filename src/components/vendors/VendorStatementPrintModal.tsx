import React, { useRef } from 'react';
import { SubcontractorVendor, VendorTransaction } from '../../types/erp';
import { useErp } from '../../context/ErpContext';
import { COMPANY_BILLING_INFO } from '../../services/dataService';
import { taqeetArabicMoney } from '../../utils/financialUtils';
import {
  Printer,
  X,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Phone,
  User,
  ShieldCheck,
  Hash
} from 'lucide-react';

interface VendorStatementPrintModalProps {
  vendor: SubcontractorVendor;
  transactions: VendorTransaction[];
  onClose: () => void;
}

export const VendorStatementPrintModal: React.FC<VendorStatementPrintModalProps> = ({
  vendor,
  transactions,
  onClose
}) => {
  const { userProfiles } = useErp();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Sort transactions chronologically
  const sortedTx = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Action Header (Screen only) */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">معاينة كشف حساب تفصيلي معتمد</h2>
              <p className="text-xs text-slate-400">
                {vendor.name} ({vendor.vendorNumber})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              طباعة كشف الحساب (A4)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (Styled as pristine physical A4 document) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 text-slate-900 print:p-0 print:bg-white print:m-0">
          <div
            ref={printAreaRef}
            className="max-w-[210mm] mx-auto bg-white p-6 sm:p-8 shadow-sm border border-slate-300 print:border-none print:shadow-none print:p-4 print:max-w-none text-right font-sans"
            dir="rtl"
          >
            {/* Header: Company & Statement Title */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 font-black text-xl">■</span>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                    {COMPANY_BILLING_INFO.nameAr}
                  </h1>
                </div>
                <p className="text-xs text-slate-600 font-semibold">{COMPANY_BILLING_INFO.nameEn}</p>
                <p className="text-xs text-slate-500">
                  سجل تجاري: {COMPANY_BILLING_INFO.commercialReg} | الرقم الضريبي: {COMPANY_BILLING_INFO.vatNumber}
                </p>
                <p className="text-xs text-slate-500">{COMPANY_BILLING_INFO.address}</p>
              </div>

              <div className="text-left space-y-1">
                <div className="inline-block px-3 py-1 bg-amber-500/15 border border-amber-500/40 rounded-lg text-amber-900 font-black text-xs sm:text-sm">
                  كشف حساب مورد / مقاول باطن
                </div>
                <p className="text-xs text-slate-500 font-mono">تاريخ الاستخراج: {new Date().toLocaleDateString('ar-SA')}</p>
                <p className="text-xs text-slate-500 font-mono">المرجع: STM-{vendor.vendorNumber}</p>
              </div>
            </div>

            {/* Vendor Identification Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-slate-500 font-medium">اسم الجهة:</span>
                  <span className="text-sm font-black text-slate-900">{vendor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium">التصنيف والتخصص:</span>
                  <span className="text-xs font-semibold text-slate-800">{vendor.specialty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium">مسؤول الاتصال والهاتف:</span>
                  <span className="text-xs font-mono text-slate-800">{vendor.contactPerson} ({vendor.phone})</span>
                </div>
              </div>

              <div className="space-y-2 md:border-r md:border-slate-200 md:pr-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">رقم السجل التجاري / الضريبي:</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {vendor.vatNumber || vendor.commercialReg || 'غير مسجل'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">شرط السداد الائتماني:</span>
                  <span className="text-xs font-bold text-slate-800">{vendor.paymentTermDays} يوماً من تاريخ الفاتورة</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-700">حالة الحساب:</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    نشط ومطابق محاسبياً
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Summary Ribbon */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                <p className="text-[11px] text-slate-500 font-semibold mb-1">إجمالي الفواتير والمستخلصات (دائن)</p>
                <p className="text-base sm:text-lg font-black text-slate-900 font-mono">
                  {vendor.totalBilled.toLocaleString()} <span className="text-xs font-sans">د.ع</span>
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                <p className="text-[11px] text-emerald-700 font-semibold mb-1">إجمالي المدفوعات المسددة (مدين)</p>
                <p className="text-base sm:text-lg font-black text-emerald-700 font-mono">
                  {vendor.totalPaid.toLocaleString()} <span className="text-xs font-sans">د.ع</span>
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-center">
                <p className="text-[11px] text-amber-800 font-bold mb-1">صافي الرصيد المتبقي (بذمة الشركة)</p>
                <p className="text-base sm:text-lg font-black text-amber-900 font-mono">
                  {vendor.currentBalance.toLocaleString()} <span className="text-xs font-sans">د.ع</span>
                </p>
              </div>
            </div>

            {/* Transactions Ledger Table */}
            <div className="mb-6">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-600" />
                سجل القيود المالية والحركات المتبادلة
              </h3>
              <table className="w-full text-xs text-right border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold">
                    <th className="p-2 border border-slate-700">التاريخ</th>
                    <th className="p-2 border border-slate-700">رقم الحركة / المرجع</th>
                    <th className="p-2 border border-slate-700">البيان والشرح التفصيلي</th>
                    <th className="p-2 border border-slate-700">المشروع</th>
                    <th className="p-2 border border-slate-700 text-emerald-300">مسدد (مدين)</th>
                    <th className="p-2 border border-slate-700 text-amber-300">مستحق (دائن)</th>
                    <th className="p-2 border border-slate-700">الرصيد التراكمي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sortedTx.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-400">
                        لا توجد حركات مسجلة لهذا الحساب حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    sortedTx.map((tx, idx) => {
                      const isBill = tx.type === 'bill';
                      return (
                        <tr key={tx.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2 border border-slate-200 font-mono whitespace-nowrap text-slate-700">
                            {tx.date}
                          </td>
                          <td className="p-2 border border-slate-200 font-mono font-semibold text-slate-900 whitespace-nowrap">
                            {tx.referenceDocNumber || tx.transactionNumber}
                          </td>
                          <td className="p-2 border border-slate-200 text-slate-800 font-medium">
                            {tx.description}
                          </td>
                          <td className="p-2 border border-slate-200 text-slate-600 whitespace-nowrap">
                            {tx.projectName || 'عام / مستودع'}
                          </td>
                          <td className="p-2 border border-slate-200 font-mono font-bold text-emerald-700 whitespace-nowrap">
                            {!isBill ? `${tx.amount.toLocaleString()} د.ع` : '-'}
                          </td>
                          <td className="p-2 border border-slate-200 font-mono font-bold text-amber-800 whitespace-nowrap">
                            {isBill ? `${tx.amount.toLocaleString()} د.ع` : '-'}
                          </td>
                          <td className="p-2 border border-slate-200 font-mono font-black text-slate-900 whitespace-nowrap">
                            {tx.balanceAfter.toLocaleString()} د.ع
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200 font-black text-slate-900 border-t-2 border-slate-800">
                    <td colSpan={4} className="p-2 text-left pl-4">
                      المجاميع الإجمالية المعتمدة:
                    </td>
                    <td className="p-2 text-emerald-800 font-mono font-black whitespace-nowrap">
                      {vendor.totalPaid.toLocaleString()} د.ع
                    </td>
                    <td className="p-2 text-amber-900 font-mono font-black whitespace-nowrap">
                      {vendor.totalBilled.toLocaleString()} د.ع
                    </td>
                    <td className="p-2 text-slate-950 font-mono font-black whitespace-nowrap bg-amber-100">
                      {vendor.currentBalance.toLocaleString()} د.ع
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Tafqeet in Arabic Words */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg mb-8 text-xs text-amber-950">
              <span className="font-bold">فقط وقدره صافي الرصيد المتبقي: </span>
              <span className="font-bold underline">
                {taqeetArabicMoney(vendor.currentBalance)}
              </span>
            </div>

            {/* Signatures & Certification Block */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-800 text-center text-xs">
              <div className="space-y-10">
                <p className="font-bold text-slate-800">إعداد / قسم المحاسبة والتدقيق</p>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto pb-1 text-slate-700 font-bold">
                  {userProfiles.accountant?.nameAr || 'حسين احمد'}
                </div>
                <p className="text-[10px] text-slate-400">التوقيع والتاريخ</p>
              </div>

              <div className="space-y-10">
                <p className="font-bold text-slate-800">اعتماد المدير العام</p>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto pb-1 text-slate-700 font-bold">
                  {userProfiles.super_admin?.nameAr || 'صادق جعفر'}
                </div>
                <p className="text-[10px] text-slate-400">الختم والاعتماد الرسمي</p>
              </div>

              <div className="space-y-10">
                <p className="font-bold text-slate-800">المصادقة والمطابقة من طرف المورد</p>
                <div className="border-b border-dashed border-slate-400 w-3/4 mx-auto pb-1 text-slate-700 font-bold">
                  {vendor.contactPerson}
                </div>
                <p className="text-[10px] text-slate-400">ختم وتوقيع المفوض</p>
              </div>
            </div>

            {/* Legal Notice & Developer Credit Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
              <span>يعتبر هذا الكشف وثيقة مطابقة رسمية معتمدة من نظام لمسات المعمار السحابي لإدارة المشاريع.</span>
              <span className="font-medium text-amber-600">تمت برمجة وتطوير النظام بواسطة - شركة فن التقنية الحديثة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
