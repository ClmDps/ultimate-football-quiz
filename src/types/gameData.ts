// ============================================
// INTERFACES BASÉES SUR LES FICHIERS JSON RÉELS
// ============================================

// ========== MODE "LE CHAMPION" (TLMVPSP) ==========
export interface ChampionTheme {
  id: string;
  title: string;
  category: string;
}

export interface ChampionQuestion {
  id: string;
  theme_id: string;
  point_value: 1 | 3 | 5; // Duo (1), Carré (3), Cash (5)
  question: string;
  answer: string;
}

// ========== MODE "MILLIONS" (QVGDM) ==========
export interface MillionsQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: number; // 1 à 15
}

// ========== MODE "SURVIVAL" (K.O.) ==========
export interface SurvivalQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string;
  difficulty: number; // 1 à 5
}

// ========== MODE "ENCHÈRES" (AUCTIONS) ==========
export interface AuctionItem {
  id: string;
  theme: string;
  description: string;
  total_count: number;
  answers: string[]; // Liste des réponses valides
}

// ========== MODE "QUI SUIS-JE" ==========
export interface WhoAmIQuestion {
  id: string;
  target: string; // La réponse (nom du joueur)
  clues: string[]; // 5 indices progressifs
  difficulty: number;
}

// ========== MODE "MERCATO CHAOS" ==========
export interface MercatoQuestion {
  id: string;
  clubs: string[]; // Liste chronologique des clubs
  answer: string; // Nom du joueur
  options: string[]; // Options QCM
  difficulty: number;
}

// ========== MODE "L'INTRUS" ==========
export interface OddOneOutQuestion {
  id: string;
  options: string[]; // 4 options
  answer: string; // L'intrus
  common_link: string; // Le point commun des 3 autres
  reason: string; // Explication du pourquoi l'intrus est différent
  difficulty: number;
}

// ========== MODE "MISSING PIECE" ==========
export interface MissingPieceQuestion {
  id: number;
  type: string; // "Lineup", "Podium", "Group", etc.
  context: string; // Le contexte avec "..." à compléter
  options: string[];
  answer: string;
  difficulty: number;
}

// ========== MODE "PLUS OU MOINS" ==========
export interface HigherLowerQuestion {
  id: string;
  label: string; // Type de stat (ex: "Buts en carrière")
  reference: {
    name: string;
    value: number;
  };
  target: {
    name: string;
    value: number;
  };
  correct_answer: "Plus" | "Moins";
  difficulty: number;
}

// ========== TYPES DE MODES ==========
export type GameMode =
  | "champion"      // Le Champion (TLMVPSP)
  | "millions"      // Pyramide des Millions
  | "survival"      // Survival (K.O.)
  | "auctions"      // Enchères
  | "whoami"        // Qui suis-je
  | "mercato"       // Mercato Chaos
  | "oddoneout"     // L'Intrus
  | "missingpiece"  // Missing Piece
  | "higherlower";  // Plus ou Moins

// ========== ÉTAT DU JEU ==========
export interface GameState {
  mode: GameMode;
  score: number;
  round: number;
  lives?: number; // Pour le mode Survival
  streak?: number; // Pour les combos
  questionHistory: Set<string>; // Anti-répétition
}
