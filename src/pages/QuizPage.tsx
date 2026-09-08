import React, { useState } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Award, 
  ArrowLeft, 
  Layers, 
  Clock, 
  BookOpen,
  Filter,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DocumentData, QuizQuestion, Topic } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface QuizPageProps {
  document: DocumentData;
  initialTopicId?: string;
  onXpAwarded: (amount: number) => void;
  onStudyTopic: (topicId: string) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  document: doc,
  initialTopicId,
  onXpAwarded,
  onStudyTopic
}) => {
  // Setup State
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || 'all');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>('متوسط');
  const [strictlyFromDoc, setStrictlyFromDoc] = useState<boolean>(true);

  // Active Quiz State
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showAnswerFeedback, setShowAnswerFeedback] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [addedToFlashcards, setAddedToFlashcards] = useState<boolean>(false);

  const handleStartQuiz = async (customQuestions?: QuizQuestion[]) => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
      setCurrentIndex(0);
      setUserAnswers({});
      setShowAnswerFeedback(false);
      setIsFinished(false);
      setIsStarted(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.generateQuiz({
        documentId: doc.id,
        topicId: selectedTopicId === 'all' ? undefined : selectedTopicId,
        count: questionCount,
        difficulty,
        strictlyFromDoc
      });
      setQuestions(res.questions);
      setCurrentIndex(0);
      setUserAnswers({});
      setShowAnswerFeedback(false);
      setIsFinished(false);
      setIsStarted(true);
    } catch (err) {
      alert('فشل في إنشاء الاختبار. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCorrectIndex = (q: any) => (q.correctIndex !== undefined ? q.correctIndex : (q.correctAnswer ?? 0));

  const handleSelectOption = (optionIndex: number) => {
    if (showAnswerFeedback) return;
    setUserAnswers({ ...userAnswers, [currentIndex]: optionIndex });
    setShowAnswerFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowAnswerFeedback(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsFinished(true);
    // Calculate score
    const correctCount = questions.filter(
      (q, idx) => userAnswers[idx] === getCorrectIndex(q)
    ).length;
    const percentage = Math.round((correctCount / questions.length) * 100);

    if (percentage >= 60) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }

    const xpEarned = Math.round(correctCount * 10 + 15);
    try {
      await api.awardXp({
        amount: xpEarned,
        action: 'quiz'
      });
      onXpAwarded(xpEarned);
    } catch (err) {
      console.error(err);
    }
  };

  const currentQ = questions[currentIndex];
  const correctCount = questions.filter((q, idx) => userAnswers[idx] === getCorrectIndex(q)).length;
  const wrongQuestions = questions.filter((q, idx) => userAnswers[idx] !== getCorrectIndex(q));
  const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  const handleAddWrongsToFlashcards = () => {
    wrongQuestions.forEach((wq) => {
      storage.saveNote({
        documentId: doc.id,
        title: `سؤال مراجعة: ${wq.question.slice(0, 40)}...`,
        content: `السؤال: ${wq.question}\nالإجابة الصحيحة: ${wq.options[wq.correctAnswer]}\nالشرح: ${wq.explanation}`
      });
    });
    setAddedToFlashcards(true);
  };

  const handleRetestWrongsOnly = () => {
    if (wrongQuestions.length === 0) return;
    handleStartQuiz(wrongQuestions);
  };

  // If Quiz is NOT started, display the Configuration Setup view
  if (!isStarted) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-2">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            إنشاء اختبار تفاعلي (Quiz)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            اختبر استيعابك للملزمة مع أسئلة امتحانية مصممة لتحديد نقاط ضعفك وقوتك
          </p>
        </div>

        <div className="space-y-4">
          {/* Topic Scope */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              نطاق الأسئلة:
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">كل مواضيع الملزمة (شامل)</option>
              {doc.topics.map((t, idx) => (
                <option key={t.id} value={t.id}>
                  {idx + 1}. {t.title} {t.titleEn ? `(${t.titleEn})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              عدد الأسئلة:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 20, 30, 50].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    questionCount === cnt
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              مستوى الصعوبة:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'سهل', label: 'سهل (أساسيات)' },
                { id: 'متوسط', label: 'متوسط (متوازن)' },
                { id: 'صعب', label: 'صعب (دقيق)' },
                { id: 'امتحاني', label: 'امتحاني (وزاري)' }
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setDifficulty(diff.id)}
                  className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition-all ${
                    difficulty === diff.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Source Checkbox */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={strictlyFromDoc}
                onChange={(e) => setStrictlyFromDoc(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                الالتزام بالملزمة فقط بنسبة 100% (Strict Mode - بدون أسئلة خارجية)
              </span>
            </label>
          </div>

          <button
            onClick={() => handleStartQuiz()}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>دا أجهز أسئلة الاختبار والخيارات...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ابدأ الاختبار الآن</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // If Quiz is Finished, display the comprehensive Result & Analytics view
  if (isFinished) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              نتيجة الاختبار: {percentage}%
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              أجبت على {correctCount} سؤال صحيح من أصل {questions.length} أسئلة
            </p>
          </div>

          {/* Mini analytics pill */}
          <div className="inline-flex items-center gap-4 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {correctCount} صحيحة
            </span>
            <span className="text-rose-500 flex items-center gap-1">
              <XCircle className="w-4 h-4" />
              {wrongQuestions.length} خاطئة
            </span>
            <span className="text-indigo-600 dark:text-indigo-400">
              +{Math.round(correctCount * 10 + 15)} XP
            </span>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsStarted(false)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>اختبار جديد</span>
            </button>

            {wrongQuestions.length > 0 && (
              <>
                <button
                  onClick={handleRetestWrongsOnly}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>اختبرني فقط بنقاط ضعفي ({wrongQuestions.length})</span>
                </button>

                <button
                  onClick={handleAddWrongsToFlashcards}
                  disabled={addedToFlashcards}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  {addedToFlashcards ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>تمت الإضافة للمراجعة</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3.5 h-3.5" />
                      <span>أضف الأسئلة الخاطئة للملاحظات</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            مراجعة الأسئلة وتفاصيل الإجابات:
          </h3>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAns = userAnswers[idx];
              const isCorrect = userAns === getCorrectIndex(q);

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCorrect
                      ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/10'
                      : 'border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
                        #{idx + 1}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {q.question}
                      </h4>
                    </div>
                    {isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                  </div>

                  <div className="space-y-1.5 my-3">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = userAns === optIdx;
                      const isThisCorrect = optIdx === getCorrectIndex(q);

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                            isThisCorrect
                              ? 'border-emerald-500 bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                              : isChosen
                              ? 'border-rose-400 bg-rose-100/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                              : 'border-transparent text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>{opt}</span>
                          {isThisCorrect && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                              الإجابة الصحيحة
                            </span>
                          )}
                          {!isThisCorrect && isChosen && (
                            <span className="text-[10px] text-rose-600 dark:text-rose-300 font-bold">
                              إجابتك
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation text */}
                  <div className="text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 ml-1">توضيح دَرّسني:</span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Question In-Progress View
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress & Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">
            السؤال {currentIndex + 1} من {questions.length}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold">
            {difficulty}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          {currentQ.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = userAnswers[currentIndex] === optIdx;
            const isCorrect = optIdx === getCorrectIndex(currentQ);

            let buttonStyle = 'border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200';

            if (showAnswerFeedback) {
              if (isCorrect) {
                buttonStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold';
              } else if (isSelected) {
                buttonStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 font-bold';
              } else {
                buttonStyle = 'opacity-50 border-slate-200 dark:border-slate-700 text-slate-400';
              }
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                disabled={showAnswerFeedback}
                className={`w-full p-4 rounded-2xl text-right text-xs sm:text-sm border transition-all flex items-center justify-between ${buttonStyle}`}
              >
                <span>{option}</span>
                {showAnswerFeedback && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {showAnswerFeedback && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Explanation Box if revealed */}
        {showAnswerFeedback && (
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 animate-in fade-in space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <span>الشرح والتعليل العلمي:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next Question Button */}
        {showAnswerFeedback && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>{currentIndex < questions.length - 1 ? 'السؤال التالي' : 'إنهاء الاختبار وعرض النتيجة'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
