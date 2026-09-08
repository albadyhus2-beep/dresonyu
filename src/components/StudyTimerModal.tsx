import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X, Sparkles, CheckCircle2, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { DocumentData } from '../types';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDoc: DocumentData | null;
  onXpAwarded?: (amount: number) => void;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  activeDoc,
  onXpAwarded
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => sec - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      api.awardXp({
        amount: Math.round(selectedMinutes * 2),
        action: 'timer',
        minutes: selectedMinutes
      }).then(() => {
        onXpAwarded?.(Math.round(selectedMinutes * 2));
      }).catch(console.error);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, selectedMinutes]);

  if (!isOpen) return null;

  const handleSelectDuration = (mins: number) => {
    setSelectedMinutes(mins);
    setSecondsRemaining(mins * 60);
    setIsActive(false);
    setIsCompleted(false);
  };

  const handleTogglePlay = () => {
    setIsActive(!isActive);
    setIsCompleted(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsCompleted(false);
    setSecondsRemaining(selectedMinutes * 60);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = ((selectedMinutes * 60 - secondsRemaining) / (selectedMinutes * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        dir="rtl"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto mb-2">
            <Timer className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">مؤقت التركيز والدراسة</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {activeDoc ? `مرتبط بـ: ${activeDoc.title}` : 'جلسة تركيز عامة (Pomodoro)'}
          </p>
        </div>

        {/* Preset Selectors */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[25, 45, 60, 90].map((mins) => (
            <button
              key={mins}
              onClick={() => handleSelectDuration(mins)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedMinutes === mins
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {mins} دقيقة
            </button>
          ))}
        </div>

        {/* Circular Display */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-100 dark:text-slate-800 stroke-current"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-amber-500 stroke-current transition-all duration-500"
              strokeWidth="6"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold font-mono text-slate-900 dark:text-white tracking-wider">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-1">
              {isActive ? 'دا تدرس...' : isCompleted ? 'أحسنت! انتهت الجلسة' : 'متوقف'}
            </span>
          </div>
        </div>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>أحسنت يا بطل! تم إكمال {selectedMinutes} دقيقة تركيز.</span>
            </div>
            <span className="font-bold">+{selectedMinutes * 2} XP</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleReset}
            title="إعادة ضبط"
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${
              isActive
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>{secondsRemaining < selectedMinutes * 60 ? 'استئناف' : 'ابدأ التركيز'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
