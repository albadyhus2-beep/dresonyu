import React from 'react';
import { ShieldAlert, Flame, Printer, Download, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';
import { DocumentData } from '../types';

interface CheatSheetPageProps {
  document: DocumentData;
  onOpenExport: () => void;
}

export const CheatSheetPage: React.FC<CheatSheetPageProps> = ({ document: doc, onOpenExport }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>High-Yield Rescue Sheet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              🔥 ورقة الإنقاذ لليلة الامتحان
            </h1>
            <p className="text-xs sm:text-sm text-rose-200">
              ملزمة: {doc.title} • أهم الأرقام والفخاخ والمصطلحات التي تتكرر دائماً
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/20"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الورقة</span>
            </button>
            <button
              onClick={onOpenExport}
              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/30 transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>تصدير</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Yield Pearls Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-rose-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            نقاط ذهبية امتحانية (High-Yield Pearls)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {doc.highYieldPoints.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                  {item.category}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold">
                  {item.examRelevance}
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {item.point}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Important Terms & Definitions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            أهم المصطلحات والتعريفات السريرية
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {doc.importantTerms.map((t, idx) => (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {t.term}
                  </span>
                  {t.termEn && (
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                      ({t.termEn})
                    </span>
                  )}
                </div>
                {t.page && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                    {t.page}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.definition}
              </p>
              {t.clinicalSignificance && (
                <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  💡 الأهمية: {t.clinicalSignificance}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tables Comparison Highlights */}
      {doc.tables && doc.tables.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            مقارنات الجداول الأساسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {doc.tables.map((tbl) => (
              <div
                key={tbl.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">{tbl.title}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">{tbl.page}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{tbl.description}</p>
                {tbl.keyComparison && (
                  <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-1">
                    المفتاح: {tbl.keyComparison}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
