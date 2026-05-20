// Code learning data: 10 languages × 30 lessons each, generated from shared templates.

export type CodeLevel = 'beginner' | 'debutant' | 'intermediate' | 'expert';

export const CODE_LEVELS: { id: CodeLevel; label: string; sub: string; startIndex: number; xpMultiplier: number; color: string }[] = [
  { id: 'beginner',     label: 'أنا مبتدئ تماماً', sub: 'I am a total beginner',  startIndex: 0,  xpMultiplier: 1.0, color: '#10b981' },
  { id: 'debutant',     label: 'Débutant',          sub: 'Beginner (some basics)',  startIndex: 5,  xpMultiplier: 1.1, color: '#3b82f6' },
  { id: 'intermediate', label: 'متوسط',             sub: 'Intermediate',           startIndex: 12, xpMultiplier: 1.25, color: '#a855f7' },
  { id: 'expert',       label: 'كفء ومحترف',         sub: 'Competent & Pro',        startIndex: 20, xpMultiplier: 1.5,  color: '#ef4444' },
];

export interface CodeLanguage {
  id: string;
  name: string;
  icon: string;
  color: string;
  ext: string;
  comment: string;
  prismLang: string; // prismjs grammar key
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
  index: number;
  title: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  theory: string;
  example: string;
  challenge: string;
  starterCode: string;
  expectedOutput: string;
  hints: string[];
  solution: string;
  quiz: { question: string; options: string[]; correct: number; explanation: string };
  baseXp: number;
}

// Shared topic curriculum (30 topics, smoothly increasing difficulty)
const TOPICS = [
  'Introduction',           // 0
  'Variables',
  'Data Types',
  'Strings',
  'Numbers & Math',
  'Input & Output',         // 5
  'Booleans',
  'If / Else',
  'Comparison Operators',
  'Logical Operators',
  'For Loops',              // 10
  'While Loops',
  'Functions Basics',       // 12 ← intermediate start
  'Function Parameters',
  'Return Values',
  'Arrays / Lists',
  'Array Methods',
  'Iteration & Aggregation',
  'Objects / Dictionaries',
  'Object Methods',
  'Scope & Closures',       // 20 ← expert start
  'Error Handling',
  'Modules & Imports',
  'Classes (OOP)',
  'Inheritance',
  'File Handling',
  'Async & Promises',
  'APIs & HTTP',
  'Algorithms',
  'Final Project',          // 29
];

const DIFFICULTY: CodeLesson['difficulty'][] = TOPICS.map((_, i) =>
  i < 8 ? 'Easy' : i < 16 ? 'Medium' : i < 24 ? 'Hard' : 'Expert'
);

const BASE_XP: number[] = TOPICS.map((_, i) =>
  20 + Math.floor(i * 2.5) // 20 → 92
);

// --------- Per-language templated content for each topic ---------
// Each entry returns the lesson-specific fields. Kept compact but rich.

type LangContent = {
  print: (s: string) => string;
  variable: (name: string, value: string) => string;
  // Topic-specific code samples (challenge starter + solution + expected)
  examples: Record<number, { example: string; starter: string; solution: string; expected: string; challenge?: string }>;
};

function makePrint(lang: string) {
  switch (lang) {
    case 'python':     return (s: string) => `print(${s})`;
    case 'javascript':
    case 'typescript': return (s: string) => `console.log(${s})`;
    case 'java':       return (s: string) => `System.out.println(${s});`;
    case 'cpp':        return (s: string) => `std::cout << ${s} << std::endl;`;
    case 'csharp':     return (s: string) => `Console.WriteLine(${s});`;
    case 'php':        return (s: string) => `echo ${s};`;
    case 'swift':      return (s: string) => `print(${s})`;
    case 'kotlin':     return (s: string) => `println(${s})`;
    case 'sql':        return (s: string) => `SELECT ${s};`;
    default:           return (s: string) => `print(${s})`;
  }
}

