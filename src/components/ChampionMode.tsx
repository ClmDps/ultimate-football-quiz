import React, { useState, useEffect } from 'react';
import { gameDataService } from '../services/GameDataService';
import type { ChampionTheme, ChampionQuestion } from '../types/gameData';

/**
 * MODE "LE CHAMPION" (TLMVPSP) - VERSION CORRIGÉE
 * 
 * - 1 seul thème par partie
 * - 5 questions
 * - DUO (2 choix, 1pt) / CARRÉ (4 choix, 3pts) / CASH (libre, 5pts)
 * - Battre le champion sur cette série uniquement
 */

type DifficultyChoice = 'duo' | 'carre' | 'cash' | null;

interface ChampionModeProps {
  onBack: () => void;
}

export const ChampionMode: React.FC<ChampionModeProps> = ({ onBack }) => {
  const [availableThemes, setAvailableThemes] = useState<ChampionTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ChampionTheme | null>(null);
  const [questions, setQuestions] = useState<ChampionQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [difficultyChoice, setDifficultyChoice] = useState<DifficultyChoice>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [championScore] = useState(() => gameDataService.generateChampionScore());
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Charger les thèmes disponibles au montage
  useEffect(() => {
    const themes = gameDataService.getChampionThemes();
    setAvailableThemes(themes);
  }, []);

  // Sélection d'un thème
  const handleThemeSelect = (theme: ChampionTheme) => {
    setSelectedTheme(theme);
    const themeQuestions = gameDataService.getChampionQuestionsByTheme(theme.id);
    setQuestions(themeQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setDifficultyChoice(null);
    setSelectedOption(null);
    setUserAnswer('');
    setIsAnswered(false);
    setAnswerFeedback(null);
    setShowFinalResult(false);
  };

  // Choix de la difficulté
  const handleDifficultySelect = (choice: 'duo' | 'carre' | 'cash') => {
    setDifficultyChoice(choice);
    setSelectedOption(null);
    setUserAnswer('');
  };

  // Validation de la réponse
  const handleSubmitAnswer = () => {
    if (!questions[currentQuestionIndex] || !difficultyChoice) return;

    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;
    let pointsToAdd = 0;

    if (difficultyChoice === 'duo' || difficultyChoice === 'carre') {
      if (!selectedOption) return;
      isCorrect = selectedOption === currentQuestion.answer;
      pointsToAdd = difficultyChoice === 'duo' ? 1 : 3;
    } else {
      if (!userAnswer.trim()) return;
      const difficulty = 8;
      isCorrect = gameDataService.validateAnswer(userAnswer, currentQuestion.answer, difficulty);
      pointsToAdd = 5;
    }

    if (isCorrect) {
      setScore(score + pointsToAdd);
      setAnswerFeedback('correct');
    } else {
      setAnswerFeedback('incorrect');
    }

    setIsAnswered(true);
  };

  // Passer à la question suivante
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setDifficultyChoice(null);
      setSelectedOption(null);
      setUserAnswer('');
      setIsAnswered(false);
      setAnswerFeedback(null);
    } else {
      setShowFinalResult(true);
    }
  };

  // Rejouer avec un nouveau thème
  const handlePlayAgain = () => {
    setSelectedTheme(null);
    setQuestions([]);
    setScore(0);
    setShowFinalResult(false);
    setCurrentQuestionIndex(0);
    
    const themes = gameDataService.getChampionThemes();
    setAvailableThemes(themes);
  };

  // ========== RÉSULTAT FINAL ==========
  if (showFinalResult) {
    const hasWon = score > championScore;
    const maxPossibleScore = 5 * 5;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className={`bg-gradient-to-br ${hasWon ? 'from-green-500/20 to-emerald-500/20 border-green-400' : 'from-red-500/20 to-pink-500/20 border-red-400'} backdrop-blur-xl rounded-3xl p-12 border-2 shadow-2xl text-center animate-fadeIn`}>
            <div className="text-8xl mb-6 animate-bounce">
              {hasWon ? '🏆' : '😢'}
            </div>
            
            <h2 className={`text-5xl font-black mb-4 ${hasWon ? 'text-green-300' : 'text-red-300'}`}>
              {hasWon ? 'VICTOIRE !' : 'DÉFAITE'}
            </h2>
            
            <p className="text-2xl text-white/80 mb-6">{selectedTheme?.title}</p>
            
            <div className="space-y-6 mb-8">
              <div className="bg-black/30 rounded-2xl p-6">
                <p className="text-white/70 text-lg mb-2">Votre score</p>
                <p className="text-6xl font-black text-white">{score}</p>
                <p className="text-white/50 text-sm mt-2">sur {maxPossibleScore} points</p>
              </div>
              
              <div className="bg-black/30 rounded-2xl p-6">
                <p className="text-white/70 text-lg mb-2">Score du champion</p>
                <p className="text-5xl font-black text-yellow-400">{championScore}</p>
              </div>
              
              <div className="text-2xl font-bold text-white">
                {hasWon 
                  ? `Vous avez battu le champion de ${score - championScore} point${score - championScore > 1 ? 's' : ''} !`
                  : `Il vous manquait ${championScore - score + 1} point${championScore - score + 1 > 1 ? 's' : ''}...`
                }
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                🔄 Nouveau thème
              </button>
              <button
                onClick={onBack}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl transition-all duration-300"
              >
                ← Menu principal
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== SÉLECTION DU THÈME ==========
  if (!selectedTheme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <button
              onClick={onBack}
              className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold"
            >
              ← Retour
            </button>
            
            <h1 className="text-6xl font-black text-white mb-4 drop-shadow-2xl animate-fadeIn">
              🏆 LE CHAMPION
            </h1>
            <p className="text-2xl text-purple-300 mb-2">
              Choisissez un thème
            </p>
            <p className="text-lg text-white/60">
              5 questions • Battez le champion qui a fait <span className="font-black text-red-400">{championScore}</span> points !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableThemes.map((theme, index) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className="group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-purple-500/30 hover:border-yellow-400 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-yellow-500/30 text-yellow-300">
                      {theme.category}
                    </span>
                    <span className="text-4xl group-hover:scale-125 transition-transform duration-300">⚽</span>
                  </div>
                  
                  <h3 className="text-2xl font-black mb-3 text-white group-hover:text-yellow-300 transition-colors">
                    {theme.title}
                  </h3>
                  
                  <p className="text-purple-300 text-sm font-semibold">
                    Max 25 points • DUO/CARRÉ/CASH
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========== QUESTION ==========
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-white mb-4">Aucune question disponible 😢</p>
          <button
            onClick={() => setSelectedTheme(null)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
          >
            ← Choisir un autre thème
          </button>
        </div>
      </div>
    );
  }
  
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const allOptions = currentQuestion.options || [];
  const duoOptions = allOptions.length >= 2 ? allOptions.slice(0, 2) : allOptions;
  const carreOptions = allOptions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <button
            onClick={() => setSelectedTheme(null)}
            className="mb-4 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 font-semibold"
          >
            ← Changer de thème
          </button>
          
          <h2 className="text-4xl font-black text-white mb-2">{selectedTheme.title}</h2>
          <p className="text-xl text-purple-300 mb-4">
            Question {currentQuestionIndex + 1}/{questions.length}
          </p>
          
          <div className="max-w-md mx-auto mb-4">
            <div className="h-3 bg-black/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-center gap-8 text-lg">
            <div>
              <span className="text-white/60">Votre score : </span>
              <span className="font-black text-yellow-400">{score}</span>
            </div>
            <div>
              <span className="text-white/60">Champion : </span>
              <span className="font-black text-red-400">{championScore}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/30 shadow-2xl">
          <h3 className="text-3xl font-bold text-white mb-8 leading-relaxed">
            {currentQuestion.question}
          </h3>

          {/* PHASE 1 : Choix difficulté */}
          {!difficultyChoice && !isAnswered && (
            <div className="space-y-4">
              <p className="text-xl text-white/80 text-center mb-6 font-semibold">
                Choisissez votre niveau :
              </p>
              
              <button
                onClick={() => handleDifficultySelect('duo')}
                className="w-full p-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-3xl font-black mb-1">🥉 DUO</p>
                    <p className="text-sm opacity-90">2 réponses</p>
                  </div>
                  <div className="text-5xl font-black">1pt</div>
                </div>
              </button>

              <button
                onClick={() => handleDifficultySelect('carre')}
                className="w-full p-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-3xl font-black mb-1">🥈 CARRÉ</p>
                    <p className="text-sm opacity-90">4 réponses</p>
                  </div>
                  <div className="text-5xl font-black">3pts</div>
                </div>
              </button>

              <button
                onClick={() => handleDifficultySelect('cash')}
                className="w-full p-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-3xl font-black mb-1">🥇 CASH</p>
                    <p className="text-sm opacity-90">Réponse libre</p>
                  </div>
                  <div className="text-5xl font-black">5pts</div>
                </div>
              </button>
            </div>
          )}

          {/* PHASE 2 : Répondre */}
          {difficultyChoice && !isAnswered && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className={`px-5 py-2 rounded-xl font-black text-lg ${
                  difficultyChoice === 'duo' ? 'bg-blue-500 text-white' :
                  difficultyChoice === 'carre' ? 'bg-yellow-500 text-black' :
                  'bg-green-500 text-white'
                }`}>
                  {difficultyChoice === 'duo' ? '🥉 DUO - 1pt' :
                   difficultyChoice === 'carre' ? '🥈 CARRÉ - 3pts' :
                   '🥇 CASH - 5pts'}
                </span>
                <button
                  onClick={() => setDifficultyChoice(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all"
                >
                  Changer
                </button>
              </div>

              {(difficultyChoice === 'duo' || difficultyChoice === 'carre') && (
                <div className="space-y-3">
                  {(difficultyChoice === 'duo' ? duoOptions : carreOptions).map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedOption(option)}
                      className={`w-full p-4 text-left text-lg font-semibold rounded-xl transition-all ${
                        selectedOption === option
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black border-2 border-yellow-400 scale-105'
                          : 'bg-white/5 text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {difficultyChoice === 'cash' && (
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                  placeholder="Tapez votre réponse..."
                  className="w-full px-6 py-5 text-xl rounded-2xl bg-black/30 text-white placeholder-white/40 border-2 border-white/20 focus:border-green-400 focus:outline-none transition-all"
                  autoFocus
                />
              )}

              <button
                onClick={handleSubmitAnswer}
                disabled={
                  (difficultyChoice === 'duo' || difficultyChoice === 'carre') 
                    ? !selectedOption 
                    : !userAnswer.trim()
                }
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
              >
                ✓ Valider
              </button>
            </div>
          )}

          {/* PHASE 3 : Résultat */}
          {isAnswered && (
            <div className="space-y-6 animate-fadeIn">
              <div
                className={`p-8 rounded-2xl border-2 ${
                  answerFeedback === 'correct'
                    ? 'bg-green-500/20 border-green-400'
                    : 'bg-red-500/20 border-red-400'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-5xl">
                    {answerFeedback === 'correct' ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className="text-3xl font-black text-white">
                      {answerFeedback === 'correct' ? 'Exact !' : 'Incorrect'}
                    </p>
                    {answerFeedback === 'correct' && (
                      <p className="text-lg text-green-300">
                        +{difficultyChoice === 'duo' ? 1 : difficultyChoice === 'carre' ? 3 : 5} point{difficultyChoice !== 'duo' ? 's' : ''} 🎉
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="bg-black/20 rounded-xl p-4 mt-4">
                  <p className="text-white/70 text-sm mb-1">Réponse :</p>
                  <p className="text-2xl font-bold text-white">{currentQuestion.answer}</p>
                </div>
                
                {answerFeedback === 'incorrect' && (
                  <div className="bg-black/20 rounded-xl p-4 mt-3">
                    <p className="text-white/70 text-sm mb-1">Votre réponse :</p>
                    <p className="text-xl text-white">
                      {difficultyChoice === 'cash' ? userAnswer : selectedOption}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-5 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-black text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                {currentQuestionIndex < questions.length - 1
                  ? '➡️ Question suivante'
                  : '🏁 Voir le résultat'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChampionMode;
