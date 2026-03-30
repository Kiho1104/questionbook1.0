export type QuestionType = 'choice' | 'blank';

export interface Question {
  id: string;
  userId: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For choice
  answer: string;
  explanation?: string;
  tags: string[];
  subject: string; // e.g., "英语", "数学", "语文"
  priority: number; // 1-5, higher means more frequent
  stats: {
    correctCount: number;
    totalCount: number;
    avgTime: number; // in seconds
    lastPracticedAt?: number;
  };
  createdAt: number;
}

export interface UserStats {
  userId: string;
  lastCheckInDate?: string; // YYYY-MM-DD
  streak: number;
  totalCorrect: number;
  dailyReviewCount: number;
  lastReviewDate?: string; // YYYY-MM-DD
  totalQuestions: number;
}

export interface PracticeSession {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  questions: {
    questionId: string;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number; // seconds
  }[];
}
