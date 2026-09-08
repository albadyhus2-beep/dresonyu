import React, { useState } from 'react';
import { Download, FileText, Printer, Check, X, FileCode, Sparkles } from 'lucide-react';
import { DocumentData } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentData;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, document: doc }) => {
  const [selectedFormat, setSelectedFormat] = useState<'md' | 'txt' | 'print'>('md');
  const [exportTarget, setExportTarget] = useState<'summary' | 'flashcards' | 'cheatsheet' | 'all'>('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !doc) return null;

  const generateExportContent = () => {
    let output = `# ${doc.title}\n`;
    output += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-IQ')}\n`;
    output += `عدد الصفحات: ${doc.pageCount} | مستوى الصعوبة: ${doc.difficulty}\n\n`;

    if (exportTarget === 'summary' || exportTarget === 'all') {
      output += `## 📚 ملخص الملزمة الشامل\n\n${doc.summary}\n\n`;
      output += `### المواضيع المستخرجة:\n`;
      doc.topics.forEach((t, i) => {
        output += `\n#### ${i + 1}. ${t.title} (${t.titleEn || ''})\n`;
        output += `- المرجع: ${t.pageReference || 'غير محدد'}\n`;
        output += `- الملخص: ${t.summary}\n`;
        output += `- المفاهيم الأساسية: ${t.keyConcepts.join('، ')}\n`;
      });
      output += `\n---\n\n`;
    }

    if (exportTarget === 'cheatsheet' || exportTarget === 'all') {
      output += `## 🔥 ورقة الإنقاذ والمفاهيم عالية الأهمية (High-Yield)\n\n`;
      doc.highYieldPoints.forEach((h, i) => {
        output += `* [${h.category} - ${h.examRelevance}]: ${h.point}\n`;
      });
      output += `\n### أهم المصطلحات العلمية:\n`;
      doc.importantTerms.forEach((term) => {
        output += `* **${term.term}** (${term.termEn || ''}): ${term.definition} [${term.page || ''}]\n`;
      });
      output += `\n---\n\n`;
    }

    if (exportTarget === 'flashcards' || exportTarget === 'all') {
      output += `## 🧠 بطاقات الاستذكار السريع (Flashcards)\n\n`;
      doc.importantTerms.forEach((term, idx) => {
        output += `**بطاقة #${idx + 1}**\n- السؤال: ما هو تعريف ${term.termEn || term.term} وما هي أهميته السريرية؟\n- الجواب: ${term.definition}. الأهمية: ${term.clinicalSignificance || 'أساسية للمقرر'}\n\n`;
      });
    }

    return output;
  };

  const handleDownload = () => {
    const text = generateExportContent();
    if (selectedFormat === 'print') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="ar" dir="rtl">
          <head>
            <title>${doc.title} - دَرّسني</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; line-height: 1.6; color: #1e293b; }
              h1 { color: #4338ca; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
              h2 { color: #0f172a; margin-top: 24px; border-bottom: 1px solid #cbd5e1; }
              ul { padding-right: 20px; }
              .badge { background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            </style>
          </head>
          <body>
            <pre style="white-space: pre-wrap; font-family: inherit;">${text}</pre>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
      return;
    }

    const extension = selectedFormat === 'md' ? 'md' : 'txt';
    const mimeType = selectedFormat === 'md' ? 'text/markdown' : 'text/plain';
    const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.replace(/\s+/g, '_')}_Darrasni.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateExportContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        dir="rtl"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto mb-2">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">تصدير ملخصات ودراسة الملزمة</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            احفظ المحتوى كملف Markdown أو نصي أو اطبع ورقة الإنقاذ
          </p>
        </div>

        {/* Content Scope Selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            المحتوى المراد تصديره:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'all', label: 'الكل (شامل)' },
              { id: 'cheatsheet', label: '🔥 ورقة الإنقاذ فقط' },
              { id: 'summary', label: 'الملخص والمواضيع' },
              { id: 'flashcards', label: 'بطاقات الاستذكار' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setExportTarget(opt.id as any)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                  exportTarget === opt.id
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            صيغة التصدير:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setSelectedFormat('md')}
              className={`p-3 rounded-xl text-center border transition-all ${
                selectedFormat === 'md'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-bold">Markdown</div>
              <div className="text-[10px] text-slate-400">.md</div>
            </button>
            <button
              onClick={() => setSelectedFormat('txt')}
              className={`p-3 rounded-xl text-center border transition-all ${
                selectedFormat === 'txt'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-bold">ملف نصي</div>
              <div className="text-[10px] text-slate-400">.txt</div>
            </button>
            <button
              onClick={() => setSelectedFormat('print')}
              className={`p-3 rounded-xl text-center border transition-all ${
                selectedFormat === 'print'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Printer className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-bold">طباعة / PDF</div>
              <div className="text-[10px] text-slate-400">Printable</div>
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <FileText className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{selectedFormat === 'print' ? 'فتح شاشة الطباعة' : 'تنزيل الملف'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
