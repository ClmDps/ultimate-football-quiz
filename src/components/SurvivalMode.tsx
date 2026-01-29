import React, { useState, useEffect } from 'react';
import { gameDataService } from '../services/GameDataService';
import type { SurvivalQuestion } from '../types/gameData';

/**
 * MODE "SURVIVAL" (K.O.) - VERSION CORRIGÉE
 * 
 * - 1 point par bonne réponse
 * - Streak reset à 0 si erreur
 * - Mort subite (1 erreur = Game Over)
 * - Randomisation des questions
 */

interface SurvivalModeProps {
  onBack: () => void;
}

export const SurvivalMode: React.FC<SurvivalModeProps> = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState<SurvivalQuestion | null>(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Charger une nouvelle question (aléatoire)
  const loadQuestion = () => {
    const question = gameDataService.getSurvivalQuestion(round);
    if (!question) {
      alert('Plus de questions disponibles !');
      setGameOver(true);
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
  const handleAnswerSubmit = () => {
    if (!currentQuestion || !selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;
    setIsAnswered(true);

    if (isCorrect) {
      // +1 point + streak
      setScore(score + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }
    } else {
      // Erreur = Game Over + streak reset
      setStreak(0);
      setGameOver(true);
    }
  };

  // Passer à la question suivante
  const handleNextQuestion = () => {
    setRound(round + 1);
    loadQuestion();
  };

  // Redémarrer le jeu
  const handleRestart = () => {
    gameDataService.resetHistory('survival');
    setRound(1);
    setScore(0);
    setStreak(0);
    setGameOver(false);
    loadQuestion();
  };

  if (!currentQuestion) return null;

  // ========== GAME OVER ==========
  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur-xl rounded-3xl p-12 border-2 border-red-400 shadow-2xl text-center animate-fadeIn">
          <div className="text-8xl mb-6 animate-bounce">💀</div>
          
          <h1 className="text-6xl font-black text-white mb-4">K.O. !</h1>
          <p className="text-3xl text-red-300 font-bold mb-8">
            Tu as survécu <span className="text-yellow-400">{round - 1}</span> round{round - 1 > 1 ? 's' : ''}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-black/30 rounded-2xl p-6">
              <p className="text-xl text-white/70 mb-2">Score final</p>
              <p className="text-6xl font-black text-yellow-300">{score}</p>
            </div>
            <div className="bg-black/30 rounded-2xl p-6">
              <p className="text-xl text-white/70 mb-2">Meilleure série</p>
              <p className="text-6xl font-black text-orange-300">{bestStreak}</p>
            </div>
          </div>

          <div className="mb-8 p-6 bg-red-500/20 rounded-2xl border-2 border-red-400">
            <p className="text-lg text-white/80 mb-3 font-semibold">Question fatale :</p>
            <p className="text-xl font-bold text-white mb-4">{currentQuestion.question}</p>
            <div className="bg-black/20 rounded-xl p-4 mb-3">
              <p className="text-sm text-white/60 mb-1">Bonne réponse :</p>
              <p className="text-lg text-green-300 font-bold">{currentQuestion.answer}</p>
            </div>
            {selectedAnswer && (
              <div className="bg-black/20 rounded-xl p-4">
                <p className="text-sm text-white/60 mb-1">Ta réponse :</p>
                <p className="text-lg text-red-300 font-bold">{selectedAnswer}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-xl rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              🔄 Recommencer
            </button>
            <button
              onClick={onBack}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xl rounded-xl transition-all"
            >
              ← Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== JEU EN COURS ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold group"
        >
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span> Retour
        </button>

        {/* En-tête */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">⚡ Survival</h1>
          <p className="text-2xl text-red-300 font-semibold">Une erreur = Élimination</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-6 bg-white/10 rounded-2xl border-2 border-white/20 shadow-lg animate-fadeIn">
            <p className="text-5xl font-black text-white">{round}</p>
            <p className="text-sm text-white/80 font-semibold mt-2">Round</p>
          </div>
          <div className="text-center p-6 bg-yellow-500/20 rounded-2xl border-2 border-yellow-400 shadow-lg animate-fadeIn">
            <p className="text-5xl font-black text-yellow-300">{score}</p>
            <p className="text-sm text-white/80 font-semibold mt-2">Score</p>
          </div>
          <div className="text-center p-6 bg-orange-500/20 rounded-2xl border-2 border-orange-400 shadow-lg animate-fadeIn">
            <p className="text-5xl font-black text-orange-300">🔥 {streak}</p>
            <p className="text-sm text-white/80 font-semibold mt-2">Série</p>
          </div>
        </div>

        {/* Question */}
        <div className="bg-gradient-to-br from-red-600/10 to-orange-600/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-red-500/30 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <span className="px-5 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black rounded-xl shadow-lg">
              💀 Mort Subite
            </span>
            {streak >= 3 && (
              <span className="px-5 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-black rounded-xl shadow-lg animate-pulse">
                🔥 Série de {streak} !
              </span>
            )}
          </div>

          <h2 className="text-3xl font-bold text-white mb-8 leading-relaxed">{currentQuestion.question}</h2>

          {/* Options */}
          {!isAnswered ? (
            <div className="space-y-4 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full p-5 text-left text-xl font-semibold rounded-2xl transition-all ${
                    selectedAnswer === option
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black border-2 border-yellow-400 scale-105 shadow-xl'
                      : 'bg-white/5 text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 hover:scale-102'
                  }`}
                >
                  <span className="mr-3 text-2xl">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = option === currentQuestion.answer;
                const isSelected = option === selectedAnswer;

                return (
                  <div
                    key={index}
                    className={`w-full p-5 text-left text-xl font-semibold rounded-2xl border-2 transition-all ${
                      isCorrect
                        ? 'bg-green-500/20 border-green-400 text-white scale-105'
                        : isSelected
                        ? 'bg-red-500/20 border-red-400 text-white'
                        : 'bg-white/5 border-white/10 text-white/60'
                    }`}
                  >
                    <span className="mr-3 text-2xl">{String.fromCharCode(65 + index)}.</span>
                    {option}
                    {isCorrect && <span className="ml-2 text-2xl">✅</span>}
                    {isSelected && !isCorrect && <span className="ml-2 text-2xl">❌</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Boutons */}
          {!isAnswered ? (
            <button
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswer}
              className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
            >
              ✓ Valider
            </button>
          ) : (
            <div className="space-y-4">
              <div
                className={`p-6 rounded-2xl text-center border-2 ${
                  selectedAnswer === currentQuestion.answer
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-red-500/20 border-red-400'
                }`}
              >
                <p className="text-3xl font-black text-white">
                  {selectedAnswer === currentQuestion.answer
                    ? `✅ Bien joué ! +1 point`
                    : '❌ Game Over...'}
                </p>
              </div>

              {selectedAnswer === currentQuestion.answer && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Round suivant →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurvivalMode;