// Big content table: built per language with helpers.
function buildLangContent(lang: CodeLanguage): LangContent {
  const p = makePrint(lang.id);
  const helloOut = 'Hello, World!';
  const E: LangContent['examples'] = {};

  // Helper to register
  const reg = (i: number, v: LangContent['examples'][number]) => { E[i] = v; };

  // 0 — Introduction → print Hello, World!
  reg(0, {
    example: p('"Hello, World!"'),
    starter: `${lang.comment} Print the text: Hello, World!\n`,
    solution: p('"Hello, World!"'),
    expected: helloOut,
  });

  // 1 — Variables → declare name and print it
  reg(1, {
    example: declareVar(lang, 'name', '"Ada"') + '\n' + p('name'),
    starter: `${lang.comment} Create a variable called name = "Ada" and print it\n`,
    solution: declareVar(lang, 'name', '"Ada"') + '\n' + p('name'),
    expected: 'Ada',
  });

  // 2 — Data Types → print number
  reg(2, {
    example: declareVar(lang, 'age', '25') + '\n' + p('age'),
    starter: `${lang.comment} Make an integer variable age = 42 and print it\n`,
    solution: declareVar(lang, 'age', '42') + '\n' + p('age'),
    expected: '42',
  });

  // 3 — Strings → concatenate
  reg(3, {
    example: p('"Hello, " + "World"'),
    starter: `${lang.comment} Print: Hello, Coder\n`,
    solution: p('"Hello, Coder"'),
    expected: 'Hello, Coder',
  });

  // 4 — Numbers & Math → 7 + 5
  reg(4, {
    example: p('7 + 5'),
    starter: `${lang.comment} Print the result of 12 * 4\n`,
    solution: p('12 * 4'),
    expected: '48',
  });

  // 5 — Input/Output → just print 2 lines
  reg(5, {
    example: p('"Line 1"') + '\n' + p('"Line 2"'),
    starter: `${lang.comment} Print two lines: "Hi" and "Bye"\n`,
    solution: p('"Hi"') + '\n' + p('"Bye"'),
    expected: 'Hi\nBye',
  });

  // 6 — Booleans
  reg(6, {
    example: p(boolTrue(lang)),
    starter: `${lang.comment} Print a boolean value: true\n`,
    solution: p(boolTrue(lang)),
    expected: lang.id === 'python' ? 'True' : 'true',
  });

  // 7 — If/Else
  reg(7, {
    example: ifBlock(lang, 'x > 0', p('"positive"')),
    starter: `${lang.comment} Print "big" if 10 > 5\n`,
    solution: ifBlock(lang, '10 > 5', p('"big"')),
    expected: 'big',
  });

  // 8 — Comparison
  reg(8, {
    example: p('5 > 3'),
    solution: p('5 > 3'),
    starter: `${lang.comment} Print whether 5 > 3\n`,
    expected: lang.id === 'python' ? 'True' : 'true',
  });

  // 9 — Logical
  reg(9, {
    example: p(`${boolTrue(lang)} ${andOp(lang)} ${boolFalse(lang)}`),
    solution: p(`${boolTrue(lang)} ${andOp(lang)} ${boolTrue(lang)}`),
    starter: `${lang.comment} Print result of true AND true\n`,
    expected: lang.id === 'python' ? 'True' : 'true',
  });

  // 10 — For loops (print 1..3)
  reg(10, {
    example: forLoop(lang, 1, 3, 'i', p('i')),
    solution: forLoop(lang, 1, 3, 'i', p('i')),
    starter: `${lang.comment} Print numbers 1, 2, 3 each on a new line using a for loop\n`,
    expected: '1\n2\n3',
  });

  // 11 — While loops
  reg(11, {
    example: whileLoop(lang),
    solution: whileLoop(lang),
    starter: `${lang.comment} Use a while loop to print 1, 2, 3\n`,
    expected: '1\n2\n3',
  });

  // 12 — Functions
  reg(12, {
    example: funcGreet(lang),
    solution: funcGreet(lang),
    starter: `${lang.comment} Define a function greet that prints "Hello!" and call it\n`,
    expected: 'Hello!',
  });

  // 13 — Function parameters
  reg(13, {
    example: funcGreetName(lang, 'World'),
    solution: funcGreetName(lang, 'Ada'),
    starter: `${lang.comment} Function greet(name) that prints "Hello, <name>!". Call with "Ada"\n`,
    expected: 'Hello, Ada!',
  });

  // 14 — Return values: sum
  reg(14, {
    example: funcSum(lang),
    solution: funcSum(lang),
    starter: `${lang.comment} Function add(a, b) that returns a+b. Print add(2, 3)\n`,
    expected: '5',
  });

  // 15 — Arrays / Lists
  reg(15, {
    example: arrayDecl(lang),
    solution: arrayDecl(lang),
    starter: `${lang.comment} Create an array [1, 2, 3] and print its first element\n`,
    expected: '1',
  });

  // 16 — Array methods (length)
  reg(16, {
    example: arrayLen(lang),
    solution: arrayLen(lang),
    starter: `${lang.comment} Print the length of [10, 20, 30]\n`,
    expected: '3',
  });

  // 17 — Iteration / aggregation: sum of 1..5
  reg(17, {
    example: sumLoop(lang),
    solution: sumLoop(lang),
    starter: `${lang.comment} Print the sum of numbers 1 to 5 (=15) using a loop\n`,
    expected: '15',
  });

  // 18 — Objects / Dicts
  reg(18, {
    example: objDecl(lang),
    solution: objDecl(lang),
    starter: `${lang.comment} Create an object with name="Ada" age=36, print name\n`,
    expected: 'Ada',
  });

  // 19 — Object methods
  reg(19, {
    example: objMethod(lang),
    solution: objMethod(lang),
    starter: `${lang.comment} Print the number of keys in {a:1, b:2, c:3}\n`,
    expected: '3',
  });

  // 20 — Scope & closures
  reg(20, {
    example: closureExample(lang),
    solution: closureExample(lang),
    starter: `${lang.comment} Create a counter that increments — print 1 then 2\n`,
    expected: '1\n2',
  });

  // 21 — Error handling
  reg(21, {
    example: tryExample(lang),
    solution: tryExample(lang),
    starter: `${lang.comment} Use try/catch to print "caught" when error happens\n`,
    expected: 'caught',
  });

  // 22 — Modules / imports (just demonstrate)
  reg(22, {
    example: importExample(lang),
    solution: importExample(lang),
    starter: `${lang.comment} Use a built-in math function to print sqrt(16) = 4\n`,
    expected: '4',
  });

  // 23 — Classes
  reg(23, {
    example: classExample(lang),
    solution: classExample(lang),
    starter: `${lang.comment} Define a class Dog with bark() printing "Woof!" then call it\n`,
    expected: 'Woof!',
  });

  // 24 — Inheritance
  reg(24, {
    example: inheritExample(lang),
    solution: inheritExample(lang),
    starter: `${lang.comment} Make class Puppy extend Dog, override bark to print "Yip!"\n`,
    expected: 'Yip!',
  });

  // 25 — File handling (simulated)
  reg(25, {
    example: `${lang.comment} (simulated) write 'hi' to a file, then print it back\n` + p('"hi"'),
    solution: p('"hi"'),
    starter: `${lang.comment} Pretend you read a file containing "hi". Print it.\n`,
    expected: 'hi',
  });

  // 26 — Async
  reg(26, {
    example: asyncExample(lang),
    solution: asyncExample(lang),
    starter: `${lang.comment} Define an async task that resolves with "done" and print it\n`,
    expected: 'done',
  });

  // 27 — APIs (simulated)
  reg(27, {
    example: `${lang.comment} Simulate fetching status from an API\n` + p('"200 OK"'),
    solution: p('"200 OK"'),
    starter: `${lang.comment} Print the simulated API response: 200 OK\n`,
    expected: '200 OK',
  });

  // 28 — Algorithms (find max)
  reg(28, {
    example: maxExample(lang),
    solution: maxExample(lang),
    starter: `${lang.comment} Find and print the largest of [3, 7, 2, 9, 4]\n`,
    expected: '9',
  });

  // 29 — Final Project
  reg(29, {
    example: projectExample(lang),
    solution: projectExample(lang),
    starter: `${lang.comment} Mini Project: print FizzBuzz for n=5 (1,2,Fizz,4,Buzz)\n`,
    expected: '1\n2\nFizz\n4\nBuzz',
  });

  return { print: p, variable: (n, v) => declareVar(lang, n, v), examples: E };
}

