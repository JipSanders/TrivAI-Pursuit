import React, { useMemo } from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  isLoading: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswer, isLoading }) => {
  // Shuffle answers once when the question changes
  const shuffledAnswers = useMemo(() => {
    const all = [...question.incorrectAnswers, question.correctAnswer];
    return all.sort(() => Math.random() - 0.5);
  }, [question]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 animate-fade-in-up">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <span className="px-3 py-1 bg-indigo-600 text-xs font-bold uppercase tracking-wider rounded-full text-indigo-100">
            {question.category}
          </span>
          {isLoading && <span className="text-slate-400 text-sm animate-pulse">Processing...</span>}
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
          {question.questionText}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shuffledAnswers.map((answer, index) => (
            <button
              key={index}
              onClick={() => !isLoading && onAnswer(answer)}
              disabled={isLoading}
              className="group relative p-4 text-left bg-slate-700 hover:bg-slate-600 rounded-xl transition-all duration-200 border border-slate-600 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              <span className="flex items-center">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-full mr-4 text-sm font-bold group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-lg text-slate-200 group-hover:text-white font-medium">
                  {answer}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
