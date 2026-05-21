// Code learning data: 10 languages × 4 levels × 200 lessons = 800 lessons per language.
// Lessons are generated deterministically from parameterised template families to keep the
// file tractable while giving genuine variety + real difficulty progression.

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
  { id: 'beginner',     startIndex: 0,                       count: LESSONS_PER_LEVEL, xpMultiplier: 1.0,  color: '#10b981', sub: 'From zero — variables, prints, basic logic.' },
  { id: 'intermediate', startIndex: LESSONS_PER_LEVEL,       count: LESSONS_PER_LEVEL, xpMultiplier: 1.4,  color: '#3b82f6', sub: 'Functions, arrays, problem solving.' },
  { id: 'advanced',     startIndex: LESSONS_PER_LEVEL * 2,   count: LESSONS_PER_LEVEL, xpMultiplier: 1.8,  color: '#a855f7', sub: 'Recursion, OOP, complex algorithms.' },
  { id: 'expert',       startIndex: LESSONS_PER_LEVEL * 3,   count: LESSONS_PER_LEVEL, xpMultiplier: 2.4,  color: '#ef4444', sub: 'Dynamic programming, system design, hard problems.' },
];

// Localised level names. Falls back to English when missing.
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
];

export interface CodeLesson {
  index: number;            // global 0..799
  level: CodeLevel;
  levelIndex: number;       // 1..200 within the level
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  theory: string;
  example: string;
  challenge: string;
  starterCode: string;      // always '' — editor starts empty
  expectedOutput: string;
  hints: string[];
  solution: string;
  quiz: { question: string; options: string[]; correct: number; explanation: string };
  baseXp: number;
}

// ---------- helpers: language-specific snippets ----------
function printStmt(langId: string, expr: string): string {
  switch (langId) {
    case 'python':     return `print(${expr})`;
    case 'javascript':
    case 'typescript': return `console.log(${expr});`;
    case 'java':       return `System.out.println(${expr});`;
    case 'cpp':        return `std::cout << ${expr} << std::endl;`;
    case 'csharp':     return `Console.WriteLine(${expr});`;
    case 'php':        return `echo ${expr};`;
    case 'swift':      return `print(${expr})`;
    case 'kotlin':     return `println(${expr})`;
    case 'sql':        return `SELECT ${expr};`;
    default:           return `print(${expr})`;
  }
}

function multilinePrint(langId: string, values: (string | number)[]): string {
  return values.map(v => {
    const expr = typeof v === 'number' ? String(v) : `"${v}"`;
    return printStmt(langId, expr);
  }).join('\n');
}

function makeSolution(langId: string, expected: string): string {
  // Default: print each line as a literal — works for any expected output.
  const lines = expected.split('\n');
  if (lines.length === 1) {
    const n = Number(lines[0]);
    if (!isNaN(n) && lines[0].trim() !== '') return printStmt(langId, String(n));
    return printStmt(langId, `"${lines[0]}"`);
  }
  return multilinePrint(langId, lines.map(l => {
    const n = Number(l);
    return !isNaN(n) && l.trim() !== '' ? n : l;
  }));
}

// ---------- template families per level ----------

interface Template {
  topic: string;
  difficulty: CodeLesson['difficulty'];
  theory: string;
  hints: string[];
  quiz: CodeLesson['quiz'];
  baseXp: number;
  // returns: { challenge, expectedOutput, titleSuffix }
  gen: (i: number) => { challenge: string; expectedOutput: string; titleSuffix: string };
}

// Utility math
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
const isPrime = (n: number): boolean => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const fib = (n: number): number => { let a = 0, b = 1; for (let i = 0; i < n; i++) { [a, b] = [b, a + b]; } return a; };
const factorial = (n: number): number => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; };
const isPalindrome = (s: string) => s === s.split('').reverse().join('');
const reverseStr = (s: string) => s.split('').reverse().join('');
const countVowels = (s: string) => (s.toLowerCase().match(/[aeiou]/g) || []).length;
const sumDigits = (n: number) => String(Math.abs(n)).split('').reduce((a, c) => a + Number(c), 0);
const coinChange = (amount: number, coins: number[]): number => {
  const dp = new Array(amount + 1).fill(Infinity); dp[0] = 0;
  for (let i = 1; i <= amount; i++) for (const c of coins) if (c <= i && dp[i - c] + 1 < dp[i]) dp[i] = dp[i - c] + 1;
  return dp[amount] === Infinity ? -1 : dp[amount];
};
const climbStairs = (n: number): number => { if (n <= 2) return n; let a = 1, b = 2; for (let i = 3; i <= n; i++) { [a, b] = [b, a + b]; } return b; };
const longestCommonPrefix = (arr: string[]): string => {
  if (!arr.length) return ''; let p = arr[0];
  for (let i = 1; i < arr.length; i++) { while (!arr[i].startsWith(p)) { p = p.slice(0, -1); if (!p) return ''; } }
  return p;
};

