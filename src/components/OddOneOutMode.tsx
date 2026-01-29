import React, { useState, useEffect } from 'react';
import { gameDataService } from '../services/GameDataService';
import type { OddOneOutQuestion } from '../types/gameData';

/**
 * MODE "L'INTRUS" - VERSION CORRIGÉE
 * 
 * - 1 point par bonne réponse
 * - Randomisation des questions
 */

interface OddOneOutModeProps {
  onBack: () => void;
}

export const OddOneOutMode: React.FC<OddOneOutModeProps> = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState<OddOneOutQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  // Charger une nouvelle question
  const loadQuestion = () => {
    const question = gameDataService.getOddOneOutQuestion();
    if (!question) {
      alert('Plus de questions disponibles !');
      return;
    }
    setCurrentQuestion(question);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  // Soumettre la réponse
  const handleAnswerSubmit = () => {
    if (!currentQuestion || !selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.answer;
    setIsAnswered(true);

    if (isCorrect) {
      setScore(score + 1);
    }
  };

  // Passer à la question suivante
  const handleNextQuestion = () => {
    setRound(round + 1);
    loadQuestion();
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold group"
        >
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span> Retour
        </button>

        {/* En-tête */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">🔍 L'Intrus</h1>
          <p className="text-2xl text-pink-300 font-semibold">Trouve l'élément qui détonne !</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center p-6 bg-white/10 rounded-2xl border-2 border-white/20 shadow-lg animate-fadeIn">
            <p className="text-5xl font-black text-white">{round}</p>
            <p className="text-sm text-white/80 font-semibold mt-2">Question</p>
          </div>
          <div className="text-center p-6 bg-yellow-500/20 rounded-2xl border-2 border-yellow-400 shadow-lg animate-fadeIn">
            <p className="text-5xl font-black text-yellow-300">{score}</p>
            <p className="text-sm text-white/80 font-semibold mt-2">Score</p>
          </div>
        </div>

        {/* Question */}
        <div className="bg-gradient-to-br from-pink-600/10 to-purple-600/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-pink-500/30 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <span className="text-3xl">🎯</span>
          </div>

          <h2 className="text-3xl font-black text-white mb-3">Qui est l'intrus ?</h2>
          {!isAnswered && (
            <div className="mb-8 p-5 bg-blue-500/20 rounded-xl border-2 border-blue-400">
              <p className="text-lg text-white/90 leading-relaxed">{currentQuestion.common_link}</p>
            </div>
          )}

          {/* Options (Grille 2x2) */}
          {!isAnswered ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedOption(option)}
                  className={`p-8 text-center text-xl font-bold rounded-2xl transition-all ${
                    selectedOption === option
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black border-4 border-yellow-400 scale-105 shadow-xl'
                      : 'bg-white/5 text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 hover:scale-102'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isIntrus = option === currentQuestion.answer;

                return (
                  <div
                    key={index}
                    className={`p-8 text-center text-xl font-bold rounded-2xl border-4 transition-all ${
                      isIntrus
                        ? 'bg-red-500/30 border-red-400 text-white scale-105 shadow-xl'
                        : 'bg-green-500/20 border-green-400 text-white'
                    }`}
                  >
                    {option}
                    {isIntrus && <span className="ml-2 text-3xl">🚨</span>}
                    {!isIntrus && <span className="ml-2 text-2xl">✅</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Explication */}
          {isAnswered && (
            <div className="mb-6 space-y-4">
              {/* Feedback */}
              <div
                className={`p-6 rounded-2xl text-center border-2 ${
                  selectedOption === currentQuestion.answer
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-red-500/20 border-red-400'
                }`}
              >
                <p className="text-3xl font-black text-white mb-3">
                  {selectedOption === currentQuestion.answer ? '✅ Bravo ! +1 point' : '❌ Raté !'}
                </p>
                <p className="text-xl text-white">
                  L'intrus était : <span className="font-black text-red-300">{currentQuestion.answer}</span>
                </p>
              </div>

              {/* Point commun */}
              <div className="p-6 rounded-2xl bg-blue-500/20 border-2 border-blue-400">
                <p className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-3">
                  Point commun des 3 autres :
                </p>
                <p className="text-lg text-white leading-relaxed">{currentQuestion.common_link}</p>
              </div>

              {/* Raison */}
              <div className="p-6 rounded-2xl bg-purple-500/20 border-2 border-purple-400">
                <p className="text-sm font-bold text-purple-300 uppercase tracking-wider mb-3">
                  💡 Explication :
                </p>
                <p className="text-lg text-white leading-relaxed">{currentQuestion.reason}</p>
              </div>
            </div>
          )}

          {/* Boutons */}
          {!isAnswered ? (
            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedOption}
              className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
            >
              ✓ Valider
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Question suivante →
            </button>
          )}
        </div>

        {/* Statistiques */}
        <div className="mt-6 text-center animate-fadeIn">
          <p className="text-white/60 text-sm">
            Questions restantes : <span className="font-bold text-white">{gameDataService.getAvailableQuestionsCount('oddoneout')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OddOneOutMode;
