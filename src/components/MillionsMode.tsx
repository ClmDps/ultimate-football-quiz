import React, { useState, useEffect } from 'react';
import { gameDataService } from '../services/GameDataService';
import type { MillionsQuestion } from '../types/gameData';

/**
 * MODE "MILLIONS" (Pyramide) - VERSION AMÉLIORÉE
 * 
 * Fonctionnalités :
 * - Pyramide de 15 paliers (difficulté 1 à 15)
 * - QCM 4 options
 * - Paliers sécurisés (1000€, 32000€)
 * - Une erreur = retombe au dernier palier sécurisé
 * - Validation fuzzy adaptative selon le niveau
 */

// Pyramide des gains
const PRIZE_LADDER = [
  { level: 1, amount: 100, safe: false },
  { level: 2, amount: 200, safe: false },
  { level: 3, amount: 300, safe: false },
  { level: 4, amount: 500, safe: false },
  { level: 5, amount: 1000, safe: true },      // 1er palier sécurisé
  { level: 6, amount: 2000, safe: false },
  { level: 7, amount: 4000, safe: false },
  { level: 8, amount: 8000, safe: false },
  { level: 9, amount: 16000, safe: false },
  { level: 10, amount: 32000, safe: true },    // 2ème palier sécurisé
  { level: 11, amount: 64000, safe: false },
  { level: 12, amount: 125000, safe: false },
  { level: 13, amount: 250000, safe: false },
  { level: 14, amount: 500000, safe: false },
  { level: 15, amount: 1000000, safe: false }, // MILLION !
];

interface MillionsModeProps {
  onBack: () => void;
}

