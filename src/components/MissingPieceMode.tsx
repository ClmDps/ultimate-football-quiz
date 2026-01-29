import React, { useState, useEffect } from 'react';
import { gameDataService } from '../services/GameDataService';
import type { MissingPieceQuestion } from '../types/gameData';

/**
 * MODE "MISSING PIECE" - VERSION CORRIGÉE
 * 
 * - 1 point par bonne réponse
 * - Randomisation des questions
 */

interface MissingPieceModeProps {
  onBack: () => void;
}

export const MissingPieceMode: React.FC<MissingPieceModeProps> = ({ onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState<MissingPieceQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  // Charger une nouvelle question
  const loadQuestion = () => {
    const question = gameDataService.getMissingPieceQuestion();
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
  const handleAnswerSubmit = () => {
    if (!currentQuestion || !selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;
    setIsAnswered(true);

    if (isCorrect) {
      setScore(score + 1); // +1 point
    }
  };

  // Passer à la question suivante
  const handleNextQuestion = () => {
    setRound(round + 1);
    loadQuestion();
  };

  if (!currentQuestion) return null;

  // Fonction pour afficher le contexte avec "..." en surbrillance
  const renderContext = () => {
    const parts = currentQuestion.context.split('...');
    if (parts.length === 1) {
      return <span>{currentQuestion.context}</span>;
    }

    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="relative inline-block mx-2">
                <span className="text-yellow-300 font-black text-3xl animate-pulse">
                  ???
                </span>
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  // Icônes par type
  const typeIcons: Record<string, string> = {
    'Lineup': '⚽',
    'Podium': '🏆',
    'Group': '🌍',
    'Match Iconique': '🔥',
  };

  const typeIcon = typeIcons[currentQuestion.type] || '🧩';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold group"
        >
          <span className="inline-block group-hover:-translate-x-1 transition-transform">←</span> Retour
        </button>

        {/* En-tête */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl">🧩 Missing Piece</h1>
          <p className="text-2xl text-indigo-300 font-semibold">Complète les compositions mythiques !</p>
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
        <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-indigo-500/30 shadow-2xl animate-fadeIn">
          {/* Type de question */}
          <div className="flex items-center justify-between mb-8">
            <span className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-black rounded-xl shadow-lg">
              {typeIcon} {currentQuestion.type}
            </span>
          </div>

          {/* Contexte avec "..." */}
          <div className="mb-8 p-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl border-2 border-blue-400 shadow-inner">
            <p className="text-2xl font-bold text-white leading-relaxed text-center">
              {renderContext()}
            </p>
          </div>

          {/* Instructions */}
          {!isAnswered && (
            <p className="text-center text-xl text-white/80 mb-8 font-semibold">
              Qui manque dans cette composition ?
            </p>
          )}

          {/* Options QCM */}
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
            <div className="space-y-6">
              {/* Feedback */}
              <div
                className={`p-6 rounded-2xl text-center border-2 ${
                  selectedAnswer === currentQuestion.answer
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-red-500/20 border-red-400'
                }`}
              >
                <p className="text-3xl font-black text-white mb-3">
                  {selectedAnswer === currentQuestion.answer ? '✅ Exact ! +1 point' : '❌ Raté !'}
                </p>
                <p className="text-xl text-white">
                  La pièce manquante était : <span className="font-black text-yellow-300">{currentQuestion.answer}</span>
                </p>
              </div>

              {/* Composition complète */}
              <div className="p-8 bg-indigo-500/20 rounded-2xl border-2 border-indigo-400 shadow-lg">
                <h3 className="text-xl font-black text-indigo-300 mb-4 text-center">
                  🎯 Composition complète :
                </h3>
                <p className="text-2xl text-white text-center leading-relaxed font-semibold">
                  {currentQuestion.context.replace('...', `⭐ ${currentQuestion.answer} ⭐`)}
                </p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Composition suivante →
              </button>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="mt-6 text-center animate-fadeIn">
          <p className="text-white/60 text-sm">
            Questions restantes : <span className="font-bold text-white">{gameDataService.getAvailableQuestionsCount('missingpiece')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissingPieceMode;
