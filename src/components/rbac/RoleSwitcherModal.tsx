import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { UserRole } from '../../types/erp';
import { ROLES_CONFIG, USER_PROFILES } from '../../services/dataService';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Lock,
  ArrowRight,
  KeyRound,
  AlertTriangle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

export const RoleSwitcherModal: React.FC = () => {
  const {
    currentRole,
    currentUser,
    switchRoleWithPin,
    updateRolePin,
    userPins,
    userProfiles,
    setCurrentTab,
    isRoleModalOpen,
    setIsRoleModalOpen
  } = useErp();

  const [targetRoleForPin, setTargetRoleForPin] = useState<UserRole | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [showPinManagement, setShowPinManagement] = useState<boolean>(false);

  // States for PIN management (for Super Admin)
  const [selectedRoleToUpdate, setSelectedRoleToUpdate] = useState<UserRole>('accountant');
  const [newPinValue, setNewPinValue] = useState<string>('');
  const [pinUpdateSuccess, setPinUpdateSuccess] = useState<string>('');
  const [showPinText, setShowPinText] = useState<boolean>(false);

  if (!isRoleModalOpen) return null;

  const rolesList: UserRole[] = ['super_admin', 'accountant', 'data_entry'];

  const permissionItems = [
    { key: 'canViewFinancialReports', label: 'الاطلاع على التقارير والقوائم المالية' },
    { key: 'canViewConfidentialMargins', label: 'كشف هوامش أرباح الشركة السرية للمشاريع' },
    { key: 'canCreateInvoice', label: 'إنشاء الفواتير والمستخلصات وسندات الصرف' },
    { key: 'canApproveSubcontractorPayment', label: 'اعتماد مستخلصات مقاولي الباطن والتحويل' },
    { key: 'canDeleteRecords', label: 'حذف السجلات المالية نهائياً (الحماية من التلاعب)' },
    { key: 'canLogDailySiteOperations', label: 'تسجيل يوميات الموقع واستهلاك وقود الآليات' },
    { key: 'canManageLicense', label: 'إدارة وتفعيل مفتاح ترخيص النظام الرقمي' },
    { key: 'canAccessAuditLogs', label: 'مراجعة سجلات التدقيق الأمني ومحاولات الاختراق' },
    { key: 'canExportData', label: 'تصدير البيانات والمستخلصات بصيغ Excel/PDF' }
  ] as const;

  const handleStartSwitch = (roleId: UserRole) => {
    setPinError('');
    setPinInput('');
    setTargetRoleForPin(roleId);
  };

  const handleConfirmPinSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoleForPin) return;

    if (!pinInput.trim()) {
      setPinError('يرجى إدخال الرمز السري (PIN) لهذا الحساب');
      return;
    }

    const res = switchRoleWithPin(targetRoleForPin, pinInput);
    if (res.success) {
      setTargetRoleForPin(null);
      setPinInput('');
      setIsRoleModalOpen(false);
    } else {
      setPinError(res.message);
      setPinInput('');
    }
  };

  const handleUpdatePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinUpdateSuccess('');
    setPinError('');

    if (newPinValue.trim().length < 4) {
      setPinError('يجب أن يتكون الرمز الجديد من 4 أرقام على الأقل');
      return;
    }

    const res = updateRolePin(selectedRoleToUpdate, userPins[selectedRoleToUpdate], newPinValue);
    if (res.success) {
      setPinUpdateSuccess(`تم تغيير الرمز السري لحساب ${ROLES_CONFIG[selectedRoleToUpdate].nameAr} بنجاح إلى: ${newPinValue}`);
      setNewPinValue('');
    } else {
      setPinError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-bold text-white">
                إدارة الحسابات وصلاحيات الوصول المحمية (Protected RBAC)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              النظام محمي بالكامل: لا يمكن لأي مستخدم استبدال دوره أو الدخول لحساب آخر دون إدخال الرمز السري (PIN) المخصص لذلك الحساب.
            </p>
          </div>
          <button
            onClick={() => {
              setTargetRoleForPin(null);
              setIsRoleModalOpen(false);
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Controls & PIN Management Toggle for Super Admin */}
        {currentRole === 'super_admin' && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-200">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-white block">بصفتك المدير العام:</span>
                <span>يمكنك تعيين وتغيير الرموز السرية (PINs) لكافة الموظفين والمحاسبين لمنع أي وصول غير مصرح به.</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setCurrentTab('settings');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-amber-300 font-bold hover:bg-slate-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer border border-amber-500/30"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>لوحة إعدادات الأسماء وكلمات السر</span>
              </button>
              <button
                onClick={() => setShowPinManagement(!showPinManagement)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{showPinManagement ? 'إغلاق' : 'تغيير سريع للرمز'}</span>
              </button>
            </div>
          </div>
        )}

        {/* PIN Management Drawer for Super Admin */}
        {showPinManagement && currentRole === 'super_admin' && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-4">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              تعديل الرمز السري لأحد الحسابات:
            </h4>

            {pinUpdateSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
                {pinUpdateSuccess}
              </div>
            )}

            <form onSubmit={handleUpdatePinSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 text-xs mb-1">الحساب المستهدف:</label>
                <select
                  value={selectedRoleToUpdate}
                  onChange={(e) => setSelectedRoleToUpdate(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                >
                  <option value="super_admin">المدير العام ({userProfiles.super_admin?.nameAr || 'صادق جعفر'})</option>
                  <option value="accountant">مدير الحسابات ({userProfiles.accountant?.nameAr || 'حسين أحمد'})</option>
                  <option value="data_entry">مدخل البيانات ({userProfiles.data_entry?.nameAr || 'مسؤول الموقع'})</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs mb-1">الرمز السري الجديد (PIN):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 5544"
                  value={newPinValue}
                  onChange={(e) => setNewPinValue(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono text-center outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  حفظ وتأمين الرمز
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>الرموز الحالية المشفرة في النظام:</span>
              <span className="font-mono text-amber-400">
                المدير: {userPins.super_admin} · المحاسب: {userPins.accountant} · الموقع: {userPins.data_entry}
              </span>
            </div>
          </div>
        )}

        {/* Roles 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {rolesList.map((roleId) => {
            const config = ROLES_CONFIG[roleId];
            const user = userProfiles[roleId] || USER_PROFILES[roleId];
            const isCurrent = currentRole === roleId;
            const isTarget = targetRoleForPin === roleId;

            return (
              <div
                key={roleId}
                className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  isCurrent
                    ? 'border-amber-500/60 bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 shadow-xl shadow-amber-500/10'
                    : isTarget
                    ? 'border-sky-500 bg-slate-900 shadow-xl'
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                {/* Badge if current */}
                {isCurrent && (
                  <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center gap-1 shadow-md">
                    <Sparkles className="w-3 h-3" />
                    حسابك النشط حالياً
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400">
                      {user.avatarLetter}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{config.nameAr.split('(')[0]}</h4>
                      <span className="text-[11px] text-amber-400/90 font-medium block">
                        {user.nameAr}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed min-h-[48px]">
                    {config.descriptionAr}
                  </p>

                  {/* Permissions Summary Badges */}
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">تعديل التراخيص والأمان:</span>
                      {config.canManageLicense ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> متاح
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> محظور
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">حذف السجلات المالية:</span>
                      {config.canDeleteRecords ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> متاح
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> محظور
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">يوميات وآليات الموقع:</span>
                      {config.canLogDailySiteOperations ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> متاح
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> محظور
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="mt-5">
                  {isCurrent ? (
                    <div className="py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      أنت مسجل بهذا الحساب
                    </div>
                  ) : isTarget ? (
                    /* PIN Verification Form Inline */
                    <form onSubmit={handleConfirmPinSwitch} className="p-3 rounded-xl bg-slate-950 border border-sky-500/60 space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-[11px] text-sky-300 font-bold">
                        <span>أدخل PIN حساب {config.nameAr.split('(')[0]}:</span>
                        <button
                          type="button"
                          onClick={() => setTargetRoleForPin(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          إلغاء
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showPinText ? 'text' : 'password'}
                          required
                          autoFocus
                          value={pinInput}
                          onChange={(e) => {
                            setPinError('');
                            setPinInput(e.target.value);
                          }}
                          placeholder="الرمز السري PIN"
                          className="w-full text-center font-mono py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-sky-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPinText(!showPinText)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        >
                          {showPinText ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>

                      {pinError && (
                        <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>{pinError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>تحقق وتفعيل الحساب</span>
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => handleStartSwitch(roleId)}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white shadow-md cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>تبديل الحساب (يتطلب PIN)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Comparative RBAC Matrix Table */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <h4 className="text-sm font-bold text-white mb-3">
            مصفوفة الصلاحيات المقارنة (Role-Based Access Control Matrix)
          </h4>
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                  <th className="p-3.5 font-semibold">الصلاحية / الوظيفة</th>
                  <th className="p-3.5 font-semibold text-center text-amber-400">المدير العام</th>
                  <th className="p-3.5 font-semibold text-center text-emerald-400">المحاسب المالي</th>
                  <th className="p-3.5 font-semibold text-center text-sky-400">مدخل البيانات / الموقع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {permissionItems.map((perm) => (
                  <tr key={perm.key} className="hover:bg-slate-800/20">
                    <td className="p-3 font-medium text-slate-200">{perm.label}</td>
                    <td className="p-3 text-center">
                      {ROLES_CONFIG.super_admin[perm.key] ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/10 text-rose-400">
                          <XCircle className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {ROLES_CONFIG.accountant[perm.key] ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/10 text-rose-400">
                          <XCircle className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {ROLES_CONFIG.data_entry[perm.key] ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/10 text-rose-400">
                          <XCircle className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
