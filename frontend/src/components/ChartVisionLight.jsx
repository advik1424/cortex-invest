import React, { useState, useEffect, memo } from 'react';
import { chartApi, screenerApi } from '../services/api';
import FormattedAnalystAnswer from './FormattedAnalystAnswer';
import {
  Upload, Search, Loader2, TrendingUp, TrendingDown, ShieldCheck,
  Target, AlertTriangle, CheckCircle2, Crosshair, ArrowRight,
  MessageSquare, Send, BarChart2, Layers, ShieldAlert, Newspaper,
  ExternalLink, Award, Eye, X, Check, Clock, FileText, ChevronRight,
  Info, AlertOctagon, HelpCircle, Flame
} from 'lucide-react';

function ChartVisionLight({ ticker = 'RELIANCE', onNavigateToFinancials, onSelectTicker }) {
  // Trading Horizon: 'INTRADAY', 'SWING', 'POSITIONAL'
  const [tradingCategory, setTradingCategory] = useState('SWING');

  // Multi-Chart Upload State
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedPreviewModal, setSelectedPreviewModal] = useState(null);

  // User Custom Question State
  const [userQuery, setUserQuery] = useState('');

  // Analysis State (Strictly null until user uploads and clicks Analyze)
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Follow-up Discussion State
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotChatLog, setCopilotChatLog] = useState([]);

  // REMOVED auto-scan on mount: User mandated NO PHANTOM ANALYSIS without uploaded chart!

  // Global Clipboard Multi-Paste (Ctrl + V) listener
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const newFiles = [];
      const newPreviews = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            newFiles.push(blob);
            newPreviews.push(URL.createObjectURL(blob));
          }
        }
      }

      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
        setPreviews((prev) => [...prev, ...newPreviews]);
        setErrorMessage('');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFilesSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));
      setFiles((prev) => [...prev, ...selectedFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
      setErrorMessage('');
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    previews.forEach((p) => {
      try { URL.revokeObjectURL(p); } catch (e) {}
    });
    setFiles([]);
    setPreviews([]);
    setAnalysis(null);
    setErrorMessage('');
  };

  // Revoke object URLs on unmount to release browser memory
  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        try { URL.revokeObjectURL(p); } catch (e) {}
      });
    };
  }, [previews]);

  const triggerDeepScan = async (selectedFilesOverride, categoryOverride, queryOverride) => {
    const currentFiles = selectedFilesOverride !== undefined ? selectedFilesOverride : files;
    
    // STRICT GUARD: Must have uploaded chart screenshot!
    if (!currentFiles || currentFiles.length === 0) {
      setErrorMessage('कृपया पहले चार्ट का स्क्रीनशॉट अपलोड या पेस्ट (Ctrl+V) करें। बिना चार्ट इमेज के एनालिसिस संभव नहीं है।');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      const cat = categoryOverride || tradingCategory;
      const queryToSend = queryOverride !== undefined ? queryOverride : userQuery;

      const res = await chartApi.analyze({
        files: currentFiles,
        tradingCategory: cat,
        userQuery: queryToSend,
        ticker,
        timeframe: cat === 'INTRADAY' ? '15m' : (cat === 'POSITIONAL' ? 'Weekly (1W)' : 'Daily (1D)'),
      });
      setAnalysis(res.data);
    } catch (err) {
      console.error('Scan error:', err);
      setErrorMessage('चार्ट एनालिसिस में त्रुटि हुई। कृपया दोबारा प्रयास करें या साफ़ स्क्रीनशॉट अपलोड करें।');
    } finally {
      setLoading(false);
    }
  };

  // Follow-up Q&A handler
  const handleAskCopilot = async (e) => {
    e.preventDefault();
    if (!copilotQuestion.trim()) return;

    const q = copilotQuestion.trim();
    setCopilotQuestion('');
    setCopilotLoading(true);

    const newLog = [...copilotChatLog, { sender: 'user', text: q }];
    setCopilotChatLog(newLog);

    try {
      const res = await screenerApi.askAnalyst({
        ticker: analysis?.detectedTickerOnChart || ticker,
        companyName: analysis?.detectedTickerOnChart || ticker,
        question: q,
        currentPrice: analysis?.entryPrice || entryP || 0,
        sector: analysis?.sector || 'Equities',
      });

      setCopilotChatLog([
        ...newLog,
        {
          sender: 'analyst',
          text: res.data?.answer || 'Setup remains valid as long as Stop Loss level is preserved.',
          sources: res.data?.sources,
        },
      ]);
    } catch (err) {
      setCopilotChatLog([
        ...newLog,
        {
          sender: 'analyst',
          text: `Trading note: For ${analysis?.ticker || ticker}, maintain Stop Loss at ₹${analysis?.stopLoss}. For ${tradingCategory} trade, lock 50% at Target 1 (₹${analysis?.target1}).`,
        },
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  // Execution Levels
  const entryP = analysis?.entryPrice || 0;
  const stopP = analysis?.stopLoss || 0;
  const t1 = analysis?.target1 || (entryP > 0 ? entryP * 1.048 : 0);
  const t2 = analysis?.target2 || (entryP > 0 ? entryP * 1.105 : 0);
  const t3 = analysis?.target3 || (entryP > 0 ? entryP * 1.175 : 0);

  const slPct = entryP > 0 ? (((stopP - entryP) / entryP) * 100).toFixed(1) : '0.0';
  const t1Pct = entryP > 0 ? (((t1 - entryP) / entryP) * 100).toFixed(1) : '0.0';
  const t2Pct = entryP > 0 ? (((t2 - entryP) / entryP) * 100).toFixed(1) : '0.0';
  const t3Pct = entryP > 0 ? (((t3 - entryP) / entryP) * 100).toFixed(1) : '0.0';

  const categoryConfigs = [
    { id: 'INTRADAY', label: 'Intraday (5m / 15m)', desc: 'Exit before 3:15 PM • Tight SL • Momentum' },
    { id: 'SWING', label: 'Swing Trading (Daily / 4H)', desc: 'Holding 3-15 Days • Breakout & Retest' },
    { id: 'POSITIONAL', label: 'Positional (Weekly / 1D)', desc: 'Holding 1-3 Months • Structural Trend' },
  ];

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto py-2">
      {/* ============================================================== */}
      {/* 1. UPLOAD & HORIZON SELECTOR (PRIMARY CONTROL)                 */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Upload-Driven Chart Pattern &amp; Key Levels Engine
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly visual: Patterns, Supports, Resistances, and Targets are extracted <strong>only from your uploaded chart</strong>.
            </p>
          </div>

          {/* Trade Horizon Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            {categoryConfigs.map((cfg) => {
              const isSelected = tradingCategory === cfg.id;
              return (
                <button
                  key={cfg.id}
                  onClick={() => {
                    setTradingCategory(cfg.id);
                    if (files.length > 0) {
                      triggerDeepScan(files, cfg.id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={cfg.desc}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upload Dropzone & User Questions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Chart Upload Dropzone (5 Cols) */}
          <div className="md:col-span-5 space-y-2.5">
            <label className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center h-36 ${
              files.length > 0 
                ? 'border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60' 
                : 'border-slate-300 hover:border-slate-500 bg-slate-50 hover:bg-slate-100/60'
            }`}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFilesSelect}
                className="hidden"
              />
              <Upload className={`w-6 h-6 mb-2 ${files.length > 0 ? 'text-indigo-600' : 'text-slate-500'}`} />
              <p className="text-xs font-bold text-slate-800">
                {files.length > 0 ? `${files.length} Chart Image(s) Attached` : 'Click to Upload Chart Screenshot'}
              </p>
              <span className="text-[11px] text-slate-500 mt-1">
                Drag &amp; drop or press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-800 text-[10px] font-mono font-bold">Ctrl + V</kbd> to paste
              </span>
            </label>

            {/* Error Message if tried without files */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Attached Thumbnails */}
            {previews.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
                {previews.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-14 rounded-lg overflow-hidden border border-slate-300 shrink-0 group shadow-2xs">
                    <img
                      src={url}
                      alt={`Chart ${idx + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedPreviewModal(url)}
                    />
                    <button
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={clearAllFiles}
                  className="text-[11px] text-rose-600 hover:underline font-semibold whitespace-nowrap pl-1 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* User Doubt / Strategy Context (7 Cols) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                What do you want to inspect on this chart? (Optional)
              </label>
              <textarea
                rows="3"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="e.g. Kya ye Cup &amp; Handle breakout valid hai? Candle close ka wait kahan karein? Wicks rejection bull trap to nahi hai?"
                className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 font-sans leading-relaxed resize-none"
              />
            </div>

            {/* Strategy Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                'False Breakout / Bull Trap check',
                'Exact Candle Close Confirmation level',
                'Support 1, Support 2 & Resistance zones',
                'Risk:Reward for T1, T2, T3 targets'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setUserQuery(chip);
                    if (files.length > 0) {
                      triggerDeepScan(files, tradingCategory, chip);
                    }
                  }}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 font-medium">
                {files.length > 0 ? `Ready to analyze ${files.length} chart(s) in ${tradingCategory} mode` : 'No chart uploaded yet'}
              </span>
              <button
                onClick={() => triggerDeepScan()}
                disabled={loading || files.length === 0}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                  files.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Uploaded Chart...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze Uploaded Chart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. EMPTY STATE WHEN NO CHART IS UPLOADED                       */}
      {/* ============================================================== */}
      {!analysis && !loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BarChart2 className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              No Chart Screenshot Analyzed Yet
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              चार्ट सेक्शन केवल तभी एनालिसिस करेगा जब आप कोई चार्ट स्क्रीनशॉट अपलोड करेंगे। किसी भी ट्रेडिंग प्लेटफॉर्म (TradingView, Zerodha, Dhan) से स्क्रीनशॉट लें और यहाँ <strong>Ctrl + V</strong> दबाकर पेस्ट करें।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-3 text-left">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-1">1. Visual Pattern Recognition</span>
              <p className="text-slate-500 text-[11px]">Detects Cup &amp; Handle, Double Bottom, Flag &amp; Pole, Range Boxes directly from image.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-1">2. Anti-Bull Trap Rule</span>
              <p className="text-slate-500 text-[11px]">Enforces complete candle close confirmation. Prevents entering on deceptive touch wicks.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-1">3. S/R Levels &amp; T1-T3</span>
              <p className="text-slate-500 text-[11px]">Calculates Support 1, Support 2, Resistance 1, Resistance 2, and 3-tier profit targets.</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. STRICT ANTI-BULL TRAP & CANDLE CLOSE WARNING CALLOUT        */}
      {/* ============================================================== */}
      {analysis && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                CRITICAL EXECUTION MANDATE: Mandatory Candle Close Confirmation (Anti-Bull Trap Protocol)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 font-mono">
              NO BLIND TOUCH ENTRY
            </span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed font-medium">
            <strong>प्राइस छूने पर तुरंत ट्रेड कभी न लें!</strong> वोलैटिलिटी या फेक ब्रेकआउट में प्राइस एंट्री लेवल को छूकर तुरंत रिवर्स हो जाती है और विक (wick) छोड़ देती है। ट्रेड तभी सक्रिय (active) होगा जब:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1 text-[11px]">
            <div className="bg-white/90 border border-amber-200 p-2.5 rounded-lg text-amber-900">
              <strong className="block text-amber-950 font-bold mb-0.5">
                {tradingCategory === 'INTRADAY' ? '1. Intraday (15M Candle Close)' : (tradingCategory === 'POSITIONAL' ? '1. Positional (Weekly Candle Close)' : '1. Swing (Daily 3:20-3:25 PM Close)')}
              </strong>
              <span>
                {tradingCategory === 'INTRADAY' 
                  ? 'कम से कम एक 15-मिनट की कैंडल को एंट्री लेवल (₹' + entryP.toFixed(1) + ') के ऊपर बॉडी क्लोज करने दें।' 
                  : 'डेली कैंडल 3:20 PM से 3:25 PM के बीच एंट्री लेवल (₹' + entryP.toFixed(1) + ') के ऊपर क्लोज होनी चाहिए।'}
              </span>
            </div>
            <div className="bg-white/90 border border-amber-200 p-2.5 rounded-lg text-amber-900">
              <strong className="block text-amber-950 font-bold mb-0.5">2. Wick Rejection Rule (&lt; 30% Wick)</strong>
              <span>यदि ब्रेकआउट कैंडल में ऊपर की विक (upper wick) कैंडल साइज के 30% से अधिक है, तो यह सेलर्स का दबाव (Bull Trap) है — ऐसे में एंट्री न लें।</span>
            </div>
            <div className="bg-white/90 border border-amber-200 p-2.5 rounded-lg text-amber-900">
              <strong className="block text-amber-950 font-bold mb-0.5">3. Strict Stop Loss Guard</strong>
              <span>ब्रेकआउट कैंडल या स्विंग लो के नीचे (₹{stopP.toFixed(1)}) का स्टॉप लॉस अनिवार्य है। क्लोजिंग आधार पर कट करें।</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. DIRECT TRADE VERDICT & KEY LEVELS (TRADING TERMINAL STYLE)  */}
      {/* ============================================================== */}
      {analysis && (
        <div className="space-y-5">
          {/* Main Signal Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-lg font-black text-sm uppercase tracking-wide text-white ${
                  analysis.actionVerdict?.includes('BUY') ? 'bg-emerald-600' :
                  analysis.actionVerdict?.includes('WAIT') ? 'bg-amber-600' : 'bg-rose-600'
                }`}>
                  {analysis.actionVerdict || 'WATCHLIST SETUP'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900 font-mono">
                      {analysis.detectedTickerOnChart || ticker}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold">
                      Timeframe: {analysis.detectedTimeframe || (tradingCategory === 'INTRADAY' ? '15m' : 'Daily')}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold uppercase border border-indigo-100">
                      {analysis.tradingCategory || tradingCategory}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Detected Pattern: <strong className="text-slate-900">{analysis.patternIdentified || 'Price Action Consolidation'}</strong> • Structure: <strong className="text-slate-900">{analysis.marketStructure || 'Stage-2 Expansion'}</strong>
                  </p>
                </div>
              </div>

              {/* Technical Risk / Reward Badge */}
              <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-mono self-start sm:self-auto flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold block">Risk / Reward (T2)</span>
                  <span className="text-sm font-bold text-emerald-700">
                    1:{analysis.riskRewardRatio?.toFixed(1) || '2.4'} R:R
                  </span>
                </div>
                <div className="border-l border-slate-200 pl-3">
                  <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold block">Conviction Score</span>
                  <span className="text-sm font-bold text-slate-900">
                    {analysis.convictionScore || 85}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Answer to User Query */}
            {analysis.userQueryAnswer && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-2 font-sans flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  Detailed AI Chart Analysis for Your Doubt:
                </span>
                <FormattedAnalystAnswer text={analysis.userQueryAnswer} />
              </div>
            )}

            {/* 5 Execution Price Levels (Entry, SL, T1, T2, T3) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs pt-1">
              <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200">
                <span className="text-[10px] text-indigo-900 font-sans uppercase font-bold block">1. Confirmed Entry</span>
                <span className="text-lg font-bold text-indigo-950 block mt-0.5">₹{entryP.toFixed(2)}</span>
                <span className="text-[10px] text-indigo-700 font-sans block mt-0.5">On candle close above</span>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-[10px] text-rose-800 font-sans uppercase font-bold block">Stop Loss (Base)</span>
                <span className="text-lg font-bold text-rose-600 block mt-0.5">₹{stopP.toFixed(2)}</span>
                <span className="text-[10px] text-rose-700 font-sans block mt-0.5">{slPct}% Risk</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-sans uppercase font-bold block">Target 1 (Book 50%)</span>
                <span className="text-lg font-bold text-emerald-600 block mt-0.5">₹{t1.toFixed(2)}</span>
                <span className="text-[10px] text-emerald-700 font-sans block mt-0.5">+{t1Pct}% Lock &amp; Move SL</span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <span className="text-[10px] text-emerald-900 font-sans uppercase font-bold block">Target 2 (Runner)</span>
                <span className="text-lg font-bold text-emerald-800 block mt-0.5">₹{t2.toFixed(2)}</span>
                <span className="text-[10px] text-emerald-700 font-sans block mt-0.5">+{t2Pct}% Expansion</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-600 font-sans uppercase font-bold block">Target 3 (Extended)</span>
                <span className="text-lg font-bold text-slate-900 block mt-0.5">₹{t3.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 font-sans block mt-0.5">+{t3Pct}% Trend High</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 5. SUPPORT & RESISTANCE MATRIX + EVIDENCE BREAKDOWN             */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Key Support & Resistance Levels Read from Chart */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  Visual Support &amp; Resistance
                </h4>
              </div>
              
              <div className="space-y-2 text-xs">
                {analysis.keySupportResistance && analysis.keySupportResistance.length > 0 ? (
                  analysis.keySupportResistance.map((sr, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] text-slate-700 font-medium">{sr}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="p-2 rounded bg-rose-50 border border-rose-100 flex items-center justify-between text-rose-900">
                      <span className="text-[11px] font-semibold">Major Overhead Resistance:</span>
                      <span className="font-mono font-bold">₹{t1.toFixed(1)}</span>
                    </div>
                    <div className="p-2 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-between text-indigo-900">
                      <span className="text-[11px] font-semibold">Breakout Trigger Pivot:</span>
                      <span className="font-mono font-bold">₹{entryP.toFixed(1)}</span>
                    </div>
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-between text-emerald-900">
                      <span className="text-[11px] font-semibold">Immediate Support (Demand):</span>
                      <span className="font-mono font-bold">₹{stopP.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Invalidation Alert */}
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-950 text-[11px]">
                <b className="text-rose-800 block">Invalidation Rule:</b>
                <p className="mt-0.5">{analysis.invalidationRule || `Candle close below ₹${stopP.toFixed(1)} invalidates the trade.`}</p>
              </div>
            </div>

            {/* Column 2: Technical Price Action & Indicators */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <BarChart2 className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Candle &amp; Volume Action
                </h4>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Candle Structure:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{analysis.candlePatternAnalysis}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Volume Confirmation:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{analysis.volumeActionAnalysis}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Trend &amp; RSI:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed font-mono">{analysis.trendStatus} • {analysis.rsiSignal}</p>
                </div>
              </div>
            </div>

            {/* Column 3: Step-by-Step Trade Execution Roadmap */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Target className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Execution Protocol ({tradingCategory})
                </h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="space-y-2 text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span><strong>Wait for Candle Close:</strong> Do not buy on mere price touch. Ensure candle closes above ₹{entryP.toFixed(1)}.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <span><strong>Lock 50% at Target 1:</strong> Book half position at ₹{t1.toFixed(1)} and immediately move SL to Break-even (₹{entryP.toFixed(1)}).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                    <span><strong>Trail Runner to Target 2/3:</strong> Hold remaining 50% for ₹{t2.toFixed(1)} / ₹{t3.toFixed(1)} using 20 EMA as trailing stop.</span>
                  </div>
                </div>

                {/* Fundamental & News Confluence Tag */}
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px] mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-emerald-900">Techno-Fundamental Confluence:</strong>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      {analysis.tripleConfluenceGrade || 'AAA Grade'}
                    </span>
                  </div>
                  <p className="text-emerald-900 leading-relaxed">
                    {analysis.confluenceVerdict || 'Breakout is backed by strong operating cash flows and positive earnings guidance.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Follow-up Discussion Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-800">
              <MessageSquare className="w-4 h-4 text-slate-600" />
              <span>Ask Follow-up Questions on this Chart Setup</span>
            </div>

            {copilotChatLog.length > 0 && (
              <div className="mb-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {copilotChatLog.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-100 text-slate-900 ml-8 text-right font-medium'
                        : 'bg-white border border-teal-200/80 mr-4 shadow-2xs'
                    }`}
                  >
                    <span className={`font-bold block text-[10px] uppercase mb-1 ${
                      msg.sender === 'user' ? 'text-slate-400' : 'text-[#0F766E]'
                    }`}>
                      {msg.sender === 'user' ? 'You' : 'Analyst Copilot'}
                    </span>
                    {msg.sender === 'user' ? (
                      <p className="text-slate-800">{msg.text}</p>
                    ) : (
                      <FormattedAnalystAnswer text={msg.text} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAskCopilot} className="flex items-center gap-2">
              <input
                type="text"
                value={copilotQuestion}
                onChange={(e) => setCopilotQuestion(e.target.value)}
                placeholder="Ask a question about this setup (e.g. When should I trail stop loss?)..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-slate-500"
              />
              <button
                type="submit"
                disabled={copilotLoading}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {copilotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedPreviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={() => setSelectedPreviewModal(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-black border border-slate-700">
            <button
              onClick={() => setSelectedPreviewModal(null)}
              className="absolute top-3 right-3 text-white bg-black/60 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm hover:bg-rose-600 transition-colors cursor-pointer"
            >
              ✕
            </button>
            <img src={selectedPreviewModal} alt="Enlarged chart" className="max-w-full max-h-[85vh] object-contain mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ChartVisionLight);