// ---------- code snippet helpers (deliberately readable, not strictly executable for all langs) ----------

function declareVar(lang: CodeLanguage, name: string, value: string): string {
  switch (lang.id) {
    case 'python': return `${name} = ${value}`;
    case 'javascript': return `let ${name} = ${value};`;
    case 'typescript': return `let ${name} = ${value};`;
    case 'java': return `var ${name} = ${value};`;
    case 'cpp': return `auto ${name} = ${value};`;
    case 'csharp': return `var ${name} = ${value};`;
    case 'php': return `$${name} = ${value};`;
    case 'swift': return `let ${name} = ${value}`;
    case 'kotlin': return `val ${name} = ${value}`;
    case 'sql': return `-- variable ${name} = ${value}`;
    default: return `${name} = ${value}`;
  }
}

function boolTrue(l: CodeLanguage) { return l.id === 'python' ? 'True' : 'true'; }
function boolFalse(l: CodeLanguage) { return l.id === 'python' ? 'False' : 'false'; }
function andOp(l: CodeLanguage) { return l.id === 'python' ? 'and' : '&&'; }

function ifBlock(l: CodeLanguage, cond: string, body: string): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `if ${cond}:\n    ${body}`;
  if (l.id === 'sql') return `${p(`CASE WHEN ${cond} THEN 'big' END`)}`;
  return `if (${cond}) { ${body} }`;
}

