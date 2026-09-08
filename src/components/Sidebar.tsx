import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  MessageSquare, 
  HelpCircle, 
  Layers, 
  FileText, 
  ShieldAlert, 
  Image as ImageIcon, 
  Flame, 
  Calendar, 
  BookmarkCheck, 
  Download, 
  ArrowRight,
  Home,
  FolderOpen,
  BarChart2,
  Settings,
  Upload,
  X
} from 'lucide-react';
import { DocumentData } from '../types';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  currentView?: string;
  onNavigate?: (view: string, topicId?: string) => void;
  activeDoc?: DocumentData | null;
  documents?: DocumentData[];
  onSelectDoc?: (doc: DocumentData, initialTab?: string) => void;
  onOpenUpload?: () => void;
  onOpenExport?: () => void;
  onOpenNotes?: () => void;
  // Backwards compatibility aliases
  document?: DocumentData;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onBackToLibrary?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  currentView,
  onNavigate,
  activeDoc,
  documents = [],
  onSelectDoc,
  onOpenUpload,
  onOpenExport,
  onOpenNotes,
  // aliases
  document: propDoc,
  activeTab,
  onSelectTab,
  onBackToLibrary
}) => {
  const doc = activeDoc || propDoc || null;
  const activeViewId = currentView || activeTab || 'dashboard';

  const handleNav = (tabId: string) => {
    if (onNavigate) {
      onNavigate(tabId);
    } else if (onSelectTab) {
      onSelectTab(tabId);
    }
    if (onClose) onClose();
  };

  const handleBack = () => {
    if (onBackToLibrary) {
      onBackToLibrary();
    } else if (onNavigate) {
      onNavigate('library');
    }
    if (onClose) onClose();
  };

  const studyModes = [
    { id: 'overview', label: 'نظرة عامة والمواضيع', icon: BookOpen },
    { id: 'study', label: 'اشرحلي (المدرس الذكي)', icon: Sparkles, badge: 'عراقي' },
    { id: 'chat', label: 'Chat مع الملزمة', icon: MessageSquare },
    { id: 'quiz', label: 'اختبار Quiz تفاعلي', icon: HelpCircle },
    { id: 'flashcards', label: 'بطاقات الاستذكار (SRS)', icon: Layers },
    { id: 'summary', label: 'الملخصات الأكاديمية', icon: FileText },
    { id: 'cheatsheet', label: '🔥 ورقة الإنقاذ', icon: ShieldAlert, highlight: true },
    { id: 'media', label: 'شرح الصور والجداول', icon: ImageIcon },
    { id: 'examprep', label: '🔥 قبل الامتحان / ما عندي وقت', icon: Flame },
    { id: 'studyplan', label: 'خطة الدراسة والجدولة', icon: Calendar },
  ];

  const mainPages = [
    { id: 'dashboard', label: 'الرئيسية', icon: Home },
    { id: 'library', label: 'مكتبتي والملازم', icon: FolderOpen, count: documents.length },
    { id: 'progress', label: 'إحصائياتي والتقدم', icon: BarChart2 },
    { id: 'settings', label: 'الإعدادات', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto lg:shadow-none lg:w-64 shrink-0 rounded-none lg:rounded-2xl border-l lg:border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Top Bar on Mobile (Title + Close) */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 lg:hidden">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">قائمة دَرّسني</span>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Active Document View Card */}
          {doc ? (
            <div className="mb-4">
              {/* Return to Library */}
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-3 transition-colors group font-medium"
              >
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                <span>العودة إلى مكتبتي</span>
              </button>

              {/* Document Mini-Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                    الملزمة المحددة
                  </span>
                  {documents.length > 1 && onSelectDoc && (
                    <select
                      value={doc.id}
                      onChange={(e) => {
                        const selected = documents.find((d) => d.id === e.target.value);
                        if (selected) onSelectDoc(selected);
                      }}
                      className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer max-w-[95px] truncate"
                    >
                      {documents.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <h2 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight mb-1.5">
                  {doc.title || 'ملزمة بدون عنوان'}
                </h2>

                <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  <span>{doc.pageCount || 0} صفحة</span>
                  <span>{doc.topics?.length || 0} مواضيع</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">{doc.difficulty || 'متوسط'}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${doc.progressPercent || 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>نسبة الإنجاز</span>
                  <span>{doc.progressPercent || 0}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 mb-4 border border-slate-200/80 dark:border-slate-700/80 text-center">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto mb-2 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                دَرّسني الذكي
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                أرفع ملزمتك... وخلي الباقي علينا
              </p>
              {onOpenUpload && (
                <button
                  onClick={() => {
                    onOpenUpload();
                    if (onClose) onClose();
                  }}
                  className="w-full px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>رفع ملزمة جديدة</span>
                </button>
              )}
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-4">
            {/* If doc is loaded, show Study Modes */}
            {doc && (
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                  أدوات الملزمة ({doc.title?.slice(0, 18)}...)
                </span>
                <div className="flex flex-col gap-0.5">
                  {studyModes.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeViewId === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`sidebar-tab-${item.id}`}
                        onClick={() => handleNav(item.id)}
                        className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isActive
                            ? item.highlight
                              ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                              : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                            : item.highlight
                            ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && !isActive && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* General Navigation */}
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                المنصة
              </span>
              <div className="flex flex-col gap-0.5">
                {mainPages.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeViewId === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-main-${item.id}`}
                      onClick={() => handleNav(item.id)}
                      className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.count === 'number' && item.count > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer utility buttons */}
        {doc && (
          <div className="flex flex-col gap-1.5 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
            {onOpenNotes && (
              <button
                onClick={() => {
                  onOpenNotes();
                  if (onClose) onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <BookmarkCheck className="w-4 h-4 text-amber-500" />
                <span>ملاحظاتي والمحفوظات</span>
              </button>
            )}
            {onOpenExport && (
              <button
                onClick={() => {
                  onOpenExport();
                  if (onClose) onClose();
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>تصدير الملخص والبطاقات</span>
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
};
