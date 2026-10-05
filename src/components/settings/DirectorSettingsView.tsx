import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { UserRole } from '../../types/erp';
import { ROLES_CONFIG } from '../../services/dataService';
import {
  ShieldCheck,
  KeyRound,
  User,
  Users,
  HardHat,
  Lock,
  Save,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  Cpu,
  BadgeCheck,
  Building2,
  Trash2,
  RotateCcw
} from 'lucide-react';

export const DirectorSettingsView: React.FC = () => {
  const {
    currentRole,
    currentUser,
    userProfiles,
    activeUserRoles,
    updateUserProfile,
    updateRolePin,
    deleteUserAccount,
    restoreUserAccount,
    showNotification
  } = useErp();

  // Role edit forms local state
  const [editingRole, setEditingRole] = useState<UserRole>(currentRole);
  const [formNames, setFormNames] = useState<Record<UserRole, string>>({
    super_admin: userProfiles.super_admin?.nameAr || 'المدير العام',
    accountant: userProfiles.accountant?.nameAr || 'المحاسب المالي',
    data_entry: userProfiles.data_entry?.nameAr || 'مسؤول الموقع'
  });

  const [formTitles, setFormTitles] = useState<Record<UserRole, string>>({
    super_admin: userProfiles.super_admin?.title || 'المدير العام والمؤسس',
    accountant: userProfiles.accountant?.title || 'مدير الحسابات والمالية',
    data_entry: userProfiles.data_entry?.title || 'مهندس الموقع ومسؤول تشغيل الآليات'
  });

  const [formPins, setFormPins] = useState<Record<UserRole, string>>({
    super_admin: '',
    accountant: '',
    data_entry: ''
  });
  const [currentPin, setCurrentPin] = useState('');
  const [pendingDeleteRole, setPendingDeleteRole] = useState<UserRole | null>(null);

  const [showPins, setShowPins] = useState<Record<UserRole, boolean>>({
    super_admin: false,
    accountant: false,
    data_entry: false
  });

  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const isSuperAdmin = currentRole === 'super_admin';

  const handleSaveRole = (role: UserRole) => {
    setErrorMsg('');
    setSuccessMsg('');

    const newName = formNames[role]?.trim();
    const newTitle = formTitles[role]?.trim();
    const newPin = formPins[role]?.trim();

    if (!newName) {
      setErrorMsg('لا يمكن ترك اسم المستخدم فارغاً');
      return;
    }

    if (newPin && newPin.length < 4) {
      setErrorMsg('يجب أن تتكون كلمة السر الجديدة من 4 خانات على الأقل');
      return;
    }

    // Validate the current password before applying any profile change.
    if (newPin) {
      const pinRes = updateRolePin(role, isSuperAdmin ? '' : currentPin, newPin);
      if (!pinRes.success) {
        setErrorMsg(pinRes.message);
        return;
      }
    }

    const nameRes = updateUserProfile(role, newName, newTitle);
    if (!nameRes.success) {
      setErrorMsg(nameRes.message);
      return;
    }

    setFormPins((prev) => ({ ...prev, [role]: '' }));
    setCurrentPin('');
    setSuccessMsg(`تم بنجاح تحديث بيانات الحساب [${ROLES_CONFIG[role].nameAr}]`);
    showNotification(
      'تم حفظ التعديلات',
      `تم تحديث الاسم إلى (${newName})${newPin ? ' وكلمة السر' : ''} بنجاح.`,
      'success'
    );
  };

  const allRolesConfigList: {
    id: UserRole;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    { id: 'super_admin', icon: ShieldCheck, color: 'amber' },
    { id: 'accountant', icon: Users, color: 'emerald' },
    { id: 'data_entry', icon: HardHat, color: 'sky' }
  ];
  const rolesConfigList = isSuperAdmin
    ? allRolesConfigList
    : allRolesConfigList.filter((role) => role.id === currentRole);

  const handleDeleteRole = (role: UserRole) => {
    if (pendingDeleteRole !== role) {
      setPendingDeleteRole(role);
      setErrorMsg('اضغط زر الحذف مرة ثانية لتأكيد حذف الحساب من شاشة الدخول.');
      return;
    }
    const result = deleteUserAccount(role);
    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }
    setPendingDeleteRole(null);
    setSuccessMsg(result.message);
  };

  return (
    <div className="space-y-6 text-right animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1424] via-slate-900 to-[#121024] p-6 sm:p-8 border border-amber-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                إعدادات الحسابات
              </span>
              <span className="text-xs text-slate-400">· إدارة محلية للحسابات</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              إدارة الاسم وكلمة السر وحالة الحساب
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isSuperAdmin
                ? 'يمكنك تعديل حسابات النظام أو تعطيلها، مع بقاء حساب المدير العام محمياً من الحذف.'
                : 'يمكنك تعديل اسمك ومسمّاك وكلمة سر حسابك، أو حذف حسابك من شاشة الدخول.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg">
              {currentUser.avatarLetter}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">{currentUser.nameAr}</span>
              <span className="text-[11px] text-amber-400">{currentUser.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 shadow-lg">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      {/* Role Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rolesConfigList.map(({ id, icon: Icon, color }) => {
          const isSelected = editingRole === id;
          const currentProfile = userProfiles[id];
          const config = ROLES_CONFIG[id];
          const isActive = activeUserRoles.includes(id);

          return (
            <button
              key={id}
              onClick={() => {
                setEditingRole(id);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-3.5 cursor-pointer ${
                isSelected
                  ? color === 'amber'
                    ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                    : color === 'emerald'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg'
                    : 'bg-sky-500/15 border-sky-500 ring-2 ring-sky-500/30 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                  isSelected
                    ? color === 'amber'
                      ? 'bg-amber-500 text-slate-950'
                      : color === 'emerald'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-sky-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate">
                  {currentProfile?.nameAr}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {isActive ? config.nameAr.split('(')[0] : 'حساب محذوف'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Role Edit Card */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <span>تعديل بيانات وكلمة سر: {ROLES_CONFIG[editingRole].nameAr}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              قم بتعديل الاسم الظاهر في المستندات والفواتير وكلمة المرور الخاصة بهذا الحساب.
            </p>
          </div>
          <span className={`px-3 py-1 rounded-xl border text-xs font-bold ${activeUserRoles.includes(editingRole) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
            {activeUserRoles.includes(editingRole) ? 'الحساب نشط' : 'الحساب محذوف'}
          </span>
        </div>

        {!activeUserRoles.includes(editingRole) ? (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
            <p className="text-sm text-slate-300">هذا الحساب غير ظاهر في شاشة الدخول.</p>
            <button
              type="button"
              onClick={() => {
                const result = restoreUserAccount(editingRole);
                result.success ? setSuccessMsg(result.message) : setErrorMsg(result.message);
              }}
              className="mx-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> إعادة تفعيل الحساب
            </button>
          </div>
        ) : (
        <>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              الاسم الكامل لصاحب الحساب:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formNames[editingRole]}
                onChange={(e) =>
                  setFormNames({ ...formNames, [editingRole]: e.target.value })
                }
                placeholder="أدخل الاسم الكامل"
                className="w-full p-3.5 pr-10 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-amber-400 transition-colors"
              />
              <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400">
              * هذا الاسم سيظهر في تذييل الفواتير، سندات الصرف، وسجلات التدقيق الرسمية.
            </p>
          </div>

          {/* Title Field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              المسمى الوظيفي:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formTitles[editingRole]}
                onChange={(e) =>
                  setFormTitles({ ...formTitles, [editingRole]: e.target.value })
                }
                placeholder="أدخل المسمى الوظيفي"
                className="w-full p-3.5 pr-10 rounded-2xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-amber-400 transition-colors"
              />
              <BadgeCheck className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400">
              * المسمى الوظيفي والصفة القانونية في الشركة.
            </p>
          </div>

          {/* Password / PIN Field */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-bold text-slate-300">
              كلمة سر جديدة (اتركها فارغة إذا لا تريد تغييرها):
            </label>
            <div className="relative max-w-md">
              <input
                type={showPins[editingRole] ? 'text' : 'password'}
                value={formPins[editingRole]}
                onChange={(e) =>
                  setFormPins({ ...formPins, [editingRole]: e.target.value })
                }
                placeholder="أدخل 4 خانات على الأقل"
                className="w-full p-3.5 pr-10 pl-10 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-base outline-none focus:border-amber-400 transition-colors"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() =>
                  setShowPins({ ...showPins, [editingRole]: !showPins[editingRole] })
                }
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                {showPins[editingRole] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              * لن يعرض النظام كلمة السر الحالية. تُستخدم الكلمة الجديدة عند تسجيل الدخول التالي.
            </p>
          </div>

          {!isSuperAdmin && (
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-slate-300">كلمة السر الحالية لتأكيد التغيير:</label>
              <input
                type="password"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                className="w-full max-w-md p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {editingRole !== 'super_admin' && (
            <button
              type="button"
              onClick={() => handleDeleteRole(editingRole)}
              className="py-3 px-5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{pendingDeleteRole === editingRole ? 'تأكيد حذف الحساب' : 'حذف الحساب'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSaveRole(editingRole)}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ بيانات وكلمة سر {ROLES_CONFIG[editingRole].nameAr.split('(')[0]}</span>
          </button>
        </div>
        </>
        )}
      </div>

      {/* Developer and Technical Partner Credit Card */}
      <div className="rounded-3xl bg-slate-950/70 border border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white block">
              نظام إدارة المقاولات والرقابة المؤسسية (ERP Pro)
            </span>
            <span className="text-slate-400">
              تمت برمجة وتطوير النظام بواسطة -{' '}
              <strong className="text-amber-400 font-bold">شركة فن التقنية الحديثة</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>ترخيص حصري ومشفر لشركة لمسات المعمار</span>
        </div>
      </div>
    </div>
  );
};
