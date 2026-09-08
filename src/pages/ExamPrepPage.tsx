import React, { useState } from 'react';
import { Flame, Clock, Sparkles, AlertCircle, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';
import { DocumentData } from '../types';
import { api } from '../services/api';

interface ExamPrepPageProps {
  document: DocumentData;
  onOpenQuiz: (topicId?: string) => void;
  onOpenStudy: (topicId?: string) => void;
}

export const ExamPrepPage: React.FC<ExamPrepPageProps> = ({ document: doc, onOpenQuiz, onOpenStudy }) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateQuickSession = async (mins: number) => {
    setSelectedDuration(mins);
    setIsLoading(true);
    try {
      const res = await api.getQuickStudy({
        documentId: doc.id,
        durationMinutes: mins
      });
      setSessionData(res.quickSession);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-950 via-amber-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>Emergency Exam Cramming Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            🔥 وضع "ما عندي وقت" وقبل الامتحان
          </h1>
          <p className="text-xs sm:text-sm text-orange-200 max-w-2xl leading-relaxed">
            باقي قليل على المحاضرة أو الامتحان؟ حدد كم دقيقة عندك، ودَرّسني راح يفلترلك الملزمة ويركزلك فقط على الأسئلة الحتمية والنقاط الأكثر تكراراً بالأسئلة الوزارية والجامعية.
          </p>
        </div>
      </div>

      {/* Time selector buttons */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          كم من الوقت متبقي لديك قبل الامتحان؟
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { mins: 10, label: '10 دقائق', desc: 'إنقاذ فوري (5 مفاهيم حتمية)' },
            { mins: 30, label: '30 دقيقة', desc: 'مراجعة مركزة وسريعة' },
            { mins: 60, label: 'ساعة واحدة', desc: 'تغطية High-Yield لجميع الفصول' },
            { mins: 120, label: 'ساعتان', desc: 'مراجعة شاملة + حل أهم الـ MCQs' },
          ].map((dur) => (
            <button
              key={dur.mins}
              onClick={() => handleGenerateQuickSession(dur.mins)}
              className={`p-4 rounded-2xl text-right border transition-all ${
                selectedDuration === dur.mins && sessionData
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-200 font-bold'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="text-sm font-bold">{dur.label}</div>
              <div className="text-[11px] text-slate-400 mt-1">{dur.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Resulting session view */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Sparkles className="w-8 h-8 mx-auto text-amber-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            دا نجهز خطة الإنقاذ السريعة لـ {selectedDuration} دقيقة...
          </p>
        </div>
      ) : sessionData ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Rescue Strategy Box */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              <span>خطة الإنقاذ المباشرة ({sessionData.durationMinutes} دقيقة)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {sessionData.strategy}
            </p>
          </div>

          {/* High-Yield Must Knows */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>أشياء لا تدخل الامتحان بدونها (Must-Knows):</span>
            </h2>
            <div className="space-y-2">
              {sessionData.mustKnowPoints?.map((pt: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Quiz trigger */}
          <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base">جاهز لاختبار سريع قبل لا تطلع؟</h3>
              <p className="text-xs text-indigo-200 mt-0.5">5 أسئلة امتحانية سريعة على أهم النقاط أعلاه</p>
            </div>
            <button
              onClick={() => onOpenQuiz()}
              className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shrink-0"
            >
              ابدأ الـ 5 أسئلة الآن
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <Clock className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            اضغط على أي وقت بالأعلى لبدء جلسة الإنقاذ
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            سنقوم فوراً باستخلاص أكثر 5 إلى 10 مفاهيم تتكرر في أسئلة الامتحان لهذه الملزمة.
          </p>
        </div>
      )}
    </div>
  );
};
