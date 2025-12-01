import React, { useState, useEffect } from 'react';
import { GameState, Difficulty, CATEGORIES, Question } from './types';
import { generateTriviaQuestion } from './services/geminiService';
import QuestionCard from './components/QuestionCard';
import ImageGenerator from './components/ImageGenerator';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const startGame = async (selectedCat: string) => {
    setCategory(selectedCat);
    setScore(0);
    setStreak(0);
    await loadQuestion(selectedCat);
    setGameState(GameState.PLAYING);
  };

  const loadQuestion = async (cat: string) => {
    setIsLoading(true);
    setShowResult(false);
    setSelectedAnswer(null);
    try {
      const catName = CATEGORIES.find(c => c.id === cat)?.name || cat;
      const q = await generateTriviaQuestion(catName, difficulty);
      setCurrentQuestion(q);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setLastAnswerCorrect(correct);
    if (correct) {
      setScore(s => s + 100 + (streak * 10)); // Bonus for streak
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (showResult) {
      loadQuestion(category);
    }
  };

  const getResultPrompt = () => {
    if (!currentQuestion) return "A trivia trophy";
    return lastAnswerCorrect 
      ? `A golden trophy symbolizing victory in ${currentQuestion.category}, detailed, 4k, cinematic lighting` 
      : `A comforting scene representing learning from mistakes in ${currentQuestion.category}, soft lighting, hopeful atmosphere`;
  };

  // -- Render Helpers --

  const renderMenu = () => (
    <div className="max-w-4xl mx-auto text-center px-4 animate-fade-in">
      <div className="mb-12">
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6 drop-shadow-lg tracking-tight">
          TrivAI Pursuit
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Challenge your mind with AI-generated trivia across multiple disciplines. 
          Win rounds to unlock high-fidelity visual rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => startGame(cat.id)}
            className="group relative bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${cat.color} blur-2xl rounded-full w-24 h-24 -mr-4 -mt-4`}></div>
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{cat.name}</h3>
            <p className="text-sm text-slate-500">Start Challenge &rarr;</p>
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <div className="bg-slate-800 p-1 rounded-lg inline-flex">
          {Object.values(Difficulty).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                difficulty === diff 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
        
        {/* Direct Access to Studio */}
        <button
          onClick={() => setGameState(GameState.IMAGE_GEN)}
          className="px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-bold shadow-lg hover:shadow-pink-500/20 transition-all"
        >
          Visual Studio
        </button>
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="w-full max-w-4xl mx-auto px-4">
      <header className="flex justify-between items-center mb-8">
        <button onClick={() => setGameState(GameState.MENU)} className="text-slate-400 hover:text-white font-medium">
          &larr; Exit
        </button>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Score</div>
            <div className="text-2xl font-bold text-white font-mono">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-500 uppercase tracking-wide">Streak</div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">🔥 {streak}</div>
          </div>
        </div>
      </header>

      {currentQuestion ? (
        <div className="relative">
          <QuestionCard 
            question={currentQuestion} 
            onAnswer={handleAnswer} 
            isLoading={isLoading || showResult}
          />
          
          {showResult && (
             <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
               <div className="bg-slate-900/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700 text-center pointer-events-auto transform animate-scale-in max-w-md w-full mx-4">
                 <div className="text-6xl mb-4">
                   {lastAnswerCorrect ? '🎉' : '❌'}
                 </div>
                 <h2 className={`text-3xl font-bold mb-2 ${lastAnswerCorrect ? 'text-green-400' : 'text-red-400'}`}>
                   {lastAnswerCorrect ? 'Correct!' : 'Wrong!'}
                 </h2>
                 <p className="text-slate-300 mb-6">
                   {lastAnswerCorrect 
                     ? `+${100 + (streak > 1 ? (streak-1) * 10 : 0)} points` 
                     : `The correct answer was: ${currentQuestion.correctAnswer}`
                   }
                 </p>
                 
                 <div className="space-y-3">
                   <button 
                     onClick={handleNext}
                     className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
                   >
                     Next Question
                   </button>
                   
                   {lastAnswerCorrect && (
                     <button 
                       onClick={() => setGameState(GameState.IMAGE_GEN)}
                       className="w-full py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-lg shadow-pink-900/20"
                     >
                       Claim Visual Reward 🎨
                     </button>
                   )}
                 </div>
               </div>
             </div>
          )}
        </div>
      ) : (
        <div className="text-center mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30 flex flex-col">
      <main className="flex-grow flex items-center justify-center py-12">
        {gameState === GameState.MENU && renderMenu()}
        {gameState === GameState.PLAYING && renderGame()}
        {gameState === GameState.IMAGE_GEN && (
          <ImageGenerator 
            initialPrompt={getResultPrompt()} 
            onBack={() => setGameState(GameState.MENU)} 
          />
        )}
      </main>
      
      <footer className="py-6 text-center text-slate-600 text-sm">
        <p>Powered by Gemini 2.5 Flash & Gemini 3 Pro</p>
      </footer>
    </div>
  );
};

export default App;
