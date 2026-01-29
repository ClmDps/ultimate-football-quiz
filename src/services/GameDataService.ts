import type {
  ChampionTheme,
  ChampionQuestion,
  MillionsQuestion,
  SurvivalQuestion,
  AuctionItem,
  WhoAmIQuestion,
  MercatoQuestion,
  OddOneOutQuestion,
  MissingPieceQuestion,
  HigherLowerQuestion,
  GameMode
} from '../types/gameData';

/**
 * SERVICE PRINCIPAL - AVEC LES VRAIS NOMS DE FICHIERS
 */
class GameDataService {
  private usedQuestionIds: Map<GameMode, Set<string>> = new Map();

  private championThemes: ChampionTheme[] = [];
  private championQuestions: ChampionQuestion[] = [];
  private millionsQuestions: MillionsQuestion[] = [];
  private survivalQuestions: SurvivalQuestion[] = [];
  private auctionItems: AuctionItem[] = [];
  private whoAmIQuestions: WhoAmIQuestion[] = [];
  private mercatoQuestions: MercatoQuestion[] = [];
  private oddOneOutQuestions: OddOneOutQuestion[] = [];
  private missingPieceQuestions: MissingPieceQuestion[] = [];
  private higherLowerQuestions: HigherLowerQuestion[] = [];

  constructor() {
    this.initializeUsedQuestions();
  }

  private initializeUsedQuestions(): void {
    const modes: GameMode[] = [
      'champion', 'millions', 'survival', 'auctions',
      'whoami', 'mercato', 'oddoneout', 'missingpiece', 'higherlower'
    ];
    modes.forEach(mode => this.usedQuestionIds.set(mode, new Set()));
  }

  public resetHistory(mode: GameMode): void {
    this.usedQuestionIds.get(mode)?.clear();
  }

  public resetAllHistory(): void {
    this.usedQuestionIds.forEach(set => set.clear());
  }

  private markAsUsed(mode: GameMode, id: string): void {
    this.usedQuestionIds.get(mode)?.add(id);
  }

  private isUsed(mode: GameMode, id: string): boolean {
    return this.usedQuestionIds.get(mode)?.has(id) || false;
  }

