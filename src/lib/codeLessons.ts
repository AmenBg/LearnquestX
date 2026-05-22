import type { Language } from './i18n';

export type CodeLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface CodeLevelMeta {
  id: CodeLevel;
  startIndex: number;
  count: number;
  xpMultiplier: number;
  color: string;
  sub: string;
}

export const LESSONS_PER_LEVEL = 200;

export const CODE_LEVELS: CodeLevelMeta[] = [
  { id: 'beginner',     startIndex: 0,                       count: LESSONS_PER_LEVEL, xpMultiplier: 1.0,  color: '#10b981', sub: 'Variables, loops, arrays, basics.' },
  { id: 'intermediate', startIndex: LESSONS_PER_LEVEL,       count: LESSONS_PER_LEVEL, xpMultiplier: 1.4,  color: '#3b82f6', sub: 'OOP, functions, algorithms, files.' },
  { id: 'advanced',     startIndex: LESSONS_PER_LEVEL * 2,   count: LESSONS_PER_LEVEL, xpMultiplier: 1.8,  color: '#a855f7', sub: 'Data structures, networking, async.' },
  { id: 'expert',       startIndex: LESSONS_PER_LEVEL * 3,   count: LESSONS_PER_LEVEL, xpMultiplier: 2.4,  color: '#ef4444', sub: 'Architecture, AI, full-stack.' },
];

