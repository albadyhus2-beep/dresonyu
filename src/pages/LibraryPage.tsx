import React, { useState } from 'react';
import { Search, BookOpen, Trash2, Play, Upload, Filter, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { DocumentData } from '../types';
import { api } from '../services/api';

interface LibraryPageProps {
  documents: DocumentData[];
  onSelectDoc: (doc: DocumentData, tab?: string) => void;
  onOpenUpload: () => void;
  onDocDeleted?: (docId: string) => void;
  activeDoc?: DocumentData | null;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  documents,
  onSelectDoc,
  onOpenUpload,
  onDocDeleted,
  activeDoc
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const filteredDocs = (documents || []).filter((doc) => {
    if (!doc) return false;
    const matchesSearch = (doc.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.fileName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || (doc.difficulty || '').includes(filterDifficulty);
    return matchesSearch && matchesDifficulty;
  });

  const handleDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من حذف هذه الملزمة وكافة اختباراتها وملاحظاتها؟')) {
      return;
    }
    setIsDeletingId(docId);
    try {
      await api.deleteDocument(docId);
      if (onDocDeleted) {
        onDocDeleted(docId);
      }
    } catch (err) {
      alert('فشل في حذف الملزمة');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">مكتبتي الدراسية</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جميع الملازم والمحاضرات التي تم تحليلها وتجهيزها في حسابك ({documents.length} ملزمة)
          </p>
        </div>
        <button
          onClick={onOpenUpload}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>رفع ملزمة جديدة</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="ابحث بالاسم، الكلمات المفتاحية، أو اسم الملف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">كافة المستويات</option>
            <option value="سهل">سهل</option>
            <option value="متوسط">متوسط</option>
            <option value="صعب">صعب / امتحاني</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">لا توجد ملازم مطابقة لبحثك</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            تأكد من كتابة الكلمات بشكل صحيح أو قم برفع ملف جديد.
          </p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
          >
            رفع ملزمة الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDoc(doc, 'overview')}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition-all cursor-pointer flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {doc.pageCount} صفحة
                  </span>
                  <button
                    onClick={(e) => handleDelete(doc.id, e)}
                    disabled={isDeletingId === doc.id}
                    title="حذف الملزمة"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
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

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{doc.topics.length} مواضيع</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold group-hover:underline">
                    فتح الملزمة ←
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
