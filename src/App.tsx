import React, { useState } from 'react';
import { useGameData } from './hooks/useGameData';
import type { GameMode } from './types/gameData';

// Import des composants de modes
import ChampionMode from './components/ChampionMode';
import AuctionsMode from './components/AuctionsMode';
import SurvivalMode from './components/SurvivalMode';
import OddOneOutMode from './components/OddOneOutMode';
import MercatoMode from './components/MercatoMode';
import MillionsMode from './components/MillionsMode';
import WhoAmIMode from './components/WhoAmIMode';
import MissingPieceMode from './components/MissingPieceMode';
import HigherLowerMode from './components/HigherLowerMode';

/**
 * Composant principal de l'application - VERSION AMÉLIORÉE
 */
function App() {
  const { isLoaded, loadError } = useGameData();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  // Chargement des données
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-t-4 border-yellow-400 mx-auto mb-4"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-5xl">
              ⚽
            </div>
          </div>
          <p className="text-2xl font-bold text-white animate-pulse">Chargement...</p>
        </div>
      </div>
    );
  }

  // Erreur de chargement
  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-pink-900 flex items-center justify-center p-8">
        <div className="max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 border-2 border-red-400 shadow-2xl">
          <div className="text-6xl mb-4 text-center">❌</div>
          <h1 className="text-3xl font-black text-white mb-4 text-center">Erreur</h1>
          <p className="text-lg text-white mb-4 text-center">
            Impossible de charger les données du jeu.
          </p>
          <p className="text-sm text-white/70 text-center">{loadError.message}</p>
        </div>
      </div>
    );
  }

  // Rendu du mode sélectionné
  if (selectedMode) {
    const handleBackToMenu = () => setSelectedMode(null);

    switch (selectedMode) {
      case 'champion':
        return <ChampionMode onBack={handleBackToMenu} />;
      case 'auctions':
        return <AuctionsMode onBack={handleBackToMenu} />;
      case 'survival':
        return <SurvivalMode onBack={handleBackToMenu} />;
      case 'oddoneout':
        return <OddOneOutMode onBack={handleBackToMenu} />;
      case 'mercato':
        return <MercatoMode onBack={handleBackToMenu} />;
      case 'millions':
        return <MillionsMode onBack={handleBackToMenu} />;
      case 'whoami':
        return <WhoAmIMode onBack={handleBackToMenu} />;
      case 'missingpiece':
        return <MissingPieceMode onBack={handleBackToMenu} />;
      case 'higherlower':
        return <HigherLowerMode onBack={handleBackToMenu} />;
      default:
        return <div>Mode non implémenté</div>;
    }
  }

  // Menu principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 overflow-hidden">
      {/* Effets d'arrière-plan animés */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* En-tête */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-block mb-6">
            <div className="text-8xl animate-bounce">⚽</div>
          </div>
          <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-4 drop-shadow-2xl animate-fadeIn">
            ULTIMATE FOOTBALL QUIZ
          </h1>
          <p className="text-2xl md:text-3xl text-purple-300 font-semibold">
            Prouve tes connaissances foot ! 🔥
          </p>
        </div>

        {/* Grille des modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModeCard
            title="🏆 Le Champion"
            description="Bats le champion en répondant à 4 thèmes de 5 questions !"
            difficulty="Tous niveaux"
            questionsCount="600+ questions"
            color="from-yellow-500 to-orange-600"
            onClick={() => setSelectedMode('champion')}
            index={0}
          />

          <ModeCard
            title="💰 Millions"
            description="Pyramide de 15 paliers avec difficulté progressive"
            difficulty="Croissante"
            questionsCount="300+ questions"
            color="from-green-500 to-emerald-700"
            onClick={() => setSelectedMode('millions')}
            index={1}
          />

          <ModeCard
            title="⚡ Survival"
            description="Mode K.O. : Une seule erreur et c'est fini !"
            difficulty="Mort subite"
            questionsCount="160+ questions"
            color="from-red-500 to-pink-600"
            onClick={() => setSelectedMode('survival')}
            index={2}
          />

          <ModeCard
            title="🔨 Enchères"
            description="Parie et cite un maximum de bonnes réponses"
            difficulty="Tous niveaux"
            questionsCount="100 items"
            color="from-orange-500 to-red-600"
            onClick={() => setSelectedMode('auctions')}
            index={3}
          />

          <ModeCard
            title="🎭 Qui suis-je"
            description="Devine le joueur avec 5 indices progressifs"
            difficulty="Moyen"
            questionsCount="200 joueurs"
            color="from-purple-500 to-pink-600"
            onClick={() => setSelectedMode('whoami')}
            index={4}
          />

          <ModeCard
            title="🔄 Mercato Chaos"
            description="Retrouve le joueur grâce à son parcours de clubs"
            difficulty="Moyen"
            questionsCount="150+ parcours"
            color="from-teal-500 to-cyan-600"
            onClick={() => setSelectedMode('mercato')}
            index={5}
          />

          <ModeCard
            title="🔍 L'Intrus"
            description="Trouve l'élément qui n'a pas sa place"
            difficulty="Variable"
            questionsCount="200 intrus"
            color="from-pink-500 to-purple-600"
            onClick={() => setSelectedMode('oddoneout')}
            index={6}
          />

          <ModeCard
            title="🧩 Missing Piece"
            description="Complète les compositions et podiums mythiques"
            difficulty="Difficile"
            questionsCount="50+ compositions"
            color="from-blue-500 to-indigo-700"
            onClick={() => setSelectedMode('missingpiece')}
            index={7}
          />

          <ModeCard
            title="↕️ Plus ou Moins"
            description="Compare les stats de deux joueurs ou clubs"
            difficulty="Moyen"
            questionsCount="200 comparaisons"
            color="from-indigo-500 to-purple-700"
            onClick={() => setSelectedMode('higherlower')}
            index={8}
          />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center animate-fadeIn">
          <div className="inline-block bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-4">
            <p className="text-white/80 text-sm font-semibold">
              © 2026 Ultimate Football Quiz | 100% Offline | 2000+ Questions 🎮
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Composant carte de mode de jeu - VERSION AMÉLIORÉE
 */
interface ModeCardProps {
  title: string;
  description: string;
  difficulty: string;
  questionsCount: string;
  color: string;
  onClick: () => void;
  index: number;
}

const ModeCard: React.FC<ModeCardProps> = ({
  title,
  description,
  difficulty,
  questionsCount,
  color,
  onClick,
  index,
}) => {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl p-8 text-left transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 animate-fadeIn"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Gradient background avec effet glassmorphism */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-80 group-hover:opacity-100 transition-all duration-500`}
      ></div>

      {/* Effet de grille */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

      {/* Contenu */}
      <div className="relative z-10">
        <h3 className="text-4xl font-black text-white mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
          {title}
        </h3>
        <p className="text-lg text-white/95 mb-6 min-h-[60px] leading-relaxed font-medium">
          {description}
        </p>

        <div className="flex items-center justify-between border-t border-white/20 pt-4">
          <div className="space-y-1">
            <p className="text-xs text-white/70 uppercase tracking-wider font-bold">Difficulté</p>
            <p className="text-lg font-black text-white">{difficulty}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-white/70 uppercase tracking-wider font-bold">Contenu</p>
            <p className="text-lg font-black text-white">{questionsCount}</p>
          </div>
        </div>

        {/* Arrow indicator avec animation */}
        <div className="absolute bottom-6 right-6 text-5xl text-white/40 group-hover:text-white group-hover:translate-x-2 group-hover:scale-125 transition-all duration-500">
          →
        </div>
      </div>

      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

      {/* Bordure lumineuse */}
      <div className="absolute inset-0 border-2 border-white/10 group-hover:border-white/30 rounded-3xl transition-all duration-500"></div>
    </button>
  );
};

export default App;