export const MillionsMode: React.FC<MillionsModeProps> = ({ onBack }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState<MillionsQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);
  const [isWinner, setIsWinner] = useState(false);

  // Charger une question pour le niveau actuel
  const loadQuestion = () => {
    const question = gameDataService.getMillionsQuestion(currentLevel);
    if (!question) {
      alert('Plus de questions disponibles pour ce niveau !');
      endGame(getCurrentAmount());
      return;
    }
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  // Charger la première question
  useEffect(() => {
    loadQuestion();
  }, []);

  // Obtenir le montant actuel
  const getCurrentAmount = () => {
    return PRIZE_LADDER[currentLevel - 1]?.amount || 0;
  };

  // Trouver le dernier palier sécurisé
  const getLastSafeAmount = () => {
    for (let i = currentLevel - 1; i >= 0; i--) {
      if (PRIZE_LADDER[i].safe) {
        return PRIZE_LADDER[i].amount;
      }
    }
    return 0;
  };

  // Soumettre la réponse avec validation adaptative
  const handleAnswerSubmit = () => {
    if (!currentQuestion || !selectedAnswer) return;

    // Utilise le niveau comme difficulté (1-15)
    const isCorrect = gameDataService.validateAnswer(selectedAnswer, currentQuestion.answer, currentLevel);
    setIsAnswered(true);

    if (isCorrect) {
      // Bonne réponse
      if (currentLevel === 15) {
        // MILLION GAGNÉ !
        setIsWinner(true);
        endGame(1000000);
      }
    } else {
      // Mauvaise réponse : retombe au palier sécurisé
      const safeAmount = getLastSafeAmount();
      endGame(safeAmount);
    }
  };

  // Passer au niveau suivant
  const handleNextLevel = () => {
    setCurrentLevel(currentLevel + 1);
    loadQuestion();
  };

  // Arrêter avec les gains actuels
  const handleTakeTheMoney = () => {
    endGame(getCurrentAmount());
  };

  // Fin de partie
  const endGame = (amount: number) => {
    setFinalAmount(amount);
    setGameOver(true);
  };

  // Redémarrer
  const handleRestart = () => {
    gameDataService.resetHistory('millions');
    setCurrentLevel(1);
    setGameOver(false);
    setFinalAmount(0);
    setIsWinner(false);
    loadQuestion();
  };

  if (!currentQuestion) return null;

  // ========== ÉCRAN DE FIN ==========
  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl p-12 border-2 border-purple-400 shadow-2xl text-center animate-fadeIn">
          {isWinner ? (
            <>
              <div className="text-9xl mb-6 animate-bounce">🎉</div>
              <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 mb-6 animate-pulse drop-shadow-2xl">
                MILLION !
              </h1>
              <p className="text-4xl text-white font-bold mb-8">
                Vous avez gagné 1 000 000 € !!!
              </p>
            </>
          ) : (
            <>
              <div className="text-8xl mb-6">
                {finalAmount > 0 ? '🎊' : '💔'}
              </div>
              <h1 className="text-6xl font-black text-white mb-6">
                {finalAmount > 0 ? 'Bravo !' : 'Dommage !'}
              </h1>
              <div className="mb-8 bg-black/30 rounded-2xl p-6">
                <p className="text-xl text-white/70 mb-2">Vous repartez avec</p>
                <p className="text-6xl font-black text-yellow-300">{finalAmount.toLocaleString('fr-FR')} €</p>
              </div>
            </>
          )}

          {!isWinner && currentQuestion && (
            <div className="mb-8 p-6 bg-red-500/20 rounded-2xl border-2 border-red-400">
              <p className="text-lg text-white/80 mb-2 font-semibold">Question {currentLevel} :</p>
              <p className="text-xl font-bold text-white mb-4">{currentQuestion.question}</p>
              <div className="bg-black/20 rounded-xl p-4 mb-3">
                <p className="text-sm text-white/60 mb-1">Bonne réponse :</p>
                <p className="text-lg text-green-300 font-bold">{currentQuestion.answer}</p>
              </div>
              {selectedAnswer && (
                <div className="bg-black/20 rounded-xl p-4">
                  <p className="text-sm text-white/60 mb-1">Votre réponse :</p>
                  <p className="text-lg text-red-300 font-bold">{selectedAnswer}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-xl rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              🔄 Rejouer
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
  const currentPrize = PRIZE_LADDER[currentLevel - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold group"
        >
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span> Retour au menu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLONNE GAUCHE : PYRAMIDE DES GAINS */}
          <div className="lg:col-span-1 space-y-2 animate-fadeIn">
            <h2 className="text-3xl font-black text-white mb-6 text-center">💰 Pyramide</h2>
            <div className="space-y-2">
              {PRIZE_LADDER.slice().reverse().map((prize) => {
                const isCurrent = prize.level === currentLevel;
                const isPassed = prize.level < currentLevel;
                
                return (
                  <div
                    key={prize.level}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 text-black font-black scale-105 shadow-xl'
                        : isPassed
                        ? 'bg-green-500/30 border-green-400 text-white/90'
                        : prize.safe
                        ? 'bg-orange-500/20 border-orange-400 text-white'
                        : 'bg-white/5 border-white/20 text-white/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">Question {prize.level}</span>
                      <span className="font-black">{prize.amount.toLocaleString('fr-FR')} €</span>
                      {prize.safe && <span className="text-sm">🛡️</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLONNE DROITE : QUESTION */}
          <div className="lg:col-span-2">
            {/* En-tête */}
            <div className="text-center mb-8 animate-fadeIn">
              <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">💰 Millions</h1>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="px-8 py-4 bg-purple-500/30 rounded-2xl border-2 border-purple-400">
                  <p className="text-sm text-white/70 font-semibold">Question</p>
                  <p className="text-4xl font-black text-white">{currentLevel} / 15</p>
                </div>
                <div className="px-8 py-4 bg-yellow-500/30 rounded-2xl border-2 border-yellow-400">
                  <p className="text-sm text-white/70 font-semibold">En jeu</p>
                  <p className="text-4xl font-black text-yellow-300">
                    {currentPrize.amount.toLocaleString('fr-FR')} €
                  </p>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-gradient-to-br from-purple-600/10 to-indigo-600/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/30 shadow-2xl mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-6">
                <span className={`px-5 py-3 rounded-xl font-black shadow-lg ${
                  currentPrize.safe 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}>
                  {currentPrize.safe ? '🛡️ Palier Sécurisé' : `Difficulté ${currentLevel}/15`}
                </span>
              </div>

              <h2 className="text-3xl font-bold text-white mb-8 leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Options (Grille 2x2) */}
              {!isAnswered ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      className={`p-6 text-left text-lg font-semibold rounded-2xl transition-all ${
                        selectedAnswer === option
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black border-4 border-yellow-400 scale-105 shadow-xl'
                          : 'bg-white/5 text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 hover:scale-102'
                      }`}
                    >
                      <span className="text-3xl mr-3">{String.fromCharCode(65 + index)}</span>
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {currentQuestion.options.map((option, index) => {
                    const isCorrect = option === currentQuestion.answer;
                    const isSelected = option === selectedAnswer;

                    return (
                      <div
                        key={index}
                        className={`p-6 text-left text-lg font-semibold rounded-2xl border-4 transition-all ${
                          isCorrect
                            ? 'bg-green-500/30 border-green-400 text-white scale-105'
                            : isSelected
                            ? 'bg-red-500/30 border-red-400 text-white'
                            : 'bg-white/5 border-white/10 text-white/60'
                        }`}
                      >
                        <span className="text-3xl mr-3">{String.fromCharCode(65 + index)}</span>
                        {option}
                        {isCorrect && <span className="ml-2 text-3xl">✅</span>}
                        {isSelected && !isCorrect && <span className="ml-2 text-3xl">❌</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Boutons d'action */}
              {!isAnswered ? (
                <div className="space-y-4">
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer}
                    className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                  >
                    ✓ Valider ma réponse finale
                  </button>
                  {currentLevel > 1 && (
                    <button
                      onClick={handleTakeTheMoney}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      💰 Prendre l'argent ({getCurrentAmount().toLocaleString('fr-FR')} €)
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div
                    className={`p-6 rounded-2xl text-center border-2 ${
                      selectedAnswer === currentQuestion.answer
                        ? 'bg-green-500/20 border-green-400'
                        : 'bg-red-500/20 border-red-400'
                    }`}
                  >
                    <p className="text-4xl font-black text-white mb-3">
                      {selectedAnswer === currentQuestion.answer
                        ? '✅ Bonne réponse !'
                        : '❌ Mauvaise réponse'}
                    </p>
                    {selectedAnswer === currentQuestion.answer && currentLevel < 15 && (
                      <p className="text-2xl text-white">
                        Vous passez à {PRIZE_LADDER[currentLevel]?.amount.toLocaleString('fr-FR')} € !
                      </p>
                    )}
                  </div>

                  {selectedAnswer === currentQuestion.answer && currentLevel < 15 && (
                    <button
                      onClick={handleNextLevel}
                      className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Question suivante →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Info palier sécurisé */}
            {!isAnswered && (
              <div className="text-center text-white/60 text-sm bg-white/5 rounded-2xl p-4 border border-white/10 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                {currentLevel >= 5 ? (
                  <p>
                    💡 En cas d'erreur, vous repartez avec au minimum{' '}
                    <span className="font-bold text-orange-300">{getLastSafeAmount().toLocaleString('fr-FR')} €</span>
                  </p>
                ) : (
                  <p>
                    ⚠️ Aucun palier sécurisé atteint. En cas d'erreur, vous repartez avec 0 €
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MillionsMode;
