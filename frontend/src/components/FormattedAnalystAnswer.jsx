import React, { memo } from 'react';
import { AlertTriangle, CheckCircle2, Activity, Compass, ShieldAlert, TrendingUp } from 'lucide-react';

function FormattedAnalystAnswer({ text, className = '' }) {
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

  const parseBold = (str) => {
    if (!str) return null;
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

  // Parse lines into structured sections
  const lines = sanitized.split('\n');
  const sections = [];
  let currentSection = { id: 'intro', title: '', items: [] };

  const isHeading = (trimmed) => {
    // Matches "### 1. Direct Analyst Verdict", "1. Direct Analyst Verdict", "### Direct Analyst Verdict"
    const match = trimmed.match(/^(?:###\s*)?(?:([1-4])\.\s*)?(.+)$/i);
    if (!match) return null;
    const num = match[1];
    const title = match[2].trim();

    if (/direct analyst verdict/i.test(title)) {
      return { num: num || '1', title: '1. Direct Analyst Verdict', type: 'verdict' };
    }
    if (/fundamental & quantitative/i.test(title)) {
      return { num: num || '2', title: '2. Fundamental & Quantitative Analysis', type: 'fundamental' };
    }
    if (/key catalysts & risk/i.test(title)) {
      return { num: num || '3', title: '3. Key Catalysts & Risk Watch', type: 'catalysts' };
    }
    if (/strategic investment takeaway/i.test(title)) {
      return { num: num || '4', title: '4. Strategic Investment Takeaway', type: 'takeaway' };
    }
    if (trimmed.startsWith('### ')) {
      return { num: num || '', title: trimmed.replace(/^###\s*/, ''), type: 'custom' };
    }
    return null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const heading = isHeading(trimmed);
    if (heading) {
      if (currentSection.items.length > 0 || currentSection.title) {
        sections.push(currentSection);
      }
      currentSection = {
        id: heading.type,
        title: heading.title,
        type: heading.type,
        items: [],
      };
    } else {
      currentSection.items.push(trimmed);
    }
  }
  if (currentSection.items.length > 0 || currentSection.title) {
    sections.push(currentSection);
  }

  const renderItem = (item, idx) => {
    // Subheading check (e.g. "**Primary Macro & Sector Headwinds:**" or "**Key Board Resolutions & Capital Allocation:**")
    if (item.startsWith('**') && item.endsWith('**') && !item.includes('* ')) {
      return (
        <div key={idx} className="text-xs font-bold text-teal-900 mt-2.5 mb-1 pt-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-[#0F766E] rounded-full inline-block"></span>
          <span>{item.slice(2, -2)}</span>
        </div>
      );
    }

    // Bullet point check: "* **Title**: Description" or "* Description" or "- Description"
    if (item.startsWith('* ') || item.startsWith('- ')) {
      const bulletContent = item.replace(/^[*•-]\s*/, '').trim();

      // Check for colon separator with bold label: "**Title**: Description" or "Title: Description"
      const colonMatch = bulletContent.match(/^(?:\*\*(.*?)\*\*:?|([^*:]+):)\s*(.+)$/);
      if (colonMatch) {
        const label = colonMatch[1] || colonMatch[2];
        const desc = colonMatch[3];
        return (
          <div key={idx} className="flex items-start gap-2.5 my-1.5 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5"></span>
            <div className="text-slate-700 leading-relaxed text-xs">
              <strong className="font-bold text-slate-900">{label.trim()}: </strong>
              <span>{parseBold(desc)}</span>
            </div>
          </div>
        );
      }

      return (
        <div key={idx} className="flex items-start gap-2.5 my-1.5 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5"></span>
          <div className="text-slate-700 leading-relaxed text-xs">
            {parseBold(bulletContent)}
          </div>
        </div>
      );
    }

    // Regular paragraph
    return (
      <p key={idx} className="my-1 text-slate-700 leading-relaxed text-xs font-normal">
        {parseBold(item)}
      </p>
    );
  };

  return (
    <div className={`space-y-3 text-xs text-slate-800 leading-relaxed font-sans ${className}`}>
      {sections.map((sec, secIdx) => {
        // 1. Direct Analyst Verdict Card
        if (sec.type === 'verdict') {
          return (
            <div
              key={secIdx}
              className="p-3.5 rounded-xl bg-gradient-to-br from-teal-50/80 via-white to-slate-50 border border-teal-200 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-teal-100/80">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-[#0F766E] text-white px-2 py-0.5 rounded shadow-2xs">
                  <CheckCircle2 className="w-3 h-3" />
                  Direct Analyst Verdict
                </span>
                <span className="text-[10px] text-teal-800 font-semibold font-mono">
                  Institutional Resolution
                </span>
              </div>
              <div className="space-y-1.5 pt-0.5">
                {sec.items.map((item, i) => renderItem(item, i))}
              </div>
            </div>
          );
        }

        // 2. Fundamental & Quantitative Analysis
        if (sec.type === 'fundamental') {
          return (
            <div key={secIdx} className="space-y-1 pt-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200/80 pb-1.5 mt-2">
                <span className="w-1.5 h-3.5 bg-[#0F766E] rounded-full inline-block"></span>
                <span>{sec.title}</span>
              </h4>
              <div className="space-y-1 pl-0.5">
                {sec.items.map((item, i) => renderItem(item, i))}
              </div>
            </div>
          );
        }

        // 3. Key Catalysts & Risk Watch
        if (sec.type === 'catalysts') {
          return (
            <div key={secIdx} className="space-y-1 pt-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200/80 pb-1.5 mt-2">
                <span className="w-1.5 h-3.5 bg-amber-500 rounded-full inline-block"></span>
                <span>{sec.title}</span>
              </h4>
              <div className="space-y-1 pl-0.5">
                {sec.items.map((item, i) => renderItem(item, i))}
              </div>
            </div>
          );
        }

        // 4. Strategic Investment Takeaway Card
        if (sec.type === 'takeaway') {
          return (
            <div
              key={secIdx}
              className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 shadow-2xs space-y-2 mt-2"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                  <Compass className="w-3 h-3 text-teal-400" />
                  Strategic Takeaway
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Capital Allocation Strategy
                </span>
              </div>
              <div className="space-y-1.5 pt-0.5">
                {sec.items.map((item, i) => renderItem(item, i))}
              </div>
            </div>
          );
        }

        // Custom / fallback section
        return (
          <div key={secIdx} className="space-y-1.5">
            {sec.title && (
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2 border-b border-slate-200/80 pb-1 mt-2">
                <span className="w-1.5 h-3 bg-[#0F766E] rounded-full inline-block"></span>
                <span>{sec.title}</span>
              </h4>
            )}
            <div className="space-y-1">
              {sec.items.map((item, i) => renderItem(item, i))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(FormattedAnalystAnswer);
