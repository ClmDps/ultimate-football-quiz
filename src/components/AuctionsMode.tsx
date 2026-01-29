import React, { useState, useEffect } from 'react';
import { gameDataService } from '../services/GameDataService';
import type { AuctionItem } from '../types/gameData';

/**
 * MODE "ENCHÈRES" - VERSION CORRIGÉE
 * 
 * - 1 point par bonne réponse
 * - Maximum 2 erreurs autorisées
 * - Randomisation des items
 */

interface AuctionsModeProps {
  onBack: () => void;
}

export const AuctionsMode: React.FC<AuctionsModeProps> = ({ onBack }) => {
  const [currentItem, setCurrentItem] = useState<AuctionItem | null>(null);
  const [phase, setPhase] = useState<'bet' | 'answer'>('bet');
  const [bet, setBet] = useState<number>(1);
  const [userInput, setUserInput] = useState('');
  const [foundAnswers, setFoundAnswers] = useState<string[]>([]);
  const [remainingAttempts, setRemainingAttempts] = useState(0);
  const [errors, setErrors] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const MAX_ERRORS = 2;

  // Charger un nouvel item
  const loadNewItem = () => {
    const item = gameDataService.getAuctionItem();
    if (!item) {
      alert('Plus d\'items disponibles !');
      return;
    }
    setCurrentItem(item);
    setPhase('bet');
    setBet(1);
    setUserInput('');
    setFoundAnswers([]);
    setRemainingAttempts(0);
    setErrors(0);
    setFeedback(null);
    setGameOver(false);
  };

  useEffect(() => {
    loadNewItem();
  }, []);

  // Valider le pari
  const handleBetSubmit = () => {
    if (!currentItem) return;
    
    if (bet > currentItem.total_count) {
      alert(`Le pari ne peut pas dépasser ${currentItem.total_count} !`);
      return;
    }

    setPhase('answer');
    setRemainingAttempts(bet + MAX_ERRORS); // Pari + 2 erreurs max
  };

  // Soumettre une réponse
  const handleAnswerSubmit = () => {
    if (!currentItem || !userInput.trim()) return;

    // Vérifie si déjà trouvée
    if (foundAnswers.some(ans => gameDataService.validateAnswer(userInput, ans, 5))) {
      setFeedback({ type: 'error', message: '❌ Déjà trouvé !' });
      setUserInput('');
      return;
    }

    // Valide la réponse avec fuzzy matching
    const matchIndex = gameDataService.validateAuctionAnswer(userInput, currentItem.answers);

    if (matchIndex !== -1) {
      // Réponse correcte : +1 point
      const correctAnswer = currentItem.answers[matchIndex];
      setFoundAnswers([...foundAnswers, correctAnswer]);
      setScore(score + 1);
      setFeedback({ type: 'success', message: `✅ Correct : ${correctAnswer}` });
      setUserInput('');

      // Vérifie si le pari est atteint
      if (foundAnswers.length + 1 >= bet) {
        setGameOver(true);
        setFeedback({ type: 'success', message: `🎉 Pari réussi ! +${bet} points bonus` });
        setScore(score + 1 + bet); // Points trouvés + bonus
      }
    } else {
      // Réponse incorrecte
      const newErrors = errors + 1;
      setErrors(newErrors);
      setRemainingAttempts(remainingAttempts - 1);
      setFeedback({ type: 'error', message: `❌ Réponse invalide (${newErrors}/${MAX_ERRORS} erreurs)` });
      setUserInput('');

      if (newErrors >= MAX_ERRORS) {
        setGameOver(true);
        setFeedback({ type: 'error', message: '💔 2 erreurs ! Pari échoué.' });
      }
    }
  };

  if (!currentItem) return null;

  // ========== PHASE 1 : PARI ==========
  if (phase === 'bet') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold group"
          >
            <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span> Retour
          </button>

          <div className="text-center mb-8 animate-fadeIn">
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">🔨 Enchères</h1>
            <p className="text-2xl text-orange-300 font-semibold">
              Score : <span className="text-yellow-400 font-black">{score}</span> points
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-600/10 to-red-600/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-orange-500/30 shadow-2xl animate-fadeIn">
            <div className="mb-8">
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-xl mb-4 shadow-lg">
                {currentItem.total_count} réponses possibles
              </span>
              <h2 className="text-4xl font-black text-white mb-4">{currentItem.theme}</h2>
              <p className="text-xl text-white/90 leading-relaxed">{currentItem.description}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white text-xl font-bold mb-4">
                  Combien peux-tu en citer ?
                </label>
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setBet(Math.max(1, bet - 1))}
                    className="w-16 h-16 bg-white/10 hover:bg-white/20 hover:scale-110 text-white font-black text-3xl rounded-xl transition-all shadow-lg"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center bg-black/30 rounded-2xl py-6">
                    <span className="text-7xl font-black text-yellow-300 drop-shadow-lg">{bet}</span>
                  </div>
                  <button
                    onClick={() => setBet(Math.min(currentItem.total_count, bet + 1))}
                    className="w-16 h-16 bg-white/10 hover:bg-white/20 hover:scale-110 text-white font-black text-3xl rounded-xl transition-all shadow-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-red-500/20 rounded-xl p-4 border border-red-400">
                <p className="text-red-300 text-center font-semibold">
                  ⚠️ Maximum 2 erreurs autorisées !
                </p>
              </div>

              <button
                onClick={handleBetSubmit}
                className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-2xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                ✓ Confirmer le pari
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== PHASE 2 : RÉPONSES ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold group"
        >
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span> Retour
        </button>

        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">🔨 Enchères</h1>
          <p className="text-2xl text-orange-300 font-semibold">
            Score : <span className="text-yellow-400 font-black">{score}</span> points
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-600/10 to-red-600/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-orange-500/30 shadow-2xl mb-6 animate-fadeIn">
          <h2 className="text-3xl font-black text-white mb-6">{currentItem.theme}</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center p-6 bg-green-500/20 rounded-2xl border-2 border-green-400 shadow-lg">
              <p className="text-5xl font-black text-green-300">{foundAnswers.length}</p>
              <p className="text-sm text-white/80 font-semibold mt-2">Trouvées</p>
            </div>
            <div className="text-center p-6 bg-yellow-500/20 rounded-2xl border-2 border-yellow-400 shadow-lg">
              <p className="text-5xl font-black text-yellow-300">{bet}</p>
              <p className="text-sm text-white/80 font-semibold mt-2">Objectif</p>
            </div>
            <div className="text-center p-6 bg-red-500/20 rounded-2xl border-2 border-red-400 shadow-lg">
              <p className="text-5xl font-black text-red-300">{errors}/{MAX_ERRORS}</p>
              <p className="text-sm text-white/80 font-semibold mt-2">Erreurs</p>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`mb-6 p-6 rounded-2xl animate-fadeIn ${
                feedback.type === 'success'
                  ? 'bg-green-500/20 border-2 border-green-400'
                  : 'bg-red-500/20 border-2 border-red-400'
              }`}
            >
              <p className="text-xl font-black text-white">{feedback.message}</p>
            </div>
          )}

          {/* Input */}
          {!gameOver && errors < MAX_ERRORS && (
            <div className="space-y-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                placeholder="Tapez une réponse..."
                className="w-full px-6 py-5 text-xl rounded-2xl bg-black/30 text-white placeholder-white/40 border-2 border-white/20 focus:border-yellow-400 focus:outline-none transition-all"
                autoFocus
              />
              <button
                onClick={handleAnswerSubmit}
                disabled={!userInput.trim()}
                className="w-full py-5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
              >
                ✓ Valider
              </button>
            </div>
          )}

          {/* Réponses trouvées */}
          {foundAnswers.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-black text-white mb-4">✅ Réponses trouvées :</h3>
              <div className="flex flex-wrap gap-3">
                {foundAnswers.map((answer, index) => (
                  <span
                    key={index}
                    className="px-5 py-3 bg-green-500/30 border-2 border-green-400 text-white font-bold rounded-xl shadow-lg animate-fadeIn"
                  >
                    {answer}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Game Over */}
          {gameOver && (
            <button
              onClick={loadNewItem}
              className="w-full mt-6 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Nouvelle enchère →
            </button>
          )}
        </div>

        {/* Toutes les réponses (en fin de partie) */}
        {gameOver && (
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border-2 border-white/10 shadow-xl animate-fadeIn">
            <h3 className="text-2xl font-black text-white mb-6">
              📋 Toutes les réponses ({currentItem.total_count}) :
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {currentItem.answers.map((answer, index) => (
                <span
                  key={index}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    foundAnswers.includes(answer)
                      ? 'bg-green-500/30 border-2 border-green-400 text-white'
                      : 'bg-white/5 text-white/60 border-2 border-white/10'
                  }`}
                >
                  {answer}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionsMode;