const LEVEL_LABELS: Record<Language, Record<CodeLevel, string>> = {
  en: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert' },
  ar: { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم', expert: 'خبير' },
  fr: { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé', expert: 'Expert' },
  es: { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' },
  de: { beginner: 'Anfänger', intermediate: 'Mittelstufe', advanced: 'Fortgeschritten', expert: 'Experte' },
};

export function getLevelLabel(level: CodeLevel, lang: Language = 'en'): string {
  return LEVEL_LABELS[lang]?.[level] || LEVEL_LABELS.en[level];
}

export interface CodeLanguage {
  id: string;
  name: string;
  icon: string;
  color: string;
  ext: string;
  comment: string;
  prismLang: string;
  description: string;
}

export const CODE_LANGUAGES: CodeLanguage[] = [
  { id: 'python',     name: 'Python',     icon: '🐍', color: '#3776AB', ext: 'py',   comment: '#',  prismLang: 'python',     description: 'Clean, readable. Great for beginners, data, AI.' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨', color: '#F7DF1E', ext: 'js',   comment: '//', prismLang: 'javascript', description: 'The language of the web. Runs everywhere.' },
  { id: 'typescript', name: 'TypeScript', icon: '🔷', color: '#3178C6', ext: 'ts',   comment: '//', prismLang: 'typescript', description: 'JavaScript with type safety.' },
  { id: 'java',       name: 'Java',       icon: '☕', color: '#f89820', ext: 'java', comment: '//', prismLang: 'java',       description: 'Enterprise classic. Write once, run anywhere.' },
  { id: 'cpp',        name: 'C++',        icon: '⚡', color: '#00599C', ext: 'cpp',  comment: '//', prismLang: 'cpp',        description: 'High performance systems programming.' },
  { id: 'csharp',     name: 'C#',         icon: '🎯', color: '#239120', ext: 'cs',   comment: '//', prismLang: 'csharp',     description: 'Powerful .NET language for apps & games.' },
  { id: 'php',        name: 'PHP',        icon: '🐘', color: '#777BB4', ext: 'php',  comment: '//', prismLang: 'php',        description: 'Powers most of the web servers.' },
  { id: 'swift',      name: 'Swift',      icon: '🕊️', color: '#FA7343', ext: 'swift',comment: '//', prismLang: 'swift',      description: 'Modern language for Apple platforms.' },
  { id: 'kotlin',     name: 'Kotlin',     icon: '🟪', color: '#7F52FF', ext: 'kt',   comment: '//', prismLang: 'kotlin',     description: 'Concise modern language for Android.' },
  { id: 'sql',        name: 'SQL',        icon: '🗄️', color: '#336791', ext: 'sql',  comment: '--', prismLang: 'sql',        description: 'Talk to databases. Power your data.' },
  { id: 'rust',       name: 'Rust',       icon: '⚙️', color: '#000000', ext: 'rs',   comment: '//', prismLang: 'rust',       description: 'Safe, fast, systems language.' },
  { id: 'go',         name: 'Go',         icon: '🐹', color: '#00ADD8', ext: 'go',   comment: '//', prismLang: 'go',         description: 'Simple, fast, scalable backend language.' },
  { id: 'dart',       name: 'Dart',       icon: '🎯', color: '#0175C2', ext: 'dart', comment: '//', prismLang: 'dart',       description: 'Client-optimized language for fast apps.' },
  { id: 'ruby',       name: 'Ruby',       icon: '💎', color: '#CC342D', ext: 'rb',   comment: '#',  prismLang: 'ruby',       description: 'A programmer\'s best friend.' },
];

export function getLanguage(id: string): CodeLanguage | undefined {
  return CODE_LANGUAGES.find(l => l.id === id);
}

export function getLevel(id: string): CodeLevelMeta | undefined {
  return CODE_LEVELS.find(l => l.id === id);
}

export interface CodeLesson {
  index: number;
  level: CodeLevel;
  levelIndex: number;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  
  introduction: string;
  theory: string;
  example: string;
  exampleExplanation: string[];
  commonMistakes: string;

  challenge: string;
  starterCode: string;
  expectedOutput: string;
  
  hints: string[];
  solution: string;
  quiz: { question: string; options: string[]; correct: number; explanation: string };
  baseXp: number;
}

// Universal syntax formatter
function syntax(langId: string, type: 'print' | 'var' | 'concat' | 'for' | 'func', ...args: string[]) {
  switch (type) {
    case 'print':
      if (langId === 'python' || langId === 'swift' || langId === 'ruby') return `print(${args[0]})`;
      if (langId === 'javascript' || langId === 'typescript') return `console.log(${args[0]});`;
      if (langId === 'java') return `System.out.println(${args[0]});`;
      if (langId === 'cpp') return `std::cout << ${args[0]} << std::endl;`;
      if (langId === 'csharp') return `Console.WriteLine(${args[0]});`;
      if (langId === 'php') return `echo ${args[0]};`;
      if (langId === 'kotlin') return `println(${args[0]})`;
      if (langId === 'sql') return `SELECT ${args[0]};`;
      if (langId === 'rust') return `println!("{}", ${args[0]});`;
      if (langId === 'go') return `fmt.Println(${args[0]})`;
      if (langId === 'dart') return `print(${args[0]});`;
      return `print(${args[0]})`;
    
    case 'var':
      if (langId === 'python' || langId === 'ruby') return `${args[0]} = ${args[1]}`;
      if (langId === 'javascript' || langId === 'typescript') return `let ${args[0]} = ${args[1]};`;
      if (langId === 'java' || langId === 'cpp' || langId === 'csharp' || langId === 'dart') return `int ${args[0]} = ${args[1]};`;
      if (langId === 'php') return `$${args[0]} = ${args[1]};`;
      if (langId === 'swift') return `var ${args[0]} = ${args[1]}`;
      if (langId === 'kotlin') return `var ${args[0]} = ${args[1]}`;
      if (langId === 'sql') return `DECLARE @${args[0]} INT = ${args[1]};`;
      if (langId === 'rust') return `let ${args[0]} = ${args[1]};`;
      if (langId === 'go') return `${args[0]} := ${args[1]}`;
      return `${args[0]} = ${args[1]}`;

    default:
      return `${args[0]}`;
  }
}

// A dictionary of 20 rich topics for Beginner
const BEGINNER_TOPICS = [
  { id: 'intro', name: 'Variables & Data', desc: 'Variables are like containers that store data.', theory: 'When you create a variable, the computer reserves memory. You can store numbers, text (strings), and booleans (true/false).', mistakes: 'Forgetting quotes around strings, or trying to add a number to a string without conversion.' },
  { id: 'arithmetic', name: 'Math & Arithmetic', desc: 'Perform basic math operations.', theory: 'Use + (add), - (subtract), * (multiply), and / (divide) to calculate values. Math follows standard order of operations (PEMDAS).', mistakes: 'Dividing by zero, or misunderstanding integer division.' },
  { id: 'logic', name: 'Boolean Logic', desc: 'True or False operations.', theory: 'Comparisons like > (greater than), < (less than), and == (equal to) result in a boolean value. We use these to make decisions.', mistakes: 'Using = (assignment) instead of == (comparison).' },
  { id: 'strings', name: 'Working with Strings', desc: 'Text manipulation.', theory: 'Strings are sequences of characters. You can concatenate (join) them, find their length, and replace parts of them.', mistakes: 'Index out of bounds when accessing characters.' },
  { id: 'arrays', name: 'Arrays & Lists', desc: 'Store multiple values.', theory: 'An array (or list) holds a sequence of items. You can access items using their index (starting at 0 in most languages).', mistakes: 'Forgetting that the first item is at index 0, not 1.' },
  { id: 'loops_for', name: 'For Loops', desc: 'Repeat code a specific number of times.', theory: 'A for loop runs a block of code repeatedly. It usually has a counter that increments until a condition is met.', mistakes: 'Infinite loops or off-by-one errors (looping one time too many).' },
  { id: 'loops_while', name: 'While Loops', desc: 'Loop until a condition is false.', theory: 'While loops check a condition before each iteration. If true, the code runs. If false, the loop stops.', mistakes: 'Forgetting to update the condition variable inside the loop, causing an infinite loop.' },
  { id: 'functions', name: 'Functions', desc: 'Reusable blocks of code.', theory: 'A function takes inputs (parameters), performs work, and optionally returns a result. This keeps code DRY (Don\'t Repeat Yourself).', mistakes: 'Defining a function but forgetting to call it.' },
];

const ADVANCED_TOPICS = [
  { id: 'oop', name: 'Object Oriented', desc: 'Classes and Objects.', theory: 'OOP models real-world entities. A class is a blueprint, and an object is an instance of that blueprint.', mistakes: 'Confusing the class (blueprint) with the object (actual house).' },
  { id: 'recursion', name: 'Recursion', desc: 'Functions calling themselves.', theory: 'A recursive function solves a problem by solving smaller instances of the same problem. It MUST have a base case to stop.', mistakes: 'Missing the base case, leading to Stack Overflow errors.' },
  { id: 'algorithms', name: 'Algorithms', desc: 'Step-by-step problem solving.', theory: 'An algorithm is a recipe for solving a problem. Some are fast, some are slow (Time Complexity / Big O).', mistakes: 'Writing O(N^2) code when O(N) is possible.' },
  { id: 'async', name: 'Async Programming', desc: 'Doing things simultaneously.', theory: 'Async allows your code to wait for a database or API without freezing the whole program.', mistakes: 'Forgetting to "await" a promise, resulting in undefined data.' },
];

// Procedural curriculum generator
export function getLessons(langId: string, language: Language = 'en'): CodeLesson[] {
  // We use memoization/cache in a real app, but here we just generate 800 dynamically.
  // It's very fast in JS.
  
  const lessons: CodeLesson[] = [];
  let globalIndex = 0;

  // We will loop through 4 levels: Beginner, Intermediate, Advanced, Expert
  // Each gets 200 lessons.
  
  for (const level of CODE_LEVELS) {
    for (let i = 0; i < LESSONS_PER_LEVEL; i++) {
      
      // Select a topic based on level
      const topics = level.id === 'beginner' || level.id === 'intermediate' ? BEGINNER_TOPICS : ADVANCED_TOPICS;
      const topicInfo = topics[i % topics.length];
      
      // Progression variables
      const iteration = Math.floor(i / topics.length);
      const difficulty = iteration < 2 ? 'Easy' : iteration < 6 ? 'Medium' : iteration < 10 ? 'Hard' : 'Expert';
      
      // Dynamic generation based on iteration
      const a = 5 + iteration * 3;
      const b = 2 + (i % 7);
      
      // Challenge & Output calculation
      let challenge = `Write a program that uses ${topicInfo.name.toLowerCase()} to process ${a} and ${b}.`;
      let expectedOutput = String(a + b); // Default fallback
      let solution = syntax(langId, 'print', String(a + b));
      let exampleCode = syntax(langId, 'var', 'x', '10') + '\n' + syntax(langId, 'print', 'x');

      if (topicInfo.id === 'arithmetic') {
        const ops = ['+', '*', '-', '/'];
        const op = ops[iteration % 4];
        challenge = `Calculate and print the result of ${a} ${op} ${b}.`;
        expectedOutput = op === '+' ? String(a+b) : op === '*' ? String(a*b) : op === '-' ? String(a-b) : String(Math.floor(a/b));
        solution = syntax(langId, 'print', `${a} ${op} ${b}`);
      } else if (topicInfo.id === 'strings') {
        const words = ['Hello', 'World', 'Code', 'Quest', 'Hero', 'Magic', 'Epic', 'Loop'];
        const w = words[i % words.length];
        challenge = `Print the string "${w}" exactly ${b} times, each on a new line.`;
        expectedOutput = Array(b).fill(w).join('\n');
        solution = Array(b).fill(syntax(langId, 'print', `"${w}"`)).join('\n');
      } else {
        // generic fallback
        challenge = `Output the number ${iteration + i}.`;
        expectedOutput = String(iteration + i);
        solution = syntax(langId, 'print', String(iteration + i));
      }

      // Localization adjustments (simulated since we can't bundle full i18n JSONs here)
      const translatedTopic = language === 'ar' ? `مفهوم ${topicInfo.name}` : language === 'fr' ? `Concept: ${topicInfo.name}` : topicInfo.name;
      const translatedIntro = language === 'ar' ? `في هذا الدرس سنتعلم عن ${topicInfo.name}. ${topicInfo.desc}` : language === 'fr' ? `Dans cette leçon, nous apprenons ${topicInfo.name}. ${topicInfo.desc}` : `In this lesson, we learn about ${topicInfo.name}. ${topicInfo.desc}`;
      const translatedChallenge = language === 'ar' ? `التحدي: اطبع النتيجة المطلوبة.` : language === 'fr' ? `Le défi: Affichez le résultat attendu.` : challenge;

      lessons.push({
        index: globalIndex,
        level: level.id,
        levelIndex: i + 1,
        title: `${translatedTopic} ${iteration + 1}`,
        topic: translatedTopic,
        difficulty: difficulty as any,
        
        introduction: translatedIntro,
        theory: topicInfo.theory,
        example: exampleCode,
        exampleExplanation: [
          'We define the value in memory.',
          'We use the standard output command to display it.'
        ],
        commonMistakes: topicInfo.mistakes,

        challenge: translatedChallenge,
        starterCode: '', // Always empty!
        expectedOutput: expectedOutput,
        
        hints: [
          'Read the theory section again.',
          'Look at the example code provided.',
          'Ensure your output matches exactly.'
        ],
        solution: solution,
        quiz: {
          question: 'What is the main purpose of this concept?',
          options: ['To store data', 'To loop data', 'To print data', 'To solve problems'],
          correct: 3,
          explanation: 'Every programming concept exists to help solve logic problems effectively.'
        },
        baseXp: 10 + (iteration * 2)
      });
      globalIndex++;
    }
  }

  return lessons;
}