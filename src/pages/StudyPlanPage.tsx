import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Play, BookOpen, Sparkles } from 'lucide-react';
import { DocumentData } from '../types';

interface StudyPlanPageProps {
  document: DocumentData;
  onStudyTopic: (topicId: string) => void;
}

export const StudyPlanPage: React.FC<StudyPlanPageProps> = ({ document: doc, onStudyTopic }) => {
  const [plan, setPlan] = useState(doc.studyPlan || []);

  const handleToggleDay = (dayIndex: number) => {
    const updated = [...plan];
    updated[dayIndex].isDone = !updated[dayIndex].isDone;
    setPlan(updated);
  };

  const totalMinutes = plan.reduce((acc, curr) => acc + curr.estimatedMinutes, 0);
  const completedDays = plan.filter((d) => d.isDone).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              خطة الدراسة والجدولة الذكية
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              توزيع منظم ومحسوب زمنياً لإنهاء ملزمة "{doc.title}"
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
          إجمالي الوقت: {totalMinutes} دقيقة (~{(totalMinutes / 60).toFixed(1)} ساعة)
        </div>
      </div>

      {/* Days List */}
      <div className="space-y-4">
        {plan.map((dayItem, idx) => {
          const matchedTopics = (doc.topics || []).filter((t) => dayItem.topicIds?.includes(t.id));

          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl border transition-all ${
                dayItem.isDone
                  ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleToggleDay(idx)}
                    className="text-emerald-600 hover:scale-105 transition-transform"
                  >
                    {dayItem.isDone ? (
                      <CheckCircle2 className="w-6 h-6 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-400" />
                    )}
                  </button>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {dayItem.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>الوقت المقدر: {dayItem.estimatedMinutes} دقيقة</span>
                </div>
              </div>

              {/* Topics in this Day */}
              <div className="mt-4 space-y-2">
                {matchedTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">
                        {topic.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {topic.pageReference || 'مرجع الصفحة'} • {topic.difficulty}
                      </div>
                    </div>

                    <button
                      onClick={() => onStudyTopic(topic.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>اشرحلي</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
