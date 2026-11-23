import React, { useState } from 'react';
import { chartApi } from '../services/api';
import { Upload, Crosshair, Target, ShieldCheck, ArrowUpRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

export default function ChartVisionTab({ ticker, setTicker }) {
  const [timeframe, setTimeframe] = useState('Daily (1D)');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
    }
  };

  const handleScan = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await chartApi.analyze(file, ticker, timeframe);
      setAnalysis(res.data);
    } catch (err) {
      console.error('Chart Vision Scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Groww / Dhan Style Header */}
      <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#00D09C]/10 text-[#00D09C] border border-[#00D09C]/20 mb-2">
              <Crosshair className="w-3.5 h-3.5" />
              ChartVision Multimodal AI
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Chart Pattern Scanner & Actionable Playbook
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Upload any chart screenshot from TradingView, Groww, or Zerodha. Gemini Vision scans market structure, draws exact Entry, SL, Targets, and runs a fundamental safeguard check.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-[#12141A] border border-[#2B313C] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            >
              <option>Daily (1D)</option>
              <option>4-Hour (4H)</option>
              <option>1-Hour (1H)</option>
            </select>
            <button
              onClick={handleScan}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#00D09C] hover:bg-[#00B789] text-[#0F1015] text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning Chart...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Chart</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Clean Upload Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="mt-6 border-2 border-dashed border-[#2D3342] hover:border-[#00D09C]/60 bg-[#12141A] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
        >
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            id="chart-upload"
            className="hidden"
          />
          <label htmlFor="chart-upload" className="cursor-pointer text-center space-y-2">
            {previewUrl ? (
              <div className="space-y-3">
                <img src={previewUrl} alt="Chart" className="max-h-60 object-contain rounded-xl border border-[#262A34] mx-auto shadow-md" />
                <span className="text-xs text-[#00D09C] underline block font-medium">Click to replace screenshot</span>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#1A1D24] border border-[#282E3A] flex items-center justify-center text-zinc-400 mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs text-zinc-200 font-semibold">
                  Drag and drop your TradingView/Broker chart screenshot here, or <span className="text-[#00D09C] underline">browse</span>
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">Supports PNG, JPG, WebP</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Trade Execution Output (Groww Clean Card Style) */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262A34]">
              <div>
                <span className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider block">
                  Identified Technical Pattern
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {analysis.patternIdentified}
                </h3>
                <p className="text-xs text-[#00D09C] mt-0.5 font-medium">{analysis.marketStructure}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-[#12141A] border border-[#282E3A] rounded-xl px-4 py-2 text-right">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Risk-to-Reward</span>
                  <span className="text-base font-bold text-[#00D09C]">1 : {analysis.riskRewardRatio}</span>
                </div>
              </div>
            </div>

            {/* Exact Execution Levels */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
              <div className="bg-[#12141A] border border-[#282E3A] rounded-xl p-4">
                <span className="text-[11px] text-zinc-400 font-medium block">Entry Level</span>
                <span className="text-xl font-bold text-white mt-1 block">₹{analysis.entryPrice?.toFixed(2)}</span>
                <span className="text-[10px] text-zinc-500 mt-0.5 block">On Candle Close</span>
              </div>

              <div className="bg-[#12141A] border border-[#EB5757]/30 rounded-xl p-4">
                <span className="text-[11px] text-[#EB5757] font-medium block">Stop Loss</span>
                <span className="text-xl font-bold text-[#EB5757] mt-1 block">₹{analysis.stopLoss?.toFixed(2)}</span>
                <span className="text-[10px] text-zinc-500 mt-0.5 block">Below Swing Low / ATR</span>
              </div>

              <div className="bg-[#12141A] border border-[#00D09C]/30 rounded-xl p-4">
                <span className="text-[11px] text-[#00D09C] font-medium block">Target 1 (2R)</span>
                <span className="text-xl font-bold text-[#00D09C] mt-1 block">₹{analysis.target1?.toFixed(2)}</span>
                <span className="text-[10px] text-zinc-500 mt-0.5 block">Book 50% & SL to BE</span>
              </div>

              <div className="bg-[#12141A] border border-teal-500/30 rounded-xl p-4">
                <span className="text-[11px] text-teal-400 font-medium block">Target 2 (Runner)</span>
                <span className="text-xl font-bold text-teal-300 mt-1 block">₹{analysis.target2?.toFixed(2)}</span>
                <span className="text-[10px] text-zinc-500 mt-0.5 block">Trail with 20 EMA</span>
              </div>
            </div>
          </div>

          {/* Screener Style Fundamental Safeguard & Playbook */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider mb-3">
                <ShieldCheck className="w-4 h-4 text-[#00D09C]" />
                <span>Fundamental Safeguard Audit</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed bg-[#12141A] p-4 rounded-xl border border-[#232732]">
                {analysis.fundamentalSafeguard}
              </p>
            </div>

            <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider mb-3">
                <Target className="w-4 h-4 text-zinc-300" />
                <span>Execution Playbook</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed bg-[#12141A] p-4 rounded-xl border border-[#232732]">
                {analysis.executionPlaybook}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
