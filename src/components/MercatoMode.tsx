import React, { useState, useEffect } from 'react';
import { gameDataService } from '../services/GameDataService';
import type { MercatoQuestion } from '../types/gameData';

/**
 * MODE "MERCATO CHAOS" - Révélation progressive
 * 
 * - Les clubs se révèlent un par un
 * - 1 point par bonne réponse
 * - Randomisation des difficultés
 */

interface MercatoModeProps {
  onBack: () => void;
}

export const MercatoMode: React.FC<MercatoModeProps> = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState<MercatoQuestion | null>(null);
  const [revealedClubs, setRevealedClubs] = useState(1); // Commence avec 1 club
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  // Charger une nouvelle question
  const loadQuestion = () => {
    const question = gameDataService.getMercatoQuestion();
    if (!question) {
      alert('Plus de questions disponibles !');
      return;
    }
    setCurrentQuestion(question);
    setRevealedClubs(1);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  // Révéler le club suivant
  const handleRevealNextClub = () => {
    if (currentQuestion && revealedClubs < currentQuestion.clubs.length) {
      setRevealedClubs(revealedClubs + 1);
    }
  };

  // Soumettre la réponse
  const handleAnswerSubmit = () => {
    if (!currentQuestion || !selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;
    setIsAnswered(true);

    if (isCorrect) {
      setScore(score + 1); // 1 point par bonne réponse
    }
  };

  // Passer à la question suivante
  const handleNextQuestion = () => {
    setRound(round + 1);
    loadQuestion();
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold group"
        >
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span> Retour
        </button>

        {/* En-tête */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">🔄 Mercato Chaos</h1>
          <p className="text-2xl text-teal-300 font-semibold">Découvre le joueur club par club !</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center p-6 bg-white/10 rounded-2xl border-2 border-white/20 shadow-lg animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <p className="text-5xl font-black text-white">{round}</p>
            <p className="text-sm text-white/80 font-semibold mt-2">Question</p>
          </div>
          <div className="text-center p-6 bg-yellow-500/20 rounded-2xl border-2 border-yellow-400 shadow-lg animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <p className="text-5xl font-black text-yellow-300">{score}</p>
            <p className="text-sm text-white/80 font-semibold mt-2">Score</p>
          </div>
        </div>

        {/* Question */}
        <div className="bg-gradient-to-br from-teal-600/10 to-cyan-600/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-teal-500/30 shadow-2xl animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-white">Qui suis-je ?</h2>
            <span className="px-5 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-black rounded-xl shadow-lg">
              {currentQuestion.clubs.length} clubs
            </span>
          </div>

          {/* Clubs révélés progressivement */}
          <div className="mb-8 space-y-4">
            {currentQuestion.clubs.slice(0, revealedClubs).map((club, index) => (
              <div
                key={index}
                className={`p-5 rounded-2xl border-2 transition-all animate-fadeIn ${
                  index === revealedClubs - 1
                    ? 'bg-teal-500/30 border-teal-400 shadow-lg'
                    : 'bg-white/5 border-white/20'
                }`}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <span className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-xl text-white font-bold">{club}</p>
                    <p className="text-sm text-teal-200">Club nº {index + 1}</p>
                  </div>
                  <span className="text-3xl">⚽</span>
                </div>
              </div>
            ))}
          </div>

          {/* Indicateur de clubs restants */}
          {!isAnswered && revealedClubs < currentQuestion.clubs.length && (
            <div className="mb-8 text-center">
              <div className="flex justify-center gap-2 mb-3">
                {currentQuestion.clubs.map((_, index) => (
                  <div
                    key={index}
                    className={`w-12 h-3 rounded-full transition-all ${
                      index < revealedClubs
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg'
                        : 'bg-white/20'
                    }`}
                  ></div>
                ))}
              </div>
              <p className="text-sm text-white/70 font-semibold">
                {currentQuestion.clubs.length - revealedClubs} club{currentQuestion.clubs.length - revealedClubs > 1 ? 's' : ''} restant{currentQuestion.clubs.length - revealedClubs > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Zone de réponse */}
          {!isAnswered ? (
            <div className="space-y-4">
              {/* Options QCM */}
              <div className="space-y-3 mb-6">
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

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!selectedAnswer}
                  className="py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-black text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                >
                  ✅ Valider
                </button>
                {revealedClubs < currentQuestion.clubs.length ? (
                  <button
                    onClick={handleRevealNextClub}
                    className="py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-black text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    💡 Club suivant
                  </button>
                ) : (
                  <button
                    disabled
                    className="py-4 bg-gray-600 text-white/50 font-black text-lg rounded-2xl cursor-not-allowed"
                  >
                    Tous révélés
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Feedback */}
              <div
                className={`p-6 rounded-2xl text-center border-2 ${
                  selectedAnswer === currentQuestion.answer
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-red-500/20 border-red-400'
                }`}
              >
                <p className="text-3xl font-black text-white mb-3">
                  {selectedAnswer === currentQuestion.answer
                    ? '✅ Bravo ! +1 point'
                    : '❌ Raté !'}
                </p>
                <p className="text-xl text-white">
                  C'était : <span className="font-black text-teal-300">{currentQuestion.answer}</span>
                </p>
                {selectedAnswer !== currentQuestion.answer && (
                  <p className="text-sm text-white/70 mt-3">Ta réponse : {selectedAnswer}</p>
                )}
              </div>

              {/* Tous les clubs révélés */}
              <div className="p-6 bg-teal-500/20 rounded-2xl border-2 border-teal-400">
                <h3 className="text-xl font-black text-teal-300 mb-4">📋 Parcours complet :</h3>
                <div className="space-y-2">
                  {currentQuestion.clubs.map((club, index) => (
                    <div
                      key={index}
                      className="text-base text-white font-semibold flex items-center gap-3"
                    >
                      <span className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-black">
                        {index + 1}
                      </span>
                      {club}
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
        <div className="mt-6 text-center animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <p className="text-white/60 text-sm">
            Questions restantes : <span className="font-bold text-white">{gameDataService.getAvailableQuestionsCount('mercato')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MercatoMode;
