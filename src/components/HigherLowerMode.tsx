import React, { useState, useEffect } from 'react';
import { gameDataService } from '../services/GameDataService';
import type { HigherLowerQuestion } from '../types/gameData';

/**
 * MODE "PLUS OU MOINS" - VERSION CORRIGÉE
 * 
 * - 1 point par bonne réponse
 * - Streak qui reset à 0 si erreur
 * - Randomisation des questions
 */

interface HigherLowerModeProps {
  onBack: () => void;
}

export const HigherLowerMode: React.FC<HigherLowerModeProps> = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState<HigherLowerQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<'Plus' | 'Moins' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [round, setRound] = useState(1);

  // Charger une nouvelle question
  const loadQuestion = () => {
    const question = gameDataService.getHigherLowerQuestion();
    if (!question) {
      alert('Plus de questions disponibles !');
      return;
    }
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  // Soumettre la réponse
  const handleAnswerSubmit = (answer: 'Plus' | 'Moins') => {
    if (!currentQuestion) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correct_answer;
    setIsAnswered(true);

    if (isCorrect) {
      setScore(score + 1); // +1 point
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
    } else {
      setStreak(0); // Streak reset
    }
  };

  // Passer à la question suivante
  const handleNextQuestion = () => {
    setRound(round + 1);
    loadQuestion();
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold group"
        >
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span> Retour
        </button>

        {/* En-tête */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">↕️ Plus ou Moins ?</h1>
          <p className="text-2xl text-blue-300 font-semibold">Compare les statistiques !</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center p-6 bg-white/10 rounded-2xl border-2 border-white/20 shadow-lg animate-fadeIn">
            <p className="text-4xl font-black text-white">{round}</p>
            <p className="text-sm text-white/80 font-semibold mt-2">Question</p>
          </div>
          <div className="text-center p-6 bg-yellow-500/20 rounded-2xl border-2 border-yellow-400 shadow-lg animate-fadeIn">
            <p className="text-4xl font-black text-yellow-300">{score}</p>
            <p className="text-sm text-white/80 font-semibold mt-2">Score</p>
          </div>
          <div className="text-center p-6 bg-green-500/20 rounded-2xl border-2 border-green-400 shadow-lg animate-fadeIn">
            <p className="text-4xl font-black text-green-300">{streak}</p>
            <p className="text-sm text-white/80 font-semibold mt-2">Série 🔥</p>
          </div>
          <div className="text-center p-6 bg-purple-500/20 rounded-2xl border-2 border-purple-400 shadow-lg animate-fadeIn">
            <p className="text-4xl font-black text-purple-300">{bestStreak}</p>
            <p className="text-sm text-white/80 font-semibold mt-2">Record</p>
          </div>
        </div>

        {/* Catégorie */}
        <div className="text-center mb-6 animate-fadeIn">
          <span className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-xl rounded-2xl shadow-lg">
            📊 {currentQuestion.label}
          </span>
        </div>

        {/* Les deux cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* CARTE RÉFÉRENCE */}
          <div className="relative animate-fadeIn">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 border-4 border-blue-400 shadow-2xl h-full flex flex-col justify-between hover:scale-105 transition-transform">
              <div>
                <div className="text-center mb-4">
                  <span className="inline-block px-5 py-2 bg-blue-900/50 text-blue-200 font-bold rounded-xl text-sm">
                    RÉFÉRENCE
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white text-center mb-8 min-h-[90px] flex items-center justify-center leading-tight">
                  {currentQuestion.reference.name}
                </h3>
              </div>
              
              <div className="text-center bg-blue-900/30 rounded-2xl p-6">
                <p className="text-7xl font-black text-white mb-3">
                  {currentQuestion.reference.value.toLocaleString('fr-FR')}
                </p>
                <p className="text-lg text-blue-200 font-semibold">
                  {currentQuestion.label}
                </p>
              </div>
            </div>
          </div>

          {/* CARTE CIBLE */}
          <div className="relative animate-fadeIn">
            <div className={`rounded-3xl p-8 border-4 shadow-2xl h-full flex flex-col justify-between transition-all ${
              !isAnswered
                ? 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600'
                : selectedAnswer === currentQuestion.correct_answer
                ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-400 scale-105'
                : 'bg-gradient-to-br from-red-600 to-red-800 border-red-400'
            }`}>
              <div>
                <div className="text-center mb-4">
                  <span className={`inline-block px-5 py-2 font-bold rounded-xl text-sm ${
                    !isAnswered
                      ? 'bg-gray-900/50 text-gray-300'
                      : selectedAnswer === currentQuestion.correct_answer
                      ? 'bg-green-900/50 text-green-200'
                      : 'bg-red-900/50 text-red-200'
                  }`}>
                    {isAnswered ? (selectedAnswer === currentQuestion.correct_answer ? '✅ CORRECT' : '❌ INCORRECT') : 'À DEVINER'}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white text-center mb-8 min-h-[90px] flex items-center justify-center leading-tight">
                  {currentQuestion.target.name}
                </h3>
              </div>
              
              <div className="text-center bg-black/30 rounded-2xl p-6">
                {!isAnswered ? (
                  <div>
                    <p className="text-7xl font-black text-white mb-4">???</p>
                    <p className="text-lg text-white/70 font-semibold">{currentQuestion.label}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-7xl font-black text-white mb-3">
                      {currentQuestion.target.value.toLocaleString('fr-FR')}
                    </p>
                    <p className="text-lg text-white/90 font-semibold">{currentQuestion.label}</p>
                  </>
                )}
              </div>
            </div>

            {/* Flèche indicatrice */}
            {isAnswered && (
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 text-7xl animate-bounce">
                {currentQuestion.correct_answer === 'Plus' ? '⬆️' : '⬇️'}
              </div>
            )}
          </div>
        </div>

        {/* Boutons de réponse */}
        {!isAnswered ? (
          <div className="grid grid-cols-2 gap-6 animate-fadeIn">
            <button
              onClick={() => handleAnswerSubmit('Plus')}
              className="group relative py-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-black text-4xl rounded-3xl transition-all transform hover:scale-105 border-4 border-green-400 shadow-2xl"
            >
              <span className="block text-6xl mb-3">⬆️</span>
              PLUS
            </button>
            <button
              onClick={() => handleAnswerSubmit('Moins')}
              className="group relative py-10 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-4xl rounded-3xl transition-all transform hover:scale-105 border-4 border-red-400 shadow-2xl"
            >
              <span className="block text-6xl mb-3">⬇️</span>
              MOINS
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            {/* Feedback */}
            <div
              className={`p-8 rounded-2xl text-center border-2 ${
                selectedAnswer === currentQuestion.correct_answer
                  ? 'bg-green-500/20 border-green-400'
                  : 'bg-red-500/20 border-red-400'
              }`}
            >
              <p className="text-4xl font-black text-white mb-4">
                {selectedAnswer === currentQuestion.correct_answer
                  ? '✅ Bravo ! +1 point'
                  : '❌ Raté ! Série reset'}
              </p>
              <p className="text-2xl text-white">
                {currentQuestion.target.name} a{' '}
                <span className="font-black text-yellow-300">
                  {currentQuestion.target.value.toLocaleString('fr-FR')}
                </span>
                {' '}({currentQuestion.correct_answer.toLowerCase()} que {currentQuestion.reference.name})
              </p>
            </div>

            <button
              onClick={handleNextQuestion}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-2xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Comparaison suivante →
            </button>
          </div>
        )}

        {/* Combo */}
        {streak >= 5 && !isAnswered && (
          <div className="mt-8 text-center animate-pulse">
            <p className="text-3xl font-black text-yellow-300">
              🔥 Combo x{streak} ! Continue comme ça !
            </p>
          </div>
        )}

        {/* Statistiques */}
        <div className="mt-6 text-center animate-fadeIn">
          <p className="text-white/60 text-sm">
            Questions restantes : <span className="font-bold text-white">{gameDataService.getAvailableQuestionsCount('higherlower')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default HigherLowerMode;
