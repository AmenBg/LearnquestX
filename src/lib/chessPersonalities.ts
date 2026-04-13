export interface ChessPersonality {
  id: number;
  name: string;
  level: string;
  style: string;
  depth: number;
  randomness: number;
  description: string;
  xpReward: number;
}

export const chessPersonalities: ChessPersonality[] = [
  // Beginner (very easy) — low XP
  { id: 1, name: 'Rookie Pawn', level: 'Beginner', style: 'Random', depth: 1, randomness: 0.9, description: 'Makes mostly random moves.', xpReward: 5 },
  { id: 2, name: 'Slow Knight', level: 'Beginner', style: 'Cautious', depth: 1, randomness: 0.85, description: 'Very slow and cautious player.', xpReward: 5 },
  { id: 3, name: 'Friendly Bishop', level: 'Beginner', style: 'Balanced', depth: 1, randomness: 0.8, description: 'A friendly opponent for beginners.', xpReward: 8 },
  { id: 4, name: 'Careful Rook', level: 'Beginner', style: 'Defensive', depth: 1, randomness: 0.75, description: 'Plays defensively and carefully.', xpReward: 8 },
  { id: 5, name: 'Young Gambit', level: 'Beginner', style: 'Aggressive', depth: 1, randomness: 0.7, description: 'Tries bold moves but often fails.', xpReward: 10 },

  // Casual (easy) — low-medium XP
  { id: 6, name: 'Board Explorer', level: 'Casual', style: 'Exploratory', depth: 2, randomness: 0.55, description: 'Explores the board curiously.', xpReward: 15 },
  { id: 7, name: 'Puzzle Player', level: 'Casual', style: 'Puzzle', depth: 2, randomness: 0.5, description: 'Treats chess like a puzzle.', xpReward: 15 },
  { id: 8, name: 'Tactical Rookie', level: 'Casual', style: 'Tactical', depth: 2, randomness: 0.45, description: 'Starting to see basic tactics.', xpReward: 20 },
  { id: 9, name: 'Fast Mover', level: 'Casual', style: 'Fast', depth: 2, randomness: 0.4, description: 'Plays quickly with instinct.', xpReward: 20 },
  { id: 10, name: 'Rising Player', level: 'Casual', style: 'Rising', depth: 3, randomness: 0.4, description: 'Rapidly improving skills.', xpReward: 25 },

  // Player (medium) — medium XP
  { id: 11, name: 'Tactical Mind', level: 'Player', style: 'Tactical', depth: 3, randomness: 0.3, description: 'Strong tactical awareness.', xpReward: 30 },
  { id: 12, name: 'Solid Strategist', level: 'Player', style: 'Solid', depth: 3, randomness: 0.25, description: 'Solid and reliable play.', xpReward: 35 },
  { id: 13, name: 'Attack Planner', level: 'Player', style: 'Attacking', depth: 3, randomness: 0.2, description: 'Plans attacks carefully.', xpReward: 35 },
  { id: 14, name: 'Positional Thinker', level: 'Player', style: 'Positional', depth: 3, randomness: 0.15, description: 'Thinks about position first.', xpReward: 40 },
  { id: 15, name: 'Calculated Knight', level: 'Player', style: 'Calculated', depth: 4, randomness: 0.2, description: 'Calculates many moves ahead.', xpReward: 45 },

  // Advanced (hard) — high XP
  { id: 16, name: 'Board Master', level: 'Advanced', style: 'Mastery', depth: 4, randomness: 0.12, description: 'Mastery of the board.', xpReward: 60 },
  { id: 17, name: 'Silent Predator', level: 'Advanced', style: 'Predatory', depth: 4, randomness: 0.08, description: 'Waits silently to strike.', xpReward: 70 },
  { id: 18, name: 'Sharp Calculator', level: 'Advanced', style: 'Calculating', depth: 4, randomness: 0.05, description: 'Calculates deeply and accurately.', xpReward: 80 },
  { id: 19, name: 'Endgame Specialist', level: 'Advanced', style: 'Endgame', depth: 5, randomness: 0.08, description: 'Master of endgames.', xpReward: 90 },
  { id: 20, name: 'Elite Challenger', level: 'Advanced', style: 'Elite', depth: 5, randomness: 0.05, description: 'Elite level challenger.', xpReward: 100 },

  // Master (very hard) — very high XP
  { id: 21, name: 'Grand Strategist', level: 'Master', style: 'Grand', depth: 5, randomness: 0.04, description: 'Grand strategic vision.', xpReward: 120 },
  { id: 22, name: 'Mastermind', level: 'Master', style: 'Mastermind', depth: 5, randomness: 0.03, description: 'Sees everything on the board.', xpReward: 140 },
  { id: 23, name: 'Supreme Tactician', level: 'Master', style: 'Supreme', depth: 5, randomness: 0.02, description: 'Supreme tactical ability.', xpReward: 160 },
  { id: 24, name: 'Chess Dominator', level: 'Master', style: 'Dominating', depth: 6, randomness: 0.01, description: 'Dominates every game.', xpReward: 180 },
  { id: 25, name: 'Immortal Grandmaster', level: 'Master', style: 'Immortal', depth: 6, randomness: 0.0, description: 'The unbeatable grandmaster.', xpReward: 200 },
];
