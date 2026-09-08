import React from 'react';
import { 
  BookOpen, 
  Upload, 
  Flame, 
  Zap, 
  Timer, 
  Mic, 
  Moon, 
  Sun, 
  Library, 
  Compass, 
  Award, 
  User as UserIcon,
  ChevronLeft
} from 'lucide-react';
import { UserProfile, DocumentData } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, docId?: string) => void;
  activeDoc: DocumentData | null;
  profile: UserProfile | null;
  onOpenUpload: () => void;
  onOpenTimer: () => void;
  onOpenVoice: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeDoc,
  profile,
  onOpenUpload,
  onOpenTimer,
  onOpenVoice,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            id="nav-logo-btn"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-right group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">دَرّسني</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-200 dark:border-indigo-800">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block font-normal">
                أرفع ملزمتك... وخلي الباقي علينا
              </p>
            </div>
          </button>

          {/* Active doc quick switch badge */}
          {activeDoc && currentView !== 'dashboard' && currentView !== 'library' && (
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 max-w-xs truncate">
              <span className="text-slate-400">الملزمة:</span>
              <span className="font-medium truncate">{activeDoc.title}</span>
            </div>
          )}
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            id="nav-link-dashboard"
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'dashboard'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            الرئيسية
          </button>
          <button
            id="nav-link-library"
            onClick={() => onNavigate('library')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'library'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            مكتبتي
          </button>
          <button
            id="nav-link-progress"
            onClick={() => onNavigate('progress')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentView === 'progress'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            التقدم والأوسمة
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Study Timer Quick Trigger */}
          <button
            id="nav-timer-btn"
            onClick={onOpenTimer}
            title="مؤقت الدراسة والتركيز"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Timer className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">المؤقت</span>
          </button>

          {/* Voice Mode Quick Trigger */}
          <button
            id="nav-voice-btn"
            onClick={onOpenVoice}
            title="تحدث صوتياً مع دَرّسني"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Mic className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">صوت</span>
          </button>

          {/* Streak & XP Pills */}
          {profile && (
            <div className="hidden sm:flex items-center gap-1.5">
              <div 
                title={`سلسلة الدراسة اليومية: ${profile.streak} أيام متواصلة!`}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-800"
              >
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{profile.streak} د</span>
              </div>
              <div 
                title={`المستوى ${profile.level} (${profile.xp} XP)`}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold border border-indigo-200 dark:border-indigo-800"
              >
                <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                <span>Lvl {profile.level}</span>
              </div>
            </div>
          )}

          {/* Theme Switcher */}
          <button
            id="nav-theme-toggle"
            onClick={onToggleTheme}
            aria-label="تبديل النمط المظلم"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Upload Button */}
          <button
            id="nav-upload-btn"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>ارفع ملزمتك</span>
          </button>

          {/* Profile / Settings Button */}
          <button
            id="nav-profile-btn"
            onClick={() => onNavigate('settings')}
            title="الإعدادات والحساب"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <UserIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
