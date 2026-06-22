export interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpCost: number;
  category: 'math' | 'logic' | 'memory' | 'speed' | 'word' | 'strategy' | 'chess' | '3d';
  color: string;
  /** Optional secondary color used to render colorful gradient cards in the store. */
  color2?: string;
  /** Mark games rendered with WebGL/Three.js so the UI can badge them. */
  is3D?: boolean;
}

// Economy rebalance: prices increased ~60% to make unlocks feel earned.
// Source of truth for purchases is game_catalog in the database; keep these in sync.
export const miniGames: MiniGame[] = [
  // ── Memory ──
  { id: 'shadow-memory', name: 'Shadow Memory', description: 'Objects flash briefly then vanish — recall their exact positions.', icon: '👁️‍🗨️', xpCost: 800, category: 'memory', color: 'hsl(270 90% 65%)', color2: 'hsl(320 95% 60%)' },
  { id: 'memory-grid-pro', name: 'Memory Grid Pro', description: 'Memorize a grid of symbols, then recreate it from scratch.', icon: '🧠', xpCost: 1050, category: 'memory', color: 'hsl(300 90% 65%)', color2: 'hsl(260 95% 60%)' },
  { id: 'brain-tracker', name: 'Brain Tracker', description: 'Track multiple moving objects and identify them after they stop.', icon: '🎯', xpCost: 950, category: 'memory', color: 'hsl(195 95% 55%)', color2: 'hsl(230 95% 60%)' },
  { id: 'hidden-object', name: 'Hidden Object Hunt', description: 'Spot hidden items in detailed illustrated scenes.', icon: '🔎', xpCost: 800, category: 'memory', color: 'hsl(140 80% 50%)', color2: 'hsl(180 85% 50%)' },

  // ── Logic ──
  { id: 'speed-logic', name: 'Speed Logic', description: 'Solve logic puzzles under intense time pressure.', icon: '⚡', xpCost: 950, category: 'logic', color: 'hsl(220 95% 60%)', color2: 'hsl(280 95% 65%)' },
  { id: 'brain-shift', name: 'Brain Shift', description: 'The rules change mid-game — adapt or lose!', icon: '🔀', xpCost: 1100, category: 'logic', color: 'hsl(350 90% 60%)', color2: 'hsl(20 95% 60%)' },
  { id: 'pattern-escape', name: 'Pattern Escape', description: 'Find the correct pattern to unlock the exit before time runs out.', icon: '🚪', xpCost: 1050, category: 'logic', color: 'hsl(170 85% 50%)', color2: 'hsl(200 90% 55%)' },
  { id: 'code-signal', name: 'Code Signal', description: 'Decode hidden signals using logical deduction clues.', icon: '📡', xpCost: 1300, category: 'logic', color: 'hsl(290 85% 60%)', color2: 'hsl(330 90% 60%)' },
  { id: 'hidden-logic', name: 'Hidden Logic', description: 'Discover the secret rule governing a set of examples.', icon: '🕵️', xpCost: 1100, category: 'logic', color: 'hsl(130 70% 50%)', color2: 'hsl(170 80% 50%)' },
  { id: 'logic-circuit', name: 'Logic Circuit', description: 'Wire logic gates to produce the correct output signal.', icon: '🔌', xpCost: 1200, category: 'logic', color: 'hsl(240 90% 65%)', color2: 'hsl(200 95% 60%)' },

  // ── Speed ──
  { id: 'quick-reflex', name: 'Quick Reflex Arena', description: 'Tap only the correct objects as they flash on screen.', icon: '⏱️', xpCost: 650, category: 'speed', color: 'hsl(20 100% 60%)', color2: 'hsl(45 100% 55%)' },
  { id: 'number-trap', name: 'Number Trap', description: 'Avoid wrong numbers in a rapid scrolling sequence.', icon: '🔢', xpCost: 800, category: 'speed', color: 'hsl(45 100% 55%)', color2: 'hsl(15 100% 55%)' },
  { id: 'reaction-zone', name: 'Reaction Zone', description: 'Ultra-precise reaction test — hit targets within milliseconds.', icon: '💥', xpCost: 700, category: 'speed', color: 'hsl(0 95% 60%)', color2: 'hsl(30 100% 55%)' },
  { id: 'shape-storm', name: 'Shape Storm', description: 'Identify the named shape in a chaotic swirl of figures.', icon: '🌪️', xpCost: 800, category: 'speed', color: 'hsl(285 90% 65%)', color2: 'hsl(220 90% 60%)' },

  // ── Word ──
  { id: 'word-clash', name: 'Word Clash', description: 'Build the longest word before the timer explodes.', icon: '💬', xpCost: 900, category: 'word', color: 'hsl(35 100% 60%)', color2: 'hsl(15 100% 60%)' },
  { id: 'word-search', name: 'Word Search', description: 'Find hidden words in a letter grid before time runs out.', icon: '🔠', xpCost: 800, category: 'word', color: 'hsl(150 80% 50%)', color2: 'hsl(180 85% 50%)' },
  { id: 'word-chain', name: 'Word Chain', description: 'Each word must start with the last letter of the previous one.', icon: '🔗', xpCost: 950, category: 'word', color: 'hsl(110 75% 50%)', color2: 'hsl(160 80% 50%)' },

  // ── Math ──
  { id: 'fast-math-duel', name: 'Fast Math Duel', description: 'Race against an AI opponent to solve equations first.', icon: '🏎️', xpCost: 950, category: 'math', color: 'hsl(140 95% 55%)', color2: 'hsl(180 90% 55%)' },
  { id: 'geometry-builder', name: 'Geometry Builder', description: 'Construct shapes and solve spatial geometry puzzles.', icon: '📐', xpCost: 1050, category: 'math', color: 'hsl(260 90% 65%)', color2: 'hsl(300 90% 65%)' },
  { id: 'number-grid', name: 'Number Grid Puzzle', description: 'Fill the grid so rows and columns hit target sums.', icon: '🧮', xpCost: 950, category: 'math', color: 'hsl(190 90% 55%)', color2: 'hsl(220 95% 60%)' },

  // ── Strategy ──
  { id: 'mind-switch', name: 'Mind Switch', description: 'Switch thinking modes mid-game as objectives change.', icon: '🧩', xpCost: 1100, category: 'strategy', color: 'hsl(210 90% 60%)', color2: 'hsl(260 90% 65%)' },
  { id: 'speed-builder', name: 'Speed Builder', description: 'Build structures against the clock using limited pieces.', icon: '🏗️', xpCost: 1050, category: 'strategy', color: 'hsl(25 95% 55%)', color2: 'hsl(45 100% 55%)' },
  { id: 'mind-control', name: 'Mind Control', description: 'Control multiple moving elements simultaneously.', icon: '🎮', xpCost: 1200, category: 'strategy', color: 'hsl(340 90% 60%)', color2: 'hsl(290 90% 60%)' },
  { id: 'strategy-shift', name: 'Strategy Shift', description: 'Adapt your strategy as the board changes dynamically.', icon: '♟️', xpCost: 1300, category: 'strategy', color: 'hsl(150 75% 50%)', color2: 'hsl(190 85% 50%)' },
  { id: 'puzzle-rush', name: 'Puzzle Rush', description: 'Solve an endless stream of puzzles — how far can you go?', icon: '🏃', xpCost: 1100, category: 'strategy', color: 'hsl(55 95% 55%)', color2: 'hsl(25 100% 55%)' },

  // ── Chess (premium) ──
  { id: 'chess', name: 'Chess Arena', description: 'Play chess against 50 unique AI personalities.', icon: '♚', xpCost: 1600, category: 'chess', color: 'hsl(230 40% 35%)', color2: 'hsl(260 50% 45%)' },

  // ── 3D (WebGL / Three.js) ──
  { id: 'cube-runner-3d', name: 'Cube Runner 3D', description: 'Dodge a neon storm of cubes flying down a fully 3D endless lane.', icon: '🟦', xpCost: 1500, category: '3d', color: 'hsl(195 100% 55%)', color2: 'hsl(280 95% 60%)', is3D: true },
  { id: 'orbit-shooter-3d', name: 'Orbit Shooter 3D', description: 'Spin around a glowing core and blast incoming asteroids in real 3D space.', icon: '🪐', xpCost: 1600, category: '3d', color: 'hsl(330 95% 60%)', color2: 'hsl(20 100% 60%)', is3D: true },
  { id: 'color-cube-match-3d', name: 'Color Cube Match 3D', description: 'Rotate a 3D cube and tap the face whose color matches the target.', icon: '🧊', xpCost: 1400, category: '3d', color: 'hsl(150 90% 50%)', color2: 'hsl(200 95% 55%)', is3D: true },
];
