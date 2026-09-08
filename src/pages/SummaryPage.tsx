import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Copy, Check, Download, Printer } from 'lucide-react';
import { DocumentData } from '../types';
import { api } from '../services/api';

interface SummaryPageProps {
  document: DocumentData;
  onOpenExport: () => void;
}

export const SummaryPage: React.FC<SummaryPageProps> = ({ document: doc, onOpenExport }) => {
  const [summaryType, setSummaryType] = useState<'quick' | 'medium' | 'detailed' | 'exam'>('medium');
  const [summaryText, setSummaryText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    loadSummary();
  }, [summaryType, doc.id]);

  const loadSummary = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateSummary({
        documentId: doc.id,
        summaryType
      });
      setSummaryText(res.summary);
    } catch (err) {
      setSummaryText('تعذر توليد الملخص.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const summaryOptions = [
    { id: 'quick', label: 'ملخص سريع', desc: 'نظرة عامة في دقيقتين' },
    { id: 'medium', label: 'ملخص متوازن', desc: 'تغطية للمفاهيم الأساسية' },
    { id: 'detailed', label: 'ملخص مفصل', desc: 'لكل صفحة وجدول وقانون' },
    { id: 'exam', label: 'ملخص امتحاني', desc: 'تركيز على ما يُسأل عنه دائماً' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">الملخصات الأكاديمية الذكية</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">اختر نمط التلخيص المناسب لوقتك الحالي</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="نسخ الملخص"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenExport}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تصدير الملخص</span>
            </button>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {summaryOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSummaryType(opt.id as any)}
              className={`p-3 rounded-2xl text-right border transition-all ${
                summaryType === opt.id
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="text-xs font-bold">{opt.label}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Sparkles className="w-8 h-8 mx-auto text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              دا نلخص الملزمة بأسلوب {summaryOptions.find((s) => s.id === summaryType)?.label}...
            </p>
          </div>
        ) : (
          <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm sm:leading-relaxed whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">
            {summaryText}
          </div>
        )}
      </div>
    </div>
  );
};