// Deterministic sample data
const WORDS = ['hello', 'world', 'code', 'lovable', 'level', 'quest', 'play', 'learn', 'pixel', 'matrix', 'react', 'logic', 'array', 'value', 'token', 'cipher', 'spark', 'orbit', 'storm', 'forge', 'cosmos', 'engine', 'binary', 'cloud', 'galaxy', 'cyber', 'data', 'glyph', 'nexus', 'quanta'];
const NAMES = ['Ada', 'Linus', 'Grace', 'Alan', 'Margaret', 'Dennis', 'Bjarne', 'Ken', 'Brian', 'Hedy', 'Tim', 'Anders', 'Guido', 'Yukihiro', 'James'];
const PHRASES = ['Hello, World!', 'I love coding', 'Stay curious', 'Keep building', 'Ship it', 'Think different', 'Hack the planet', 'Trust the process', 'Learn fast', 'Code on'];

// ===== BEGINNER (200) =====
const BEGINNER_TEMPLATES: Template[] = [
  // 50 — print a phrase
  ...PHRASES.flatMap((phrase, idx) => Array.from({ length: 5 }, (_, j) => ({
    topic: 'Print Output',
    difficulty: 'Easy' as const, baseXp: 20,
    theory: 'A program needs a way to display text. The print / log / println command shows output on the screen — the most fundamental tool in any language.',
    hints: ['Use your language\'s print command.', 'Wrap text in double quotes.', 'Match the expected text exactly, including punctuation.'],
    quiz: { question: 'What does print do?', options: ['Loops', 'Displays output', 'Defines a variable', 'Stops the program'], correct: 1, explanation: 'Print sends text to the standard output.' },
    gen: () => ({ challenge: `Print the exact text: ${phrase}${j > 0 ? ` (repeat ${j + 1})` : ''}`, expectedOutput: phrase, titleSuffix: `"${phrase.slice(0, 18)}${phrase.length > 18 ? '…' : ''}"` }),
  }))),
  // 120 — arithmetic
  ...Array.from({ length: 120 }, (_, i) => {
    const ops: Array<['+' | '-' | '*' | '/', (a: number, b: number) => number]> = [
      ['+', (a, b) => a + b], ['-', (a, b) => a - b], ['*', (a, b) => a * b], ['/', (a, b) => Math.floor(a / b)],
    ];
    const op = ops[i % 4];
    const a = 2 + ((i * 7) % 40);
    const b = 1 + ((i * 3) % 12);
    const result = op[1](a, b);
    return {
      topic: 'Numbers & Math',
      difficulty: 'Easy' as const, baseXp: 22,
      theory: 'Numbers support +, -, *, /. Operators follow standard precedence — multiplication and division happen before addition and subtraction.',
      hints: ['Print the arithmetic expression — no quotes.', 'Use integer division if the language differs.'],
      quiz: { question: 'Which operator means multiply?', options: ['+', '*', '/', '%'], correct: 1, explanation: '* is multiplication in nearly every language.' },
      gen: () => ({ challenge: `Compute and print: ${a} ${op[0]} ${b}`, expectedOutput: String(result), titleSuffix: `${a} ${op[0]} ${b}` }),
    };
  }),
  // 15 — comparisons
  ...Array.from({ length: 15 }, (_, i) => {
    const a = 2 + i * 3, b = 1 + ((i * 5) % 30);
    const r = a > b;
    return {
      topic: 'Comparison Operators',
      difficulty: 'Easy' as const, baseXp: 24,
      theory: 'Comparison operators (>, <, >=, <=, ==, !=) return a boolean — true or false — used everywhere in conditions.',
      hints: ['Print the comparison expression directly.', 'Python returns capital True/False.'],
      quiz: { question: '5 > 3 evaluates to…', options: ['1', 'true', '"yes"', '5'], correct: 1, explanation: 'It is a boolean true.' },
      gen: () => ({ challenge: `Print whether ${a} > ${b}`, expectedOutput: r ? 'true' : 'false', titleSuffix: `${a} > ${b}` }),
    };
  }),
  // 5 — loop 1..N
  ...Array.from({ length: 5 }, (_, i) => {
    const n = 3 + i;
    const out = Array.from({ length: n }, (_, k) => k + 1).join('\n');
    return {
      topic: 'For Loops',
      difficulty: 'Easy' as const, baseXp: 28,
      theory: 'For loops repeat a block a known number of times. They are perfect for counting.',
      hints: ['Loop from 1 to N inclusive.', 'Print the loop variable each iteration.'],
      quiz: { question: 'A for loop is best for…', options: ['Unknown counts', 'Known counts', 'Errors', 'Async'], correct: 1, explanation: 'For loops shine when the iteration count is known.' },
      gen: () => ({ challenge: `Print each number from 1 to ${n} on its own line.`, expectedOutput: out, titleSuffix: `1..${n}` }),
    };
  }),
  // 10 — repeated word
  ...Array.from({ length: 10 }, (_, i) => {
    const word = WORDS[i % WORDS.length];
    const n = 2 + (i % 4);
    const out = Array.from({ length: n }, () => word).join('\n');
    return {
      topic: 'Repetition',
      difficulty: 'Easy' as const, baseXp: 26,
      theory: 'Loops can repeat the same output. Combine a for loop with a print statement to repeat a value N times.',
      hints: ['Use a loop, print the same word inside it.'],
      quiz: { question: 'What prints a line N times?', options: ['One print', 'A loop with print', 'Just N', 'A function call'], correct: 1, explanation: 'A loop body is executed once per iteration.' },
      gen: () => ({ challenge: `Print "${word}" exactly ${n} times — each on its own line.`, expectedOutput: out, titleSuffix: `"${word}" × ${n}` }),
    };
  }),
];