function forLoop(l: CodeLanguage, from: number, to: number, v: string, body: string): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `for ${v} in range(${from}, ${to + 1}):\n    ${body}`;
  if (l.id === 'sql') return `${p('1')}\n${p('2')}\n${p('3')}`;
  return `for (let ${v} = ${from}; ${v} <= ${to}; ${v}++) { ${body} }`;
}

function whileLoop(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `i = 1\nwhile i <= 3:\n    ${p('i')}\n    i += 1`;
  if (l.id === 'sql') return `${p('1')}\n${p('2')}\n${p('3')}`;
  return `let i = 1;\nwhile (i <= 3) { ${p('i')}; i++; }`;
}

function funcGreet(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `def greet():\n    ${p('"Hello!"')}\ngreet()`;
  if (l.id === 'sql') return p('"Hello!"');
  return `function greet() { ${p('"Hello!"')}; }\ngreet();`;
}

function funcGreetName(l: CodeLanguage, name: string): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `def greet(n):\n    ${p('"Hello, " + n + "!"')}\ngreet("${name}")`;
  if (l.id === 'sql') return p(`"Hello, ${name}!"`);
  return `function greet(n) { ${p('"Hello, " + n + "!"')}; }\ngreet("${name}");`;
}

function funcSum(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `def add(a, b):\n    return a + b\n${p('add(2, 3)')}`;
  if (l.id === 'sql') return p('2 + 3');
  return `function add(a, b) { return a + b; }\n${p('add(2, 3)')};`;
}

function arrayDecl(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `arr = [1, 2, 3]\n${p('arr[0]')}`;
  if (l.id === 'sql') return p('1');
  return `const arr = [1, 2, 3];\n${p('arr[0]')};`;
}

function arrayLen(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `${p('len([10, 20, 30])')}`;
  if (l.id === 'sql') return p('3');
  return `${p('[10, 20, 30].length')};`;
}

function sumLoop(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `s = 0\nfor i in range(1, 6):\n    s += i\n${p('s')}`;
  if (l.id === 'sql') return p('15');
  return `let s = 0;\nfor (let i = 1; i <= 5; i++) s += i;\n${p('s')};`;
}

function objDecl(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `user = {"name": "Ada", "age": 36}\n${p('user["name"]')}`;
  if (l.id === 'sql') return p('"Ada"');
  return `const user = { name: "Ada", age: 36 };\n${p('user.name')};`;
}

function objMethod(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `d = {"a":1,"b":2,"c":3}\n${p('len(d)')}`;
  if (l.id === 'sql') return p('3');
  return `const d = { a:1, b:2, c:3 };\n${p('Object.keys(d).length')};`;
}

function closureExample(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `def make():\n    c = 0\n    def inc():\n        nonlocal c\n        c += 1\n        return c\n    return inc\nf = make()\n${p('f()')}\n${p('f()')}`;
  if (l.id === 'sql') return `${p('1')}\n${p('2')}`;
  return `function make(){ let c=0; return ()=>++c; }\nconst f = make();\n${p('f()')};\n${p('f()')};`;
}

