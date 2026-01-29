import React, { useState, useEffect } from 'react';
import { gameDataService } from '../services/GameDataService';
import type { WhoAmIQuestion } from '../types/gameData';

/**
 * MODE "QUI SUIS-JE" - VERSION CORRIGÉE
 * 
 * - 1 point par bonne réponse (peu importe le nombre d'indices)
 * - 5 indices révélés progressivement
 * - Randomisation des questions
 */

interface WhoAmIModeProps {
  onBack: () => void;
}

export const WhoAmIMode: React.FC<WhoAmIModeProps> = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState<WhoAmIQuestion | null>(null);
  const [revealedClues, setRevealedClues] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  // Charger une nouvelle question
  const loadQuestion = () => {
    const question = gameDataService.getWhoAmIQuestion();
    if (!question) {
      alert('Plus de questions disponibles !');
      return;
    }
    setCurrentQuestion(question);
    setRevealedClues(1);
    setUserAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  // Révéler l'indice suivant
  const handleRevealNextClue = () => {
    if (revealedClues < 5) {
      setRevealedClues(revealedClues + 1);
    }
  };

  // Soumettre la réponse
  const handleSubmitAnswer = () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    const difficulty = 8; // Validation stricte
    const correct = gameDataService.validateAnswer(userAnswer, currentQuestion.target, difficulty);
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore(score + 1); // +1 point par bonne réponse
    }
  };

  // Passer la question
  const handleSkip = () => {
    setIsAnswered(true);
    setIsCorrect(false);
  };

  // Question suivante
  const handleNextQuestion = () => {
    setRound(round + 1);
    loadQuestion();
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold group"
        >
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span> Retour
        </button>

        {/* En-tête */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">🎭 Qui suis-je ?</h1>
          <p className="text-2xl text-purple-300 font-semibold">Devine avec le moins d'indices possible !</p>
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
        <div className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/30 shadow-2xl animate-fadeIn">
          {/* Indices révélés */}
          <div className="space-y-4 mb-8">
            {currentQuestion.clues.slice(0, revealedClues).map((clue, index) => (
              <div
                key={index}
                className={`p-5 rounded-2xl border-2 transition-all animate-fadeIn ${
                  index === revealedClues - 1
                    ? 'bg-purple-500/30 border-purple-400 shadow-lg'
                    : 'bg-white/5 border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                    {index + 1}
                  </span>
                  <p className="text-xl text-white flex-1 leading-relaxed">{clue}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Indicateur d'indices restants */}
          {!isAnswered && revealedClues < 5 && (
            <div className="mb-8 text-center">
              <div className="flex justify-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div
                    key={num}
                    className={`w-16 h-3 rounded-full transition-all ${
                      num <= revealedClues
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg'
                        : 'bg-white/20'
                    }`}
                  ></div>
                ))}
              </div>
              <p className="text-sm text-white/70 font-semibold">
                {5 - revealedClues} indice{5 - revealedClues > 1 ? 's' : ''} restant{5 - revealedClues > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Zone de réponse */}
          {!isAnswered ? (
            <div className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                placeholder="Tape le nom du joueur..."
                className="w-full px-6 py-5 text-xl rounded-2xl bg-black/30 text-white placeholder-white/40 border-2 border-white/20 focus:border-purple-400 focus:outline-none transition-all"
                autoFocus
              />
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim()}
                  className="py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-black text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                >
                  ✅ Valider
                </button>
                {revealedClues < 5 ? (
                  <button
                    onClick={handleRevealNextClue}
                    className="py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    💡 Indice suivant
                  </button>
                ) : (
                  <button
                    onClick={handleSkip}
                    className="py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-black text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    ⏭️ Passer
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Feedback */}
              <div
                className={`p-6 rounded-2xl text-center border-2 ${
                  isCorrect
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-red-500/20 border-red-400'
                }`}
              >
                <p className="text-4xl font-black text-white mb-3">
                  {isCorrect ? '✅ Bravo ! +1 point' : '❌ Raté !'}
                </p>
                <p className="text-2xl text-white">
                  C'était : <span className="font-black text-purple-300">{currentQuestion.target}</span>
                </p>
                {!isCorrect && userAnswer.trim() && (
                  <p className="text-sm text-white/70 mt-3">Ta réponse : {userAnswer}</p>
                )}
              </div>

              {/* Tous les indices révélés */}
              <div className="p-6 bg-purple-500/20 rounded-2xl border-2 border-purple-400">
                <h3 className="text-xl font-black text-purple-300 mb-4">📋 Tous les indices :</h3>
                <div className="space-y-3">
                  {currentQuestion.clues.map((clue, index) => (
                    <div
                      key={index}
                      className={`text-base ${
                        index < revealedClues ? 'text-white font-semibold' : 'text-white/50 italic'
                      }`}
                    >
                      {index + 1}. {clue}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Joueur suivant →
              </button>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="mt-6 text-center animate-fadeIn">
          <p className="text-white/60 text-sm">
            Questions restantes : <span className="font-bold text-white">{gameDataService.getAvailableQuestionsCount('whoami')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhoAmIMode;
