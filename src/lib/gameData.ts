export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalLevels: number;
  completedLevels: number;
  description: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  avatar: string;
}

export const subjects: Subject[] = [
  { id: 'math', name: 'Mathematics', icon: '🧮', color: 'hsl(130 100% 55%)', totalLevels: 200, completedLevels: 0, description: 'Numbers, algebra, geometry and more' },
  { id: 'physics', name: 'Physics', icon: '⚡', color: 'hsl(220 90% 56%)', totalLevels: 200, completedLevels: 0, description: 'Forces, energy, waves and matter' },
  { id: 'science', name: 'Science', icon: '🔬', color: 'hsl(270 80% 60%)', totalLevels: 200, completedLevels: 0, description: 'Biology, chemistry and earth science' },
  { id: 'arabic', name: 'Arabic', icon: '🕌', color: 'hsl(35 100% 55%)', totalLevels: 200, completedLevels: 0, description: 'Reading, writing and grammar' },
  { id: 'english', name: 'English', icon: '📖', color: 'hsl(200 80% 55%)', totalLevels: 200, completedLevels: 0, description: 'Reading, writing and literature' },
  { id: 'french', name: 'French', icon: '🗼', color: 'hsl(350 80% 55%)', totalLevels: 200, completedLevels: 0, description: 'Vocabulary, grammar and conversation' },
  { id: 'philosophy', name: 'Philosophy', icon: '🤔', color: 'hsl(280 70% 55%)', totalLevels: 200, completedLevels: 0, description: 'Critical thinking and reasoning' },
  { id: 'history', name: 'History', icon: '🏛️', color: 'hsl(45 80% 50%)', totalLevels: 200, completedLevels: 0, description: 'Ancient civilizations to modern era' },
  { id: 'geography', name: 'Geography', icon: '🌍', color: 'hsl(160 70% 45%)', totalLevels: 200, completedLevels: 0, description: 'Countries, climates and cultures' },
  { id: 'computer_science', name: 'Computer Science', icon: '💻', color: 'hsl(190 80% 50%)', totalLevels: 200, completedLevels: 0, description: 'Programming, algorithms and logic' },
];

export const achievements: Achievement[] = [
  { id: '1', name: 'First Steps', description: 'Complete your first lesson', icon: '🎯', unlocked: true },
  { id: '2', name: 'Week Warrior', description: '7-day streak', icon: '🔥', unlocked: true },
  { id: '3', name: 'Math Wizard', description: 'Complete 20 math levels', icon: '🧙', unlocked: true },
  { id: '4', name: 'Polyglot', description: 'Study 3 languages', icon: '🌐', unlocked: false },
  { id: '5', name: 'Speed Demon', description: 'Finish a level in under 2 min', icon: '⚡', unlocked: false },
  { id: '6', name: 'Perfect Score', description: 'Get 100% on a quiz', icon: '💯', unlocked: true },
  { id: '7', name: 'Night Owl', description: 'Study after midnight', icon: '🦉', unlocked: false },
  { id: '8', name: 'Century', description: 'Reach level 100', icon: '💎', unlocked: false },
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Sarah K.', xp: 15420, level: 42, avatar: '👩‍🎓' },
  { rank: 2, name: 'Ahmed M.', xp: 14850, level: 40, avatar: '👨‍💻' },
  { rank: 3, name: 'Marie L.', xp: 13200, level: 38, avatar: '👩‍🔬' },
  { rank: 4, name: 'Carlos R.', xp: 12100, level: 35, avatar: '🧑‍🎨' },
  { rank: 5, name: 'Lena W.', xp: 11500, level: 33, avatar: '👩‍🚀' },
  { rank: 6, name: 'You', xp: 8750, level: 25, avatar: '🎮' },
  { rank: 7, name: 'Omar B.', xp: 8200, level: 24, avatar: '🧑‍💼' },
  { rank: 8, name: 'Sophie D.', xp: 7600, level: 22, avatar: '👩‍🎤' },
  { rank: 9, name: 'Kenji T.', xp: 6900, level: 20, avatar: '🧑‍🔧' },
  { rank: 10, name: 'Fatima A.', xp: 6200, level: 18, avatar: '👩‍⚕️' },
];

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const sampleLesson = {
  title: 'Addition & Subtraction Basics',
  level: 25,
  subject: 'Mathematics',
  steps: [
    {
      type: 'explanation' as const,
      title: 'Adding Numbers',
      content: 'Addition is the process of combining two or more numbers to find their total. The symbol "+" is used for addition. For example: 5 + 3 = 8',
    },
    {
      type: 'quiz' as const,
      question: 'What is 12 + 7?',
      options: ['17', '19', '21', '18'],
      correct: 1,
      explanation: '12 + 7 = 19. You can count up 7 from 12.',
    },
    {
      type: 'quiz' as const,
      question: 'What is 25 - 8?',
      options: ['15', '17', '18', '16'],
      correct: 1,
      explanation: '25 - 8 = 17. Subtract 8 from 25.',
    },
    {
      type: 'quiz' as const,
      question: 'If you have 15 apples and give away 6, how many remain?',
      options: ['8', '10', '9', '7'],
      correct: 2,
      explanation: '15 - 6 = 9 apples remaining.',
    },
    {
      type: 'challenge' as const,
      question: '🏆 CHALLENGE: What is 48 + 37?',
      options: ['75', '85', '84', '86'],
      correct: 1,
      explanation: '48 + 37 = 85. Break it down: 48 + 30 = 78, then 78 + 7 = 85.',
    },
  ],
};
