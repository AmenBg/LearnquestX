export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'speed' | 'competitive' | 'games' | 'special' | 'code' | 'starter';
  xpReward: number;
  title?: string;
}

export const achievements: Achievement[] = [
  // 🧠 Learning (1-12)
  { id: 'first_correct', name: 'First Steps', description: 'Get your first correct answer', icon: '🎯', category: 'learning', xpReward: 10 },
  { id: 'correct_10', name: 'Quick Learner', description: 'Get 10 correct answers', icon: '📚', category: 'learning', xpReward: 25 },
  { id: 'correct_50', name: 'Knowledge Seeker', description: 'Get 50 correct answers', icon: '🔍', category: 'learning', xpReward: 50 },
  { id: 'correct_100', name: 'Scholar', description: 'Get 100 correct answers', icon: '🎓', category: 'learning', xpReward: 100 },
  { id: 'correct_500', name: 'Wise Owl', description: 'Get 500 correct answers', icon: '🦉', category: 'learning', xpReward: 200 },
  { id: 'correct_1000', name: 'Knowledge Master', description: 'Get 1000 correct answers', icon: '👑', category: 'learning', xpReward: 500, title: 'Knowledge Master' },
  { id: 'perfect_quiz', name: 'Perfectionist', description: 'Score 100% on a quiz', icon: '💯', category: 'learning', xpReward: 30 },
  { id: 'perfect_5', name: 'Flawless Five', description: 'Score 100% on 5 quizzes', icon: '✨', category: 'learning', xpReward: 75 },
  { id: 'math_master', name: 'Math Wizard', description: 'Answer 50 math questions correctly', icon: '🧮', category: 'learning', xpReward: 60, title: 'Math Wizard' },
  { id: 'science_master', name: 'Science Pro', description: 'Answer 50 science questions correctly', icon: '🔬', category: 'learning', xpReward: 60, title: 'Science Pro' },
  { id: 'language_master', name: 'Polyglot', description: 'Answer 50 language questions correctly', icon: '🗣️', category: 'learning', xpReward: 60, title: 'Polyglot' },
  { id: 'all_subjects', name: 'Renaissance Mind', description: 'Answer questions from all subjects', icon: '🌟', category: 'learning', xpReward: 100 },

  // 🔥 Streak (13-20)
  { id: 'streak_3', name: 'Getting Started', description: 'Maintain a 3-day streak', icon: '🔥', category: 'streak', xpReward: 15 },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🗓️', category: 'streak', xpReward: 35 },
  { id: 'streak_14', name: 'Two Week Titan', description: 'Maintain a 14-day streak', icon: '💪', category: 'streak', xpReward: 70 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '📅', category: 'streak', xpReward: 150, title: 'Streak King' },
  { id: 'streak_60', name: 'Unstoppable', description: 'Maintain a 60-day streak', icon: '⚡', category: 'streak', xpReward: 300 },
  { id: 'streak_90', name: 'Legend of Discipline', description: 'Maintain a 90-day streak', icon: '🏆', category: 'streak', xpReward: 500, title: 'Discipline Legend' },
  { id: 'streak_180', name: 'Half Year Hero', description: 'Maintain a 180-day streak', icon: '🌟', category: 'streak', xpReward: 1000 },
  { id: 'streak_365', name: 'Year of Greatness', description: 'Maintain a 365-day streak', icon: '👑', category: 'streak', xpReward: 2500, title: 'The Eternal' },

  // ⚡ Speed (21-28)
  { id: 'fast_answer', name: 'Lightning Fast', description: 'Answer correctly in under 2 seconds', icon: '⚡', category: 'speed', xpReward: 15 },
  { id: 'fast_5_row', name: 'Speed Demon', description: '5 fast answers in a row', icon: '🏎️', category: 'speed', xpReward: 40, title: 'Speed Demon' },
  { id: 'fast_10_row', name: 'Quicksilver', description: '10 fast answers in a row', icon: '💨', category: 'speed', xpReward: 80 },
  { id: 'quiz_under_1min', name: 'Minute Master', description: 'Complete a quiz in under 1 minute', icon: '⏱️', category: 'speed', xpReward: 30 },
  { id: 'quiz_under_30s', name: 'Time Breaker', description: 'Complete a quiz in under 30 seconds', icon: '🕐', category: 'speed', xpReward: 60 },
  { id: 'exercise_speed_10', name: 'Quick Learner', description: 'Complete 10 exercises quickly', icon: '🏃', category: 'speed', xpReward: 50 },
  { id: 'reaction_master', name: 'Reflex King', description: 'React in under 200ms in a game', icon: '👁️', category: 'speed', xpReward: 25 },
  { id: 'speed_legend', name: 'Speed Legend', description: '100 fast correct answers total', icon: '🌩️', category: 'speed', xpReward: 200, title: 'Speed Legend' },

  // 🏆 Competitive (29-40)
  { id: 'first_mp_win', name: 'First Victory', description: 'Win your first multiplayer match', icon: '🏅', category: 'competitive', xpReward: 20 },
  { id: 'mp_wins_5', name: 'Rising Champion', description: 'Win 5 multiplayer matches', icon: '🥊', category: 'competitive', xpReward: 50 },
  { id: 'mp_wins_10', name: 'Battle Hardened', description: 'Win 10 multiplayer matches', icon: '⚔️', category: 'competitive', xpReward: 100 },
  { id: 'mp_wins_25', name: 'Arena Champion', description: 'Win 25 multiplayer matches', icon: '🏆', category: 'competitive', xpReward: 200, title: 'Arena Champion' },
  { id: 'mp_wins_50', name: 'Legendary Fighter', description: 'Win 50 multiplayer matches', icon: '👑', category: 'competitive', xpReward: 500, title: 'The Unbeatable' },
  { id: 'mp_top1', name: 'Number One', description: 'Finish #1 in a multiplayer match', icon: '🥇', category: 'competitive', xpReward: 25 },
  { id: 'mp_perfect', name: 'Flawless Victory', description: 'Win with 100% accuracy in multiplayer', icon: '💎', category: 'competitive', xpReward: 75 },
  { id: 'beat_stronger', name: 'Giant Slayer', description: 'Beat a player with higher level', icon: '🗡️', category: 'competitive', xpReward: 40 },
  { id: 'win_streak_3', name: 'Hot Streak', description: 'Win 3 matches in a row', icon: '🔥', category: 'competitive', xpReward: 50 },
  { id: 'win_streak_5', name: 'Dominator', description: 'Win 5 matches in a row', icon: '💀', category: 'competitive', xpReward: 100 },
  { id: 'ai_easy_win', name: 'AI Beginner', description: 'Beat easy AI opponent', icon: '🤖', category: 'competitive', xpReward: 10 },
  { id: 'ai_expert_win', name: 'AI Conqueror', description: 'Beat expert AI opponent', icon: '🧠', category: 'competitive', xpReward: 100, title: 'AI Conqueror' },

  // 🎮 Games (41-48)
  { id: 'first_game', name: 'Player One', description: 'Unlock your first game', icon: '🎮', category: 'games', xpReward: 10 },
  { id: 'games_5', name: 'Game Collector', description: 'Unlock 5 games', icon: '🕹️', category: 'games', xpReward: 30 },
  { id: 'games_10', name: 'Arcade Fan', description: 'Unlock 10 games', icon: '👾', category: 'games', xpReward: 60 },
  { id: 'games_25', name: 'Gaming Enthusiast', description: 'Unlock 25 games', icon: '🎯', category: 'games', xpReward: 150 },
  { id: 'games_all', name: 'Complete Collection', description: 'Unlock all games', icon: '🏅', category: 'games', xpReward: 500, title: 'Game Master' },
  { id: 'chess_first_win', name: 'Chess Beginner', description: 'Win your first chess game', icon: '♟️', category: 'games', xpReward: 20 },
  { id: 'chess_10_wins', name: 'Chess Veteran', description: 'Win 10 chess games', icon: '♚', category: 'games', xpReward: 75 },
  { id: 'chess_beat_immortal', name: 'Chess Immortal', description: 'Beat the Immortal Grandmaster', icon: '👑', category: 'games', xpReward: 500, title: 'Chess Immortal' },

  // 💎 Special (49-55)
  { id: 'xp_1000', name: 'XP Hunter', description: 'Reach 1,000 XP', icon: '💎', category: 'special', xpReward: 50 },
  { id: 'xp_5000', name: 'XP Collector', description: 'Reach 5,000 XP', icon: '💰', category: 'special', xpReward: 100 },
  { id: 'xp_10000', name: 'XP Master', description: 'Reach 10,000 XP', icon: '🏦', category: 'special', xpReward: 250 },
  { id: 'xp_50000', name: 'XP Legend', description: 'Reach 50,000 XP', icon: '👑', category: 'special', xpReward: 1000, title: 'XP Legend' },
  { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5', icon: '⭐', category: 'special', xpReward: 30 },
  { id: 'level_10', name: 'Veteran', description: 'Reach Level 10', icon: '🌟', category: 'special', xpReward: 75 },
  { id: 'level_25', name: 'Elite', description: 'Reach Level 25', icon: '💫', category: 'special', xpReward: 200, title: 'Elite Player' },
  { id: 'level_50', name: 'Legendary', description: 'Reach Level 50', icon: '🌠', category: 'special', xpReward: 500, title: 'The Legendary' },
  { id: 'first_arena', name: 'Arena Debut', description: 'Complete your first Quiz Arena session', icon: '🏟️', category: 'special', xpReward: 15 },
  { id: 'arena_10', name: 'Arena Regular', description: 'Complete 10 Quiz Arena sessions', icon: '🏛️', category: 'special', xpReward: 50 },
  { id: 'secret_explorer', name: '???', description: 'Find the hidden secret', icon: '🔮', category: 'special', xpReward: 100, title: 'The Explorer' },

  // 🌱 Starter — quick wins (very cheap to unlock, motivating)
  { id: 'welcome', name: 'Welcome Aboard', description: 'Sign in for the first time', icon: '👋', category: 'starter', xpReward: 5 },
  { id: 'profile_complete', name: 'Looking Sharp', description: 'Finish your profile setup', icon: '✏️', category: 'starter', xpReward: 5 },
  { id: 'first_lesson_open', name: 'Curious Mind', description: 'Open your first lesson', icon: '🧭', category: 'starter', xpReward: 5 },
  { id: 'first_quiz_answer', name: 'Brave Guess', description: 'Answer any quiz question', icon: '🎲', category: 'starter', xpReward: 5 },
  { id: 'first_subject_visit', name: 'Subject Explorer', description: 'Browse the subjects page', icon: '🗺️', category: 'starter', xpReward: 5 },
  { id: 'first_theme_swap', name: 'Style Pioneer', description: 'Try a different theme', icon: '🎨', category: 'starter', xpReward: 10 },
  { id: 'first_settings', name: 'Tinkerer', description: 'Open settings for the first time', icon: '🔧', category: 'starter', xpReward: 5 },
  { id: 'three_lessons', name: 'Three in a Row', description: 'Complete any 3 lessons', icon: '🌿', category: 'starter', xpReward: 15 },
  { id: 'first_language_pick', name: 'World Citizen', description: 'Change your language', icon: '🌐', category: 'starter', xpReward: 10 },
  { id: 'first_xp_milestone', name: 'XP Sprout', description: 'Reach 100 XP', icon: '🌱', category: 'starter', xpReward: 10 },

  // 💻 Code Academy badges — cheap progression for the new Code subject
  { id: 'code_first_run', name: 'Hello, World!', description: 'Run code for the first time', icon: '🖥️', category: 'code', xpReward: 10 },
  { id: 'code_first_lesson', name: 'Code Apprentice', description: 'Finish your first Code lesson', icon: '🧑‍💻', category: 'code', xpReward: 15 },
  { id: 'code_first_perfect', name: 'Clean Coder', description: 'Pass a Code lesson on the first try', icon: '✨', category: 'code', xpReward: 20 },
  { id: 'code_no_hints', name: 'Self-Made', description: 'Pass a Code lesson without hints or solution', icon: '🧠', category: 'code', xpReward: 25 },
  { id: 'code_5_lessons', name: 'Junior Dev', description: 'Complete 5 Code lessons', icon: '👨‍💻', category: 'code', xpReward: 30 },
  { id: 'code_10_lessons', name: 'Mid-Level Dev', description: 'Complete 10 Code lessons', icon: '🚀', category: 'code', xpReward: 60 },
  { id: 'code_30_lessons', name: 'Senior Dev', description: 'Complete 30 Code lessons', icon: '🏆', category: 'code', xpReward: 150, title: 'Senior Dev' },
  { id: 'code_2_languages', name: 'Bilingual Coder', description: 'Try 2 different programming languages', icon: '🔄', category: 'code', xpReward: 25 },
  { id: 'code_5_languages', name: 'Polyglot Coder', description: 'Try 5 different programming languages', icon: '🧬', category: 'code', xpReward: 80 },
  { id: 'code_all_languages', name: 'Stack Master', description: 'Try all 10 programming languages', icon: '⚡', category: 'code', xpReward: 250, title: 'Stack Master' },
  { id: 'code_expert_level', name: 'Pro Path', description: 'Start a language at Expert level', icon: '🎯', category: 'code', xpReward: 30 },
  { id: 'code_python_first', name: 'Snake Charmer', description: 'Finish a Python lesson', icon: '🐍', category: 'code', xpReward: 10 },
  { id: 'code_js_first', name: 'Web Wizard', description: 'Finish a JavaScript lesson', icon: '🟨', category: 'code', xpReward: 10 },
  { id: 'code_streak_3', name: 'On Fire', description: '3 Code lessons in a row', icon: '🔥', category: 'code', xpReward: 20 },
  { id: 'code_streak_10', name: 'Hackathon Mode', description: '10 Code lessons in a row', icon: '⚡', category: 'code', xpReward: 75 },
];

export const achievementCategories = [
  { id: 'all', name: 'All', icon: '🏅' },
  { id: 'starter', name: 'Starter', icon: '🌱' },
  { id: 'learning', name: 'Learning', icon: '🧠' },
  { id: 'code', name: 'Code', icon: '💻' },
  { id: 'streak', name: 'Streaks', icon: '🔥' },
  { id: 'speed', name: 'Speed', icon: '⚡' },
  { id: 'competitive', name: 'Competitive', icon: '🏆' },
  { id: 'games', name: 'Games', icon: '🎮' },
  { id: 'special', name: 'Special', icon: '💎' },
];
