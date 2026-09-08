import React, { useState } from 'react';
import { Image as ImageIcon, Table, Sparkles, ArrowRight, HelpCircle, Flame, Eye } from 'lucide-react';
import { DocumentData } from '../types';
import { api } from '../services/api';

interface MediaExplainerPageProps {
  document: DocumentData;
}

export const MediaExplainerPage: React.FC<MediaExplainerPageProps> = ({ document: doc }) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'figures'>('tables');
  const [selectedItem, setSelectedItem] = useState<any>(
    (doc.tables && doc.tables[0]) || (doc.figures && doc.figures[0]) || null
  );
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeAction, setActiveAction] = useState<string>('');

  const handleExplainAction = async (action: 'explain' | 'compare' | 'important') => {
    if (!selectedItem) return;
    setActiveAction(action);
    setIsLoading(true);
    try {
      const res = await api.explainMedia({
        documentId: doc.id,
        mediaType: activeTab === 'tables' ? 'table' : 'figure',
        itemTitle: selectedItem?.title || '',
        itemDescription: selectedItem.description || '',
        action
      });
      setExplanation(res.explanation);
    } catch (err) {
      setExplanation('تعذر تحليل وشرح هذا العنصر.');
    } finally {
      setIsLoading(false);
    }
  };

  const tables = doc.tables || [];
  const figures = doc.figures || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              شرح الصور والمخططات والجداول
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              استخراج بصري لكل العناصر التوضيحية وشرحها بالعامية العراقية
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => {
              setActiveTab('tables');
              setSelectedItem(tables[0] || null);
              setExplanation('');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'tables'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>الجداول المقارنة ({tables.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('figures');
              setSelectedItem(figures[0] || null);
              setExplanation('');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'figures'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>المخططات والرسوم ({figures.length})</span>
          </button>
        </div>
      </div>

      {/* Item Selector Chips */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {(activeTab === 'tables' ? tables : figures).map((item: any) => (
          <button
            key={item.id}
            onClick={() => {
              setSelectedItem(item);
              setExplanation('');
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-2 shrink-0 ${
              selectedItem?.id === item.id
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
            }`}
          >
            <span>{item?.title || 'عنصر'}</span>
            <span className="text-[10px] opacity-70 font-mono">({item.page})</span>
          </button>
        ))}
      </div>

      {/* Active Item Card */}
      {selectedItem ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono">
                  {selectedItem.page}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {activeTab === 'tables' ? 'جدول مقارن' : 'مخطط بياني توضيحي'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {selectedItem?.title || 'عنصر توضيحي'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedItem.description}
              </p>
            </div>
          </div>

          {/* Action Explainer Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleExplainAction('explain')}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAction === 'explain'
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>اشرحلي هذا العنصر بالتفصيل</span>
            </button>

            {activeTab === 'tables' && (
              <button
                onClick={() => handleExplainAction('compare')}
                disabled={isLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeAction === 'compare'
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>قارنلي بين عناصر هذا الجدول</span>
              </button>
            )}

            <button
              onClick={() => handleExplainAction('important')}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAction === 'important'
                  ? 'bg-rose-600 text-white'
                  : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>شنو المهم بهاي بالامتحان؟</span>
            </button>
          </div>

          {/* Explanation Output */}
          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <Sparkles className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">دا يحلل الصورة والجدول ويشرحها بالعراقي...</p>
            </div>
          ) : explanation ? (
            <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 animate-in fade-in">
              <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">
                {explanation}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              اختر أحد أزرار التحليل بالأعلى للحصول على شرح فوري لهذا العنصر.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
          <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500">لا توجد صور أو جداول مستخرجة لهذه الملزمة.</p>
        </div>
      )}
    </div>
  );
};
