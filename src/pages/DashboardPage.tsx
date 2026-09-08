import React from 'react';
import { 
  Upload, 
  Play, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  Clock, 
  Flame, 
  Zap, 
  BookOpen, 
  ArrowLeft, 
  ShieldAlert, 
  ChevronLeft,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { DocumentData, UserProfile } from '../types';

interface DashboardPageProps {
  profile: UserProfile | null;
  documents: DocumentData[];
  onOpenUpload: () => void;
  onSelectDoc: (doc: DocumentData, initialTab?: string) => void;
  onNavigate: (view: string) => void;
  onOpenTimer?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  profile,
  documents = [],
  onOpenUpload,
  onSelectDoc,
  onNavigate,
  onOpenTimer
}) => {
  // Identify the most recent document to study or resume
  const activeDoc = documents && documents.length > 0 ? documents[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{profile?.specialization || 'طالب دَرّسني'} • {profile?.academicLevel || 'سنة دراسية'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              هلا بيك، {profile?.name || 'يا بطل'}! جاهز لدراسة اليوم؟
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
              "أرفع ملزمتك... وخلي الباقي علينا." كل ما تحتاجه لفهم المحاضرات، حل الـ MCQs، وضمان ليلة الامتحان في مكان واحد.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>رفع ملزمة جديدة</span>
            </button>
            <button
              onClick={onOpenTimer}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-colors flex items-center gap-2 border border-white/15"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>مؤقت التركيز</span>
            </button>
          </div>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Resume Section (تكمل من وين وقفت؟) */}
      {activeDoc && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                    تكمل من وين وقفت؟
                  </span>
                  <span className="text-xs text-slate-400">
                    آخر دراسة: {new Date(activeDoc.lastStudiedAt || activeDoc.createdAt).toLocaleDateString('ar-IQ')}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                  {activeDoc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  وصلت إلى {activeDoc.progressPercent || 0}% • {activeDoc.topics?.length || 0} مواضيع مستخرجة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectDoc(activeDoc, 'study')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>كمل الدراسة</span>
              </button>
              <button
                onClick={() => onSelectDoc(activeDoc, 'quiz')}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                اختبرني الآن
              </button>
            </div>
          </div>

          {/* Mini progress line */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-4">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${activeDoc.progressPercent || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">وقت الدراسة الكلي</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {profile?.totalStudyMinutes || 65} <span className="text-xs font-normal text-slate-500">دقيقة</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">سلسلة الالتزام</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500">
            {profile?.streak || 4} <span className="text-xs font-normal text-slate-500">أيام متواصلة</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">المستوى الأكاديمي</span>
            <Zap className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            Lvl {profile?.level || 2} <span className="text-xs font-normal text-slate-500">({profile?.xp || 340} XP)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">البطاقات المتقنة</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {profile?.flashcardsMasteredCount || 24} <span className="text-xs font-normal text-slate-500">بطاقة SRS</span>
          </div>
        </div>
      </div>

      {/* Quick Access Function Hub */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
          ماذا تريد أن تفعل الآن؟
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => activeDoc && onSelectDoc(activeDoc, 'study')}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all text-right group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">اشرحلي</div>
            <div className="text-[10px] text-slate-400">شرح عراقي للملزمة</div>
          </button>

          <button
            onClick={() => activeDoc && onSelectDoc(activeDoc, 'quiz')}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all text-right group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">اختبرني (Quiz)</div>
            <div className="text-[10px] text-slate-400">MCQs مع تحليل الضعف</div>
          </button>

          <button
            onClick={() => activeDoc && onSelectDoc(activeDoc, 'flashcards')}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all text-right group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">بطاقات الاستذكار</div>
            <div className="text-[10px] text-slate-400">تكرار متباعد SRS</div>
          </button>

          <button
            onClick={() => activeDoc && onSelectDoc(activeDoc, 'cheatsheet')}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-500 transition-all text-right group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-rose-600 dark:text-rose-400">ورقة الإنقاذ</div>
            <div className="text-[10px] text-slate-400">High-Yield ليلة الامتحان</div>
          </button>

          <button
            onClick={() => activeDoc && onSelectDoc(activeDoc, 'examprep')}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all text-right group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">ما عندي وقت</div>
            <div className="text-[10px] text-slate-400">دراسة مكثفة في دقائق</div>
          </button>

          <button
            onClick={() => onNavigate('library')}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all text-right group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">مكتبة الملازم</div>
            <div className="text-[10px] text-slate-400">عرض كافة الملازم ({documents.length})</div>
          </button>
        </div>
      </div>

      {/* Recent Documents Table/Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">ملازمك الحالية</h2>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">لا توجد ملازم مرفوعة حتى الآن</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              ارفع ملزمتك الأولى بنقرة واحدة ودع دَرّسني يقرأها ويجهز أسئلتها فوراً.
            </p>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              ارفع أول ملزمة
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>{doc.pageCount} صفحة</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{doc.difficulty}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug mb-2">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {doc.summary}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>نسبة الإنجاز</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.progressPercent || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-4">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${doc.progressPercent || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectDoc(doc, 'study')}
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>اشرحلي</span>
                    </button>
                    <button
                      onClick={() => onSelectDoc(doc, 'overview')}
                      className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                    >
                      التفاصيل
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
