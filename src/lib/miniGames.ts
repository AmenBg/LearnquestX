export interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpCost: number;
  category: 'math' | 'logic' | 'memory' | 'speed' | 'word';
  color: string;
}

export const miniGames: MiniGame[] = [
  { id: 'math-speed', name: 'Math Speed Challenge', description: 'Solve math problems as fast as you can!', icon: '⚡', xpCost: 500, category: 'math', color: 'hsl(130 100% 55%)' },
  { id: 'memory-match', name: 'Memory Match', description: 'Find matching pairs before time runs out.', icon: '🧠', xpCost: 400, category: 'memory', color: 'hsl(270 80% 60%)' },
  { id: 'logic-puzzle', name: 'Logic Puzzle', description: 'Complete patterns and logical sequences.', icon: '🧩', xpCost: 600, category: 'logic', color: 'hsl(220 90% 56%)' },
  { id: 'word-builder', name: 'Word Builder', description: 'Build words from scrambled letters.', icon: '📝', xpCost: 450, category: 'word', color: 'hsl(35 100% 55%)' },
  { id: 'brain-maze', name: 'Brain Maze', description: 'Navigate through tricky mazes.', icon: '🌀', xpCost: 550, category: 'logic', color: 'hsl(160 70% 45%)' },
  { id: 'pattern-recognition', name: 'Pattern Recognition', description: 'Identify patterns in sequences.', icon: '🔍', xpCost: 500, category: 'logic', color: 'hsl(200 80% 55%)' },
  { id: 'number-ninja', name: 'Number Ninja', description: 'Slash the correct numbers!', icon: '🥷', xpCost: 700, category: 'math', color: 'hsl(0 80% 55%)' },
  { id: 'quick-calc', name: 'Quick Calculation Race', description: 'Race against the clock solving equations.', icon: '🏎️', xpCost: 500, category: 'math', color: 'hsl(45 100% 50%)' },
  { id: 'code-breaker', name: 'Code Breaker', description: 'Crack the secret code.', icon: '🔐', xpCost: 800, category: 'logic', color: 'hsl(300 70% 50%)' },
  { id: 'sudoku', name: 'Sudoku Challenge', description: 'Classic number puzzle.', icon: '🔢', xpCost: 600, category: 'logic', color: 'hsl(180 60% 45%)' },
  { id: 'trivia-arena', name: 'Trivia Arena', description: 'Test your general knowledge.', icon: '🏟️', xpCost: 450, category: 'word', color: 'hsl(15 90% 55%)' },
  { id: 'geometry-builder', name: 'Geometry Builder', description: 'Build shapes and solve geometry puzzles.', icon: '📐', xpCost: 550, category: 'math', color: 'hsl(260 70% 55%)' },
  { id: 'hidden-object', name: 'Hidden Object Challenge', description: 'Find hidden items in complex scenes.', icon: '🔎', xpCost: 400, category: 'memory', color: 'hsl(90 60% 45%)' },
  { id: 'knowledge-race', name: 'Knowledge Race', description: 'Race to answer questions correctly.', icon: '🏁', xpCost: 500, category: 'speed', color: 'hsl(330 80% 55%)' },
  { id: 'brain-reflex', name: 'Brain Reflex Test', description: 'Test your reaction speed.', icon: '💥', xpCost: 350, category: 'speed', color: 'hsl(50 100% 50%)' },
  { id: 'strategy-puzzle', name: 'Strategy Puzzle', description: 'Plan your moves carefully.', icon: '♟️', xpCost: 750, category: 'logic', color: 'hsl(210 50% 40%)' },
  { id: 'pattern-memory', name: 'Pattern Memory', description: 'Remember and repeat patterns.', icon: '🎨', xpCost: 450, category: 'memory', color: 'hsl(350 80% 55%)' },
  { id: 'word-search', name: 'Word Search Battle', description: 'Find words in a grid.', icon: '🔠', xpCost: 400, category: 'word', color: 'hsl(120 60% 45%)' },
  { id: 'reaction-speed', name: 'Reaction Speed Game', description: 'How fast can you react?', icon: '⏱️', xpCost: 300, category: 'speed', color: 'hsl(20 90% 55%)' },
  { id: 'puzzle-master', name: 'Puzzle Master', description: 'Solve increasingly hard puzzles.', icon: '🏆', xpCost: 900, category: 'logic', color: 'hsl(40 90% 50%)' },
];