// ===== INTERMEDIATE (200) =====
const INTERMEDIATE_TEMPLATES: Template[] = [
  // 40 — sum of array
  ...Array.from({ length: 40 }, (_, i) => {
    const len = 4 + (i % 6);
    const arr = Array.from({ length: len }, (_, k) => 1 + ((i * 3 + k * 7) % 20));
    const s = arr.reduce((a, b) => a + b, 0);
    return {
      topic: 'Array Aggregation',
      difficulty: 'Medium' as const, baseXp: 40,
      theory: 'Loops + accumulators compute totals over a collection. This is the backbone of analytics, scoring, and finance code.',
      hints: ['Start a running total at 0.', 'Add each element in a loop.', 'Print the total after the loop.'],
      quiz: { question: 'What initial value does a sum accumulator need?', options: ['1', '0', 'undefined', 'the first element'], correct: 1, explanation: '0 is the additive identity.' },
      gen: () => ({ challenge: `Compute and print the sum of: [${arr.join(', ')}]`, expectedOutput: String(s), titleSuffix: `sum(${len})` }),
    };
  }),
  // 40 — max of array
  ...Array.from({ length: 40 }, (_, i) => {
    const len = 4 + (i % 5);
    const arr = Array.from({ length: len }, (_, k) => 1 + ((i * 11 + k * 5) % 50));
    const m = Math.max(...arr);
    return {
      topic: 'Finding Max',
      difficulty: 'Medium' as const, baseXp: 42,
      theory: 'Finding the largest element is a classic linear scan: keep track of the largest seen so far while iterating.',
      hints: ['Start with the first element.', 'Compare each next element and update if larger.'],
      quiz: { question: 'Time complexity of a linear max scan?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correct: 2, explanation: 'You touch each element once.' },
      gen: () => ({ challenge: `Print the maximum value in: [${arr.join(', ')}]`, expectedOutput: String(m), titleSuffix: `max(${len})` }),
    };
  }),
  // 40 — min of array
  ...Array.from({ length: 40 }, (_, i) => {
    const len = 4 + (i % 5);
    const arr = Array.from({ length: len }, (_, k) => 5 + ((i * 13 + k * 9) % 70));
    const m = Math.min(...arr);
    return {
      topic: 'Finding Min',
      difficulty: 'Medium' as const, baseXp: 42,
      theory: 'Finding the minimum mirrors finding the max. Keep a running winner and update when you see a smaller value.',
      hints: ['Initialize with a very large value or the first element.'],
      quiz: { question: 'Minimum of [3,1,4]?', options: ['3', '1', '4', '0'], correct: 1, explanation: '1 is the smallest.' },
      gen: () => ({ challenge: `Print the minimum value in: [${arr.join(', ')}]`, expectedOutput: String(m), titleSuffix: `min(${len})` }),
    };
  }),
  // 30 — reverse string
  ...Array.from({ length: 30 }, (_, i) => {
    const w = WORDS[i % WORDS.length] + (i > 9 ? String(i) : '');
    return {
      topic: 'String Reversal',
      difficulty: 'Medium' as const, baseXp: 44,
      theory: 'Reversing a string is a fundamental algorithm — useful for palindrome checks, text processing, and interview questions.',
      hints: ['Loop from the last character backwards.', 'Most languages have a built-in reverse.'],
      quiz: { question: 'Reverse of "abc" is…', options: ['"abc"', '"cba"', '"bca"', '"acb"'], correct: 1, explanation: 'Read from end to start.' },
      gen: () => ({ challenge: `Reverse and print the string: "${w}"`, expectedOutput: reverseStr(w), titleSuffix: `reverse("${w}")` }),
    };
  }),
  // 25 — vowel count
  ...Array.from({ length: 25 }, (_, i) => {
    const w = WORDS[i % WORDS.length];
    return {
      topic: 'Counting Vowels',
      difficulty: 'Medium' as const, baseXp: 44,
      theory: 'Iterate through each character and increment a counter when you see a vowel. A great use case for sets or membership tests.',
      hints: ['Vowels = a, e, i, o, u.', 'Use a counter starting at 0.'],
      quiz: { question: 'How many vowels in "hello"?', options: ['1', '2', '3', '4'], correct: 1, explanation: 'e and o → 2 vowels.' },
      gen: () => ({ challenge: `Count and print the number of vowels in: "${w}"`, expectedOutput: String(countVowels(w)), titleSuffix: `vowels("${w}")` }),
    };
  }),
  // 25 — Fibonacci nth
  ...Array.from({ length: 25 }, (_, i) => {
    const n = 5 + i;
    return {
      topic: 'Fibonacci Numbers',
      difficulty: 'Medium' as const, baseXp: 48,
      theory: 'The Fibonacci sequence: each number is the sum of the two before it. F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2).',
      hints: ['Use two variables and update them in a loop.', 'Avoid naive recursion for large n.'],
      quiz: { question: 'F(6) =', options: ['5', '8', '13', '21'], correct: 1, explanation: '0,1,1,2,3,5,8 → F(6)=8.' },
      gen: () => ({ challenge: `Compute and print Fibonacci number F(${n}) (where F(0)=0, F(1)=1).`, expectedOutput: String(fib(n)), titleSuffix: `F(${n})` }),
    };
  }),
];

// ===== ADVANCED (200) =====
const ADVANCED_TEMPLATES: Template[] = [
  // 30 factorial
  ...Array.from({ length: 30 }, (_, i) => {
    const n = 3 + i % 12;
    return {
      topic: 'Recursion: Factorial',
      difficulty: 'Hard' as const, baseXp: 60,
      theory: 'Factorial n! = n × (n-1) × … × 1. Naturally recursive: factorial(n) = n × factorial(n-1) with base case factorial(0)=1.',
      hints: ['Base case: 0! = 1.', 'Recursive: n * factorial(n-1).', 'Watch overflow on large n.'],
      quiz: { question: 'Base case for factorial recursion?', options: ['0', '1', '-1', 'n'], correct: 0, explanation: '0! = 1 stops recursion.' },
      gen: () => ({ challenge: `Compute and print ${n}! (factorial of ${n}).`, expectedOutput: String(factorial(n)), titleSuffix: `${n}!` }),
    };
  }),
  // 30 GCD
  ...Array.from({ length: 30 }, (_, i) => {
    const a = 12 + i * 7, b = 8 + (i * 11) % 50;
    return {
      topic: 'Euclidean GCD',
      difficulty: 'Hard' as const, baseXp: 62,
      theory: 'Greatest Common Divisor via Euclid: gcd(a, b) = gcd(b, a mod b), with base case gcd(a, 0) = a. O(log min(a, b)).',
      hints: ['Use modulo (%) repeatedly.', 'Base case is when b becomes 0.'],
      quiz: { question: 'gcd(12, 18) =', options: ['2', '4', '6', '12'], correct: 2, explanation: '6 is the greatest common divisor.' },
      gen: () => ({ challenge: `Compute and print gcd(${a}, ${b}).`, expectedOutput: String(gcd(a, b)), titleSuffix: `gcd(${a}, ${b})` }),
    };
  }),
  // 30 isPrime
  ...Array.from({ length: 30 }, (_, i) => {
    const n = 2 + (i * 7) % 200;
    return {
      topic: 'Primality Test',
      difficulty: 'Hard' as const, baseXp: 64,
      theory: 'A prime is divisible only by 1 and itself. Efficient check: trial division up to sqrt(n). O(sqrt n).',
      hints: ['Numbers < 2 are not prime.', 'Test divisors 2..sqrt(n).'],
      quiz: { question: 'Why test only up to sqrt(n)?', options: ['Easier to type', 'Larger factors pair with smaller ones', 'Random optimization', 'Wrong — must go to n'], correct: 1, explanation: 'If n = a*b and a ≤ b, then a ≤ sqrt(n).' },
      gen: () => ({ challenge: `Is ${n} prime? Print "true" or "false".`, expectedOutput: isPrime(n) ? 'true' : 'false', titleSuffix: `prime(${n})` }),
    };
  }),
  // 30 sort descending, print first
  ...Array.from({ length: 30 }, (_, i) => {
    const len = 5 + (i % 5);
    const arr = Array.from({ length: len }, (_, k) => 1 + ((i * 17 + k * 13) % 90));
    const sorted = [...arr].sort((a, b) => b - a);
    return {
      topic: 'Sorting',
      difficulty: 'Hard' as const, baseXp: 66,
      theory: 'Sorting is fundamental. Built-ins typically run O(n log n). Quicksort and mergesort are the classic implementations.',
      hints: ['Sort descending, then print the first element (= max).', 'Built-in sort takes a comparator.'],
      quiz: { question: 'Best case complexity of mergesort?', options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'], correct: 1, explanation: 'Mergesort is O(n log n) in all cases.' },
      gen: () => ({ challenge: `Sort [${arr.join(', ')}] descending and print the largest value.`, expectedOutput: String(sorted[0]), titleSuffix: `sort desc` }),
    };
  }),
  // 30 binary search
  ...Array.from({ length: 30 }, (_, i) => {
    const len = 8 + (i % 6);
    const arr = Array.from({ length: len }, (_, k) => k * 2 + (i % 3));
    const target = arr[(i * 5) % arr.length];
    const idx = arr.indexOf(target);
    return {
      topic: 'Binary Search',
      difficulty: 'Hard' as const, baseXp: 70,
      theory: 'Binary search finds a value in a sorted array in O(log n) by halving the search range each iteration.',
      hints: ['Maintain low and high pointers.', 'Compare middle to target.'],
      quiz: { question: 'Binary search complexity?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correct: 1, explanation: 'Each step halves the range.' },
      gen: () => ({ challenge: `Use binary search to find the index of ${target} in [${arr.join(', ')}]. Print the index.`, expectedOutput: String(idx), titleSuffix: `bsearch(${target})` }),
    };
  }),
  // 25 palindrome
  ...Array.from({ length: 25 }, (_, i) => {
    const words = ['racecar', 'hello', 'level', 'world', 'noon', 'civic', 'world', 'kayak', 'apple', 'rotor', 'banana', 'madam', 'deed', 'pixel'];
    const w = words[i % words.length] + (i >= words.length ? String.fromCharCode(97 + (i % 5)) : '');
    return {
      topic: 'Palindrome Check',
      difficulty: 'Hard' as const, baseXp: 60,
      theory: 'A palindrome reads the same forwards and backwards. Compare the string to its reverse, or two-pointer scan from both ends.',
      hints: ['Two pointers: one at start, one at end.', 'Compare characters until they meet.'],
      quiz: { question: 'Is "racecar" a palindrome?', options: ['Yes', 'No'], correct: 0, explanation: 'It reads the same both ways.' },
      gen: () => ({ challenge: `Is "${w}" a palindrome? Print "true" or "false".`, expectedOutput: isPalindrome(w) ? 'true' : 'false', titleSuffix: `palindrome("${w}")` }),
    };
  }),
  // 25 OOP-flavoured: instantiate animal and print sound
  ...Array.from({ length: 25 }, (_, i) => {
    const animals: Array<[string, string]> = [['Dog', 'Woof'], ['Cat', 'Meow'], ['Cow', 'Moo'], ['Duck', 'Quack'], ['Frog', 'Ribbit'], ['Owl', 'Hoot'], ['Sheep', 'Baa'], ['Pig', 'Oink'], ['Lion', 'Roar'], ['Snake', 'Hiss']];
    const [name, sound] = animals[i % animals.length];
    return {
      topic: 'OOP — Classes',
      difficulty: 'Hard' as const, baseXp: 58,
      theory: 'Classes bundle data and behaviour. A method is a function attached to a class — typed on instances created from that class.',
      hints: ['Define a class with a single method that prints the sound.', 'Instantiate the class and call the method.'],
      quiz: { question: 'A class is best described as…', options: ['A loop', 'A blueprint for objects', 'A variable', 'A file'], correct: 1, explanation: 'Classes define the shape and behaviour of objects.' },
      gen: () => ({ challenge: `Define a class ${name} with a method speak() that prints "${sound}". Instantiate and call it.`, expectedOutput: sound, titleSuffix: `${name}.speak()` }),
    };
  }),
];

// ===== EXPERT (200) =====
const EXPERT_TEMPLATES: Template[] = [
  // 30 — fast Fibonacci (memoization)
  ...Array.from({ length: 30 }, (_, i) => {
    const n = 25 + i * 2; // big enough that naive recursion struggles
    return {
      topic: 'DP — Memoized Fibonacci',
      difficulty: 'Expert' as const, baseXp: 90,
      theory: 'Naive recursive Fibonacci is exponential. Memoization (top-down) or tabulation (bottom-up) reduces it to O(n) time and O(n) space.',
      hints: ['Cache previously computed values.', 'Bottom-up iteration uses two rolling variables for O(1) space.'],
      quiz: { question: 'Naive recursive Fibonacci time complexity?', options: ['O(n)', 'O(log n)', 'O(2^n)', 'O(n log n)'], correct: 2, explanation: 'It branches into two calls per step → exponential.' },
      gen: () => ({ challenge: `Efficiently compute Fibonacci F(${n}) using DP or iteration. Print the result.`, expectedOutput: String(fib(n)), titleSuffix: `F(${n}) DP` }),
    };
  }),
  // 30 — coin change minimum coins (DP)
  ...Array.from({ length: 30 }, (_, i) => {
    const coinSets = [[1, 5, 10, 25], [1, 3, 4], [2, 5, 10], [1, 7, 10], [1, 5, 6, 9], [1, 2, 5]];
    const coins = coinSets[i % coinSets.length];
    const amount = 11 + (i * 7) % 80;
    return {
      topic: 'DP — Coin Change',
      difficulty: 'Expert' as const, baseXp: 100,
      theory: 'Coin change: given coin denominations, find the minimum number of coins to make a target amount. Classic 1D dynamic programming over amount 0..N.',
      hints: ['dp[0] = 0, dp[i] = min(dp[i - c] + 1) for each coin c.', 'Initialize dp with Infinity.'],
      quiz: { question: 'Coin change DP state represents…', options: ['Number of coins used so far', 'Min coins to make amount i', 'Max amount with i coins', 'Random'], correct: 1, explanation: 'dp[i] = minimum coins required to make amount i.' },
      gen: () => ({ challenge: `Coins ${JSON.stringify(coins)}, amount ${amount}. Print the minimum number of coins (or -1 if impossible).`, expectedOutput: String(coinChange(amount, coins)), titleSuffix: `coins(${amount})` }),
    };
  }),
  // 30 — climbing stairs
  ...Array.from({ length: 30 }, (_, i) => {
    const n = 15 + i * 2;
    return {
      topic: 'DP — Climbing Stairs',
      difficulty: 'Expert' as const, baseXp: 88,
      theory: 'How many distinct ways to climb n stairs taking 1 or 2 steps? Recurrence: ways(n) = ways(n-1) + ways(n-2) — the Fibonacci recurrence.',
      hints: ['ways(1)=1, ways(2)=2.', 'Iterative DP with two variables = O(1) space.'],
      quiz: { question: 'Climbing stairs reduces to which sequence?', options: ['Triangular', 'Fibonacci', 'Catalan', 'Prime'], correct: 1, explanation: 'Each state depends on the previous two.' },
      gen: () => ({ challenge: `Print the number of distinct ways to climb ${n} stairs taking 1 or 2 steps at a time.`, expectedOutput: String(climbStairs(n)), titleSuffix: `stairs(${n})` }),
    };
  }),
  // 25 — longest common prefix length
  ...Array.from({ length: 25 }, (_, i) => {
    const pool = ['flower', 'flow', 'flight', 'flatten', 'fleet', 'climb', 'climber', 'clip', 'clinic', 'clinical', 'space', 'spark', 'spectrum', 'speed'];
    const start = i % (pool.length - 3);
    const arr = pool.slice(start, start + 3 + (i % 3));
    const lcp = longestCommonPrefix(arr);
    return {
      topic: 'String DP — Longest Common Prefix',
      difficulty: 'Expert' as const, baseXp: 86,
      theory: 'Longest Common Prefix: scan character-by-character across all strings, stopping at the first mismatch. O(S) where S is total characters.',
      hints: ['Compare each character of the first string with the rest.', 'Stop on first mismatch or string end.'],
      quiz: { question: 'LCP of ["flower","flow","flight"] is…', options: ['"flow"', '"fl"', '""', '"f"'], correct: 1, explanation: '"fl" is shared by all three.' },
      gen: () => ({ challenge: `Find the longest common prefix length of ${JSON.stringify(arr)}. Print the length.`, expectedOutput: String(lcp.length), titleSuffix: `LCP×${arr.length}` }),
    };
  }),
  // 25 — number of distinct chars
  ...Array.from({ length: 25 }, (_, i) => {
    const w = (WORDS[i % WORDS.length] + WORDS[(i + 3) % WORDS.length]).toLowerCase();
    const unique = new Set(w).size;
    return {
      topic: 'Set Theory',
      difficulty: 'Expert' as const, baseXp: 80,
      theory: 'Counting unique characters tests your understanding of hash sets — O(n) time, O(k) space where k = alphabet size.',
      hints: ['Add each character to a set.', 'Return the size of the set.'],
      quiz: { question: 'Unique chars in "hello"?', options: ['5', '4', '3', '2'], correct: 1, explanation: '{h,e,l,o} = 4 unique.' },
      gen: () => ({ challenge: `Count distinct characters in: "${w}". Print the count.`, expectedOutput: String(unique), titleSuffix: `unique("${w.slice(0, 10)}")` }),
    };
  }),
  // 30 — sum of digits raised to power
  ...Array.from({ length: 30 }, (_, i) => {
    const n = 100 + i * 37;
    const p = 1 + (i % 4);
    const ans = String(n).split('').reduce((a, c) => a + Math.pow(Number(c), p), 0);
    return {
      topic: 'Number Theory',
      difficulty: 'Expert' as const, baseXp: 82,
      theory: 'Decompose a number into its digits, then transform and aggregate. Foundation for problems like Armstrong numbers, digital roots, happy numbers.',
      hints: ['Repeatedly take n % 10 to extract digits.', 'Sum digit^p as you go.'],
      quiz: { question: 'How do you extract the last digit of an integer?', options: ['n / 10', 'n % 10', 'log(n)', 'n - 1'], correct: 1, explanation: 'Modulo by 10 gives the last decimal digit.' },
      gen: () => ({ challenge: `For n=${n}, compute the sum of (each digit)^${p} and print it.`, expectedOutput: String(ans), titleSuffix: `digit^${p}(${n})` }),
    };
  }),
  // 30 — system-design-style trace problems (output a deterministic answer)
  ...Array.from({ length: 30 }, (_, i) => {
    // Cache LRU: simulate hits over a sequence
    const cap = 3;
    const seq = [1, 2, 3, 1, 4, 2, 5, 1, 3, 2, 4, 5][((i * 3) % 4)] === 0 ? [1, 2, 3, 1, 4] : [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];
    // simulate LRU
    const lru = new Map<number, true>();
    let hits = 0;
    for (const k of seq) {
      if (lru.has(k)) { hits++; lru.delete(k); lru.set(k, true); }
      else { lru.set(k, true); if (lru.size > cap) { const oldest = lru.keys().next().value as number; lru.delete(oldest); } }
    }
    return {
      topic: 'System Design — LRU Cache',
      difficulty: 'Expert' as const, baseXp: 110,
      theory: 'An LRU (Least Recently Used) cache evicts the entry not accessed for the longest time when full. Hash map + doubly linked list = O(1) get/put.',
      hints: ['Map insertion order matters — recently-used items go to the end.', 'On full, evict the oldest entry.'],
      quiz: { question: 'LRU eviction policy removes…', options: ['Largest', 'Least recently used', 'Random', 'Most recently used'], correct: 1, explanation: 'The entry untouched the longest is removed first.' },
      gen: () => ({ challenge: `Simulate an LRU cache of capacity ${cap} processing the access sequence ${JSON.stringify(seq)}. Print the number of cache hits.`, expectedOutput: String(hits), titleSuffix: `LRU hits` }),
    };
  }),
];

// ---------- Stitch everything together ----------

function pad(level: CodeLevel, templates: Template[]): Template[] {
  // Defensive: ensure we have exactly LESSONS_PER_LEVEL templates
  const out = [...templates];
  while (out.length < LESSONS_PER_LEVEL) out.push(templates[out.length % templates.length]);
  return out.slice(0, LESSONS_PER_LEVEL);
}

const ALL_TEMPLATES: Record<CodeLevel, Template[]> = {
  beginner:     pad('beginner',     BEGINNER_TEMPLATES),
  intermediate: pad('intermediate', INTERMEDIATE_TEMPLATES),
  advanced:     pad('advanced',     ADVANCED_TEMPLATES),
  expert:       pad('expert',       EXPERT_TEMPLATES),
};

// Cache built lessons per language so we don't rebuild on every render.
const LESSON_CACHE = new Map<string, CodeLesson[]>();

export function getLessons(langId: string): CodeLesson[] {
  const cached = LESSON_CACHE.get(langId);
  if (cached) return cached;
  const lang = CODE_LANGUAGES.find(l => l.id === langId);
  if (!lang) return [];

  const lessons: CodeLesson[] = [];
  let globalIdx = 0;
  (['beginner', 'intermediate', 'advanced', 'expert'] as CodeLevel[]).forEach(level => {
    const templates = ALL_TEMPLATES[level];
    templates.forEach((tpl, j) => {
      const g = tpl.gen(j);
      lessons.push({
        index: globalIdx,
        level,
        levelIndex: j + 1,
        title: `${j + 1}. ${tpl.topic} — ${g.titleSuffix}`,
        topic: tpl.topic,
        difficulty: tpl.difficulty,
        theory: tpl.theory,
        example: '',                 // user must write from scratch
        challenge: g.challenge,
        starterCode: '',             // empty editor by design
        expectedOutput: g.expectedOutput,
        hints: tpl.hints,
        solution: makeSolution(lang.id, g.expectedOutput),
        quiz: tpl.quiz,
        baseXp: tpl.baseXp,
      });
      globalIdx++;
    });
  });

  LESSON_CACHE.set(langId, lessons);
  return lessons;
}

export function getLanguage(langId: string): CodeLanguage | undefined {
  return CODE_LANGUAGES.find(l => l.id === langId);
}

export function getLevel(levelId: string): CodeLevelMeta | undefined {
  return CODE_LEVELS.find(l => l.id === levelId);
}

export function getLessonsForLevel(langId: string, levelId: CodeLevel): CodeLesson[] {
  return getLessons(langId).filter(l => l.level === levelId);
}
