import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  Flame, 
  Brain, 
  BookMarked, 
  Volume2, 
  StopCircle, 
  CheckCircle2, 
  ChevronDown, 
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  Bookmark,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DocumentData, Topic, UserProfile } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface StudyPageProps {
  document: DocumentData;
  initialTopicId?: string;
  profile: UserProfile | null;
  onXpAwarded: (amount: number) => void;
  onDocUpdated: (updated: DocumentData) => void;
  onOpenQuiz: (topicId?: string) => void;
}

export const StudyPage: React.FC<StudyPageProps> = ({
  document: doc,
  initialTopicId,
  profile,
  onXpAwarded,
  onDocUpdated,
  onOpenQuiz
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    initialTopicId || doc.topics[0]?.id || ''
  );
  const [level, setLevel] = useState<string>(profile?.explanationLevel || 'medium');
  const [style, setStyle] = useState<string>(profile?.explanationStyle || 'tutor');
  const [variation, setVariation] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [followupResponse, setFollowupResponse] = useState<string>('');
  const [followupLoading, setFollowupLoading] = useState<boolean>(false);
  const [activeFollowupType, setActiveFollowupType] = useState<string>('');

  const topicsList = doc?.topics || [];
  const currentTopic = topicsList.find((t) => t.id === selectedTopicId) || topicsList[0] || null;

  useEffect(() => {
    if (selectedTopicId && currentTopic) {
      loadExplanation();
      setBookmarked(storage.isBookmarked(doc.id, currentTopic?.title || ''));
      setFollowupResponse('');
      setActiveFollowupType('');
    }
  }, [selectedTopicId, level, style]);

  const loadExplanation = async (isReExplain = false, forcedVariation?: number) => {
    setIsLoading(true);
    try {
      const res = await api.explainTopic({
        documentId: doc.id,
        topicId: selectedTopicId,
        level,
        style,
        variation: forcedVariation || variation,
        isReExplain,
        userPreferences: {
          dialect: profile?.dialect || 'iraqi',
          keepEnglishTerms: profile?.keepEnglishTerms ?? true,
          useAnalogies: profile?.useAnalogies ?? true,
          useEmojis: profile?.useEmojis ?? true
        }
      });
      setExplanation(res.explanation);
      if (forcedVariation) {
        setVariation(forcedVariation);
      }
    } catch (err: any) {
      setExplanation('صار خلل بتوليد الشرح. جرّب تضغط "أعد الشرح" مرة ثانية.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnderstandClick = async () => {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    try {
      const updated = await api.updateProgress({
        documentId: doc.id,
        completedTopicId: selectedTopicId
      });
      onDocUpdated(updated);
      const res = await api.awardXp({
        amount: 25,
        action: 'topic'
      });
      onXpAwarded(res.awarded);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCycleVariation = () => {
    const nextVar = variation >= 4 ? 1 : variation + 1;
    setVariation(nextVar);
    loadExplanation(true, nextVar);
  };

  const handleFollowupAction = async (actionType: 'why' | 'exam' | 'mnemonic' | 'testme') => {
    setActiveFollowupType(actionType);
    setFollowupLoading(true);
    let prompt = '';
    if (actionType === 'why') prompt = 'ليش هذا الشيء يصير بالضبط؟ اشرح السبب الفسلجي / العلمي الكامن وراءه.';
    if (actionType === 'exam') prompt = 'شنو أهم الأسئلة أو الفخاخ الامتحانية المتكررة على هذا الموضوع؟';
    if (actionType === 'mnemonic') prompt = 'انطيني حيلة أو طريقة حفظ ذكية أو جملة تساعدني ما أنسى هذا المفهوم.';
    if (actionType === 'testme') prompt = 'اسألني سؤال سريع ومباشر هنا حتى تشوفني فهمت الموضوع لو لا.';

    try {
      const res = await api.chat({
        documentId: doc.id,
        topicId: selectedTopicId,
        messages: [],
        question: prompt
      });
      setFollowupResponse(res.reply);
    } catch (err) {
      setFollowupResponse('تعذر جلب الإجابة الإضافية.');
    } finally {
      setFollowupLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = explanation.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-XA';
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleBookmark = () => {
    if (!currentTopic) return;
    const newState = storage.toggleBookmark({
      documentId: doc.id,
      title: currentTopic.title || doc.title || 'موضوع دراسي',
      type: 'topic',
      contentSnippet: explanation.slice(0, 180)
    });
    setBookmarked(newState);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!doc) {
    return (
      <div className="p-8 text-center text-slate-500">
        لم يتم تحديد أي ملزمة.
      </div>
    );
  }

  if (topicsList.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">لا توجد مواضيع مستخرجة في هذه الملزمة</h3>
        <p className="text-xs text-slate-500">يرجى التأكد من محتوى الملزمة في صفحة النظرة العامة.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Topic Switcher & Mode Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Topic Selector */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
              الموضوع قيد الشرح ({topicsList.findIndex((t) => t.id === selectedTopicId) + 1} من {topicsList.length}):
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full text-xs sm:text-sm font-bold bg-transparent text-slate-900 dark:text-white border-0 p-0 focus:ring-0 cursor-pointer"
            >
              {topicsList.map((t, idx) => (
                <option key={t.id} value={t.id} className="text-slate-900 dark:text-slate-100 dark:bg-slate-900">
                  {idx + 1}. {t.title} {t.titleEn ? `(${t.titleEn})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Level & Style Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Level */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-400 font-medium">المستوى:</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 border-0 p-0 focus:ring-0 cursor-pointer"
            >
              <option value="quick" className="dark:bg-slate-900">سريع (Quick)</option>
              <option value="medium" className="dark:bg-slate-900">متوسط (متوازن)</option>
              <option value="deep" className="dark:bg-slate-900">عميق وتفصيلي</option>
              <option value="zero" className="dark:bg-slate-900">من الصفر (ELI5)</option>
              <option value="exam" className="dark:bg-slate-900">تركيز امتحاني</option>
              <option value="medical" className="dark:bg-slate-900">طبي / سريري</option>
            </select>
          </div>

          {/* Style */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-400 font-medium">الأسلوب:</span>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 border-0 p-0 focus:ring-0 cursor-pointer"
            >
              <option value="tutor" className="dark:bg-slate-900">مدرس خصوصي عراقي</option>
              <option value="simple" className="dark:bg-slate-900">تبسيط شديد</option>
              <option value="exam" className="dark:bg-slate-900">وضع الامتحان</option>
              <option value="medical" className="dark:bg-slate-900">طبي سريري (Clinical)</option>
              <option value="analogies" className="dark:bg-slate-900">أمثلة وتشبيهات واقعية</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main AI Explanation Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Box Top Bar */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{currentTopic?.title}</span>
              {currentTopic?.pageReference && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-normal">
                  {currentTopic.pageReference}
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              (الأسلوب #{variation})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleSpeech}
              title={isSpeaking ? 'إيقاف الصوت' : 'استمع للشرح صوتياً'}
              className={`p-1.5 rounded-lg transition-colors ${
                isSpeaking
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isSpeaking ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleToggleBookmark}
              title="حفظ في المفضلة"
              className={`p-1.5 rounded-lg transition-colors ${
                bookmarked
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              onClick={handleCopy}
              title="نسخ الشرح"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                دا أجهزلك الشرح العراقي البسيط...
              </p>
              <p className="text-xs text-slate-400">
                نستخرج التفاصيل الدقيقة من الملزمة ونحافظ على المصطلحات الإنجليزية
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                {explanation}
              </div>

              {/* Topic Key Concepts Tags */}
              {currentTopic?.keyConcepts && currentTopic.keyConcepts.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium ml-1">مفاهيم مرتبطة:</span>
                  {currentTopic.keyConcepts.map((kc, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 font-medium"
                    >
                      {kc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Post-Explanation Feedback Check */}
        {!isLoading && (
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                فهمت هذا الموضوع لو تحب نغير زاوية الشرح؟
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleUnderstandClick}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>إي فهمت (+25 XP)</span>
                </button>
                <button
                  onClick={handleCycleVariation}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>عيدها بطريقة ثانية</span>
                </button>
                <button
                  onClick={() => onOpenQuiz(selectedTopicId)}
                  className="px-3.5 py-2 rounded-xl border border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>اختبرني بهذا الموضوع</span>
                </button>
              </div>
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] font-medium text-slate-400">أسئلة سريعة:</span>
              <button
                onClick={() => handleFollowupAction('why')}
                className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              >
                ❓ ليش هذا الشيء يصير؟
              </button>
              <button
                onClick={() => handleFollowupAction('exam')}
                className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-rose-500 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              >
                🔥 شنو المهم بالامتحان؟
              </button>
              <button
                onClick={() => handleFollowupAction('mnemonic')}
                className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              >
                🧠 احفظني هاي (حيلة حفظ)
              </button>
              <button
                onClick={() => handleFollowupAction('testme')}
                className="px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
              >
                📝 اسألني وشوفني فاهم لو لا
              </button>
            </div>

            {/* Live Followup Response Section */}
            {(followupLoading || followupResponse) && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 animate-in fade-in">
                {followupLoading ? (
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>دا أجهز الرد السريع...</span>
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {followupResponse}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Next/Previous Topic Navigation */}
      <div className="flex items-center justify-between pt-2">
        {(() => {
          const currentIndex = topicsList.findIndex((t) => t.id === selectedTopicId);
          const prevTopic = currentIndex > 0 ? topicsList[currentIndex - 1] : null;
          const nextTopic = currentIndex >= 0 && currentIndex < topicsList.length - 1 ? topicsList[currentIndex + 1] : null;

          return (
            <>
              {prevTopic ? (
                <button
                  onClick={() => setSelectedTopicId(prevTopic.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق: {prevTopic.title}</span>
                </button>
              ) : <div />}

              {nextTopic && (
                <button
                  onClick={() => setSelectedTopicId(nextTopic.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
                >
                  <span>التالي: {nextTopic.title}</span>
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};
