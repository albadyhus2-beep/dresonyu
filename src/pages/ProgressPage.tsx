import React from 'react';
import { Award, Flame, Zap, Clock, Layers, HelpCircle, CheckCircle2, Trophy, Star } from 'lucide-react';
import { UserProfile } from '../types';

interface ProgressPageProps {
  profile: UserProfile | null;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ profile }) => {
  const currentXp = profile?.xp || 340;
  const currentLevel = profile?.level || 2;
  const nextLevelXp = currentLevel * 250;
  const levelProgress = Math.min(100, Math.round(((currentXp % 250) / 250) * 100));

  const badges = [
    {
      id: 'first_upload',
      title: 'أول خطوة 🚀',
      desc: 'قمت برفع أول ملزمة دراسية وحللتها بالكامل',
      unlocked: true,
      icon: Trophy
    },
    {
      id: 'streak_3',
      title: 'التزام ناري 🔥',
      desc: 'حافظت على سلسلة دراسة لأكثر من 3 أيام متتالية',
      unlocked: (profile?.streak || 0) >= 3,
      icon: Flame
    },
    {
      id: 'srs_master',
      title: 'عبقري الـ SRS 🧠',
      desc: 'أتقنت أكثر من 20 بطاقة تعليمية في نظام التكرار المتباعد',
      unlocked: (profile?.flashcardsMasteredCount || 0) >= 20,
      icon: Layers
    },
    {
      id: 'quiz_master',
      title: 'صائد الامتحانات 💯',
      desc: 'حققت نسبة تفوق 80% في اختبارات الـ Quiz الأكاديمية',
      unlocked: (profile?.quizzesTakenCount || 0) >= 1,
      icon: Star
    },
    {
      id: 'focus_hero',
      title: 'بطل التركيز ⏱️',
      desc: 'أكملت جلسة مؤقت بومودورو لدراسة 25 دقيقة بدون تشتت',
      unlocked: (profile?.totalStudyMinutes || 0) >= 25,
      icon: Clock
    },
    {
      id: 'night_owl',
      title: 'منقذ ليلة الامتحان 🦉',
      desc: 'استخدمت ورقة الإنقاذ ومراجعة ما عندي وقت قبل الامتحان',
      unlocked: true,
      icon: Award
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-violet-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>نظام التقدم والمكافآت</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            المستوى {currentLevel}: طالب متميز
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-lg leading-relaxed">
            كل دقيقة تدرسها، كل بطاقة تراجعها، وكل Quiz تكمله يضيف لك نقاط XP ويرفع مستواك الأكاديمي!
          </p>
        </div>

        {/* Level Radial / Gauge Box */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 shrink-0 text-center w-full md:w-56">
          <div className="text-xs text-indigo-200 font-semibold mb-1">المستوى التالي (Lvl {currentLevel + 1})</div>
          <div className="text-2xl font-bold font-mono">{currentXp} / {nextLevelXp} XP</div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
          </div>
          <div className="text-[10px] text-indigo-200 mt-1.5">باقي {nextLevelXp - currentXp} XP للترقية</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">سلسلة الأيام</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500">{profile?.streak || 4} أيام</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">دقائق الدراسة</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{profile?.totalStudyMinutes || 65} د</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">اختبارات منجزة</span>
            <HelpCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{profile?.quizzesTakenCount || 3}</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">بطاقات SRS</span>
            <Layers className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{profile?.flashcardsMasteredCount || 24}</div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">الأوسمة والإنجازات (Badges)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all ${
                  b.unlocked
                    ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 opacity-50 bg-slate-50 dark:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    b.unlocked ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{b.title}</h3>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {b.unlocked ? 'تم الفتح ✓' : 'قيد الإنجاز'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
