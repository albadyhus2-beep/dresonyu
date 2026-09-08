import React, { useState, useEffect } from 'react';
import { X, Bookmark, Plus, Trash2, StickyNote, Tag, Calendar } from 'lucide-react';
import { storage } from '../services/storage';
import { UserNote, UserBookmark, DocumentData } from '../types';

interface NotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentData;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({ isOpen, onClose, document: doc }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'bookmarks'>('notes');
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen && doc?.id) {
      setNotes(storage.getNotes(doc.id));
      setBookmarks(storage.getBookmarks(doc.id));
    }
  }, [isOpen, doc?.id]);

  if (!isOpen || !doc) return null;

  const handleCreateNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    const created = storage.saveNote({
      documentId: doc.id,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim()
    });
    setNotes([created, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAdding(false);
  };

  const handleDeleteNote = (id: string) => {
    storage.deleteNote(id);
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleDeleteBookmark = (bm: UserBookmark) => {
    storage.toggleBookmark({
      documentId: bm.documentId,
      title: bm.title,
      type: bm.type,
      contentSnippet: bm.contentSnippet
    });
    setBookmarks(bookmarks.filter((b) => b.id !== bm.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        dir="rtl"
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">الملاحظات والمحفوظات</h3>
              <p className="text-[10px] text-slate-400 truncate max-w-xs">{doc.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2">
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5" />
            <span>ملاحظاتي ({notes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>المحفوظات ({bookmarks.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'notes' ? (
            <>
              {/* Add Note Button or Form */}
              {!isAdding ? (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة ملاحظة جديدة</span>
                </button>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <input
                    type="text"
                    placeholder="عنوان الملاحظة"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <textarea
                    rows={3}
                    placeholder="اكتب ملاحظتك هنا..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleCreateNote}
                      className="px-3 py-1 rounded-lg text-xs bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              )}

              {/* Notes list */}
              {notes.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  لا توجد ملاحظات مسجلة لهذه الملزمة بعد.
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-right group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{note.title}</h4>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(note.createdAt).toLocaleDateString('ar-IQ')}</span>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            /* Bookmarks list */
            bookmarks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                لم تقم بحفظ أي مفهوم أو سؤال حتى الآن.
              </div>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-right group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold">
                      {bm.type}
                    </span>
                    <button
                      onClick={() => handleDeleteBookmark(bm)}
                      className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">{bm.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                    {bm.contentSnippet}
                  </p>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
