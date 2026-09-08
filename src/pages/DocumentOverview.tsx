import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Play, 
  HelpCircle, 
  Layers, 
  FileText, 
  ShieldAlert, 
  Image as ImageIcon, 
  Flame, 
  CheckCircle2, 
  Clock, 
  FileCheck,
  Tag,
  AlertCircle
} from 'lucide-react';
import { DocumentData, Topic } from '../types';
import { api } from '../services/api';

interface DocumentOverviewProps {
  document: DocumentData;
  onSelectTab?: (tab: string, topicId?: string) => void;
  onNavigate?: (view: string, topicId?: string) => void;
  onOpenQuiz?: (topicId?: string) => void;
  onOpenStudy?: (topicId?: string) => void;
  onOpenExport?: () => void;
  onDocUpdated?: (updated: DocumentData) => void;
}

export const DocumentOverview: React.FC<DocumentOverviewProps> = ({
  document: doc,
  onSelectTab: propSelectTab,
  onNavigate,
  onOpenQuiz,
  onOpenStudy,
  onOpenExport,
  onDocUpdated
}) => {
  const onSelectTab = (tab: string, topicId?: string) => {
    if (tab === 'quiz' && onOpenQuiz) {
      onOpenQuiz(topicId);
      return;
    }
    if (tab === 'study' && onOpenStudy) {
      onOpenStudy(topicId);
      return;
    }
    if (tab === 'export' && onOpenExport) {
      onOpenExport();
      return;
    }
    if (propSelectTab) {
      propSelectTab(tab, topicId);
    } else if (onNavigate) {
      onNavigate(tab, topicId);
    }
  };

  const handleToggleTopicComplete = async (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await api.updateProgress({
        documentId: doc.id,
        completedTopicId: topicId
      });
      if (onDocUpdated) {
        onDocUpdated(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                {doc.difficulty}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                {doc.pageCount} صفحة
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-800">
                الوقت المقدر: {doc.estimatedStudyTime}
              </span>
              {doc.qualityReport?.pdfType && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">
                  {doc.qualityReport.pdfType}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {doc.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {doc.summary}
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => onSelectTab('study')}
              className="w-full px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>ابدأ الشرح العراقي</span>
            </button>
            <button
              onClick={() => onSelectTab('quiz')}
              className="w-full px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>اختبرني Quiz</span>
            </button>
            <button
              onClick={() => onSelectTab('cheatsheet')}
              className="w-full px-6 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>🔥 ورقة الإنقاذ</span>
            </button>
          </div>
        </div>

        {/* Quality Notice if partial */}
        {doc.qualityReport?.isPartial && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              تم تحليل النص بالكامل، ولكن بعض الصور عالية الدقة تمت جدولتها لتتم معالجتها في وضع "شرح الصور".
            </span>
          </div>
        )}
      </div>

      {/* Quantitative Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => onSelectTab('study')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition-all"
        >
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{doc.topics.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">مواضيع أساسية مستخرجة</div>
        </div>
        <div 
          onClick={() => onSelectTab('flashcards')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition-all"
        >
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{doc.importantTerms.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">مصطلحات وبطاقات SRS</div>
        </div>
        <div 
          onClick={() => onSelectTab('media')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer transition-all"
        >
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {(doc.tables?.length || 0) + (doc.figures?.length || 0)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">جداول ومخططات بيانية</div>
        </div>
        <div 
          onClick={() => onSelectTab('cheatsheet')}
          className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-500 cursor-pointer transition-all"
        >
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{doc.highYieldPoints.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">نقاط High-Yield امتحانية</div>
        </div>
      </div>

      {/* Topics Breakdown List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">المواضيع الدراسية (Topics)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">مرتبة بحسب تسلسل الملزمة والصفحات الأكاديمية</p>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {doc.topics.filter((t) => t.isCompleted).length} من {doc.topics.length} مكتمل
          </span>
        </div>

        <div className="space-y-3">
          {doc.topics.map((topic, idx) => (
            <div
              key={topic.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {topic.title}
                  </h3>
                  {topic.titleEn && (
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                      ({topic.titleEn})
                    </span>
                  )}
                  {topic.pageReference && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                      {topic.pageReference}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {topic.summary}
                </p>

                {/* Key Concepts Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {topic.keyConcepts.map((concept, cIdx) => (
                    <span
                      key={cIdx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => handleToggleTopicComplete(topic.id, e)}
                  title={topic.isCompleted ? 'إلغاء الإكمال' : 'تحديد كمكتمل'}
                  className={`p-2 rounded-xl border transition-colors ${
                    topic.isCompleted
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onSelectTab('study', topic.id)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>اشرحلي هذا</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