function tryExample(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `try:\n    1/0\nexcept:\n    ${p('"caught"')}`;
  if (l.id === 'sql') return p('"caught"');
  return `try { throw new Error("x"); } catch(e) { ${p('"caught"')}; }`;
}

function importExample(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `import math\n${p('int(math.sqrt(16))')}`;
  if (l.id === 'sql') return p('4');
  return `${p('Math.sqrt(16)')};`;
}

function classExample(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `class Dog:\n    def bark(self):\n        ${p('"Woof!"')}\nDog().bark()`;
  if (l.id === 'sql') return p('"Woof!"');
  return `class Dog { bark(){ ${p('"Woof!"')}; } }\nnew Dog().bark();`;
}

function inheritExample(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `class Dog:\n    def bark(self):\n        ${p('"Woof!"')}\nclass Puppy(Dog):\n    def bark(self):\n        ${p('"Yip!"')}\nPuppy().bark()`;
  if (l.id === 'sql') return p('"Yip!"');
  return `class Dog { bark(){${p('"Woof!"')};} }\nclass Puppy extends Dog { bark(){${p('"Yip!"')};} }\nnew Puppy().bark();`;
}

function asyncExample(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `import asyncio\nasync def t():\n    return "done"\n${p('asyncio.run(t())')}`;
  if (l.id === 'sql') return p('"done"');
  return `async function t(){ return "done"; }\nt().then(v=>${p('v')});`;
}

function maxExample(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `${p('max([3, 7, 2, 9, 4])')}`;
  if (l.id === 'sql') return p('9');
  return `${p('Math.max(3,7,2,9,4)')};`;
}

function projectExample(l: CodeLanguage): string {
  const p = makePrint(l.id);
  if (l.id === 'python') return `for i in range(1, 6):\n    if i % 15 == 0: ${p('"FizzBuzz"')}\n    elif i % 3 == 0: ${p('"Fizz"')}\n    elif i % 5 == 0: ${p('"Buzz"')}\n    else: ${p('i')}`;
  if (l.id === 'sql') return `${p('1')}\n${p('2')}\n${p('"Fizz"')}\n${p('4')}\n${p('"Buzz"')}`;
  return `for(let i=1;i<=5;i++){\n  if(i%15===0) ${p('"FizzBuzz"')};\n  else if(i%3===0) ${p('"Fizz"')};\n  else if(i%5===0) ${p('"Buzz"')};\n  else ${p('i')};\n}`;
}

// ----------- Theory & quizzes per topic (shared across languages with light specialization) -----------

