import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { UploadModal } from './components/UploadModal';
import { StudyTimerModal } from './components/StudyTimerModal';
import { VoiceModal } from './components/VoiceModal';
import { ExportModal } from './components/ExportModal';
import { NotesDrawer } from './components/NotesDrawer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { DocumentOverview } from './pages/DocumentOverview';
import { StudyPage } from './pages/StudyPage';
import { ChatPage } from './pages/ChatPage';
import { QuizPage } from './pages/QuizPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { SummaryPage } from './pages/SummaryPage';
import { CheatSheetPage } from './pages/CheatSheetPage';
import { ExamPrepPage } from './pages/ExamPrepPage';
import { MediaExplainerPage } from './pages/MediaExplainerPage';
import { StudyPlanPage } from './pages/StudyPlanPage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';

// Types & Services
import { DocumentData, UserProfile } from './types';
import { api } from './services/api';
import { storage } from './services/storage';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [targetTopicId, setTargetTopicId] = useState<string | undefined>(undefined);

  // App Data State
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [activeDocument, setActiveDocument] = useState<DocumentData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(storage.getTheme());

  // Modals & Drawers State
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isTimerOpen, setIsTimerOpen] = useState<boolean>(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);

  // XP Toast Notification State
  const [xpToast, setXpToast] = useState<{ amount: number; show: boolean }>({
    amount: 0,
    show: false
  });

  // Initialize theme on HTML root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initial Load: User & Documents
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [user, docs] = await Promise.all([
        api.getCurrentUser(),
        api.getDocuments()
      ]);
      setUserProfile(user);
      setDocuments(docs);
      if (docs.length > 0) {
        setActiveDocument(docs[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    storage.setTheme(nextTheme);
  };

  const handleXpAwarded = (amount: number) => {
    if (userProfile) {
      const updatedXp = (userProfile.xp || 0) + amount;
      const updatedLevel = Math.floor(updatedXp / 250) + 1;
      setUserProfile({
        ...userProfile,
        xp: updatedXp,
        level: updatedLevel
      });
    }
    setXpToast({ amount, show: true });
    setTimeout(() => {
      setXpToast({ amount: 0, show: false });
    }, 3000);
  };

  const handleDocUpdated = (updatedDoc: DocumentData) => {
    setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
    if (activeDocument?.id === updatedDoc.id) {
      setActiveDocument(updatedDoc);
    }
  };

  const handleDocumentUploaded = (newDoc: DocumentData) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setActiveDocument(newDoc);
    setCurrentView('overview');
    handleXpAwarded(50);
  };

  const handleSelectDocument = (doc: DocumentData) => {
    setActiveDocument(doc);
    setCurrentView('overview');
  };

  const handleNavigate = (view: string, topicId?: string) => {
    setTargetTopicId(topicId);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30 animate-bounce">
          د
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">دَرّسني</h2>
          <p className="text-xs text-slate-400">أرفع ملزمتك... وخلي الباقي علينا</p>
        </div>
      </div>
    );
  }

  // Standalone Landing Page View
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        <LandingPage
          onGetStarted={() => {
            if (userProfile?.isGuest) {
              setCurrentView('dashboard');
            } else {
              setCurrentView('auth');
            }
          }}
          onOpenDemo={() => {
            if (documents.length > 0) {
              setActiveDocument(documents[0]);
              setCurrentView('overview');
            } else {
              setCurrentView('dashboard');
            }
          }}
          onLogin={() => setCurrentView('auth')}
        />
      </div>
    );
  }

  // Standalone Auth Page View
  if (currentView === 'auth') {
    return (
      <AuthPage
        onSuccess={(profile) => {
          setUserProfile(profile);
          setCurrentView('dashboard');
        }}
        onCancel={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Main Navigation Bar */}
      <Navbar
        profile={userProfile}
        currentView={currentView}
        activeDoc={activeDocument}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenTimer={() => setIsTimerOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenNotes={() => setIsNotesOpen(true)}
        onNavigate={handleNavigate}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-3 sm:px-6 py-4 gap-6">
        {/* Persistent Desktop / Drawer Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          currentView={currentView}
          onNavigate={handleNavigate}
          activeDoc={activeDocument}
          documents={documents}
          onSelectDoc={handleSelectDocument}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenNotes={() => setIsNotesOpen(true)}
        />

        {/* Dynamic Main Content Workspace */}
        <main className="flex-1 min-w-0 pb-16">
          {/* XP Toast Notification */}
          {xpToast.show && (
            <div className="fixed bottom-6 left-6 z-50 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 text-xs font-bold flex items-center gap-2 animate-bounce">
              <span>+{xpToast.amount} XP 🎉 إنجاز رائع!</span>
            </div>
          )}

          {/* Fallback when viewing a document tab without an active document */}
          {['overview', 'study', 'chat', 'quiz', 'flashcards', 'summary', 'cheatsheet', 'examprep', 'media', 'studyplan'].includes(currentView) && !activeDocument && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto mt-12">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center font-bold text-xl">
                📚
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">لم يتم اختيار أي ملزمة</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                يرجى اختيار ملزمة من مكتبتك أو رفع ملزمة جديدة للاستفادة من أدوات الدراسة والشرح الذكي.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => handleNavigate('library')}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  الذهاب للمكتبة
                </button>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                >
                  رفع ملزمة جديدة
                </button>
              </div>
            </div>
          )}

          {/* View Routing */}
          {currentView === 'dashboard' && (
            <DashboardPage
              documents={documents}
              profile={userProfile}
              onSelectDoc={handleSelectDocument}
              onOpenUpload={() => setIsUploadOpen(true)}
              onNavigate={handleNavigate}
              onOpenTimer={() => setIsTimerOpen(true)}
            />
          )}

          {currentView === 'library' && (
            <LibraryPage
              documents={documents}
              activeDoc={activeDocument}
              onSelectDoc={handleSelectDocument}
              onOpenUpload={() => setIsUploadOpen(true)}
              onDocDeleted={(docId) => {
                setDocuments((prev) => prev.filter((d) => d.id !== docId));
                if (activeDocument?.id === docId) {
                  const remaining = documents.filter((d) => d.id !== docId);
                  setActiveDocument(remaining.length > 0 ? remaining[0] : null);
                }
              }}
            />
          )}

          {currentView === 'overview' && activeDocument && (
            <DocumentOverview
              document={activeDocument}
              onNavigate={handleNavigate}
              onOpenQuiz={(topicId) => handleNavigate('quiz', topicId)}
              onOpenStudy={(topicId) => handleNavigate('study', topicId)}
              onOpenExport={() => setIsExportOpen(true)}
              onDocUpdated={handleDocUpdated}
            />
          )}

          {currentView === 'study' && activeDocument && (
            <StudyPage
              document={activeDocument}
              initialTopicId={targetTopicId}
              profile={userProfile}
              onXpAwarded={handleXpAwarded}
              onDocUpdated={handleDocUpdated}
              onOpenQuiz={(topicId) => handleNavigate('quiz', topicId)}
            />
          )}

          {currentView === 'chat' && activeDocument && (
            <ChatPage document={activeDocument} profile={userProfile} />
          )}

          {currentView === 'quiz' && activeDocument && (
            <QuizPage
              document={activeDocument}
              initialTopicId={targetTopicId}
              onXpAwarded={handleXpAwarded}
              onStudyTopic={(topicId) => handleNavigate('study', topicId)}
            />
          )}

          {currentView === 'flashcards' && activeDocument && (
            <FlashcardsPage document={activeDocument} onXpAwarded={handleXpAwarded} />
          )}

          {currentView === 'summary' && activeDocument && (
            <SummaryPage
              document={activeDocument}
              onOpenExport={() => setIsExportOpen(true)}
            />
          )}

          {currentView === 'cheatsheet' && activeDocument && (
            <CheatSheetPage
              document={activeDocument}
              onOpenExport={() => setIsExportOpen(true)}
            />
          )}

          {currentView === 'examprep' && activeDocument && (
            <ExamPrepPage
              document={activeDocument}
              onOpenQuiz={(topicId) => handleNavigate('quiz', topicId)}
              onOpenStudy={(topicId) => handleNavigate('study', topicId)}
            />
          )}

          {currentView === 'media' && activeDocument && (
            <MediaExplainerPage document={activeDocument} />
          )}

          {currentView === 'studyplan' && activeDocument && (
            <StudyPlanPage
              document={activeDocument}
              onStudyTopic={(topicId) => handleNavigate('study', topicId)}
            />
          )}

          {currentView === 'progress' && (
            <ProgressPage profile={userProfile} />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              profile={userProfile}
              onProfileUpdated={(updated) => setUserProfile(updated)}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          )}
        </main>
      </div>

      {/* Global Interactive Modals & Drawers */}
      {isUploadOpen && (
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={handleDocumentUploaded}
        />
      )}

      {isTimerOpen && (
        <StudyTimerModal
          isOpen={isTimerOpen}
          onClose={() => setIsTimerOpen(false)}
          onMinutesCompleted={(mins) => {
            if (userProfile) {
              setUserProfile({
                ...userProfile,
                totalStudyMinutes: (userProfile.totalStudyMinutes || 0) + mins
              });
            }
            handleXpAwarded(mins * 2);
          }}
        />
      )}

      {isVoiceOpen && activeDocument && (
        <VoiceModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
          document={activeDocument}
          profile={userProfile}
        />
      )}

      {isExportOpen && activeDocument && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          document={activeDocument}
        />
      )}

      {isNotesOpen && activeDocument && (
        <NotesDrawer
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          document={activeDocument}
        />
      )}
    </div>
  );
}
