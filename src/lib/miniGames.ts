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
  // Math games
  { id: 'math-speed', name: 'Math Speed Challenge', description: 'Solve math problems as fast as you can!', icon: '⚡', xpCost: 500, category: 'math', color: 'hsl(130 100% 55%)' },
  { id: 'number-ninja', name: 'Number Ninja', description: 'Slash the correct numbers!', icon: '🥷', xpCost: 700, category: 'math', color: 'hsl(0 80% 55%)' },
  { id: 'quick-calc', name: 'Quick Calculation Race', description: 'Race against the clock solving equations.', icon: '🏎️', xpCost: 600, category: 'math', color: 'hsl(45 100% 50%)' },
  { id: 'geometry-builder', name: 'Geometry Builder', description: 'Build shapes and solve geometry puzzles.', icon: '📐', xpCost: 650, category: 'math', color: 'hsl(260 70% 55%)' },
  { id: 'math-runner', name: 'Math Runner', description: 'Run through equations at high speed!', icon: '🏃', xpCost: 550, category: 'math', color: 'hsl(140 80% 45%)' },
  { id: 'mental-math-sprint', name: 'Mental Math Sprint', description: 'Sprint through mental calculations.', icon: '🧮', xpCost: 750, category: 'math', color: 'hsl(200 70% 50%)' },
  { id: 'calculation-marathon', name: 'Calculation Marathon', description: 'Endurance test of math skills.', icon: '🏅', xpCost: 800, category: 'math', color: 'hsl(30 90% 50%)' },
  { id: 'number-grid', name: 'Number Grid Puzzle', description: 'Fill the grid with correct numbers.', icon: '🔢', xpCost: 600, category: 'math', color: 'hsl(180 60% 45%)' },

  // Memory games
  { id: 'memory-match', name: 'Memory Card Match', description: 'Find matching pairs before time runs out.', icon: '🧠', xpCost: 500, category: 'memory', color: 'hsl(270 80% 60%)' },
  { id: 'pattern-memory', name: 'Pattern Memory', description: 'Remember and repeat patterns.', icon: '🎨', xpCost: 550, category: 'memory', color: 'hsl(350 80% 55%)' },
  { id: 'hidden-object', name: 'Hidden Object Challenge', description: 'Find hidden items in complex scenes.', icon: '🔎', xpCost: 500, category: 'memory', color: 'hsl(90 60% 45%)' },
  { id: 'color-memory', name: 'Color Memory Challenge', description: 'Remember sequences of colors.', icon: '🌈', xpCost: 500, category: 'memory', color: 'hsl(300 70% 55%)' },
  { id: 'memory-grid-master', name: 'Memory Grid Master', description: 'Master the memory grid challenge.', icon: '📋', xpCost: 650, category: 'memory', color: 'hsl(210 60% 50%)' },

  // Speed games
  { id: 'reaction-speed', name: 'Reaction Speed Game', description: 'How fast can you react?', icon: '⏱️', xpCost: 400, category: 'speed', color: 'hsl(20 90% 55%)' },
  { id: 'brain-reflex', name: 'Brain Reflex Test', description: 'Test your reaction speed.', icon: '💥', xpCost: 450, category: 'speed', color: 'hsl(50 100% 50%)' },
  { id: 'knowledge-race', name: 'Knowledge Race', description: 'Race to answer questions correctly.', icon: '🏁', xpCost: 550, category: 'speed', color: 'hsl(330 80% 55%)' },
  { id: 'reflex-click', name: 'Reflex Click Challenge', description: 'Click targets as they appear!', icon: '🖱️', xpCost: 400, category: 'speed', color: 'hsl(10 85% 55%)' },
  { id: 'reaction-timing', name: 'Reaction Timing Test', description: 'Precise timing challenge.', icon: '🎯', xpCost: 450, category: 'speed', color: 'hsl(160 70% 50%)' },
  { id: 'speed-typing', name: 'Speed Typing Challenge', description: 'Type words as fast as you can!', icon: '⌨️', xpCost: 500, category: 'speed', color: 'hsl(220 80% 55%)' },
  { id: 'fast-thinking', name: 'Fast Thinking Quiz', description: 'Think fast, answer faster!', icon: '💨', xpCost: 550, category: 'speed', color: 'hsl(40 90% 50%)' },
  { id: 'quick-decision', name: 'Quick Decision Game', description: 'Make split-second decisions.', icon: '🎲', xpCost: 500, category: 'speed', color: 'hsl(280 70% 55%)' },

  // Word games
  { id: 'word-builder', name: 'Word Builder', description: 'Build words from scrambled letters.', icon: '📝', xpCost: 550, category: 'word', color: 'hsl(35 100% 55%)' },
  { id: 'word-search', name: 'Word Search Battle', description: 'Find words in a grid.', icon: '🔠', xpCost: 500, category: 'word', color: 'hsl(120 60% 45%)' },
  { id: 'trivia-arena', name: 'Trivia Arena', description: 'Test your general knowledge.', icon: '🏟️', xpCost: 550, category: 'word', color: 'hsl(15 90% 55%)' },
  { id: 'word-scramble', name: 'Word Scramble', description: 'Unscramble letters to form words.', icon: '🔤', xpCost: 500, category: 'word', color: 'hsl(60 80% 45%)' },
  { id: 'trivia-master', name: 'Trivia Master', description: 'Advanced trivia for experts.', icon: '🎓', xpCost: 700, category: 'word', color: 'hsl(190 70% 50%)' },
  { id: 'word-chain', name: 'Word Chain Challenge', description: 'Chain words together logically.', icon: '🔗', xpCost: 600, category: 'word', color: 'hsl(100 60% 45%)' },
  { id: 'knowledge-duel', name: 'Knowledge Duel', description: 'Duel with questions against the clock.', icon: '⚔️', xpCost: 650, category: 'word', color: 'hsl(0 70% 50%)' },

  // Logic games
  { id: 'logic-puzzle', name: 'Logic Grid Puzzle', description: 'Complete patterns and logical sequences.', icon: '🧩', xpCost: 650, category: 'logic', color: 'hsl(220 90% 56%)' },
  { id: 'brain-maze', name: 'Brain Maze', description: 'Navigate through tricky mazes.', icon: '🌀', xpCost: 650, category: 'logic', color: 'hsl(160 70% 45%)' },
  { id: 'pattern-recognition', name: 'Pattern Recognition', description: 'Identify patterns in sequences.', icon: '🔍', xpCost: 600, category: 'logic', color: 'hsl(200 80% 55%)' },
  { id: 'code-breaker', name: 'Code Breaker', description: 'Crack the secret code.', icon: '🔐', xpCost: 800, category: 'logic', color: 'hsl(300 70% 50%)' },
  { id: 'sudoku', name: 'Sudoku Challenge', description: 'Classic number puzzle.', icon: '🔢', xpCost: 700, category: 'logic', color: 'hsl(180 60% 45%)' },
  { id: 'puzzle-solver', name: 'Puzzle Solver', description: 'Solve complex multi-step puzzles.', icon: '🧩', xpCost: 750, category: 'logic', color: 'hsl(250 70% 55%)' },
  { id: 'puzzle-master', name: 'Puzzle Master', description: 'Solve increasingly hard puzzles.', icon: '🏆', xpCost: 900, category: 'logic', color: 'hsl(40 90% 50%)' },
  { id: 'logic-sequence', name: 'Logical Sequence Solver', description: 'Find the next in the sequence.', icon: '📊', xpCost: 600, category: 'logic', color: 'hsl(170 65% 45%)' },
  { id: 'logic-switch', name: 'Logic Switch Puzzle', description: 'Toggle switches to solve puzzles.', icon: '🔀', xpCost: 650, category: 'logic', color: 'hsl(240 60% 55%)' },
  { id: 'logic-tower', name: 'Logic Tower Builder', description: 'Build towers with logic rules.', icon: '🗼', xpCost: 700, category: 'logic', color: 'hsl(310 65% 50%)' },
  { id: 'hidden-pattern', name: 'Hidden Pattern Challenge', description: 'Find hidden patterns in noise.', icon: '🕵️', xpCost: 650, category: 'logic', color: 'hsl(130 55% 45%)' },
  { id: 'brain-rotation', name: 'Brain Rotation Puzzle', description: 'Rotate pieces to match patterns.', icon: '🔄', xpCost: 700, category: 'logic', color: 'hsl(275 65% 55%)' },
  { id: 'pattern-speed', name: 'Pattern Speed Test', description: 'How fast can you spot patterns?', icon: '👁️', xpCost: 550, category: 'logic', color: 'hsl(195 75% 50%)' },

  // Strategy games
  { id: 'strategy-puzzle', name: 'Strategy Puzzle', description: 'Plan your moves carefully.', icon: '♟️', xpCost: 800, category: 'strategy', color: 'hsl(210 50% 40%)' },
  { id: 'strategy-tower', name: 'Strategy Tower Defense', description: 'Defend your tower strategically.', icon: '🏰', xpCost: 850, category: 'strategy', color: 'hsl(25 80% 50%)' },
  { id: 'strategy-board', name: 'Strategy Board Game', description: 'Outsmart your AI opponent.', icon: '🎯', xpCost: 800, category: 'strategy', color: 'hsl(340 70% 50%)' },
  { id: 'smart-strategy', name: 'Smart Strategy Puzzle', description: 'Advanced strategic thinking.', icon: '🧠', xpCost: 900, category: 'strategy', color: 'hsl(150 60% 40%)' },
  { id: 'maze-escape', name: 'Maze Escape', description: 'Find your way out of the maze.', icon: '🗺️', xpCost: 600, category: 'strategy', color: 'hsl(80 60% 45%)' },
  { id: 'puzzle-blocks', name: 'Puzzle Blocks', description: 'Fit blocks into the grid.', icon: '🧱', xpCost: 650, category: 'strategy', color: 'hsl(15 75% 50%)' },
  { id: 'time-attack', name: 'Time Attack Puzzle', description: 'Solve puzzles before time runs out.', icon: '⏰', xpCost: 700, category: 'strategy', color: 'hsl(55 85% 50%)' },
  { id: 'puzzle-labyrinth', name: 'Puzzle Labyrinth', description: 'Navigate the puzzle labyrinth.', icon: '🏗️', xpCost: 750, category: 'strategy', color: 'hsl(205 65% 50%)' },
  { id: 'brain-balance', name: 'Brain Balance Challenge', description: 'Balance equations and logic.', icon: '⚖️', xpCost: 700, category: 'strategy', color: 'hsl(265 60% 50%)' },
  { id: 'shape-matching', name: 'Shape Matching', description: 'Match shapes at lightning speed.', icon: '🔷', xpCost: 500, category: 'strategy', color: 'hsl(230 75% 55%)' },
  { id: 'pattern-builder', name: 'Pattern Builder', description: 'Build complex patterns step by step.', icon: '🎨', xpCost: 650, category: 'strategy', color: 'hsl(350 65% 50%)' },

  // Chess
  { id: 'chess', name: 'Chess Arena', description: 'Play chess against 50 unique AI opponents.', icon: '♟️', xpCost: 1000, category: 'chess', color: 'hsl(0 0% 25%)' },
];
