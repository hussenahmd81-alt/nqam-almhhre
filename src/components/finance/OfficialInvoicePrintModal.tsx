import React from 'react';
import { Invoice } from '../../types/erp';
import { useErp } from '../../context/ErpContext';
import { COMPANY_BILLING_INFO } from '../../services/dataService';
import { formatSAR, tafqeetSAR } from '../../utils/financialUtils';
import { Printer, X, ShieldCheck, QrCode, Building2, Phone, Mail, Globe, MapPin, CheckCircle2 } from 'lucide-react';

interface OfficialInvoicePrintModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const OfficialInvoicePrintModal: React.FC<OfficialInvoicePrintModalProps> = ({
  invoice,
  onClose
}) => {
  const { userProfiles } = useErp();
  if (!invoice) return null;

  const isSales = invoice.type === 'sales';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Container: standard A4 ratio styling */}
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl relative my-auto overflow-hidden print:m-0 print:p-0 print:w-full print:max-w-none print:rounded-none print:shadow-none">
        
        {/* Floating Action Bar (hidden when printing) */}
        <div className="no-print bg-slate-900 px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 text-white text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>معاينة الفاتورة الرسمية المتوافقة مع معايير ZATCA (هيئة الزكاة والضريبة والجمارك)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الفاتورة الرسمية (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body */}
        <div className="p-8 sm:p-12 text-slate-800 text-xs leading-normal select-text">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-slate-900 gap-6">
            {/* Right: Company Logo & Details (Arabic) */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold text-2xl shadow">
                  LM
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {COMPANY_BILLING_INFO.nameAr}
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {COMPANY_BILLING_INFO.nameEn}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-600 space-y-0.5 font-medium">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{COMPANY_BILLING_INFO.address}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-600">
                  <span>هاتف: {COMPANY_BILLING_INFO.phone}</span>
                  <span>|</span>
                  <span>البريد: {COMPANY_BILLING_INFO.email}</span>
                </div>
              </div>
            </div>

            {/* Left: Official ZATCA QR Code & Registration */}
            <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-4 text-left">
              {/* QR Code Container */}
              <div className="p-2 border-2 border-slate-900 rounded-xl bg-white flex flex-col items-center shadow-sm">
                {/* SVG Visual QR Simulation */}
                <div className="w-24 h-24 bg-slate-900 p-1.5 rounded-lg flex items-center justify-center text-white relative">
                  <QrCode className="w-full h-full text-white" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-amber-400 rounded-md flex items-center justify-center text-[8px] font-black text-slate-950">
                      LM
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-slate-600 mt-1">ZATCA e-Invoice</span>
              </div>

              <div className="text-[11px] text-slate-700 space-y-0.5 text-right sm:text-left">
                <div>
                  <span className="text-slate-500">سجل تجاري: </span>
                  <span className="font-mono font-bold text-slate-900">{COMPANY_BILLING_INFO.commercialReg}</span>
                </div>
                <div>
                  <span className="text-slate-500">الرقم الضريبي: </span>
                  <span className="font-mono font-bold text-slate-900">{COMPANY_BILLING_INFO.vatNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Title & Meta Bar */}
          <div className="mt-6 bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                {isSales ? 'فاتورة ضريبية / مستخلص مبيعات هندسية' : 'فاتورة شراء وتوريد مواد'}
              </span>
              <h2 className="text-lg font-black text-slate-900 font-mono mt-1">
                {invoice.invoiceNumber}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">تاريخ الإصدار</span>
                <span className="font-mono font-bold text-slate-900">{invoice.date}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">تاريخ الاستحقاق</span>
                <span className="font-mono font-bold text-slate-900">{invoice.dueDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">مرجع العقد / التعميد</span>
                <span className="font-mono font-bold text-slate-900">{invoice.contractRef || 'CONT-DIRECT'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">حالة السداد</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    invoice.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : invoice.status === 'partially_paid'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {invoice.status === 'paid' && 'مدفوعة بالكامل'}
                  {invoice.status === 'partially_paid' && 'مسددة جزئياً'}
                  {invoice.status === 'pending' && 'معلقة / غير مسددة'}
                  {invoice.status === 'cancelled' && 'ملغاة'}
                </span>
              </div>
            </div>
          </div>

          {/* Client & Project Info */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {isSales ? 'بيانات العميل المستفيد' : 'بيانات المورد / المقاول'}
              </span>
              <p className="text-sm font-black text-slate-900">{invoice.clientName}</p>
              {invoice.clientAddress && (
                <p className="text-slate-600 text-[11px]">{invoice.clientAddress}</p>
              )}
              {invoice.clientVatNumber && (
                <p className="text-slate-600 text-[11px] font-mono">
                  الرقم الضريبي للعميل: {invoice.clientVatNumber}
                </p>
              )}
              {invoice.clientPhone && (
                <p className="text-slate-600 text-[11px] font-mono">
                  هاتف التواصل: {invoice.clientPhone}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:text-left">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                المشروع المعماري المنفذ
              </span>
              <p className="text-sm font-black text-slate-900">{invoice.projectName || 'مشروع هندسي عام'}</p>
              <p className="text-slate-600 text-[11px]">موقع المشروع: مدينة الرياض - نطاق لمسات المعمار</p>
              <p className="text-slate-600 text-[11px]">المدير العام: {userProfiles.super_admin?.nameAr || 'صادق جعفر'}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-300">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-4">وصف البند والعمل المعماري / المواد</th>
                  <th className="py-2.5 px-3 text-center">الوحدة</th>
                  <th className="py-2.5 px-3 text-center">الكمية</th>
                  <th className="py-2.5 px-4 text-center">سعر المفرد</th>
                  <th className="py-2.5 px-4 text-left">الإجمالي (د.ع)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.description}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-600">{item.unit}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {item.quantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-800">
                      {formatSAR(item.unitPrice, false)}
                    </td>
                    <td className="py-3 px-4 text-left font-mono font-bold text-slate-900">
                      {formatSAR(item.total, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Tafqeet Callout */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            {/* Left: Tafqeet & Payment Info */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                  المبلغ الصافي كتابةً وتفقيطاً:
                </span>
                <p className="font-bold text-amber-950 text-sm leading-relaxed">
                  {tafqeetSAR(invoice.grandTotal)}
                </p>
              </div>

              {/* Payment Bank Details */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] space-y-1.5">
                <span className="font-bold text-slate-800 block">الحسابات البنكية المعتمدة للتحويل:</span>
                {COMPANY_BILLING_INFO.bankDetails.map((b, i) => (
                  <div key={i} className="flex justify-between items-center text-slate-700 font-mono">
                    <span>{b.bankName}:</span>
                    <span className="font-bold text-slate-900">{b.iban}</span>
                  </div>
                ))}
              </div>

              {invoice.paymentTerms && (
                <div className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-800">شروط الدفع والتعاقد: </span>
                  <span>{invoice.paymentTerms}</span>
                </div>
              )}
            </div>

            {/* Right: Detailed Summary Calculation */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي الخاضع للضريبة:</span>
                <span className="font-bold text-slate-900">{formatSAR(invoice.subtotal)}</span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>الخصم الممنوح ({invoice.discountPercent}%):</span>
                  <span className="font-bold">-{formatSAR(invoice.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>ضريبة القيمة المضافة ({invoice.taxRate}%):</span>
                <span className="font-bold text-slate-900">+{formatSAR(invoice.taxAmount)}</span>
              </div>

              <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-sm font-black text-slate-950">
                <span>الصافي الإجمالي النهائي:</span>
                <span className="text-base text-amber-600">{formatSAR(invoice.grandTotal)}</span>
              </div>

              {invoice.paidAmount > 0 && (
                <div className="pt-2 border-t border-slate-200 flex justify-between text-emerald-700 text-xs">
                  <span>المبلغ المسدد حتى تاريخه:</span>
                  <span className="font-bold">{formatSAR(invoice.paidAmount)}</span>
                </div>
              )}

              {invoice.remainingAmount > 0 && (
                <div className="flex justify-between text-rose-700 text-xs font-bold">
                  <span>المبلغ المتبقي المطلوب سداده:</span>
                  <span>{formatSAR(invoice.remainingAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Official Signatures & Digital Seal */}
          <div className="mt-10 pt-6 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700">المحاسب المالي المعتمد</p>
              <div className="mt-8 pt-1 border-t border-slate-300 font-semibold text-slate-900">
                {invoice.createdBy}
              </div>
            </div>

            {/* Company Digital Stamp */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-600/70 p-1 flex items-center justify-center text-center text-amber-700 font-bold text-[9px] uppercase tracking-tighter rotate-[-6deg]">
                <div className="w-full h-full rounded-full border border-amber-600 flex flex-col items-center justify-center p-1">
                  <span>شركة لمسات المعمار</span>
                  <span className="text-[8px] text-slate-900">إدارة العقود</span>
                  <span className="text-[7px]">معتمد رسمياً</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">الختم الرقمي الموحد</span>
            </div>

            <div>
              <p className="font-bold text-slate-700">مدير الحسابات والمالية</p>
              <div className="mt-8 pt-1 border-t border-slate-300 font-semibold text-slate-900">
                {userProfiles.accountant?.nameAr || 'حسين احمد'}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-600/70 p-1 flex items-center justify-center text-center text-amber-700 font-bold text-[9px] uppercase tracking-tighter rotate-[-6deg]">
                <div className="w-full h-full rounded-full border border-amber-600 flex flex-col items-center justify-center p-1">
                  <span>شركة لمسات المعمار</span>
                  <span className="text-[8px] text-slate-900">إدارة العقود</span>
                  <span className="text-[7px]">معتمد رسمياً</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-mono">الختم الرقمي الموحد</span>
            </div>

            <div>
              <p className="font-bold text-slate-700">المدير العام والاعتماد الهندسي</p>
              <div className="mt-8 pt-1 border-t border-slate-300 font-semibold text-slate-900">
                {userProfiles.super_admin?.nameAr || 'صادق جعفر'}
              </div>
            </div>
          </div>

          {/* Footer Notice & Credit */}
          <div className="mt-8 border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-2">
            <span>تم إصدار هذه الوثيقة إلكترونياً من نظام لمسات المعمار وتعد ملزمة نظامياً وفق أنظمة وزارة التجارة والضريبة.</span>
            <span className="font-medium text-amber-600">تمت برمجة وتطوير النظام بواسطة - شركة فن التقنية الحديثة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
