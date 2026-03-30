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
  // ── Memory (4 unique mechanics) ──
  { id: 'shadow-memory', name: 'Shadow Memory', description: 'Objects flash briefly then vanish — recall their exact positions.', icon: '👁️‍🗨️', xpCost: 500, category: 'memory', color: 'hsl(270 80% 60%)' },
  { id: 'memory-grid-pro', name: 'Memory Grid Pro', description: 'Memorize a grid of symbols, then recreate it from scratch.', icon: '🧠', xpCost: 650, category: 'memory', color: 'hsl(300 70% 55%)' },
  { id: 'brain-tracker', name: 'Brain Tracker', description: 'Track multiple moving objects and identify them after they stop.', icon: '🎯', xpCost: 600, category: 'memory', color: 'hsl(200 75% 50%)' },
  { id: 'hidden-object', name: 'Hidden Object Hunt', description: 'Spot hidden items in detailed illustrated scenes.', icon: '🔎', xpCost: 500, category: 'memory', color: 'hsl(90 60% 45%)' },

  // ── Logic (5 unique mechanics) ──
  { id: 'speed-logic', name: 'Speed Logic', description: 'Solve logic puzzles under intense time pressure.', icon: '⚡', xpCost: 600, category: 'logic', color: 'hsl(220 90% 56%)' },
  { id: 'brain-shift', name: 'Brain Shift', description: 'The rules change mid-game — adapt or lose!', icon: '🔀', xpCost: 700, category: 'logic', color: 'hsl(350 80% 55%)' },
  { id: 'pattern-escape', name: 'Pattern Escape', description: 'Find the correct pattern to unlock the exit before time runs out.', icon: '🚪', xpCost: 650, category: 'logic', color: 'hsl(160 70% 45%)' },
  { id: 'code-signal', name: 'Code Signal', description: 'Decode hidden signals using logical deduction clues.', icon: '📡', xpCost: 800, category: 'logic', color: 'hsl(300 70% 50%)' },
  { id: 'hidden-logic', name: 'Hidden Logic', description: 'Discover the secret rule governing a set of examples.', icon: '🕵️', xpCost: 700, category: 'logic', color: 'hsl(130 55% 45%)' },
  { id: 'logic-circuit', name: 'Logic Circuit', description: 'Wire logic gates to produce the correct output signal.', icon: '🔌', xpCost: 750, category: 'logic', color: 'hsl(240 60% 55%)' },

  // ── Speed (4 unique mechanics) ──
  { id: 'quick-reflex', name: 'Quick Reflex Arena', description: 'Tap only the correct objects as they flash on screen.', icon: '⏱️', xpCost: 400, category: 'speed', color: 'hsl(20 90% 55%)' },
  { id: 'number-trap', name: 'Number Trap', description: 'Avoid wrong numbers in a rapid scrolling sequence.', icon: '🔢', xpCost: 500, category: 'speed', color: 'hsl(45 100% 50%)' },
  { id: 'reaction-zone', name: 'Reaction Zone', description: 'Ultra-precise reaction test — hit targets within milliseconds.', icon: '💥', xpCost: 450, category: 'speed', color: 'hsl(10 85% 55%)' },
  { id: 'shape-storm', name: 'Shape Storm', description: 'Identify the named shape in a chaotic swirl of figures.', icon: '🌪️', xpCost: 500, category: 'speed', color: 'hsl(280 70% 55%)' },

  // ── Word (3 unique mechanics) ──
  { id: 'word-clash', name: 'Word Clash', description: 'Build the longest word before the timer explodes.', icon: '💬', xpCost: 550, category: 'word', color: 'hsl(35 100% 55%)' },
  { id: 'word-search', name: 'Word Search', description: 'Find hidden words in a letter grid before time runs out.', icon: '🔠', xpCost: 500, category: 'word', color: 'hsl(120 60% 45%)' },
  { id: 'word-chain', name: 'Word Chain', description: 'Each word must start with the last letter of the previous one.', icon: '🔗', xpCost: 600, category: 'word', color: 'hsl(100 60% 45%)' },

  // ── Math (3 unique mechanics) ──
  { id: 'fast-math-duel', name: 'Fast Math Duel', description: 'Race against an AI opponent to solve equations first.', icon: '🏎️', xpCost: 600, category: 'math', color: 'hsl(130 100% 55%)' },
  { id: 'geometry-builder', name: 'Geometry Builder', description: 'Construct shapes and solve spatial geometry puzzles.', icon: '📐', xpCost: 650, category: 'math', color: 'hsl(260 70% 55%)' },
  { id: 'number-grid', name: 'Number Grid Puzzle', description: 'Fill the grid so rows and columns hit target sums.', icon: '🧮', xpCost: 600, category: 'math', color: 'hsl(180 60% 45%)' },

  // ── Strategy (5 unique mechanics) ──
  { id: 'mind-switch', name: 'Mind Switch', description: 'Switch thinking modes mid-game as objectives change.', icon: '🧩', xpCost: 700, category: 'strategy', color: 'hsl(210 50% 40%)' },
  { id: 'speed-builder', name: 'Speed Builder', description: 'Build structures against the clock using limited pieces.', icon: '🏗️', xpCost: 650, category: 'strategy', color: 'hsl(25 80% 50%)' },
  { id: 'mind-control', name: 'Mind Control', description: 'Control multiple moving elements simultaneously.', icon: '🎮', xpCost: 750, category: 'strategy', color: 'hsl(340 70% 50%)' },
  { id: 'strategy-shift', name: 'Strategy Shift', description: 'Adapt your strategy as the board changes dynamically.', icon: '♟️', xpCost: 800, category: 'strategy', color: 'hsl(150 60% 40%)' },
  { id: 'puzzle-rush', name: 'Puzzle Rush', description: 'Solve an endless stream of puzzles — how far can you go?', icon: '🏃', xpCost: 700, category: 'strategy', color: 'hsl(55 85% 50%)' },

  // ── Chess ──
  { id: 'chess', name: 'Chess Arena', description: 'Play chess against 50 unique AI personalities.', icon: '♚', xpCost: 1000, category: 'chess', color: 'hsl(0 0% 25%)' },
];
