export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  avatar?: string;
  specialization: 'Medicine' | 'Pharmacy' | 'Dentistry' | 'Nursing' | 'Engineering' | 'Science' | 'Law' | 'Other';
  academicLevel: string;
  dialect: 'iraqi' | 'saudi' | 'egyptian' | 'fusha' | 'english';
  explanationLevel: 'quick' | 'medium' | 'deep' | 'scratch' | 'exam' | 'medical' | 'academic';
  explanationStyle: 'tutor' | 'simplified' | 'exam' | 'medical' | 'discussion' | 'fast' | 'academic' | 'analogies';
  keepEnglishTerms: boolean;
  useAnalogies: boolean;
  useEmojis: boolean;
  theme: 'light' | 'dark' | 'system';
  xp: number;
  level: number;
  streak: number;
  lastStudyDate: string;
  totalStudyMinutes: number;
  topicsCompletedCount: number;
  quizzesTakenCount: number;
  flashcardsMasteredCount: number;
}

export interface DocumentTopic {
  id: string;
  title: string;
  titleEn?: string;
  pageReference?: string;
  summary: string;
  keyConcepts: string[];
  subtopics: string[];
  difficulty: 'سهل' | 'متوسط' | 'صعب' | 'متقدم';
  isCompleted?: boolean;
}

export type Topic = DocumentTopic;

export interface DocumentTerm {
  term: string;
  termEn?: string;
  definition: string;
  clinicalSignificance?: string;
  page?: string;
}

export interface DocumentTable {
  id: string;
  title: string;
  description: string;
  page?: string;
  keyComparison?: string;
}

export interface DocumentFigure {
  id: string;
  title: string;
  description: string;
  page?: string;
  keyObservations?: string;
}

export interface HighYieldPoint {
  category: string;
  point: string;
  examRelevance: 'عالية جدًا 🔥' | 'مهمة' | 'معلومة سريرية' | 'سؤال مكرر';
}

export interface QualityReport {
  textQuality: 'ممتازة' | 'جيدة' | 'متوسطة' | 'تحتاج مراجعة';
  scannedPagesDetected: boolean;
  imageDetection: boolean;
  notes: string;
  isPartial: boolean;
  pdfType: 'Text PDF' | 'Scanned PDF' | 'Mixed PDF';
}

export interface StudyPlanDay {
  day: number;
  title: string;
  topicIds: string[];
  estimatedMinutes: number;
  isDone: boolean;
}

export interface DocumentData {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileHash: string;
  pageCount: number;
  summary: string;
  difficulty: 'سهل' | 'متوسط' | 'صعب' | 'متقدم / امتحاني';
  estimatedStudyTime: string;
  createdAt: string;
  lastStudiedAt: string;
  progressPercent: number;
  lastTopicId?: string;
  topics: DocumentTopic[];
  importantTerms: DocumentTerm[];
  tables: DocumentTable[];
  figures: DocumentFigure[];
  highYieldPoints: HighYieldPoint[];
  qualityReport: QualityReport;
  studyPlan: StudyPlanDay[];
  extractedTextSample?: string;
}

export interface Flashcard {
  id: string;
  documentId: string;
  topicId?: string;
  front: string;
  back: string;
  page?: string;
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: string;
  status: 'new' | 'learning' | 'mastered';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceCitation?: string;
  topicId?: string;
}

export interface QuizAttempt {
  id: string;
  documentId: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  difficulty: string;
  weakTopics: string[];
  strongTopics: string[];
  recommendations: string;
  timeSpentSeconds: number;
}

export interface ChatMessage {
  id: string;
  sender?: 'user' | 'assistant';
  role?: 'user' | 'assistant';
  text?: string;
  content?: string;
  timestamp?: string;
  createdAt?: string;
  citation?: string;
  isExternalKnowledge?: boolean;
}

export interface UserNote {
  id: string;
  documentId: string;
  topicId?: string;
  page?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserBookmark {
  id: string;
  documentId: string;
  topicId?: string;
  title: string;
  type: 'topic' | 'explanation' | 'term' | 'question';
  contentSnippet: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
}
