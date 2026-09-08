import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, Volume2, StopCircle, Copy, Check, AlertCircle } from 'lucide-react';
import { DocumentData, ChatMessage, UserProfile } from '../types';
import { api } from '../services/api';

interface ChatPageProps {
  document: DocumentData;
  profile: UserProfile | null;
}

export const ChatPage: React.FC<ChatPageProps> = ({ document: doc, profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `هلا بيك يا بطل! أنا دَرّسني، قارئ ملزمة "${doc.title}" بالكامل ومستعد أجاوبك عن أي فكرة، معادلة، أو تفصيلة مذكورة بيها، وبشكل عراقي مبسط ومباشر. اسألني عن أي شي ببالك!`,
      createdAt: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'شنو أهم 3 مفاهيم لازم أركز عليها بالامتحان؟',
    'اشرحلي الفروقات الأساسية المذكورة بالجداول.',
    'هل اكو أرقام أو نسب مئوية مهمة لازم أحفظها؟',
    'لخصلي أهم الآليات المرضية بـ 4 نقاط سريعة.'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: q,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.chat({
        documentId: doc.id,
        topicId: selectedTopicId === 'all' ? undefined : selectedTopicId,
        messages: messages.slice(-6),
        question: q,
        userLevel: profile?.academicLevel
      });

      const assistantMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'assistant',
        content: res.reply,
        isExternalKnowledge: res.isExternalKnowledge,
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'bot_err_' + Date.now(),
        role: 'assistant',
        content: 'صار خلل بالاتصال مع دَرّسني. يرجى إعادة إرسال السؤال.',
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-h-[850px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Chat Top Filter Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">المحادثة الذكية مع الملزمة</h2>
            <p className="text-[10px] text-slate-400">إجابات مستندة حصراً لبيانات ملف {doc.fileName}</p>
          </div>
        </div>

        {/* Topic filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">نطاق السؤال:</span>
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="all">كل الملزمة (عام)</option>
            {doc.topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {/* Notice if external knowledge was used */}
                {m.isExternalKnowledge && (
                  <div className="mb-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-1.5 border border-amber-200/70 dark:border-amber-800/70">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>تنبيه: هذه الجزئية إضافية من المعرفة الطبية العامة وليست واردة في نص الملزمة.</span>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-sans">{m.content}</div>

                {/* Actions for assistant */}
                {!isUser && (
                  <div className="flex items-center justify-end gap-1.5 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-slate-400">
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="p-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="نسخ الرد"
                    >
                      {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span>دَرّسني يقرأ الملزمة ويصيغ الجواب...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions (Chips) */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 bg-slate-50/50 dark:bg-slate-800/20">
          <span className="text-[11px] text-slate-400">اقتراحات:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="اسأل دَرّسني أي سؤال عن الملزمة... (مثال: شنو الفرق بين systolic و diastolic؟)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm shadow-indigo-600/20 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4 -rotate-90" />
          </button>
        </form>
      </div>
    </div>
  );
};