  private normalizeString(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public validateAnswer(userAnswer: string, correctAnswer: string, difficulty: number = 5): boolean {
    const normalized1 = this.normalizeString(userAnswer);
    const normalized2 = this.normalizeString(correctAnswer);

    if (normalized1 === normalized2) return true;

    const maxDistance = Math.max(1, Math.floor(normalized2.length * (10 - difficulty) / 20));
    return this.levenshteinDistance(normalized1, normalized2) <= maxDistance;
  }

  public validateAuctionAnswer(userAnswer: string, correctAnswers: string[]): number {
    const normalized = this.normalizeString(userAnswer);
    
    return correctAnswers.findIndex(answer => {
      const normalizedAnswer = this.normalizeString(answer);
      if (normalized === normalizedAnswer) return true;
      
      const maxDistance = Math.max(1, Math.floor(normalizedAnswer.length / 4));
      return this.levenshteinDistance(normalized, normalizedAnswer) <= maxDistance;
    });
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Charge les données JSON (VRAIS NOMS DE FICHIERS)
   */
  public async loadData(): Promise<void> {
    try {
      console.log('🔄 Chargement des données...');

      // Import avec les vrais noms de fichiers
      const [
        questionsModule,
        millionsModule,
        survivalModule,
        auctionsModule,
        whoamiModule,
        mercatoModule,
        intrusModule,
        piecesModule,
        plusmoinsModule
      ] = await Promise.all([
        import('../data/json/tlmvpsp_questions.json'),
        import('../data/json/qvgdm.json'),           // ✅ Qui Veut Gagner Des Millions
        import('../data/json/ko.json'),              // ✅ K.O. / Survival
        import('../data/json/auctions.json'),        // ✅ Enchères
        import('../data/json/quisuisje.json'),       // ✅ Qui suis-je
        import('../data/json/mercato.json'),         // ✅ Mercato
        import('../data/json/intrus.json'),          // ✅ L'intrus
        import('../data/json/pieces.json'),          // ✅ Pièces manquantes
        import('../data/json/plusmoins.json')        // ✅ Plus ou Moins
      ]);

      // Extraire themes + questions du TLMVPSP
      const questionsData = questionsModule.default;
      this.championThemes = [];
      this.championQuestions = [];

      questionsData.forEach((themeData: any) => {
        if (themeData.questions && themeData.questions.length > 0) {
          this.championThemes.push({
            id: themeData.id,
            title: themeData.title,
            category: themeData.category
          });

          themeData.questions.forEach((q: any) => {
            this.championQuestions.push({
              id: `${themeData.id}_q${q.id}`,
              theme_id: themeData.id,
              question: q.question,
              options: q.options || [],
              answer: q.answer,
              point_value: q.points || 1,
              explanation: q.explanation || ''
            });
          });
        }
      });

      console.log(`📊 ${this.championThemes.length} thèmes Champion, ${this.championQuestions.length} questions`);

      // Charger les autres modes
      this.millionsQuestions = millionsModule.default;
      this.survivalQuestions = survivalModule.default;
      this.auctionItems = auctionsModule.default;
      this.whoAmIQuestions = whoamiModule.default;
      this.mercatoQuestions = mercatoModule.default;
      this.oddOneOutQuestions = intrusModule.default;
      this.missingPieceQuestions = piecesModule.default;
      
      // Fix pour HigherLower
      const rawHigherLower = plusmoinsModule.default as any[];
      this.higherLowerQuestions = rawHigherLower.map((q: any) => ({
        ...q,
        correct_answer: (q.correct_answer === 'Plus' || q.correct_answer === 'Moins') 
          ? q.correct_answer 
          : 'Plus'
      }));

      console.log('✅ Toutes les données chargées !');
    } catch (error) {
      console.error('❌ Erreur de chargement:', error);
      throw error;
    }
  }

  // ========================================
  // CHAMPION MODE
  // ========================================

  public getChampionThemes(): ChampionTheme[] {
    const shuffled = [...this.championThemes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }

  public getChampionQuestionsByTheme(themeId: string): ChampionQuestion[] {
    const questions = this.championQuestions
      .filter(q => q.theme_id === themeId)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    return questions;
  }

  public generateChampionScore(): number {
    const rand = Math.random();
    if (rand < 0.05) return 25;
    if (rand < 0.15) return Math.floor(Math.random() * 3) + 23;
    return Math.floor(Math.random() * 11) + 13;
  }

  // ========================================
  // MILLIONS MODE
  // ========================================

  public getMillionsQuestion(difficulty: number): MillionsQuestion | null {
    const availableQuestions = this.millionsQuestions.filter(
      q => q.difficulty === difficulty && !this.isUsed('millions', JSON.stringify(q))
    );

    if (availableQuestions.length === 0) return null;

    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    this.markAsUsed('millions', JSON.stringify(question));
    return question;
  }

  // ========================================
  // SURVIVAL MODE
  // ========================================

  public getSurvivalQuestion(round: number): SurvivalQuestion | null {
    const availableQuestions = this.survivalQuestions.filter(
      q => !this.isUsed('survival', q.id)
    );

    if (availableQuestions.length === 0) return null;

    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    this.markAsUsed('survival', question.id);
    return question;
  }

  // ========================================
  // AUCTIONS MODE
  // ========================================

  public getAuctionItem(): AuctionItem | null {
    const availableItems = this.auctionItems.filter(
      item => !this.isUsed('auctions', item.id)
    );

    if (availableItems.length === 0) return null;

    const item = availableItems[Math.floor(Math.random() * availableItems.length)];
    this.markAsUsed('auctions', item.id);
    return item;
  }

  // ========================================
  // WHO AM I MODE
  // ========================================

  public getWhoAmIQuestion(): WhoAmIQuestion | null {
    const availableQuestions = this.whoAmIQuestions.filter(
      q => !this.isUsed('whoami', q.id)
    );

    if (availableQuestions.length === 0) return null;

    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    this.markAsUsed('whoami', question.id);
    return question;
  }

  // ========================================
  // MERCATO MODE
  // ========================================

  public getMercatoQuestion(): MercatoQuestion | null {
    const availableQuestions = this.mercatoQuestions.filter(
      q => !this.isUsed('mercato', q.id)
    );

    if (availableQuestions.length === 0) return null;

    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    this.markAsUsed('mercato', question.id);
    return question;
  }

  // ========================================
  // ODD ONE OUT MODE
  // ========================================

  public getOddOneOutQuestion(): OddOneOutQuestion | null {
    const availableQuestions = this.oddOneOutQuestions.filter(
      q => !this.isUsed('oddoneout', q.id)
    );

    if (availableQuestions.length === 0) return null;

    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    this.markAsUsed('oddoneout', question.id);
    return question;
  }

  // ========================================
  // MISSING PIECE MODE
  // ========================================

  public getMissingPieceQuestion(): MissingPieceQuestion | null {
    const availableQuestions = this.missingPieceQuestions.filter(
      q => !this.isUsed('missingpiece', q.id)
    );

    if (availableQuestions.length === 0) return null;

    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    this.markAsUsed('missingpiece', question.id);
    return question;
  }

  // ========================================
  // HIGHER/LOWER MODE
  // ========================================

  public getHigherLowerQuestion(): HigherLowerQuestion | null {
    const availableQuestions = this.higherLowerQuestions.filter(
      q => !this.isUsed('higherlower', q.id)
    );

    if (availableQuestions.length === 0) return null;

    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    this.markAsUsed('higherlower', question.id);
    return question;
  }

  // ========================================
  // UTILITAIRES
  // ========================================

  public getAvailableQuestionsCount(mode: GameMode): number {
    const usedSet = this.usedQuestionIds.get(mode);
    if (!usedSet) return 0;

    const dataMap: Record<GameMode, any[]> = {
      champion: this.championQuestions,
      millions: this.millionsQuestions,
      survival: this.survivalQuestions,
      auctions: this.auctionItems,
      whoami: this.whoAmIQuestions,
      mercato: this.mercatoQuestions,
      oddoneout: this.oddOneOutQuestions,
      missingpiece: this.missingPieceQuestions,
      higherlower: this.higherLowerQuestions
    };

    const total = dataMap[mode]?.length || 0;
    return total - usedSet.size;
  }
}

export const gameDataService = new GameDataService();
