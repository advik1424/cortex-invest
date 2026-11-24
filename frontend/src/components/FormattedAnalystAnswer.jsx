import React, { memo } from 'react';
import { AlertTriangle } from 'lucide-react';

function FormattedAnalystAnswer({ text, className = '' }) {
  if (!text) return null;

  // Domain Guardrail Warning Interception
  if (text.includes('Scope Notice') || text.startsWith('⚠️')) {
    const cleanText = text.replace(/^⚠️\s*\*\*Scope Notice\*\*:\s*/i, '').trim();
    return (
      <div className={`p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3 shadow-2xs font-sans ${className}`}>
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
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

  const parseBold = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const lines = text.split('\n');
  return (
    <div className={`space-y-1.5 text-xs text-slate-800 leading-relaxed font-sans ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;
        
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="text-xs font-bold text-slate-900 uppercase tracking-wide mt-3 mb-1.5 flex items-center gap-1.5 text-teal-900 border-b border-slate-100 pb-1"
            >
              <span className="w-1.5 h-3 bg-[#0F766E] rounded-full inline-block"></span>
              <span>{trimmed.replace(/^###\s*/, '')}</span>
            </h4>
          );
        }
        
        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={idx} className="text-xs font-bold text-slate-800 mt-2 mb-0.5">
              {trimmed.replace(/^####\s*/, '')}
            </h5>
          );
        }
        
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-1.5 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5"></span>
              <span className="text-slate-700">{parseBold(trimmed.slice(2))}</span>
            </div>
          );
        }
        
        return (
          <p key={idx} className="my-1 text-slate-700 leading-relaxed font-normal">
            {parseBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default memo(FormattedAnalystAnswer);