const THEORY: { title: string; theory: string; challenge: string; hints: string[]; quiz: CodeLesson['quiz'] }[] = [
  { title: 'Introduction', theory: 'Welcome! Every program needs a way to display output. The "print" / "console.log" / "println" command shows text on the screen — the most fundamental tool in coding.', challenge: 'Print the classic first message: Hello, World!', hints: ['Use the print function for your language.', 'Wrap the text in double quotes.'],
    quiz: { question: 'Why is "Hello, World!" the traditional first program?', options: ['It tests output works', 'It is required by law', 'It compiles faster', 'No reason'], correct: 0, explanation: 'It is a minimal program that verifies your toolchain prints output correctly.' } },
  { title: 'Variables', theory: 'A variable is a named container that holds a value. You can change what is inside and reuse the name throughout the program.', challenge: 'Create a variable name = "Ada" and print it.', hints: ['Assign with =', 'Then call print on the variable name (no quotes around the variable)'],
    quiz: { question: 'A variable is best described as…', options: ['A fixed constant', 'A named storage for a value', 'A loop', 'A function'], correct: 1, explanation: 'Variables are labeled storage you can read and update.' } },
  { title: 'Data Types', theory: 'Values have types: integers, decimals, text (strings), and booleans. The type controls what operations are valid.', challenge: 'Make an integer variable age = 42 and print it.', hints: ['Integers do not need quotes.', 'Print the variable directly.'],
    quiz: { question: 'Which is an integer?', options: ['"42"', '42.5', '42', 'true'], correct: 2, explanation: '42 is a whole number.' } },
  { title: 'Strings', theory: 'Strings are sequences of characters wrapped in quotes. You can combine them with the + operator.', challenge: 'Print exactly: Hello, Coder', hints: ['Use a single print with the full text.', 'Mind the comma and space.'],
    quiz: { question: 'Which is a string?', options: ['42', 'true', '"hi"', 'null'], correct: 2, explanation: 'A string is a sequence of characters in quotes.' } },
  { title: 'Numbers & Math', theory: 'Numbers support +, -, *, /. Operators follow standard precedence — multiplication before addition.', challenge: 'Print the result of 12 * 4.', hints: ['No quotes — print the arithmetic expression.'],
    quiz: { question: 'What does 12 * 4 equal?', options: ['46', '48', '52', '44'], correct: 1, explanation: '12 × 4 = 48.' } },
  { title: 'Input & Output', theory: 'Output sends data to the user. Each call typically prints on its own line. Multiple prints stack vertically.', challenge: 'Print two separate lines: Hi and Bye.', hints: ['Call print twice.'],
    quiz: { question: 'What does each print call typically end with?', options: ['Comma', 'Newline', 'Nothing', 'Tab'], correct: 1, explanation: 'Most print commands append a newline by default.' } },
  { title: 'Booleans', theory: 'Booleans hold true or false. They are the foundation of decisions in your program.', challenge: 'Print a boolean value: true.', hints: ['No quotes around boolean literals.'],
    quiz: { question: 'How many values can a boolean have?', options: ['1', '2', '3', 'Unlimited'], correct: 1, explanation: 'Only true or false.' } },
  { title: 'If / Else', theory: 'If statements run code only when a condition is true. Else covers the alternative.', challenge: 'Print "big" if 10 > 5.', hints: ['Wrap your print inside an if condition.'],
    quiz: { question: 'Else runs when…', options: ['The condition is true', 'Always', 'The condition is false', 'Never'], correct: 2, explanation: 'Else handles the false branch.' } },
  { title: 'Comparison Operators', theory: '> < >= <= == != return boolean results. They are how you ask the program questions.', challenge: 'Print whether 5 > 3.', hints: ['Print the comparison expression directly.'],
    quiz: { question: 'Which operator means "not equal"?', options: ['==', '=', '!=', '<>'], correct: 2, explanation: '!= is the standard inequality operator in most languages.' } },
  { title: 'Logical Operators', theory: 'AND, OR, NOT combine booleans. AND is only true when both sides are true.', challenge: 'Print the result of true AND true.', hints: ['Use && (or "and" in Python).'],
    quiz: { question: 'true AND false equals…', options: ['true', 'false', 'error', 'null'], correct: 1, explanation: 'AND requires both sides true.' } },
  { title: 'For Loops', theory: 'For loops repeat a block a known number of times — perfect for iterating from N to M.', challenge: 'Print numbers 1, 2, 3 — each on its own line.', hints: ['Use a for loop from 1 to 3.', 'Print the loop variable each iteration.'],
    quiz: { question: 'A for loop is best for…', options: ['Unknown counts', 'Known counts', 'Async work', 'Errors'], correct: 1, explanation: 'For loops shine when the number of iterations is known.' } },
  { title: 'While Loops', theory: 'While loops repeat as long as a condition stays true. Use them when you do not know how many iterations you need.', challenge: 'Use a while loop to print 1, 2, 3.', hints: ['Start i at 1, stop when i > 3.', 'Increment i each iteration.'],
    quiz: { question: 'A while loop stops when…', options: ['The condition is true', 'It iterates 10 times', 'The condition is false', 'Always after 1 run'], correct: 2, explanation: 'While runs as long as condition is true.' } },
  { title: 'Functions Basics', theory: 'Functions are reusable blocks of code. Define once, call many times — the foundation of clean programs.', challenge: 'Define greet() that prints "Hello!" and call it.', hints: ['Define the function, then call it on the next line.'],
    quiz: { question: 'Functions help you…', options: ['Repeat code', 'Reuse logic', 'Slow things down', 'Crash often'], correct: 1, explanation: 'They eliminate duplication and improve clarity.' } },
  { title: 'Function Parameters', theory: 'Parameters let functions accept inputs. Same logic, different data — generic and powerful.', challenge: 'Function greet(name) that prints "Hello, <name>!". Call with "Ada".', hints: ['Concatenate the parameter into the message.'],
    quiz: { question: 'Parameters are…', options: ['Variables for inputs', 'Outputs only', 'Errors', 'Loops'], correct: 0, explanation: 'They receive values when a function is called.' } },
  { title: 'Return Values', theory: 'Functions can return a value so callers can use the result. This enables composition.', challenge: 'Function add(a, b) returns a+b. Print add(2, 3).', hints: ['Use the return keyword.', 'Print the result of calling add.'],
    quiz: { question: 'Return values let you…', options: ['Print to screen', 'Pass data back to the caller', 'Stop the program', 'Loop forever'], correct: 1, explanation: 'Return is how a function communicates back its result.' } },
  { title: 'Arrays / Lists', theory: 'Arrays hold ordered collections of values. Access by index, starting from 0.', challenge: 'Create [1, 2, 3] and print its first element.', hints: ['Indexing starts at 0.'],
    quiz: { question: 'In most languages, the first index is…', options: ['0', '1', '-1', 'a'], correct: 0, explanation: 'Zero-indexed arrays are standard.' } },
  { title: 'Array Methods', theory: 'Built-in methods like length/size and push/append make arrays powerful.', challenge: 'Print the length of [10, 20, 30].', hints: ['Use len() in Python or .length in JS.'],
    quiz: { question: 'Length of [10, 20, 30] is…', options: ['2', '3', '4', '0'], correct: 1, explanation: 'Three elements means length 3.' } },
  { title: 'Iteration & Aggregation', theory: 'Combine loops with arrays to compute totals, averages, max — the backbone of data work.', challenge: 'Print the sum of numbers 1..5 using a loop.', hints: ['Accumulate into a running total.', 'Initialize total to 0.'],
    quiz: { question: 'Sum of 1+2+3+4+5 is…', options: ['10', '15', '20', '25'], correct: 1, explanation: '1+2+3+4+5 = 15.' } },
  { title: 'Objects / Dictionaries', theory: 'Objects map keys to values — great for representing entities like a user or product.', challenge: 'Object with name="Ada" age=36 — print name.', hints: ['Access by key.'],
    quiz: { question: 'Objects map…', options: ['Numbers to numbers', 'Keys to values', 'Loops to functions', 'Files to strings'], correct: 1, explanation: 'Key-value mapping is the defining structure.' } },
  { title: 'Object Methods', theory: 'You can inspect the number of keys, list them, or iterate. Powerful for dynamic structures.', challenge: 'Print the number of keys in {a:1, b:2, c:3}.', hints: ['Use Object.keys or len().'],
    quiz: { question: 'Number of keys in {a:1,b:2,c:3} is…', options: ['2', '3', '4', '1'], correct: 1, explanation: 'Three keys.' } },
  { title: 'Scope & Closures', theory: 'Variables defined inside a function are private. A closure captures outer variables for later use — basis of advanced patterns.', challenge: 'Create a counter that prints 1 then 2.', hints: ['Inner function increments outer variable.'],
    quiz: { question: 'A closure is…', options: ['A loop', 'A function that captures its outer scope', 'An error', 'A class'], correct: 1, explanation: 'Closures retain references to enclosing variables.' } },
  { title: 'Error Handling', theory: 'try / catch (except) lets your program recover from errors gracefully instead of crashing.', challenge: 'Use try/catch to print "caught" on error.', hints: ['Throw or trigger an error inside try.'],
    quiz: { question: 'try/catch is used to…', options: ['Speed code', 'Handle errors gracefully', 'Define variables', 'Print fast'], correct: 1, explanation: 'It separates normal flow from error recovery.' } },
  { title: 'Modules & Imports', theory: 'Import lets you reuse code from standard libraries or other files — the heart of code organization.', challenge: 'Use a built-in math function: print sqrt(16) = 4.', hints: ['Import math (Python) or Math.sqrt (JS).'],
    quiz: { question: 'Imports help you…', options: ['Speed loops', 'Reuse existing code', 'Throw errors', 'Print faster'], correct: 1, explanation: 'They bring functions from libraries into your file.' } },
  { title: 'Classes (OOP)', theory: 'A class is a blueprint for objects — bundling data (fields) and behavior (methods) together.', challenge: 'Class Dog with bark() printing "Woof!" — call it.', hints: ['Define the class then instantiate it.'],
    quiz: { question: 'A class is…', options: ['A function', 'A blueprint for objects', 'A variable', 'A file'], correct: 1, explanation: 'Classes define structure and behavior for objects.' } },
  { title: 'Inheritance', theory: 'A subclass inherits from a parent and can override behavior — enabling code reuse via hierarchy.', challenge: 'Class Puppy extends Dog, override bark to print "Yip!".', hints: ['Use extends / inherit syntax.', 'Override the method in the child.'],
    quiz: { question: 'Inheritance lets a class…', options: ['Run faster', 'Reuse and extend another class', 'Throw errors', 'Be private'], correct: 1, explanation: 'Children inherit parent members and can override them.' } },
  { title: 'File Handling', theory: 'Reading and writing files lets your program persist data between runs. Always close (or use with/auto-close) the file.', challenge: 'Pretend you read a file containing "hi". Print it.', hints: ['Just print the string for this simulation.'],
    quiz: { question: 'Why close a file after use?', options: ['Free resources', 'Make it faster', 'Encrypt data', 'No reason'], correct: 0, explanation: 'Open file handles consume OS resources.' } },
  { title: 'Async & Promises', theory: 'Async lets your code do other work while waiting on slow tasks (network, disk). Promises represent future values.', challenge: 'Define an async task that resolves with "done" and print it.', hints: ['Use async/await or Promise.then.'],
    quiz: { question: 'Async code is best for…', options: ['Pure math', 'Waiting on IO', 'Simple prints', 'Constants'], correct: 1, explanation: 'IO-bound work benefits the most.' } },
  { title: 'APIs & HTTP', theory: 'APIs let your program talk to other services over the network using HTTP. JSON is the standard data format.', challenge: 'Print the simulated API response: 200 OK.', hints: ['Just print the success string for this exercise.'],
    quiz: { question: 'HTTP 200 means…', options: ['Error', 'Success', 'Not found', 'Server crashed'], correct: 1, explanation: '2xx codes indicate success.' } },
  { title: 'Algorithms', theory: 'Algorithms are step-by-step procedures. Finding a max, sorting, and searching are foundational patterns.', challenge: 'Find and print the largest of [3, 7, 2, 9, 4].', hints: ['Use a built-in max function or loop comparing values.'],
    quiz: { question: 'Largest of [3,7,2,9,4] is…', options: ['7', '9', '4', '3'], correct: 1, explanation: '9 is the largest.' } },
  { title: 'Final Project', theory: 'FizzBuzz — the classic interview warmup. Combine loops, conditions, and modulo into a polished mini-project.', challenge: 'Print FizzBuzz from 1 to 5: 1, 2, Fizz, 4, Buzz.', hints: ['Check %15 first, then %3, then %5, else the number.', 'Print each result on its own line.'],
    quiz: { question: 'In FizzBuzz, what prints for 15?', options: ['Fizz', 'Buzz', 'FizzBuzz', '15'], correct: 2, explanation: '15 is divisible by both 3 and 5, so FizzBuzz.' } },
];

// Public: build all lessons for a language
export function getLessons(langId: string): CodeLesson[] {
  const lang = CODE_LANGUAGES.find(l => l.id === langId);
  if (!lang) return [];
  const content = buildLangContent(lang);
  return TOPICS.map((topic, i) => {
    const t = THEORY[i];
    const c = content.examples[i] || { example: '', starter: '', solution: '', expected: '' };
    return {
      index: i,
      title: `${i + 1}. ${t.title}`,
      topic: t.title,
      difficulty: DIFFICULTY[i],
      theory: t.theory,
      example: c.example,
      challenge: t.challenge,
      starterCode: c.starter,
      expectedOutput: c.expected,
      hints: t.hints,
      solution: c.solution,
      quiz: t.quiz,
      baseXp: BASE_XP[i],
    };
  });
}

export function getLanguage(langId: string): CodeLanguage | undefined {
  return CODE_LANGUAGES.find(l => l.id === langId);
}

export function getLevel(levelId: string) {
  return CODE_LEVELS.find(l => l.id === levelId);
}
