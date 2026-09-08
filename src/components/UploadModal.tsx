import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileUp, 
  Loader2, 
  FileCheck, 
  Sparkles,
  ClipboardPaste,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentData } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (doc: DocumentData) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedText, setPastedText] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('جاهز للرفع');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      validateAndSetFile(selected);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    setErrorMessage('');
    // Check file size (max 25MB)
    if (f.size > 25 * 1024 * 1024) {
      setErrorMessage('حجم الملف كبير جدًا! الحد الأقصى المسموح به هو 25 ميجابايت.');
      return;
    }
    // Check extension
    const validExtensions = ['.pdf', '.txt', '.md', '.doc', '.docx'];
    const hasValidExt = validExtensions.some((ext) => f.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMessage('هذا النوع من الملفات غير مدعوم. يرجى اختيار ملف PDF أو TXT أو Word.');
      return;
    }
    setFile(f);
  };

  const handleStartProcessing = async () => {
    if (activeTab === 'file' && !file) {
      setErrorMessage('يرجى اختيار ملف أولاً.');
      return;
    }
    if (activeTab === 'text' && (!pastedText.trim() || !pastedTitle.trim())) {
      setErrorMessage('يرجى كتابة عنوان ولصق النص المراد دراسته.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');
    setUploadPercent(15);
    setStatusMessage('دا أرفع الملف...');

    // Progress simulation during AI multimodal processing
    const step1 = setTimeout(() => {
      setUploadPercent(35);
      setStatusMessage('دا أقرأ المحتوى...');
    }, 1200);

    const step2 = setTimeout(() => {
      setUploadPercent(60);
      setStatusMessage('دا أفهم المادة...');
    }, 2800);

    const step3 = setTimeout(() => {
      setUploadPercent(80);
      setStatusMessage('دا أرتب المواضيع والأسئلة...');
    }, 4500);

    const step4 = setTimeout(() => {
      setUploadPercent(95);
      setStatusMessage('دا أجهز خطة الدراسة وورقة الإنقاذ...');
    }, 6000);

    try {
      let result;
      if (activeTab === 'file' && file) {
        result = await api.uploadDocument(file, (st) => setStatusMessage(st));
      } else {
        result = await api.uploadDocument({ text: pastedText, title: pastedTitle });
      }

      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);

      setUploadPercent(100);
      setStatusMessage('جاهزين! 🚀');

      setTimeout(() => {
        setIsUploading(false);
        onSuccess(result.document);
        onClose();
      }, 600);
    } catch (err: any) {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
      setIsUploading(false);
      setErrorMessage(err.message || 'صار خلل بقراءة الملف. جرّب ترفعه مرة ثانية.');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        dir="rtl"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">رفع ملزمة دراسية</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">نظام تحليل الملازم الذكي متكامل مع Gemini</p>
            </div>
          </div>
          {!isUploading && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tab Selection */}
        {!isUploading && (
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2">
            <button
              onClick={() => setActiveTab('file')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'file'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <FileUp className="w-4 h-4" />
              <span>ملف PDF / مستند</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'text'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>لصق النص يدويًا</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Uploading Status View */}
          {isUploading ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">{statusMessage}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  دا نحلل النصوص والمخططات والجداول ونستخرج أرقام الصفحات بدقة
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{file ? file.name : pastedTitle}</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{uploadPercent}%</span>
              </div>
            </div>
          ) : activeTab === 'file' ? (
            /* File Upload View */
            <div className="space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]'
                    : file
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {file ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <FileCheck className="w-6 h-6" />
                    </div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-xs mx-auto">
                      {file.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                      <span>{formatBytes(file.size)}</span>
                      <span>•</span>
                      <span>جاهز للتحليل</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-xs text-rose-500 hover:underline pt-1"
                    >
                      تغيير الملف
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        اسحب ملف الملزمة وأفلته هنا
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        أو انقر لاختيار ملف من جهازك
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">PDF</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">Scanned & Text</span>
                      <span>أقصى حجم: 25MB</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample note tryout */}
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    ماعندك ملزمة حالياً؟
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPastedTitle('Pharmacology: Antihypertensive Agents (أدوية ضغط الدم)');
                    setPastedText(`Lecture: Antihypertensive Pharmacology & Therapeutics
Topics covered:
1. Classification of Antihypertensives: ACE inhibitors, ARBs, Calcium Channel Blockers, Diuretics, Beta Blockers.
2. Mechanisms of action: ACEi inhibits ACE preventing conversion of Angiotensin I to Angiotensin II, reducing aldosterone and bradykinin breakdown.
3. Adverse effects: Dry cough in ACEi due to bradykinin accumulation; substitute with ARBs like Losartan.
4. Calcium channel blockers: Dihydropyridines (Amlodipine) cause vasodilation with potential ankle edema. Non-dihydropyridines (Verapamil, Diltiazem) cause bradycardia and decreased cardiac inotropy.
5. Clinical indications: Diabetic nephropathy best treated with ACEi/ARB for renal protection.
6. Contraindications: Pregnancy is absolute contraindication for ACEi and ARBs due to fetal teratogenicity and renal dysgenesis.`);
                    setActiveTab('text');
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  استخدم ملزمة طبية تجريبية
                </button>
              </div>
            </div>
          ) : (
            /* Manual Text Paste View */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان المحتوى أو الملزمة
                </label>
                <input
                  type="text"
                  placeholder="مثال: علم الأدوية - المحاضرة الرابعة"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  النص أو المادة العلمية
                </label>
                <textarea
                  rows={6}
                  placeholder="الصق هنا ملخص المحاضرة، الملاحظات، أو أي نص دراسي ترغب في أن يشرحه لك دَرّسني..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!isUploading && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleStartProcessing}
              disabled={activeTab === 'file' ? !file : !pastedText.trim() || !pastedTitle.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>ابدأ التحليل والدراسة</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
