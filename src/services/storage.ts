import { UserNote, UserBookmark } from '../types';

const NOTES_KEY = 'darrasni_notes_v1';
const BOOKMARKS_KEY = 'darrasni_bookmarks_v1';
const THEME_KEY = 'darrasni_theme_v1';

export const storage = {
  getNotes(documentId?: string): UserNote[] {
    try {
      const data = localStorage.getItem(NOTES_KEY);
      const notes: UserNote[] = data ? JSON.parse(data) : [];
      if (documentId) {
        return notes.filter((n) => n.documentId === documentId);
      }
      return notes;
    } catch {
      return [];
    }
  },

  saveNote(note: Omit<UserNote, 'id' | 'createdAt' | 'updatedAt'>): UserNote {
    const notes = this.getNotes();
    const newNote: UserNote = {
      ...note,
      id: 'note_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.unshift(newNote);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    return newNote;
  },

  deleteNote(id: string): void {
    const notes = this.getNotes().filter((n) => n.id !== id);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  },

  getBookmarks(documentId?: string): UserBookmark[] {
    try {
      const data = localStorage.getItem(BOOKMARKS_KEY);
      const list: UserBookmark[] = data ? JSON.parse(data) : [];
      if (documentId) {
        return list.filter((b) => b.documentId === documentId);
      }
      return list;
    } catch {
      return [];
    }
  },

  toggleBookmark(bookmark: Omit<UserBookmark, 'id' | 'createdAt'>): boolean {
    const list = this.getBookmarks();
    const existingIndex = list.findIndex(
      (b) => b.documentId === bookmark.documentId && b.title === bookmark.title
    );
    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
      return false; // Removed
    } else {
      const newBm: UserBookmark = {
        ...bookmark,
        id: 'bm_' + Date.now(),
        createdAt: new Date().toISOString()
      };
      list.unshift(newBm);
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
      return true; // Added
    }
  },

  isBookmarked(documentId: string, title: string): boolean {
    const list = this.getBookmarks();
    return list.some((b) => b.documentId === documentId && b.title === title);
  },

  getTheme(): 'light' | 'dark' {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  setTheme(theme: 'light' | 'dark'): void {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};
