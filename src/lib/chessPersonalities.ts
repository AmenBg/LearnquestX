export interface ChessPersonality {
  id: number;
  name: string;
  level: string;
  style: string;
  depth: number; // search depth for AI (1-6)
  randomness: number; // 0-1, higher = more random moves
  description: string;
}

export const chessPersonalities: ChessPersonality[] = [
  // Beginner (1-10)
  { id: 1, name: 'Rookie Pawn', level: 'Beginner', style: 'Random', depth: 1, randomness: 0.9, description: 'Makes mostly random moves.' },
  { id: 2, name: 'Slow Knight', level: 'Beginner', style: 'Cautious', depth: 1, randomness: 0.85, description: 'Very slow and cautious player.' },
  { id: 3, name: 'Friendly Bishop', level: 'Beginner', style: 'Balanced', depth: 1, randomness: 0.8, description: 'A friendly opponent for beginners.' },
  { id: 4, name: 'Careful Rook', level: 'Beginner', style: 'Defensive', depth: 1, randomness: 0.75, description: 'Plays defensively and carefully.' },
  { id: 5, name: 'Young Gambit', level: 'Beginner', style: 'Aggressive', depth: 1, randomness: 0.7, description: 'Tries bold moves but often fails.' },
  { id: 6, name: 'Lazy Castle', level: 'Beginner', style: 'Passive', depth: 1, randomness: 0.7, description: 'A lazy player who barely tries.' },
  { id: 7, name: 'Quiet Pawn', level: 'Beginner', style: 'Quiet', depth: 1, randomness: 0.65, description: 'Makes quiet, non-threatening moves.' },
  { id: 8, name: 'Student Knight', level: 'Beginner', style: 'Learning', depth: 2, randomness: 0.7, description: 'Still learning the basics.' },
  { id: 9, name: 'Casual Bishop', level: 'Beginner', style: 'Casual', depth: 2, randomness: 0.65, description: 'Plays casually without much thought.' },
  { id: 10, name: 'Beginner King', level: 'Beginner', style: 'Basic', depth: 2, randomness: 0.6, description: 'A beginner finding their way.' },

  // Casual (11-20)
  { id: 11, name: 'Board Explorer', level: 'Casual', style: 'Exploratory', depth: 2, randomness: 0.55, description: 'Explores the board curiously.' },
  { id: 12, name: 'Puzzle Player', level: 'Casual', style: 'Puzzle', depth: 2, randomness: 0.5, description: 'Treats chess like a puzzle.' },
  { id: 13, name: 'Tactical Rookie', level: 'Casual', style: 'Tactical', depth: 2, randomness: 0.5, description: 'Starting to see basic tactics.' },
  { id: 14, name: 'Calm Strategist', level: 'Casual', style: 'Calm', depth: 2, randomness: 0.45, description: 'Calm and methodical player.' },
  { id: 15, name: 'Fast Mover', level: 'Casual', style: 'Fast', depth: 2, randomness: 0.45, description: 'Plays quickly with instinct.' },
  { id: 16, name: 'Risky Gambler', level: 'Casual', style: 'Risky', depth: 2, randomness: 0.4, description: 'Takes risky gambles often.' },
  { id: 17, name: 'Smart Defender', level: 'Casual', style: 'Defensive', depth: 3, randomness: 0.45, description: 'Good at defensive play.' },
  { id: 18, name: 'Sharp Knight', level: 'Casual', style: 'Sharp', depth: 3, randomness: 0.4, description: 'Sharp and alert player.' },
  { id: 19, name: 'Tactical Bishop', level: 'Casual', style: 'Tactical', depth: 3, randomness: 0.4, description: 'Uses bishops effectively.' },
  { id: 20, name: 'Rising Player', level: 'Casual', style: 'Rising', depth: 3, randomness: 0.35, description: 'Rapidly improving skills.' },

  // Intermediate (21-30)
  { id: 21, name: 'Tactical Mind', level: 'Intermediate', style: 'Tactical', depth: 3, randomness: 0.3, description: 'Strong tactical awareness.' },
  { id: 22, name: 'Solid Strategist', level: 'Intermediate', style: 'Solid', depth: 3, randomness: 0.3, description: 'Solid and reliable play.' },
  { id: 23, name: 'Attack Planner', level: 'Intermediate', style: 'Attacking', depth: 3, randomness: 0.25, description: 'Plans attacks carefully.' },
  { id: 24, name: 'Defensive Master', level: 'Intermediate', style: 'Defensive', depth: 3, randomness: 0.25, description: 'Hard to break through.' },
  { id: 25, name: 'Positional Thinker', level: 'Intermediate', style: 'Positional', depth: 3, randomness: 0.2, description: 'Thinks about position first.' },
  { id: 26, name: 'Sharp Gambit', level: 'Intermediate', style: 'Gambit', depth: 4, randomness: 0.3, description: 'Loves opening gambits.' },
  { id: 27, name: 'Counter Attacker', level: 'Intermediate', style: 'Counter', depth: 4, randomness: 0.25, description: 'Waits and counter-attacks.' },
  { id: 28, name: 'Precision Player', level: 'Intermediate', style: 'Precise', depth: 4, randomness: 0.2, description: 'Plays with high precision.' },
  { id: 29, name: 'Strategy Builder', level: 'Intermediate', style: 'Strategic', depth: 4, randomness: 0.2, description: 'Builds long-term plans.' },
  { id: 30, name: 'Calculated Knight', level: 'Intermediate', style: 'Calculated', depth: 4, randomness: 0.15, description: 'Calculates many moves ahead.' },

  // Advanced (31-40)
  { id: 31, name: 'Board Master', level: 'Advanced', style: 'Mastery', depth: 4, randomness: 0.15, description: 'Mastery of the board.' },
  { id: 32, name: 'Silent Predator', level: 'Advanced', style: 'Predatory', depth: 4, randomness: 0.12, description: 'Waits silently to strike.' },
  { id: 33, name: 'Tactical Storm', level: 'Advanced', style: 'Storm', depth: 4, randomness: 0.1, description: 'Unleashes tactical storms.' },
  { id: 34, name: 'Strategic Brain', level: 'Advanced', style: 'Strategic', depth: 4, randomness: 0.1, description: 'Superior strategic thinking.' },
  { id: 35, name: 'Sharp Calculator', level: 'Advanced', style: 'Calculating', depth: 5, randomness: 0.12, description: 'Calculates deeply and accurately.' },
  { id: 36, name: 'Opening Expert', level: 'Advanced', style: 'Opening', depth: 5, randomness: 0.1, description: 'Dominates in the opening.' },
  { id: 37, name: 'Middle Game Hunter', level: 'Advanced', style: 'Middle', depth: 5, randomness: 0.1, description: 'Excels in the middle game.' },
  { id: 38, name: 'Endgame Specialist', level: 'Advanced', style: 'Endgame', depth: 5, randomness: 0.08, description: 'Master of endgames.' },
  { id: 39, name: 'Positional Genius', level: 'Advanced', style: 'Positional', depth: 5, randomness: 0.08, description: 'Genius positional play.' },
  { id: 40, name: 'Elite Challenger', level: 'Advanced', style: 'Elite', depth: 5, randomness: 0.05, description: 'Elite level challenger.' },

  // Expert (41-50)
  { id: 41, name: 'Grand Strategist', level: 'Expert', style: 'Grand', depth: 5, randomness: 0.05, description: 'Grand strategic vision.' },
  { id: 42, name: 'Mastermind', level: 'Expert', style: 'Mastermind', depth: 5, randomness: 0.04, description: 'Sees everything on the board.' },
  { id: 43, name: 'Iron Defender', level: 'Expert', style: 'Iron Defense', depth: 5, randomness: 0.03, description: 'Unbreakable defense.' },
  { id: 44, name: 'Lightning Attacker', level: 'Expert', style: 'Lightning', depth: 6, randomness: 0.05, description: 'Attacks with lightning speed.' },
  { id: 45, name: 'Elite Grandmaster', level: 'Expert', style: 'Grandmaster', depth: 6, randomness: 0.04, description: 'Plays at grandmaster level.' },
  { id: 46, name: 'Supreme Tactician', level: 'Expert', style: 'Supreme', depth: 6, randomness: 0.03, description: 'Supreme tactical ability.' },
  { id: 47, name: 'Chess Dominator', level: 'Expert', style: 'Dominating', depth: 6, randomness: 0.02, description: 'Dominates every game.' },
  { id: 48, name: 'Ultimate Strategist', level: 'Expert', style: 'Ultimate', depth: 6, randomness: 0.02, description: 'The ultimate strategic mind.' },
  { id: 49, name: 'Legend of the Board', level: 'Expert', style: 'Legendary', depth: 6, randomness: 0.01, description: 'A legend of chess.' },
  { id: 50, name: 'Immortal Grandmaster', level: 'Expert', style: 'Immortal', depth: 6, randomness: 0.0, description: 'The unbeatable grandmaster.' },
];
