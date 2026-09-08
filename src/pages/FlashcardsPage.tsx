import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  RotateCw, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft,
  BookOpen,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DocumentData, Flashcard } from '../types';
import { api } from '../services/api';

interface FlashcardsPageProps {
  document: DocumentData;
  onXpAwarded: (amount: number) => void;
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ document: doc, onXpAwarded }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [masteredCount, setMasteredCount] = useState<number>(0);

  useEffect(() => {
    loadFlashcards();
  }, [doc.id]);

  const loadFlashcards = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateFlashcards({
        documentId: doc.id
      });
      setFlashcards(res.flashcards);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    setIsFlipped(false);

    if (rating === 'easy' || rating === 'good') {
      setMasteredCount((prev) => prev + 1);
      try {
        const res = await api.awardXp({
          amount: 5,
          action: 'flashcard'
        });
        onXpAwarded(res.awarded);
      } catch (err) {
        console.error(err);
      }
    }

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  const currentCard = flashcards[currentIndex];

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-pulse">
          <Layers className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          دا نولد بطاقات التكرار المتباعد (SRS)...
        </p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
        <p className="text-xs text-slate-500">لا توجد بطاقات متاحة حالياً.</p>
        <button
          onClick={loadFlashcards}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          إعادة التوليد
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Top Header & Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              بطاقة {currentIndex + 1} من {flashcards.length}
            </div>
            <div className="text-[10px] text-slate-400">نظام المراجعة المتباعدة (SRS)</div>
          </div>
        </div>

        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>أتقنت {masteredCount}</span>
        </div>
      </div>

      {/* Flip Card Stage */}
      <div
        onClick={handleFlip}
        className="cursor-pointer select-none perspective-1000 min-h-[300px]"
      >
        <div
          className={`relative w-full h-full min-h-[300px] rounded-3xl p-8 transition-all duration-500 border flex flex-col justify-between shadow-sm hover:shadow-md ${
            isFlipped
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800'
          }`}
        >
          {/* Card Top Pill */}
          <div className="flex items-center justify-between text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                isFlipped
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {isFlipped ? 'الإجابة والتعليل' : 'المصطلح أو السؤال'}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <RotateCw className="w-3 h-3" />
              <span>انقر للقلب</span>
            </span>
          </div>

          {/* Card Content */}
          <div className="my-auto py-6 text-center">
            {isFlipped ? (
              <div className="space-y-3">
                <p className="text-base sm:text-lg font-medium leading-relaxed">
                  {currentCard?.back}
                </p>
                {currentCard?.citation && (
                  <span className="inline-block text-xs px-2.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                    {currentCard.citation}
                  </span>
                )}
              </div>
            ) : (
              <h3 className="text-xl sm:text-2xl font-bold leading-relaxed">
                {currentCard?.front}
              </h3>
            )}
          </div>

          {/* Card Bottom Hint */}
          <div className="text-center text-[11px] text-slate-400">
            {isFlipped
              ? 'قيّم مدى استذكارك للبطاقة بالأسفل'
              : 'فكر بالإجابة في ذهنك أولاً ثم انقر'}
          </div>
        </div>
      </div>

      {/* SRS Rating Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => handleRate('again')}
          className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-center transition-all"
        >
          <div className="text-xs font-bold">Again</div>
          <div className="text-[10px] text-rose-500/80">لم أتذكرها (1 د)</div>
        </button>

        <button
          onClick={() => handleRate('hard')}
          className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-center transition-all"
        >
          <div className="text-xs font-bold">Hard</div>
          <div className="text-[10px] text-amber-500/80">صعبة (10 د)</div>
        </button>

        <button
          onClick={() => handleRate('good')}
          className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 text-center transition-all"
        >
          <div className="text-xs font-bold">Good</div>
          <div className="text-[10px] text-indigo-500/80">جيدة (1 يوم)</div>
        </button>

        <button
          onClick={() => handleRate('easy')}
          className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-center transition-all"
        >
          <div className="text-xs font-bold">Easy</div>
          <div className="text-[10px] text-emerald-500/80">سهلة جداً (4 أيام)</div>
        </button>
      </div>

      {/* Navigation Arrows */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              setIsFlipped(false);
            }
          }}
          disabled={currentIndex === 0}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <span className="text-xs text-slate-400">
          {currentIndex + 1} / {flashcards.length}
        </span>

        <button
          onClick={() => {
            if (currentIndex < flashcards.length - 1) {
              setCurrentIndex(currentIndex + 1);
              setIsFlipped(false);
            }
          }}
          disabled={currentIndex === flashcards.length - 1}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
