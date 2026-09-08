import { DocumentData, UserProfile, QuizQuestion, Flashcard } from '../types';

export const api = {
  async getDocuments(): Promise<DocumentData[]> {
    const res = await fetch('/api/documents');
    if (!res.ok) throw new Error('فشل في جلب قائمة الملازم');
    const data = await res.json();
    return data.documents || [];
  },

  async getDocument(id: string): Promise<DocumentData> {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) throw new Error('الملزمة غير موجودة');
    const data = await res.json();
    return data.document;
  },

  async deleteDocument(id: string): Promise<boolean> {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('فشل في حذف الملزمة');
    return true;
  },

  async uploadDocument(
    fileOrText: File | { text: string; title: string },
    onStatusChange?: (status: string) => void
  ): Promise<{ document: DocumentData; isDuplicate: boolean; message: string }> {
    const formData = new FormData();

    if (fileOrText instanceof File) {
      formData.append('file', fileOrText);
      onStatusChange?.('دا أرفع الملف...');
    } else {
      formData.append('text', fileOrText.text);
      formData.append('title', fileOrText.title);
      onStatusChange?.('دا أقرأ المحتوى النصي...');
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'صار خلل في معالجة الملف.');
    }

    return await res.json();
  },

  async explainTopic(params: {
    documentId: string;
    topicId?: string;
    level?: string;
    style?: string;
    variation?: number;
    isReExplain?: boolean;
    customPrompt?: string;
    userPreferences?: any;
  }): Promise<{ explanation: string; topicId: string; topicTitle: string; variation: number }> {
    const res = await fetch('/api/explain-topic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل في توليد الشرح.');
    }
    return await res.json();
  },

  async chat(params: {
    documentId: string;
    topicId?: string;
    messages: any[];
    question: string;
    userLevel?: string;
  }): Promise<{ reply: string; isExternalKnowledge: boolean }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل في إرسال السؤال.');
    }
    return await res.json();
  },

  async generateQuiz(params: {
    documentId: string;
    topicId?: string;
    count?: number;
    difficulty?: string;
    strictlyFromDoc?: boolean;
  }): Promise<{ questions: QuizQuestion[] }> {
    const res = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل في إنشاء الاختبار.');
    }
    return await res.json();
  },

  async generateFlashcards(params: {
    documentId: string;
    topicId?: string;
    count?: number;
  }): Promise<{ flashcards: Flashcard[] }> {
    const res = await fetch('/api/generate-flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل في إنشاء البطاقات.');
    }
    return await res.json();
  },

  async generateSummary(params: {
    documentId: string;
    summaryType: 'quick' | 'medium' | 'detailed' | 'exam';
  }): Promise<{ summary: string }> {
    const res = await fetch('/api/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل في توليد الملخص.');
    }
    return await res.json();
  },

  async generateCheatSheet(documentId: string): Promise<{ cheatSheet: any }> {
    const res = await fetch('/api/generate-cheatsheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل في توليد ورقة الإنقاذ.');
    }
    return await res.json();
  },

  async explainMedia(params: {
    documentId: string;
    mediaType: 'table' | 'figure';
    itemTitle: string;
    itemDescription: string;
    action: 'explain' | 'compare' | 'important';
  }): Promise<{ explanation: string }> {
    const res = await fetch('/api/explain-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل في شرح العنصر.');
    }
    return await res.json();
  },

  async getQuickStudy(params: {
    documentId: string;
    durationMinutes: number;
  }): Promise<{ quickSession: any }> {
    const res = await fetch('/api/quick-study', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل في تجهيز الجلسة.');
    }
    return await res.json();
  },

  async voiceChat(params: {
    documentId?: string;
    topicId?: string;
    transcript: string;
  }): Promise<{ replyText: string }> {
    const res = await fetch('/api/voice-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'فشل في المحادثة الصوتية.');
    }
    return await res.json();
  },

  async getProfile(): Promise<UserProfile> {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('فشل في جلب الحساب');
    const data = await res.json();
    return data.profile;
  },

  async getCurrentUser(): Promise<UserProfile> {
    return this.getProfile();
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('فشل في تحديث الحساب');
    const data = await res.json();
    return data.profile;
  },

  async awardXp(params: {
    amount: number;
    action: 'study' | 'timer' | 'topic' | 'quiz' | 'flashcard';
    minutes?: number;
  }): Promise<{ xp: number; level: number; awarded: number }> {
    const res = await fetch('/api/award-xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('فشل في احتساب النقاط');
    return await res.json();
  },

  async updateProgress(params: {
    documentId: string;
    progressPercent?: number;
    lastTopicId?: string;
    completedTopicId?: string;
    studyTimeMinutes?: number;
  }): Promise<DocumentData> {
    const res = await fetch(`/api/documents/${params.documentId}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('فشل في تحديث التقدم');
    const data = await res.json();
    return data.document;
  }
};
