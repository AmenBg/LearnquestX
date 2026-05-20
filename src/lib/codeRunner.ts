// Minimal multi-language "run" simulator for the coding lessons.
// JavaScript/TypeScript: actually executes in a sandboxed Function.
// Other languages: scans the source for common print-style calls and renders
// their evaluated arguments — sufficient for the challenge expectations in
// codeLessons.ts (which are all print-based).

export interface RunResult {
  output: string;
  error?: string;
}

const PRINT_PATTERNS: Record<string, RegExp[]> = {
  python:     [/print\s*\(([^)]*)\)/g],
  java:       [/System\.out\.println\s*\(([^)]*)\)/g, /System\.out\.print\s*\(([^)]*)\)/g],
  cpp:        [/std::cout\s*<<\s*([^;]+?)(?:\s*<<\s*(?:std::)?endl)?\s*;/g],
  csharp:     [/Console\.WriteLine\s*\(([^)]*)\)/g, /Console\.Write\s*\(([^)]*)\)/g],
  php:        [/echo\s+([^;]+);/g, /print\s*\(([^)]*)\)/g],
  swift:      [/print\s*\(([^)]*)\)/g],
  kotlin:     [/println\s*\(([^)]*)\)/g, /print\s*\(([^)]*)\)/g],
  sql:        [/SELECT\s+([^;]+?)(?:\s+FROM[^;]*)?;/gi],
};

function evalArg(raw: string): string {
  let s = raw.trim();
  // Strip surrounding parens
  while (s.startsWith('(') && s.endsWith(')')) s = s.slice(1, -1).trim();

  // Concatenated strings/identifiers joined by + → try to eval each piece
  if (s.includes('+') && !/^\s*-?\d+(\.\d+)?\s*$/.test(s)) {
    // Avoid splitting math like 7+5 → handle below.
    // If any segment is a quoted string, treat as concatenation.
    if (/["']/.test(s)) {
      const parts = s.split('+').map(p => evalArg(p));
      return parts.join('');
    }
  }

  // Quoted string
  const q = s.match(/^(['"])(.*)\1$/);
  if (q) return q[2];

  // Boolean / null
  if (/^(true|false|True|False|null|None)$/.test(s)) return s;

  // Pure number
  if (/^-?\d+(\.\d+)?$/.test(s)) return s;

  // Simple arithmetic of numeric literals only
  if (/^[\d\s+\-*/().]+$/.test(s)) {
    try {
      // eslint-disable-next-line no-new-func
      const v = Function(`"use strict"; return (${s});`)();
      if (typeof v === 'number') return String(v);
    } catch {}
  }

  // len([…])  →  count items
  const lenArr = s.match(/^len\s*\(\s*\[([^\]]*)\]\s*\)$/);
  if (lenArr) {
    const items = lenArr[1].split(',').map(x => x.trim()).filter(Boolean);
    return String(items.length);
  }

  // max([…])  → numeric max
  const maxArr = s.match(/^max\s*\(\s*\[([^\]]*)\]\s*\)$/);
  if (maxArr) {
    const nums = maxArr[1].split(',').map(x => parseFloat(x.trim())).filter(n => !isNaN(n));
    if (nums.length) return String(Math.max(...nums));
  }
  const maxArgs = s.match(/^Math\.max\s*\(([^)]+)\)$/);
  if (maxArgs) {
    const nums = maxArgs[1].split(',').map(x => parseFloat(x.trim())).filter(n => !isNaN(n));
    if (nums.length) return String(Math.max(...nums));
  }

  // arr[0] style — look up declared arrays in source not implemented; fall through.

  // Math.sqrt(n)
  const sqrt = s.match(/^(?:int\s*\()?\s*(?:math\.|Math\.)sqrt\s*\(\s*(\d+(?:\.\d+)?)\s*\)\)?$/);
  if (sqrt) return String(Math.floor(Math.sqrt(parseFloat(sqrt[1]))));

  // Object.keys({...}).length
  const okeys = s.match(/^Object\.keys\s*\(\s*\{([^}]*)\}\s*\)\.length$/);
  if (okeys) {
    const pairs = okeys[1].split(',').map(x => x.trim()).filter(Boolean);
    return String(pairs.length);
  }

  // Variable lookup not tracked — return raw
  return s;
}

function runJs(code: string): RunResult {
  const logs: string[] = [];
  const sandboxConsole = {
    log: (...args: unknown[]) => logs.push(args.map(a => formatValue(a)).join(' ')),
    error: (...args: unknown[]) => logs.push(args.map(a => formatValue(a)).join(' ')),
    warn: (...args: unknown[]) => logs.push(args.map(a => formatValue(a)).join(' ')),
  };
  // strip TS type annotations very loosely
  const js = code
    .replace(/:\s*\w+(\[\])?(\s*=)/g, '$2')      // foo: string =
    .replace(/<[^<>]+>/g, '');                    // generics

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('console', `"use strict";\n(async()=>{\n${js}\n})();`);
    fn(sandboxConsole);
    // Give microtasks a chance — synchronous return; async examples should resolve fast.
    return { output: logs.join('\n') };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { output: logs.join('\n'), error: msg };
  }
}

function formatValue(v: unknown): string {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v);
}

export function runCode(language: string, code: string): RunResult {
  // Strip line/block comments to make pattern scanning cleaner.
  const cleaned = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1')
    .replace(/(^|\s)#.*$/gm, '$1')
    .replace(/(^|\s)--.*$/gm, '$1');

  if (language === 'javascript' || language === 'typescript') {
    return runJs(cleaned);
  }

  const patterns = PRINT_PATTERNS[language];
  if (!patterns) {
    return { output: '', error: `No simulator for "${language}". Try matching the expected output.` };
  }

  const outputs: { index: number; text: string }[] = [];
  for (const pat of patterns) {
    let m: RegExpExecArray | null;
    const re = new RegExp(pat.source, pat.flags);
    while ((m = re.exec(cleaned)) !== null) {
      outputs.push({ index: m.index, text: evalArg(m[1] || '') });
    }
  }
  // Re-sort by index for source order
  const sorted = outputs
    .sort((a, b) => a.index - b.index)
    .map(o => o.text);

  return { output: sorted.join('\n') };
}

export function normalizeOutput(s: string): string {
  return s.replace(/\r\n/g, '\n').replace(/\s+$/g, '').trim();
}
