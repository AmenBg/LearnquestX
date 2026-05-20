import { useMemo } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-tomorrow.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
  language: string; // prism grammar key
  minHeight?: number;
}

export default function CodeEditor({ value, onChange, language, minHeight = 380 }: Props) {
  const grammar = useMemo(() => Prism.languages[language] || Prism.languages.javascript, [language]);

  // Compute line numbers from value
  const lines = value.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1);

  return (
    <div
      className="relative rounded-xl border border-border bg-[#1e1e2e] overflow-hidden shadow-[0_0_30px_rgba(130,255,150,0.08)]"
      style={{ minHeight }}
    >
      {/* Top bar: traffic-light buttons + language */}
      <div className="flex items-center justify-between border-b border-border/60 bg-[#181826] px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <span className="text-xs font-mono text-muted-foreground uppercase">{language}</span>
      </div>

      <div className="flex" style={{ minHeight: minHeight - 40 }}>
        {/* Line numbers */}
        <div
          className="select-none px-3 py-3 text-right font-mono text-xs text-muted-foreground/60 border-r border-border/40 bg-[#1a1a2a]"
          style={{ minWidth: 44 }}
        >
          {lineNumbers.map(n => (
            <div key={n} style={{ lineHeight: '1.5rem' }}>{n}</div>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <Editor
            value={value}
            onValueChange={onChange}
            highlight={code => Prism.highlight(code, grammar, language)}
            padding={12}
            tabSize={2}
            insertSpaces
            textareaClassName="!outline-none"
            style={{
              fontFamily: '"Fira Code", "JetBrains Mono", ui-monospace, monospace',
              fontSize: 14,
              lineHeight: '1.5rem',
              minHeight: minHeight - 40,
              color: '#f8f8f2',
              caretColor: '#10b981',
            }}
          />
        </div>
      </div>
    </div>
  );
}
