import React, { memo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Compass, Check, Copy, TrendingUp, Sparkles, HelpCircle } from 'lucide-react';

function FormattedAnalystAnswer({ text, className = '' }) {
  const [copied, setCopied] = useState(false);

  if (!text) return null;

  // Sanitize Windows shell encoding artifacts and normalize currency
  const sanitized = text
    .replace(/â‚¹/g, '₹')
    .replace(/\bRs\.?\s*/gi, '₹')
    .replace(/\bINR\s*/gi, '₹');

  // Domain Guardrail Warning Interception
  if (sanitized.includes('Scope Notice') || sanitized.startsWith('⚠️')) {
    const cleanText = sanitized.replace(/^⚠️\s*\*\*Scope Notice\*\*:\s*/i, '').trim();
    return (
      <div className={`p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3 shadow-2xs font-sans ${className}`}>
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300 inline-block font-sans">
              ⚠️ Domain Guardrail Notice
            </span>
          </div>
          <div className="leading-relaxed whitespace-pre-line font-medium text-slate-800">
            {cleanText}
          </div>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(sanitized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parseInline = (str) => {
    if (!str) return null;

    // Matches `code/tags`, **bold**, *italics*, and currency amounts
    const parts = str.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 bg-slate-100 text-emerald-800 rounded font-mono text-[11px] font-semibold border border-slate-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={idx} className="italic text-slate-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  // Parse lines into blocks (headings, paragraphs, lists, callouts, tables)
  const lines = sanitized.split('\n');
  const blocks = [];
  let currentList = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      continue;
    }

    // Markdown Headings (# H1, ## H2, ### H3, #### H4)
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      blocks.push({ type: 'heading', level, title });
      continue;
    }

    // Bullet points (* or -)
    const bulletMatch = trimmed.match(/^[*•-]\s+(.+)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'bullet') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push(bulletMatch[1].trim());
      continue;
    }

    // Numbered list (1. , 2. )
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      if (!currentList || currentList.type !== 'numbered') {
        if (currentList) blocks.push(currentList);
        currentList = { type: 'numbered', items: [] };
      }
      currentList.items.push({ num: numberedMatch[1], text: numberedMatch[2].trim() });
      continue;
    }

    // Blockquote (> )
    const quoteMatch = trimmed.match(/^>\s*(.+)$/);
    if (quoteMatch) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      blocks.push({ type: 'quote', text: quoteMatch[1].trim() });
      continue;
    }

    // Table row (| col1 | col2 |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (currentList) {
        blocks.push(currentList);
        currentList = null;
      }
      if (trimmed.includes('---')) continue; // skip markdown divider row
      const cells = trimmed.slice(1, -1).split('|').map((c) => c.trim());
      blocks.push({ type: 'table-row', cells });
      continue;
    }

    // Regular paragraph
    if (currentList) {
      blocks.push(currentList);
      currentList = null;
    }
    blocks.push({ type: 'paragraph', text: trimmed });
  }

  if (currentList) {
    blocks.push(currentList);
  }

  return (
    <div className={`relative space-y-3 text-xs text-slate-800 leading-relaxed font-sans bg-white/95 rounded-xl p-4 border border-slate-200/90 shadow-2xs ${className}`}>
      {/* Top Action Bar with Copy Button */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Institutional Research Intelligence</span>
        </div>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded hover:bg-slate-100 flex items-center gap-1 text-[10.5px] cursor-pointer"
          title="Copy response"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Render Parsed Blocks */}
      <div className="space-y-2.5">
        {blocks.map((block, idx) => {
          if (block.type === 'heading') {
            const isH1orH2 = block.level <= 2;
            const isVerdict = /verdict|recommendation|takeaway|summary/i.test(block.title);

            return (
              <div
                key={idx}
                className={`flex items-center gap-2 pt-2.5 pb-1 ${
                  isH1orH2
                    ? 'border-b border-slate-200 text-slate-900 font-black text-sm'
                    : 'text-slate-800 font-bold text-xs'
                }`}
              >
                <span
                  className={`w-1.5 rounded-full inline-block ${
                    isVerdict
                      ? 'bg-emerald-600 h-4'
                      : block.level === 3
                      ? 'bg-teal-600 h-3.5'
                      : 'bg-indigo-600 h-4'
                  }`}
                ></span>
                <span>{parseInline(block.title)}</span>
              </div>
            );
          }

          if (block.type === 'bullet') {
            return (
              <div key={idx} className="space-y-1.5 pl-1 my-1.5">
                {block.items.map((item, itemIdx) => {
                  const colonMatch = item.match(/^(?:\*\*(.*?)\*\*:?|([^*:]+):)\s*(.+)$/);
                  if (colonMatch) {
                    const label = colonMatch[1] || colonMatch[2];
                    const desc = colonMatch[3];
                    return (
                      <div key={itemIdx} className="flex items-start gap-2 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                        <div className="leading-relaxed">
                          <strong className="font-bold text-slate-900">{label.trim()}: </strong>
                          <span>{parseInline(desc)}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={itemIdx} className="flex items-start gap-2 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                      <div className="leading-relaxed">{parseInline(item)}</div>
                    </div>
                  );
                })}
              </div>
            );
          }

          if (block.type === 'numbered') {
            return (
              <div key={idx} className="space-y-1.5 pl-1 my-1.5">
                {block.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-2.5 text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {item.num}
                    </span>
                    <div className="leading-relaxed pt-0.5">{parseInline(item.text)}</div>
                  </div>
                ))}
              </div>
            );
          }

          if (block.type === 'quote') {
            return (
              <div
                key={idx}
                className="p-3 my-2 bg-gradient-to-r from-emerald-50/80 to-slate-50 border-l-4 border-emerald-600 rounded-r-lg text-slate-800 text-xs italic"
              >
                {parseInline(block.text)}
              </div>
            );
          }

          if (block.type === 'table-row') {
            return (
              <div key={idx} className="grid grid-cols-4 gap-2 py-1 px-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-mono">
                {block.cells.map((cell, cIdx) => (
                  <div key={cIdx} className="truncate">
                    {parseInline(cell)}
                  </div>
                ))}
              </div>
            );
          }

          // Paragraph
          return (
            <p key={idx} className="text-slate-700 leading-relaxed text-xs">
              {parseInline(block.text)}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default memo(FormattedAnalystAnswer);
