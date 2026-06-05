import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "../cn";

interface CodeLine {
  color?: string;
  text: string;
}

interface CodeBlockProps {
  lines: CodeLine[];
  label?: string;
  className?: string;
  copyable?: boolean;
}

const DEFAULT_COLORS: Record<string, string> = {
  "#":  "#475569",
  git:  "#67E8F9",
  docker: "#67E8F9",
  make: "#C4B5FD",
  npm:  "#86EFAC",
  pip:  "#86EFAC",
  curl: "#FCD34D",
};

function autoColor(text: string): string {
  const first = text.trimStart().split(" ")[0];
  if (first.startsWith("#")) return "#475569";
  return DEFAULT_COLORS[first] ?? "#f1f5f9";
}

export function CodeBlock({ lines, label, className, copyable = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const plainText = lines.map((l) => l.text).join("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // clipboard not available
    }
  }

  return (
    <div
      className={cn("rounded-xl overflow-hidden border", className)}
      style={{ background: "rgba(0,0,0,0.55)", borderColor: "rgba(255,255,255,0.07)" }}
    >
      {(label || copyable) && (
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}
        >
          {label ? (
            <span className="text-xs text-slate-500 font-mono">{label}</span>
          ) : (
            <span />
          )}
          {copyable && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400/40 rounded px-1"
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      )}

      <div className="p-4 md:p-5 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed whitespace-pre" aria-label={label ?? "Code block"}>
          {lines.map((line, i) => (
            <span
              key={i}
              className="block"
              style={{ color: line.color ?? autoColor(line.text) }}
            >
              {line.text}
            </span>
          ))}
        </pre>
      </div>
    </div>
  );
}

// ── Inline code snippet ───────────────────────────────────────────────────
interface InlineCodeProps {
  children: React.ReactNode;
  color?: "cyan" | "violet" | "green" | "default";
}

export function InlineCode({ children, color = "default" }: InlineCodeProps) {
  const colorMap = {
    cyan:    "text-cyan-300 bg-cyan-950/40",
    violet:  "text-violet-300 bg-violet-950/40",
    green:   "text-emerald-300 bg-emerald-950/40",
    default: "text-slate-300 bg-slate-800/60",
  };
  return (
    <code
      className={cn(
        "font-mono text-[0.85em] px-1.5 py-0.5 rounded border border-white/[0.06]",
        colorMap[color]
      )}
    >
      {children}
    </code>
  );
}
