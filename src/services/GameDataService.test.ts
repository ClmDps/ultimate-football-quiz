/**
 * EXEMPLES DE TESTS POUR GAMEDATA SERVICE
 * 
 * Ces tests démontrent le fonctionnement du service
 * et peuvent servir de base pour des tests unitaires
 */

import { gameDataService } from './services/GameDataService';

// ========================================
// TEST 1 : CHARGEMENT DES DONNÉES
// ========================================
async function testDataLoading() {
  console.log('🧪 Test 1 : Chargement des données');
  
  try {
    await gameDataService.loadData();
    console.log('✅ Données chargées avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur de chargement:', error);
    return false;
  }
}

// ========================================
// TEST 2 : VALIDATION FUZZY
// ========================================
function testFuzzyValidation() {
  console.log('\n🧪 Test 2 : Validation Fuzzy');

  const tests = [
    // Casse
    { input: 'mbappe', correct: 'Kylian Mbappé', expected: true },
    { input: 'MBAPPE', correct: 'Kylian Mbappé', expected: true },
    
    // Accents
    { input: 'griezmann', correct: 'Antoine Griezmann', expected: true },
    { input: 'Griezmann', correct: 'Antoine Griezmann', expected: true },
    
    // Nom partiel
    { input: 'Zidane', correct: 'Zinédine Zidane', expected: true },
    { input: 'Benzema', correct: 'Karim Benzema', expected: true },
    { input: 'Ronaldo', correct: 'Cristiano Ronaldo', expected: true },
    
    // Nom complet
    { input: 'Zinedine Zidane', correct: 'Zinédine Zidane', expected: true },
    { input: 'Karim Benzema', correct: 'Karim Benzema', expected: true },
    
    // Faute de frappe légère (tolérance)
    { input: 'Mbape', correct: 'Kylian Mbappé', expected: true },
    { input: 'Griezzman', correct: 'Antoine Griezmann', expected: true },
    
    // Réponses incorrectes
    { input: 'Pogba', correct: 'Kylian Mbappé', expected: false },
    { input: 'Platini', correct: 'Zinédine Zidane', expected: false },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(({ input, correct, expected }) => {
    const result = gameDataService.validateAnswer(input, correct);
    const status = result === expected ? '✅' : '❌';
    
    if (result === expected) {
      passed++;
    } else {
      failed++;
      console.error(
        `${status} FAIL: "${input}" vs "${correct}" - Attendu: ${expected}, Obtenu: ${result}`
      );
    }
  });

  console.log(`\nRésultats: ${passed}/${tests.length} tests réussis`);
  return failed === 0;
}

// ========================================
// TEST 3 : ANTI-RÉPÉTITION
// ========================================
function testAntiRepetition() {
  console.log('\n🧪 Test 3 : Anti-répétition');

  // Récupère 3 questions Survival
  const q1 = gameDataService.getSurvivalQuestion(1);
  const q2 = gameDataService.getSurvivalQuestion(1);
  const q3 = gameDataService.getSurvivalQuestion(1);

  // Vérifie qu'elles sont toutes différentes
  const ids = [q1?.id, q2?.id, q3?.id];
  const uniqueIds = new Set(ids);

  if (uniqueIds.size === 3) {
    console.log('✅ Les 3 questions sont différentes');
    console.log('IDs:', ids);
    return true;
  } else {
    console.error('❌ Répétition détectée !');
    console.error('IDs:', ids);
    return false;
  }
}

// ========================================
// TEST 4 : RÉINITIALISATION
// ========================================
function testReset() {
  console.log('\n🧪 Test 4 : Réinitialisation de l\'historique');

  // Utilise quelques questions
  gameDataService.getSurvivalQuestion(1);
  gameDataService.getSurvivalQuestion(1);
  gameDataService.getSurvivalQuestion(1);

  const before = gameDataService.getAvailableQuestionsCount('survival');
  console.log(`Questions restantes avant reset: ${before}`);

  // Réinitialise
  gameDataService.resetHistory('survival');

  const after = gameDataService.getAvailableQuestionsCount('survival');
  console.log(`Questions restantes après reset: ${after}`);

  if (after > before) {
    console.log('✅ Historique réinitialisé avec succès');
    return true;
  } else {
    console.error('❌ Échec de la réinitialisation');
    return false;
  }
}

// ========================================
// TEST 5 : MODE CHAMPION - RECHERCHE
// ========================================
function testChampionSearch() {
  console.log('\n🧪 Test 5 : Recherche de thèmes (Mode Champion)');

  const queries = [
    { query: 'Zidane', expectedMin: 1 },
    { query: 'Real Madrid', expectedMin: 1 },
    { query: 'Coupe du Monde', expectedMin: 5 },
    { query: 'xyzabc123', expectedMin: 0 }, // Recherche qui ne doit rien donner
  ];

  let allPassed = true;

  queries.forEach(({ query, expectedMin }) => {
    const results = gameDataService.searchThemes(query);
    const found = results.length;

    if (found >= expectedMin) {
      console.log(`✅ "${query}": ${found} résultat(s) trouvé(s)`);
    } else {
      console.error(`❌ "${query}": ${found} résultat(s), attendu au moins ${expectedMin}`);
      allPassed = false;
    }
  });

  return allPassed;
}

// ========================================
// TEST 6 : VALIDATION AUCTION
// ========================================
function testAuctionValidation() {
  console.log('\n🧪 Test 6 : Validation Auction (Fuzzy avec liste)');

  const validAnswers = [
    'Zinédine Zidane',
    'Thierry Henry',
    'Olivier Giroud',
    'Karim Benzema',
  ];

  const testCases = [
    { input: 'zidane', expectedIndex: 0 },
    { input: 'Henry', expectedIndex: 1 },
    { input: 'giroud', expectedIndex: 2 },
    { input: 'benzema', expectedIndex: 3 },
    { input: 'Pogba', expectedIndex: -1 }, // Non trouvé
  ];

  let allPassed = true;

  testCases.forEach(({ input, expectedIndex }) => {
    const index = gameDataService.validateAuctionAnswer(input, validAnswers);
    
    if (index === expectedIndex) {
      const found = index >= 0 ? validAnswers[index] : 'Non trouvé';
      console.log(`✅ "${input}" → ${found}`);
    } else {
      console.error(`❌ "${input}" → Attendu index ${expectedIndex}, obtenu ${index}`);
      allPassed = false;
    }
  });

  return allPassed;
}

// ========================================
// TEST 7 : DIFFICULTÉ SURVIVAL
// ========================================
function testSurvivalDifficulty() {
  console.log('\n🧪 Test 7 : Difficulté progressive Survival');

  // Réinitialise d'abord
  gameDataService.resetHistory('survival');

  const tests = [
    { round: 3, expectedDifficulty: 1 },
    { round: 7, expectedDifficulty: 2 },
    { round: 12, expectedDifficulty: 3 },
    { round: 18, expectedDifficulty: 4 },
    { round: 23, expectedDifficulty: 5 },
  ];

  let allPassed = true;

  tests.forEach(({ round, expectedDifficulty }) => {
    const question = gameDataService.getSurvivalQuestion(round);
    
    if (!question) {
      console.error(`❌ Pas de question pour le round ${round}`);
      allPassed = false;
      return;
    }

    if (question.difficulty === expectedDifficulty) {
      console.log(`✅ Round ${round} → Difficulté ${question.difficulty}`);
    } else {
      console.error(
        `❌ Round ${round} → Attendu ${expectedDifficulty}, obtenu ${question.difficulty}`
      );
      allPassed = false;
    }
  });

  return allPassed;
}

// ========================================
// EXÉCUTION DE TOUS LES TESTS
// ========================================
async function runAllTests() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║  TESTS GAMEDATA SERVICE              ║');
  console.log('╚══════════════════════════════════════╝\n');

  const results = {
    dataLoading: false,
    fuzzyValidation: false,
    antiRepetition: false,
    reset: false,
    championSearch: false,
    auctionValidation: false,
    survivalDifficulty: false,
  };

  // Test 1 : Chargement (obligatoire pour les autres)
  results.dataLoading = await testDataLoading();
  if (!results.dataLoading) {
    console.error('\n⚠️  Arrêt : Le chargement des données a échoué');
    return results;
  }

  // Tests suivants
  results.fuzzyValidation = testFuzzyValidation();
  results.antiRepetition = testAntiRepetition();
  results.reset = testReset();
  results.championSearch = testChampionSearch();
  results.auctionValidation = testAuctionValidation();
  results.survivalDifficulty = testSurvivalDifficulty();

  // Résumé
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  RÉSUMÉ DES TESTS                    ║');
  console.log('╚══════════════════════════════════════╝\n');

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${test}`);
  });

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;

  console.log(`\n📊 Total: ${passedTests}/${totalTests} tests réussis`);

  return results;
}

// Export pour utilisation dans un environnement de test
export { runAllTests };

// Auto-exécution en mode développement
if (import.meta.env.DEV) {
  console.log('🔬 Mode développement détecté - Tests disponibles');
  console.log('Pour lancer les tests : runAllTests()');
  
  // Décommentez pour auto-exécution au chargement :
  // runAllTests();
}
