export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
  IMAGE_GEN = 'IMAGE_GEN'
}

export enum Difficulty {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard'
}

export interface Question {
  questionText: string;
  correctAnswer: string;
  incorrectAnswers: string[];
  category: string;
}

export interface QuestionResponse {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

// TrivAI Pursuit Categories
export const CATEGORIES = [
  { id: 'geography', name: 'Geography', color: 'bg-blue-500', icon: '🌍' },
  { id: 'entertainment', name: 'Entertainment', color: 'bg-pink-500', icon: '🎬' },
  { id: 'history', name: 'History', color: 'bg-yellow-500', icon: '📜' },
  { id: 'art', name: 'Art & Lit', color: 'bg-purple-500', icon: '🎨' },
  { id: 'science', name: 'Science', color: 'bg-green-500', icon: '🔬' },
  { id: 'sports', name: 'Sports', color: 'bg-orange-500', icon: '🏆' },
];

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageSize = '1K' | '2K' | '4K';
