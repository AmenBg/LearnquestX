export interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpCost: number;
  category: 'math' | 'logic' | 'memory' | 'speed' | 'word' | 'strategy' | 'chess';
  color: string;
}

export const miniGames: MiniGame[] = [
  // Math — 3 unique concepts
  { id: 'math-speed', name: 'Math Speed Challenge', description: 'Solve rapid-fire arithmetic before the timer runs out.', icon: '⚡', xpCost: 500, category: 'math', color: 'hsl(130 100% 55%)' },
  { id: 'geometry-builder', name: 'Geometry Builder', description: 'Construct shapes and solve spatial geometry puzzles.', icon: '📐', xpCost: 650, category: 'math', color: 'hsl(260 70% 55%)' },
  { id: 'number-grid', name: 'Number Grid Puzzle', description: 'Fill the grid so rows and columns hit target sums.', icon: '🔢', xpCost: 600, category: 'math', color: 'hsl(180 60% 45%)' },

  // Memory — 3 unique concepts
  { id: 'memory-match', name: 'Memory Card Match', description: 'Flip cards and find matching pairs before time expires.', icon: '🃏', xpCost: 500, category: 'memory', color: 'hsl(270 80% 60%)' },
  { id: 'pattern-memory', name: 'Pattern Replay', description: 'Watch a sequence of lights and replay it perfectly.', icon: '🎨', xpCost: 550, category: 'memory', color: 'hsl(350 80% 55%)' },
  { id: 'hidden-object', name: 'Hidden Object Hunt', description: 'Spot hidden items in detailed illustrated scenes.', icon: '🔎', xpCost: 500, category: 'memory', color: 'hsl(90 60% 45%)' },

  // Speed — 3 unique concepts
  { id: 'reaction-speed', name: 'Reaction Test', description: 'Tap the moment the screen changes color — milliseconds count!', icon: '⏱️', xpCost: 400, category: 'speed', color: 'hsl(20 90% 55%)' },
  { id: 'speed-typing', name: 'Speed Typing', description: 'Type falling words before they hit the bottom.', icon: '⌨️', xpCost: 500, category: 'speed', color: 'hsl(220 80% 55%)' },
  { id: 'quick-decision', name: 'Quick Decisions', description: 'True or false? Swipe left or right in split seconds.', icon: '🎲', xpCost: 500, category: 'speed', color: 'hsl(280 70% 55%)' },

  // Word — 3 unique concepts
  { id: 'word-builder', name: 'Word Builder', description: 'Drag scattered letters to form the longest word possible.', icon: '📝', xpCost: 550, category: 'word', color: 'hsl(35 100% 55%)' },
  { id: 'word-search', name: 'Word Search', description: 'Find hidden words in a letter grid before time runs out.', icon: '🔠', xpCost: 500, category: 'word', color: 'hsl(120 60% 45%)' },
  { id: 'word-chain', name: 'Word Chain', description: 'Each word must start with the last letter of the previous one.', icon: '🔗', xpCost: 600, category: 'word', color: 'hsl(100 60% 45%)' },

  // Logic — 4 unique concepts
  { id: 'sudoku', name: 'Sudoku', description: 'Classic 9×9 number placement puzzle.', icon: '🔢', xpCost: 700, category: 'logic', color: 'hsl(180 60% 45%)' },
  { id: 'code-breaker', name: 'Code Breaker', description: 'Guess the secret color code with logic clues each round.', icon: '🔐', xpCost: 800, category: 'logic', color: 'hsl(300 70% 50%)' },
  { id: 'brain-maze', name: 'Brain Maze', description: 'Navigate shifting mazes that rearrange as you move.', icon: '🌀', xpCost: 650, category: 'logic', color: 'hsl(160 70% 45%)' },
  { id: 'pattern-recognition', name: 'Pattern Spotter', description: 'Identify the rule in a visual sequence and pick what comes next.', icon: '🔍', xpCost: 600, category: 'logic', color: 'hsl(200 80% 55%)' },

  // Strategy — 4 unique concepts
  { id: 'strategy-tower', name: 'Tower Defense', description: 'Place defenses strategically to survive waves of challenges.', icon: '🏰', xpCost: 850, category: 'strategy', color: 'hsl(25 80% 50%)' },
  { id: 'puzzle-blocks', name: 'Block Fit', description: 'Rotate and fit tetromino-style blocks into the board.', icon: '🧱', xpCost: 650, category: 'strategy', color: 'hsl(15 75% 50%)' },
  { id: 'brain-balance', name: 'Balance Scale', description: 'Place weights on a scale to reach perfect equilibrium.', icon: '⚖️', xpCost: 700, category: 'strategy', color: 'hsl(265 60% 50%)' },
  { id: 'shape-matching', name: 'Shape Match', description: 'Drag shapes into their silhouettes against the clock.', icon: '🔷', xpCost: 500, category: 'strategy', color: 'hsl(230 75% 55%)' },

  // Chess — 1 unique
  { id: 'chess', name: 'Chess Arena', description: 'Play chess against 50 unique AI personalities.', icon: '♟️', xpCost: 1000, category: 'chess', color: 'hsl(0 0% 25%)' },
];
