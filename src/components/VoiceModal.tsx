import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Loader2, PlayCircle, StopCircle } from 'lucide-react';
import { api } from '../services/api';
import { DocumentData } from '../types';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDoc: DocumentData | null;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose, activeDoc }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
      setTranscript('');
      setResponse('');
      return;
    }

    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'ar-IQ'; // Iraqi Arabic default with mixed English support

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        setTranscript('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Start recognition error:', err);
      }
    } else {
      alert('متصفحك لا يدعم التعرف على الصوت المباشر. يمكنك كتابة سؤالك في حقل المحادثة.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSendVoiceQuestion = async () => {
    if (!transcript.trim()) return;
    setIsLoading(true);
    try {
      const res = await api.voiceChat({
        documentId: activeDoc?.id,
        transcript: transcript.trim()
      });
      setResponse(res.replyText);
      speakText(res.replyText);
    } catch (err) {
      setResponse('صار خلل بالاتصال الصوتي، جرب تسأل مرة ثانية عيني.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-XA'; // Arabic voice
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        dir="rtl"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto mb-2">
            <Mic className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">تحدث صوتياً مع دَرّسني</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            يدعم الكلام باللهجة العراقية والإنجليزية والمختلط ("هلا شباب شنو الـpathophysiology...")
          </p>
        </div>

        {/* Listening / Waveform Visualizer */}
        <div className="flex flex-col items-center justify-center py-6">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-95 ${
              isListening
                ? 'bg-rose-500 shadow-rose-500/40 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            {isListening && (
              <span className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping" />
            )}
          </button>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4">
            {isListening ? 'دا أسمعك... احچي براحتك' : 'اضغط على المايك وابدأ الكلام'}
          </span>
        </div>

        {/* Live Transcript Box */}
        {transcript && (
          <div className="mb-4 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-[11px] font-semibold text-slate-400 mb-1">صوتك:</div>
            <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
              "{transcript}"
            </p>
            {!isLoading && (
              <button
                onClick={handleSendVoiceQuestion}
                className="mt-2.5 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>اسأل دَرّسني عن هذا المفهوم</span>
              </button>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="py-4 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
            <span className="text-xs text-slate-500">دا يجهز الجواب الصوتي...</span>
          </div>
        )}

        {/* AI Voice Response */}
        {response && (
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <Volume2 className="w-4 h-4" />
                رد دَرّسني:
              </span>
              <button
                onClick={isSpeaking ? stopSpeaking : () => speakText(response)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {isSpeaking ? (
                  <>
                    <StopCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-rose-500">إيقاف القراءة</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>إعادة الاستماع</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {response}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
