import React, { useState } from 'react';
import { User, Settings, Save, Check, Shield, Sun, Moon, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface SettingsPageProps {
  profile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  onProfileUpdated,
  theme,
  onToggleTheme
}) => {
  const [name, setName] = useState(profile?.name || '');
  const [specialization, setSpecialization] = useState(profile?.specialization || 'Medicine');
  const [academicLevel, setAcademicLevel] = useState(profile?.academicLevel || 'المرحلة الثالثة');
  const [dialect, setDialect] = useState(profile?.dialect || 'iraqi');
  const [explanationLevel, setExplanationLevel] = useState(profile?.explanationLevel || 'medium');
  const [explanationStyle, setExplanationStyle] = useState(profile?.explanationStyle || 'tutor');
  const [keepEnglishTerms, setKeepEnglishTerms] = useState(profile?.keepEnglishTerms ?? true);
  const [useAnalogies, setUseAnalogies] = useState(profile?.useAnalogies ?? true);
  const [useEmojis, setUseEmojis] = useState(profile?.useEmojis ?? true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateProfile({
        name,
        specialization,
        academicLevel,
        dialect: dialect as any,
        explanationLevel: explanationLevel as any,
        explanationStyle: explanationStyle as any,
        keepEnglishTerms,
        useAnalogies,
        useEmojis
      });
      onProfileUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert('فشل في حفظ التعديلات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">إعدادات الحساب والتخصيص</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">تخصيص أسلوب الشرح واللهجة والتخصص الأكاديمي</p>
          </div>
        </div>

        {profile?.isGuest && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-bold">
            وضع الزائر (Guest)
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">البيانات الأكاديمية والشخصية</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الاسم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">التخصص الأكاديمي</label>
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المرحلة الدراسية</label>
              <input
                type="text"
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                placeholder="مثال: المرحلة الثالثة"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">اللهجة المفضلة للشرح</label>
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="iraqi">اللهجة العراقية (افتراضي مريح)</option>
                <option value="saudi">اللهجة الخليجية / السعودية</option>
                <option value="egyptian">اللهجة المصرية</option>
                <option value="fusha">اللغة العربية الفصحى الأكاديمية</option>
                <option value="english">English (Medical / Academic)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tutoring Style & Terminology */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">أسلوب التدريس والمصطلحات</h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">إبقاء المصطلحات العلمية باللغة الإنجليزية</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  حاسم لطلاب الطب والهندسة حتى لا تترجم أسماء الأمراض والأدوية حرفياً
                </div>
              </div>
              <input
                type="checkbox"
                checked={keepEnglishTerms}
                onChange={(e) => setKeepEnglishTerms(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">استخدام التشبيهات والأمثلة الواقعية</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  ربط المفاهيم المعقدة بأمثلة من الحياة اليومية لسهولة التذكر
                </div>
              </div>
              <input
                type="checkbox"
                checked={useAnalogies}
                onChange={(e) => setUseAnalogies(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">التفاعل بالرموز التعبيرية (Emojis)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  جعل الشرح حيوي وممتع بدون ملل
                </div>
              </div>
              <input
                type="checkbox"
                checked={useEmojis}
                onChange={(e) => setUseEmojis(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
            </label>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">مظهر التطبيق (Theme)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">التبديل بين النمط الفاتح والمظلم لحماية العين</p>
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-2"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>النمط المظلم (Dark)</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span>النمط الفاتح (Light)</span>
              </>
            )}
          </button>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>تم حفظ التعديلات بنجاح!</span>
            </span>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'دا يحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
