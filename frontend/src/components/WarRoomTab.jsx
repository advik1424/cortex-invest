import React, { useState, useEffect } from 'react';
import { debateApi, marketApi } from '../services/api';
import { CheckCircle2, XCircle, ShieldCheck, Sparkles, Loader2, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

export default function WarRoomTab({ ticker, setTicker }) {
  const [horizon, setHorizon] = useState('Medium-term (6-12M)');
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingDebate, setLoadingDebate] = useState(false);
  const [debateResult, setDebateResult] = useState(null);

  const fetchQuote = async (sym) => {
    setLoadingQuote(true);
    try {
      const res = await marketApi.getQuote(sym);
      setQuote(res.data);
    } catch (e) {
      console.error('Failed to fetch quote:', e);
    } finally {
      setLoadingQuote(false);
    }
  };

  useEffect(() => {
    fetchQuote(ticker);
  }, [ticker]);

  const handleRunAudit = async (e) => {
    if (e) e.preventDefault();
    setLoadingDebate(true);
    try {
      const res = await debateApi.analyze(ticker, horizon, `CMP: ${quote?.currentPrice}`);
      setDebateResult(res.data);
    } catch (err) {
      console.error('Debate API error:', err);
    } finally {
      setLoadingDebate(false);
    }
  };

  const getVerdictStyle = (verdict) => {
    if (!verdict) return 'bg-[#00D09C]/15 text-[#00D09C] border-[#00D09C]/30';
    if (verdict.includes('BUY') || verdict.includes('ACCUMULATE')) {
      return 'bg-[#00D09C]/15 text-[#00D09C] border-[#00D09C]/40';
    }
    if (verdict.includes('AVOID') || verdict.includes('RISK')) {
      return 'bg-[#EB5757]/15 text-[#EB5757] border-[#EB5757]/40';
    }
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Screener.in + Groww Style Company Header */}
      {quote && (
        <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#262A34]">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {quote.companyName || quote.symbol}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-[#232732] text-zinc-300 border border-[#2D3342]">
                  {quote.symbol} • {quote.exchange}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                Sector: {quote.sector} • Currency: {quote.currency}
              </p>
            </div>

            {/* Live Price Block */}
            <div className="flex items-baseline lg:items-end flex-col">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ₹{quote.currentPrice?.toFixed(2)}
              </div>
              <div className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${quote.change >= 0 ? 'text-[#00D09C]' : 'text-[#EB5757]'}`}>
                {quote.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {quote.change >= 0 ? '+' : ''}{quote.change?.toFixed(2)} ({quote.change >= 0 ? '+' : ''}{quote.changePercent?.toFixed(2)}%)
              </div>
            </div>
          </div>

          {/* 2. Screener.in Signature Key Ratios Grid */}
          <div className="pt-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
              Key Fundamental Ratios (Screener.in Model)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <div className="bg-[#12141A] border border-[#232732] rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block font-medium">Market Cap</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{quote.marketCap}</span>
              </div>
              <div className="bg-[#12141A] border border-[#232732] rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block font-medium">Current Price</span>
                <span className="text-sm font-bold text-white mt-0.5 block">₹{quote.currentPrice?.toFixed(1)}</span>
              </div>
              <div className="bg-[#12141A] border border-[#232732] rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block font-medium">High / Low</span>
                <span className="text-sm font-bold text-white mt-0.5 block">₹{quote.fiftyTwoWeekHigh?.toFixed(0)} / {quote.fiftyTwoWeekLow?.toFixed(0)}</span>
              </div>
              <div className="bg-[#12141A] border border-[#232732] rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block font-medium">Stock P/E</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{quote.peRatio}</span>
              </div>
              <div className="bg-[#12141A] border border-[#232732] rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block font-medium">Book Value</span>
                <span className="text-sm font-bold text-white mt-0.5 block">₹{quote.bookValue?.toFixed(0)}</span>
              </div>
              <div className="bg-[#12141A] border border-[#232732] rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block font-medium">ROCE</span>
                <span className="text-sm font-bold text-[#00D09C] mt-0.5 block">{quote.roce}%</span>
              </div>
              <div className="bg-[#12141A] border border-[#232732] rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block font-medium">ROE</span>
                <span className="text-sm font-bold text-[#00D09C] mt-0.5 block">{quote.roe}%</span>
              </div>
              <div className="bg-[#12141A] border border-[#232732] rounded-xl p-3">
                <span className="text-[11px] text-zinc-400 block font-medium">Debt to Equity</span>
                <span className={`text-sm font-bold mt-0.5 block ${quote.debtToEquity > 1.5 ? 'text-[#EB5757]' : 'text-zinc-200'}`}>
                  {quote.debtToEquity}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Action Audit Trigger Bar (Groww style) */}
      <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D09C]/10 border border-[#00D09C]/20 flex items-center justify-center text-[#00D09C]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">FinAgent Research Committee Audit</h4>
            <p className="text-xs text-zinc-400">
              Autonomous multi-agent consensus: Bull Thesis vs Bear Forensic Audit vs Chief Risk Officer.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={horizon}
            onChange={(e) => setHorizon(e.target.value)}
            className="bg-[#12141A] border border-[#2B313C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option>Short-term Swing (1-3M)</option>
            <option>Medium-term (6-12M)</option>
            <option>Long-term Wealth (2-5Y)</option>
          </select>
          <button
            onClick={handleRunAudit}
            disabled={loadingDebate}
            className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#00D09C] hover:bg-[#00B789] text-[#0F1015] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingDebate ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing Ratios & News...</span>
              </>
            ) : (
              <span>Run Committee Audit</span>
            )}
          </button>
        </div>
      </div>

      {/* 4. Screener.in Signature "PROS & CONS" Box + CRO Verdict */}
      {debateResult && (
        <div className="space-y-6">
          {/* CRO Verdict Summary Card */}
          <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#12141A] border border-[#2B313C] flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">{debateResult.convictionScore}</span>
                <span className="text-[9px] text-zinc-400 font-semibold uppercase">Score / 100</span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider block">
                  Consensus Action Verdict
                </span>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border mt-1 ${getVerdictStyle(debateResult.verdict)}`}>
                  {debateResult.verdict}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right max-w-md">
              <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider block">
                Chief Risk Officer Capital Allocation
              </span>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                {debateResult.riskOfficerSynthesis}
              </p>
            </div>
          </div>

          {/* Screener.in Style Dual PROS & CONS Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PROS (Bull Growth Analyst) */}
            <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 text-sm font-bold text-[#00D09C] uppercase tracking-wider mb-4 pb-2 border-b border-[#262A34]">
                <CheckCircle2 className="w-4 h-4" />
                <span>PROS (Bullish Growth Thesis)</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed bg-[#12141A] p-4 rounded-xl border border-[#232732] mb-4">
                {debateResult.bullArgument}
              </p>

              <div className="space-y-2">
                <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
                  Growth Catalysts Verified:
                </span>
                {debateResult.keyCatalysts?.map((c, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D09C] mt-1.5 shrink-0"></span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CONS (Bearish Forensic Audit) */}
            <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-center gap-2 text-sm font-bold text-[#EB5757] uppercase tracking-wider mb-4 pb-2 border-b border-[#262A34]">
                <XCircle className="w-4 h-4" />
                <span>CONS (Bearish Forensic Risks)</span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed bg-[#12141A] p-4 rounded-xl border border-[#232732] mb-4">
                {debateResult.bearArgument}
              </p>

              <div className="space-y-2">
                <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
                  Red Flags & Valuation Concerns:
                </span>
                {debateResult.criticalRisks?.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EB5757] mt-1.5 shrink-0"></span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
