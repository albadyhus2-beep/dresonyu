import React, { useState } from 'react';
import { BookOpen, Mail, Lock, User, ArrowRight, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface AuthPageProps {
  onSuccess: (profile: UserProfile) => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('Medicine');
  const [academicLevel, setAcademicLevel] = useState('المرحلة الثالثة - كلية الطب');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const profile = await api.updateProfile({
          email: email || 'student@darrasni.iq',
          isGuest: false
        });
        onSuccess(profile);
      } else {
        const profile = await api.updateProfile({
          name: name || 'طالب دَرّسني',
          email: email || 'student@darrasni.iq',
          specialization,
          academicLevel,
          isGuest: false
        });
        onSuccess(profile);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const profile = await api.updateProfile({
        name: 'زائر دَرّسني',
        email: 'guest@darrasni.iq',
        isGuest: true
      });
      onSuccess(profile);
    } catch (err) {
      setError('فشل الدخول كزائر');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للرئيسية</span>
        </button>

        {/* Brand Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mode === 'login' ? 'تسجيل الدخول إلى دَرّسني' : 'إنشاء حساب طالب جديد'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            "أرفع ملزمتك... وخلي الباقي علينا"
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800">
          {/* Mode Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all ${
                mode === 'login'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 pb-3 text-xs font-bold border-b-2 transition-all ${
                mode === 'register'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الكامل
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="علي أحمد"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    التخصص الدراسي
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Medicine">طب بشري (Medicine)</option>
                    <option value="Pharmacy">صيدلة (Pharmacy)</option>
                    <option value="Dentistry">طب أسنان (Dentistry)</option>
                    <option value="Engineering">هندسة (Engineering)</option>
                    <option value="Computer Science">علوم حاسوب / IT</option>
                    <option value="Science">علوم عامة (Biology / Chemistry)</option>
                    <option value="High School">سادس إعدادي / ثانوية</option>
                    <option value="Other">تخصص آخر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    المرحلة الدراسية
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: المرحلة الثالثة"
                    value={academicLevel}
                    onChange={(e) => setAcademicLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{mode === 'login' ? 'دخول إلى الحساب' : 'إكمال التسجيل'}</span>
            </button>
          </form>

          {/* Social or Guest Divider */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {/* Google Login Simulation */}
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>تسجيل الدخول بواسطة Google</span>
            </button>

            {/* Guest Mode with Clear Limitation Notice */}
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  وضع الزائر (Guest Mode)
                </span>
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  دخول فوري كزائر
                </button>
              </div>
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-normal">
                في وضع الزائر، يتم تخزين بياناتك وملازمك في متصفحك الحالي فقط (حتى ملزمتين). لتزامن دراستك عبر هاتفك ولابتوبك دائمًا، ننصح بالتسجيل.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
