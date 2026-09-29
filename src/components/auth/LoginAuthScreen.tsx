import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { UserRole } from '../../types/erp';
import { USER_PROFILES, ROLES_CONFIG } from '../../services/dataService';
import { ArchitecturalLogo } from '../common/ArchitecturalLogo';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Users,
  HardHat,
  ArrowRight,
  AlertTriangle,
  Info
} from 'lucide-react';

export const LoginAuthScreen: React.FC = () => {
  const { loginWithPin, userProfiles } = useErp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const roles: { id: UserRole; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: 'super_admin', icon: ShieldCheck, color: 'amber' },
    { id: 'accountant', icon: Users, color: 'emerald' },
    { id: 'data_entry', icon: HardHat, color: 'sky' }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pin.trim()) {
      setErrorMsg('يرجى إدخال الرمز السري (PIN) للمتابعة');
      return;
    }

    setIsSubmitting(true);
    const res = loginWithPin(selectedRole, pin);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message);
      setPin('');
    }
  };

  const handleKeypadPress = (val: string) => {
    setErrorMsg('');
    if (val === 'C') {
      setPin('');
    } else if (val === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      if (pin.length < 8) {
        setPin((prev) => prev + val);
      }
    }
  };

  const activeProfile = userProfiles[selectedRole] || USER_PROFILES[selectedRole];
  const activeConfig = ROLES_CONFIG[selectedRole];

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Minimal */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-slate-800/80 bg-[#090e1a]/80 backdrop-blur-xl relative z-10">
        <ArchitecturalLogo size="md" />
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-slate-400">بوابة الدخول المشفرة · 2026</span>
        </div>
      </header>

      {/* Main Login Card Viewport */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-right space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-1">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              تسجيل الدخول ومصادقة المستخدم
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              اختر الحساب المعني وأدخل الرمز السري (PIN) للتحقق من هويتك وتطبيق صلاحياتك الحصرية.
            </p>
          </div>

          {/* Account Selector Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              1. اختر حساب المستخدم:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {roles.map(({ id, icon: Icon, color }) => {
                const profile = userProfiles[id] || USER_PROFILES[id];
                const config = ROLES_CONFIG[id];
                const isSelected = selectedRole === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSelectedRole(id);
                      setPin('');
                      setErrorMsg('');
                    }}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? color === 'amber'
                          ? 'border-amber-500 bg-amber-500/15 text-white ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                          : color === 'emerald'
                          ? 'border-emerald-500 bg-emerald-500/15 text-white ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10'
                          : 'border-sky-500 bg-sky-500/15 text-white ring-2 ring-sky-500/40 shadow-lg shadow-sky-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 font-bold ${
                        isSelected
                          ? color === 'amber'
                            ? 'bg-amber-500 text-slate-950'
                            : color === 'emerald'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-sky-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold block">{profile.nameAr.split('(')[0]}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{config.nameAr.split('(')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Account Details */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                {activeProfile.avatarLetter}
              </div>
              <div>
                <span className="font-bold text-white block">{activeProfile.nameAr}</span>
                <span className="text-[11px] text-slate-400">{activeProfile.title}</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-amber-400 border border-slate-700">
              {activeConfig.nameAr}
            </span>
          </div>

          {/* PIN Entry Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  2. أدخل الرمز السري الخاص بك (PIN):
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPin ? 'إخفاء الرمز' : 'إظهار الرمز'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => {
                    setErrorMsg('');
                    setPin(e.target.value);
                  }}
                  placeholder="••••"
                  autoFocus
                  maxLength={10}
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 px-4 rounded-2xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none text-white transition-all"
                />
                <KeyRound className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {errorMsg && (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Quick Touch Keypad for Mobile or Touch Screens */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeypadPress(key === '⌫' ? 'backspace' : key)}
                  className={`py-2.5 rounded-xl text-base font-mono font-bold transition-all cursor-pointer ${
                    key === 'C'
                      ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30'
                      : key === '⌫'
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      : 'bg-slate-950/70 hover:bg-slate-800 text-white border border-slate-800 active:scale-95'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !pin}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>دخول آمن للنظام</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security Notice - No PIN hints displayed */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white block">ملاحظة أمنية:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                هذا النظام محمي بنظام التشفير وصلاحيات الوصول المعتمدة. يتم تعيين وإدارة الرموز السرية وصلاحيات الموظفين حصراً من قِبل المدير العام ({userProfiles.super_admin?.nameAr || 'صادق جعفر'}).
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer System Info */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900 bg-[#060a12] relative z-10 flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto w-full gap-2">
        <span>شركة لمسات المعمار للمقاولات والاستشارات الهندسية · 2026</span>
        <span className="text-amber-400/90 font-medium">
          تمت برمجة وتطوير النظام بواسطة - شركة فن التقنية الحديثة
        </span>
      </footer>
    </div>
  );
};
