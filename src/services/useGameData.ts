import { useState, useEffect } from 'react';
import { gameDataService } from '../services/GameDataService';
import type { GameMode } from '../types/gameData';

/**
 * Hook personnalisé pour gérer l'état du jeu
 */
export const useGameData = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    const loadGameData = async () => {
      try {
        await gameDataService.loadData();
        setIsLoaded(true);
      } catch (error) {
        setLoadError(error as Error);
      }
    };

    loadGameData();
  }, []);

  return { isLoaded, loadError, gameDataService };
};

/**
 * Hook pour gérer l'état d'un mode de jeu
 */
export const useGameMode = <T,>(
  mode: GameMode,
  getQuestion: () => T | null
) => {
  const [currentQuestion, setCurrentQuestion] = useState<T | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  const loadQuestion = () => {
    const question = getQuestion();
    if (question) {
      setCurrentQuestion(question);
    }
    return question;
  };

  const nextRound = () => {
    setRound(round + 1);
    return loadQuestion();
  };

  const resetGame = () => {
    gameDataService.resetHistory(mode);
    setScore(0);
    setRound(1);
    loadQuestion();
  };

  const addScore = (points: number) => {
    setScore(score + points);
  };

  const remainingQuestions = gameDataService.getAvailableQuestionsCount(mode);

  useEffect(() => {
    loadQuestion();
  }, []);

  return {
    currentQuestion,
    score,
    round,
    remainingQuestions,
    loadQuestion,
    nextRound,
    resetGame,
    addScore,
  };
};

/**
 * Hook pour la validation des réponses avec feedback
 */
export const useAnswerValidation = () => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const validateAnswer = (userInput: string, correctAnswer: string) => {
    const result = gameDataService.validateAnswer(userInput, correctAnswer);
    setIsCorrect(result);
    
    if (result) {
      setFeedback('✅ Correct !');
    } else {
      setFeedback(`❌ Incorrect. La réponse était : ${correctAnswer}`);
    }

    return result;
  };

  const reset = () => {
    setIsCorrect(null);
    setFeedback('');
  };

  return { isCorrect, feedback, validateAnswer, reset };
};

/**
 * Hook pour gérer la recherche de thèmes (Mode Champion)
 */
export const useThemeSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const themes = gameDataService.getChampionThemes();
  const [filteredThemes, setFilteredThemes] = useState(themes);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredThemes(themes);
    } else {
      const normalized = searchQuery.toLowerCase();
      const results = themes.filter(theme => 
        theme.title.toLowerCase().includes(normalized) ||
        theme.category.toLowerCase().includes(normalized)
      );
      setFilteredThemes(results);
    }
  }, [searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredThemes,
    totalThemes: themes.length,
  };
};

/**
 * Hook pour le système de timer (optionnel)
 */
export const useGameTimer = (initialSeconds: number = 30) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = (seconds: number = initialSeconds) => {
    setTimeLeft(seconds);
    setIsRunning(false);
  };

  return { timeLeft, isRunning, start, pause, reset };
};

/**
 * Hook pour gérer les high scores (localStorage)
 */
export const useHighScores = (mode: GameMode) => {
  const storageKey = `highscore_${mode}`;
  
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? parseInt(saved, 10) : 0;
  });

  const updateHighScore = (newScore: number) => {
    if (newScore > highScore) {
      setHighScore(newScore);
      localStorage.setItem(storageKey, newScore.toString());
      return true;
    }
    return false;
  };

  const resetHighScore = () => {
    setHighScore(0);
    localStorage.removeItem(storageKey);
  };

  return { highScore, updateHighScore, resetHighScore };
};

/**
 * Hook pour gérer les statistiques globales
 */
export const useGameStats = () => {
  const [stats, setStats] = useState({
    totalGamesPlayed: 0,
    totalScore: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
  });

  const loadStats = () => {
    const saved = localStorage.getItem('game_stats');
    if (saved) {
      setStats(JSON.parse(saved));
    }
  };

  const updateStats = (
    correct: boolean,
    score: number,
    questionsAnswered: number
  ) => {
    const newStats = {
      totalGamesPlayed: stats.totalGamesPlayed + 1,
      totalScore: stats.totalScore + score,
      totalQuestionsAnswered: stats.totalQuestionsAnswered + questionsAnswered,
      correctAnswers: stats.correctAnswers + (correct ? 1 : 0),
    };
    setStats(newStats);
    localStorage.setItem('game_stats', JSON.stringify(newStats));
  };

  const resetStats = () => {
    const emptyStats = {
      totalGamesPlayed: 0,
      totalScore: 0,
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
    };
    setStats(emptyStats);
    localStorage.setItem('game_stats', JSON.stringify(emptyStats));
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, updateStats, resetStats };
};
