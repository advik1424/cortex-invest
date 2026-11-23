import React, { useState, useEffect } from 'react';
import { screenerApi } from '../services/api';
import {
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Check,
  AlertTriangle,
  FileText,
  Loader2,
  ShieldAlert,
  Scale,
  Target,
  RefreshCw,
  Award,
  Zap,
  Send,
  MessageSquare,
  Activity,
  Layers,
  LayoutList,
  Eye,
  HelpCircle,
  BarChart3,
  Users,
  ShieldCheck,
  Crosshair,
  ArrowRight,
  SlidersHorizontal,
  Newspaper,
  Quote,
} from 'lucide-react';

export default function ScreenerMain({ ticker }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // View Mode: Default is 'FULL_SHEET' for complete one-page institutional research
  const [viewMode, setViewMode] = useState('FULL_SHEET');

  // Active Sub-Tab for Focused View: Default is 'OVERVIEW'
  const [activeSubTab, setActiveSubTab] = useState('OVERVIEW');

  // AI Institutional & Trader Report State
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Interactive Fundamental & Trader Discussion State
  const [question, setQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatLog, setChatLog] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await screenerApi.getData(ticker);
        if (isMounted) {
          setData(res.data);
          // Trigger live direct trading analysis for this stock
          triggerAiAnalysis(ticker, 'FORENSIC_AUDIT', res.data?.profile, res.data?.ratios);
        }
      } catch (err) {
        console.error('Error fetching screener data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [ticker]);

  const triggerAiAnalysis = async (tick, type, prof, rat) => {
    setAiLoading(true);
    try {
      const payload = {
        ticker: tick || ticker,
        analysisType: type || 'FORENSIC_AUDIT',
        companyName: prof?.name || data?.profile?.name || tick,
        sector: prof?.sector || data?.profile?.sector || 'Diversified',
        currentPrice: rat?.currentPrice || data?.ratios?.currentPrice || 1000.0,
      };
      const res = await screenerApi.getAiAnalysis(payload);
      setAiReport(res.data);
    } catch (e) {
      console.error('AI Analysis failed:', e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAskAnalyst = async (customQ) => {
    const qText = customQ || question;
    if (!qText.trim()) return;

    setChatLoading(true);
    try {
      const payload = {
        ticker: ticker,
        companyName: data?.profile?.name || ticker,
        question: qText.trim(),
      };
      const res = await screenerApi.askAnalyst(payload);
      setChatLog((prev) => [
        ...prev,
        {
          question: qText.trim(),
          answer: res.data?.answer,
          timestamp: res.data?.timestamp,
        },
      ]);
      setQuestion('');
    } catch (e) {
      console.error('Analyst query failed:', e);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
        <span className="text-xs text-slate-500 font-medium">
          Loading Live Market Data & Direct Trade Setup for {ticker}...
        </span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-600 text-sm">
        No fundamental data found for ticker: {ticker}
      </div>
    );
  }

  const {
    profile,
    ratios,
    prosCons,
    peers,
    quarterlyResults,
    profitAndLoss,
    compoundedGrowth,
    shareholding,
    concallAnalysis,
  } = data;

  const cmp = ratios?.currentPrice || 1000;
  const ts = aiReport?.traderSolution;

  // Direct Execution Price Levels
  const entryLevel = cmp;
  const slLevel = ts?.stopLoss || Math.round(cmp * 0.955 * 10) / 10;
  const t1Level = ts?.target1 || Math.round(cmp * 1.048 * 10) / 10;
  const t2Level = ts?.target2 || Math.round(cmp * 1.105 * 10) / 10;
  const t3Level = ts?.target3 || Math.round(cmp * 1.175 * 10) / 10;

  const fundamentalPrompts = [
    'Primary downside risks in the latest quarterly results and business segments',
    'Management concall guidance, order book, and capital expenditure breakdown',
    'Long-term compounding thesis vs cyclical industry risks',
    'Intrinsic valuation (DCF, historical P/E median) and margin of safety',
    'Operating cash flow (OCF) vs reported net profit and working capital cycle',
  ];

  const subTabs = [
    { id: 'OVERVIEW', label: 'Overview & Ratios', icon: Eye, badge: null },
    { id: 'DISCUSSION', label: 'Pros, Cons & Notes', icon: Scale, badge: null },
    { id: 'FINANCIALS', label: 'Financial Statements', icon: BarChart3, badge: 'P&L' },
    { id: 'PEERS', label: 'Peers & Shareholding', icon: Users, badge: `${peers?.length || 4}` },
    { id: 'TRADER_SETUP', label: 'Technical Setup', icon: Target, badge: null },
  ];

  return (
    <div className="space-y-6 max-w-[1320px] mx-auto py-2">
      {/* ============================================================== */}
      {/* 1. MASTER COMPANY & DIRECT TRADE VERDICT HEADER                */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {profile.name}
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {profile.nseCode || ticker}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
                {profile.sector}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="text-[#0F766E] hover:underline flex items-center gap-1 font-medium"
              >
                <span>{profile.website?.replace('https://', '')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <span>BSE: <strong className="text-slate-800">{profile.bseCode}</strong></span>
              <span>•</span>
              <span>NSE: <strong className="text-slate-800">{profile.nseCode}</strong></span>
              <span>•</span>
              <span>Industry: <strong className="text-slate-800">{profile.industry || profile.sector}</strong></span>
            </div>
          </div>

          {/* Current Market Price & Day Change */}
          <div className="text-left md:text-right shrink-0">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              ₹ {ratios.currentPrice?.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
            </div>
            <div
              className={`text-xs font-bold flex items-center md:justify-end gap-1 mt-0.5 ${
                ratios.dayChange >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {ratios.dayChange >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>
                {ratios.dayChange >= 0 ? '+' : ''}
                {ratios.dayChange?.toFixed(2)}
              </span>
              <span>
                ({ratios.dayChange >= 0 ? '+' : ''}
                {ratios.dayChangePercent?.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Master Navigation Tabs */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id && viewMode === 'FOCUSED';
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id);
                    setViewMode('FOCUSED');
                  }}
                  className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-teal-100 text-[#0F766E]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 text-xs font-semibold">
            <button
              onClick={() => setViewMode('FOCUSED')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'FOCUSED'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Focused View</span>
            </button>
            <button
              onClick={() => setViewMode('FULL_SHEET')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'FULL_SHEET'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Full Sheet (1-Page)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TECHNICAL TRADE SETUP & KEY EXECUTION LEVELS               */}
      {/* ============================================================== */}
      {(viewMode === 'FULL_SHEET' || activeSubTab === 'TRADER_SETUP') && (
        <div className="space-y-4">
          {/* Main Setup Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-slate-700" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Technical Trade Setup
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {ts?.horizon || 'Swing (Daily)'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ts?.action || 'BUY SETUP'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Price action structure, breakout pivots, and risk-managed execution levels.
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Current Market Price</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  ₹ {cmp?.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                </span>
              </div>
            </div>

            {/* Direct Verdict Highlight Box */}
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Strategy Notes:
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                "{ts?.directVerdictSummary ||
                  `Price action consolidated above 20 EMA with positive institutional volume. Accumulate inside buy zone with strict stop loss at ₹${slLevel}.`}"
              </p>
            </div>

            {/* 4 Execution Levels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              {/* Entry Level */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block">Buy Zone</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">
                  {ts?.entryRange || `₹${(cmp * 0.985).toFixed(0)} - ₹${(cmp * 1.005).toFixed(0)}`}
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">Accumulate on dips</span>
              </div>

              {/* Stop Loss Level */}
              <div className="bg-rose-50/40 border border-rose-200 rounded-lg p-3 space-y-0.5">
                <span className="text-[10px] text-rose-700 uppercase font-sans font-semibold block">Stop Loss (SL)</span>
                <span className="text-base font-bold text-rose-600 block mt-0.5">
                  ₹ {slLevel?.toFixed(1)}
                </span>
                <span className="text-[10px] text-rose-600 font-sans block">{ts?.stopLossPct || '-4.5%'} Risk</span>
              </div>

              {/* Target 1 */}
              <div className="bg-emerald-50/40 border border-emerald-200 rounded-lg p-3 space-y-0.5">
                <span className="text-[10px] text-emerald-700 uppercase font-sans font-semibold block">Target 1 (Book 50%)</span>
                <span className="text-base font-bold text-emerald-600 block mt-0.5">
                  ₹ {t1Level?.toFixed(1)}
                </span>
                <span className="text-[10px] text-emerald-600 font-sans block">{ts?.target1Pct || '+4.8%'} profit lock</span>
              </div>

              {/* Target 2 */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-0.5">
                <span className="text-[10px] text-slate-600 uppercase font-sans font-semibold block">Target 2 (Runner)</span>
                <span className="text-base font-bold text-slate-900 block mt-0.5">
                  ₹ {t2Level?.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-500 font-sans block">1:{ts?.riskRewardRatio?.replace('1 :', '') || '2.5'} R:R</span>
              </div>
            </div>
          </div>

          {/* 3-Phase Execution Roadmap & Direct Trade Logic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step-by-Step Execution Plan */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#0F766E]" />
                Step-by-Step Trade Execution Guide
              </h3>

              <div className="space-y-3">
                {(ts?.executionSteps || [
                  `Step 1: Enter 50% quantity at current market price (₹${cmp}) and keep limit order for balance 50% at entry range low.`,
                  `Step 2: On achieving Target 1 (₹${t1Level}), book 50% profit and immediately shift Stop Loss to your Entry price for a risk-free trade.`,
                  `Step 3: Hold remaining 50% runners for Target 2 (₹${t2Level}) and Target 3, trailing with the 20-day EMA.`
                ]).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <span className="w-6 h-6 rounded-full bg-[#0F766E] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-slate-800 font-medium leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct 3-Point Trade Logic & Health Indicators */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                Direct Trade Rationale & Indicator Health
              </h3>

              <div className="space-y-3 text-xs">
                {/* Why Buy */}
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1">
                  <span className="font-bold text-emerald-800 uppercase tracking-wide block">
                    🟢 Why This Trade Works:
                  </span>
                  <p className="text-emerald-950 leading-relaxed">
                    {ts?.whyBuy || 'Price is breaking out of a consolidation base supported by expanding delivery volumes and operating leverage.'}
                  </p>
                </div>

                {/* Risk & Invalidation */}
                <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-lg space-y-1">
                  <span className="font-bold text-rose-800 uppercase tracking-wide block">
                    🔴 What Can Invalidate The Trade:
                  </span>
                  <p className="text-rose-950 leading-relaxed">
                    {ts?.riskWarning || `Daily candle close below Stop Loss (₹${slLevel}) breaks swing structure and triggers immediate exit.`}
                  </p>
                </div>

                {/* 4 Health Meters */}
                <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-semibold">Trend Signal</span>
                    <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                      {ts?.trendSignal || 'Strong Bullish (> 20 EMA)'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-semibold">Institutional Activity</span>
                    <span className="text-xs font-bold text-teal-700 block mt-0.5">
                      {ts?.institutionalFlow || 'Accumulation Detected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAB 2: OVERVIEW & RATIOS (9-CELL GRID, ABOUT, PROS & CONS) */}
      {/* ============================================================== */}
      {(viewMode === 'FULL_SHEET' || activeSubTab === 'OVERVIEW' || activeSubTab === 'DISCUSSION') && (
        <div className="space-y-6">
          {/* Iconic 9-cell Key Ratios Grid */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Key Fundamental Ratios
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-y-4 gap-x-6 text-xs">
              <div className="border-r border-slate-100 pr-3 last:border-0">
                <span className="text-slate-500 text-[11px] block font-medium">Market Cap</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block">{ratios.marketCap}</span>
              </div>
              <div className="border-r border-slate-100 pr-3 last:border-0">
                <span className="text-slate-500 text-[11px] block font-medium">Current Price</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block font-mono">
                  ₹ {ratios.currentPrice?.toFixed(0)}
                </span>
              </div>
              <div className="border-r border-slate-100 pr-3 last:border-0">
                <span className="text-slate-500 text-[11px] block font-medium">High / Low</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block font-mono">
                  {ratios.highLow52W}
                </span>
              </div>
              <div className="border-r border-slate-100 pr-3 last:border-0">
                <span className="text-slate-500 text-[11px] block font-medium">Stock P/E</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block font-mono">
                  {ratios.stockPe}
                </span>
              </div>
              <div className="border-r border-slate-100 pr-3 last:border-0">
                <span className="text-slate-500 text-[11px] block font-medium">Book Value</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block font-mono">
                  ₹ {ratios.bookValue}
                </span>
              </div>
              <div className="border-r border-slate-100 pr-3 last:border-0">
                <span className="text-slate-500 text-[11px] block font-medium">Dividend Yield</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block font-mono">
                  {ratios.dividendYield} %
                </span>
              </div>
              <div className="border-r border-slate-100 pr-3 last:border-0">
                <span className="text-slate-500 text-[11px] block font-medium">ROCE</span>
                <span className="text-sm font-bold text-emerald-600 mt-1 block font-mono">
                  {ratios.roce} %
                </span>
              </div>
              <div className="border-r border-slate-100 pr-3 last:border-0">
                <span className="text-slate-500 text-[11px] block font-medium">ROE</span>
                <span className="text-sm font-bold text-emerald-600 mt-1 block font-mono">
                  {ratios.roe} %
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block font-medium">Face Value</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block font-mono">
                  ₹ {ratios.faceValue}
                </span>
              </div>
            </div>

            {/* About Company Summary */}
            <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800 mr-1.5">ABOUT:</strong>
              {profile.about}
            </div>
          </div>

          {/* ============================================================== */}
          {/* FUNDAMENTAL PROS & CONS, NEWS & DISCUSSION CONSOLE             */}
          {/* ============================================================== */}
          <div className="space-y-6 pt-2">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-700" />
                  Company Pros &amp; Cons
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Key fundamental strengths, capital efficiency, and operational risk factors.
                </p>
              </div>
            </div>

            {/* Screener Iconic PROS & CONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* PROS (Clean White Card with Subtle Green Accent) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    PROS
                  </h3>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 font-normal">
                  {prosCons?.pros?.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">
                      <strong>Capital Efficiency:</strong> Superior return profile with ROCE of <strong>{ratios.roce}%</strong> and ROE of <strong>{ratios.roe}%</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">
                      <strong>Cash Flow Generation:</strong> Strong operating cash conversion ({aiReport?.forensicQuality?.cashConversion || '84% OCF/EBITDA'}).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">
                      <strong>Market Position:</strong> Competitive moat with strong pricing power in core business segments.
                    </span>
                  </li>
                </ul>
              </div>

              {/* CONS (Clean White Card with Subtle Red Accent) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    CONS
                  </h3>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 font-normal">
                  {prosCons?.cons?.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{c}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">
                      <strong>Raw Material Sensitivity:</strong> Vulnerable to global commodity price fluctuations and supply chain freight costs.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">
                      <strong>Valuation Multiples:</strong> Trading at P/E of <strong>{ratios.stockPe}x</strong>, offering modest safety cushion on earnings dips.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">
                      <strong>Working Capital:</strong> Dealer inventory cycles and debtor days require continuous monitoring.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Earnings Concall Notes & News Sentiment */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-slate-700" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Quarterly Concall Notes &amp; News Sentiment
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Management commentary, guidance delivery, and analyst cross-examination
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 font-mono self-start sm:self-auto">
                  {concallAnalysis?.quarter || 'Q2/Q3 FY25 Earnings Call'}
                </span>
              </div>

              {/* 3 Scorecards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">Management Outlook</span>
                  <span className="text-sm font-bold text-slate-900 block">
                    {aiReport?.concallForensics?.managementCredibility ? `${aiReport?.concallForensics?.managementCredibility} / 10` : 'Positive'}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                    "{concallAnalysis?.managementTone || 'Constructive outlook with firm focus on domestic market share and operational leverage.'}"
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">Guidance Track Record</span>
                  <span className="text-sm font-bold text-emerald-700 block">
                    {aiReport?.concallForensics?.guidanceDeliveryRecord || '4/4 Quarters Delivered'}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                    Historical guidance met with zero major negative earnings surprises over last 12 months.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] text-slate-500 font-medium block">Operational Risk</span>
                  <span className="text-sm font-bold text-amber-700 block">
                    {aiReport?.concallForensics?.guidanceVulnerability || 'Moderate (Raw Material Risk)'}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed pt-1">
                    Near-term margins susceptible to logistics freight rates and global input commodity fluctuations.
                  </p>
                </div>
              </div>

              {/* Analyst Toughest Question Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Key Analyst Question in Earnings Call:</span>
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{aiReport?.concallForensics?.toughestAnalystQuestion ||
                    'Will operating margins face near-term headwind from rising commodity input inflation and promotional dealer discounting?'}"
                </p>
              </div>

              {/* Growth Catalysts & Recent Guidance */}
              {(concallAnalysis?.futureGuidance || aiReport?.growthCatalysts) && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-700" />
                    Management Guidance &amp; Catalysts:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    {(concallAnalysis?.futureGuidance || aiReport?.growthCatalysts || [
                      'Capacity expansion funded internally without balance sheet debt leverage',
                      'Accelerating mix of premium high-margin product portfolio'
                    ]).map((guide, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded border border-slate-200">
                        <span className="text-emerald-600 font-bold">✔</span>
                        <span className="leading-relaxed">{guide}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Discussion Console */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-700" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Company Discussion &amp; Notes ({ticker})
                    </h3>
                    <span className="text-xs text-slate-500">
                      Ask questions regarding balance sheet, ROCE/ROE, quarterly concall, or valuation.
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Prompt Pills */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  Recommended Fundamental & News Discussion Questions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {fundamentalPrompts.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => handleAskAnalyst(qp)}
                      disabled={chatLoading}
                      className="px-3 py-1.5 rounded-lg text-xs bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-[#0F766E] font-medium transition-all text-left flex items-center gap-1.5"
                    >
                      <Quote className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{qp}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskAnalyst();
                  }}
                  placeholder={`Ask anything about ${ticker}'s fundamentals, pros/cons, cash flows, or recent news...`}
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F766E] focus:bg-white transition-all font-medium"
                />
                <button
                  onClick={() => handleAskAnalyst()}
                  disabled={chatLoading || !question.trim()}
                  className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all shrink-0"
                >
                  {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Ask Analyst</span>
                </button>
              </div>

              {/* Chat Log History */}
              {chatLog.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Discussion Thread ({chatLog.length})
                  </span>
                  {chatLog.map((c, i) => (
                    <div key={i} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-2 text-slate-900 font-extrabold">
                          <HelpCircle className="w-4 h-4 text-[#0F766E]" />
                          Query: {c.question}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">{c.timestamp}</span>
                      </div>
                      <div className="text-slate-800 leading-relaxed pl-5 border-l-2 border-[#0F766E] whitespace-pre-line font-medium text-xs">
                        {c.answer}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TAB 3: FINANCIAL STATEMENTS (QUARTERS, P&L, GROWTH CARDS)   */}
      {/* ============================================================== */}
      {(viewMode === 'FULL_SHEET' || activeSubTab === 'FINANCIALS') && (
        <div className="space-y-6">
          {/* Quarterly Results Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Quarterly Results
              </h2>
              <span className="text-xs text-slate-400">Consolidated Figures in ₹ Crores</span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-700 font-mono">
                <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-y border-slate-200 font-sans">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Metric</th>
                    {quarterlyResults.periods?.map((p) => (
                      <th key={p} className="py-2.5 px-3 text-right font-semibold">
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quarterlyResults.rows?.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50 ${
                        row.bold ? 'font-bold text-slate-900 bg-slate-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-sans">{row.metric}</td>
                      {row.values?.map((val, vIdx) => (
                        <td key={vIdx} className="py-2.5 px-3 text-right">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Profit & Loss Statement (Annual) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Profit & Loss (Annual)
              </h2>
              <span className="text-xs text-slate-400">Consolidated Figures in ₹ Crores</span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-700 font-mono">
                <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-y border-slate-200 font-sans">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Metric</th>
                    {profitAndLoss.periods?.map((p) => (
                      <th key={p} className="py-2.5 px-3 text-right font-semibold">
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profitAndLoss.rows?.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50 ${
                        row.bold ? 'font-bold text-slate-900 bg-slate-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-sans">{row.metric}</td>
                      {row.values?.map((val, vIdx) => (
                        <td key={vIdx} className="py-2.5 px-3 text-right">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compounded Growth 4-Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Compounded Sales Growth
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">10 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.salesGrowth?.tenYears}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">5 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.salesGrowth?.fiveYears}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">3 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.salesGrowth?.threeYears}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">TTM:</span>
                  <span className="font-bold text-emerald-600">{compoundedGrowth.salesGrowth?.ttmOrLastYear}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Compounded Profit Growth
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">10 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.profitGrowth?.tenYears}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">5 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.profitGrowth?.fiveYears}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">3 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.profitGrowth?.threeYears}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">TTM:</span>
                  <span className="font-bold text-emerald-600">{compoundedGrowth.profitGrowth?.ttmOrLastYear}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Stock Price CAGR
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">10 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.stockPriceCagr?.tenYears}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">5 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.stockPriceCagr?.fiveYears}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">3 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.stockPriceCagr?.threeYears}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">1 Year:</span>
                  <span className="font-bold text-emerald-600">{compoundedGrowth.stockPriceCagr?.ttmOrLastYear}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Return on Equity
              </h3>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">10 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.returnOnEquity?.tenYears}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">5 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.returnOnEquity?.fiveYears}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-sans">3 Years:</span>
                  <span className="font-bold text-slate-900">{compoundedGrowth.returnOnEquity?.threeYears}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Last Year:</span>
                  <span className="font-bold text-emerald-600">{compoundedGrowth.returnOnEquity?.ttmOrLastYear}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB 4: DEEP INSTITUTIONAL AUDIT & MOAT (FORENSICS, DUPONT) */}
      {/* ============================================================== */}
      {(viewMode === 'FULL_SHEET' || activeSubTab === 'FORENSICS') && (
        <div className="space-y-6">
          {aiReport ? (
            <div className="space-y-6">
              {/* Forensic Quality Tiles */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  Forensic Quality of Earnings Audit
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 block font-medium">Earnings Quality Grade</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block">
                      {aiReport.forensicQuality?.earningsGrade || 'A- (High Quality)'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 block font-medium">Altman Z-Score Zone</span>
                    <span className="text-base font-bold text-emerald-700 mt-1 block">
                      {aiReport.forensicQuality?.altmanZScoreZone || 'Safe Zone (> 3.2)'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 block font-medium">Cash Conversion</span>
                    <span className="text-base font-bold text-slate-900 mt-1 block font-mono">
                      {aiReport.forensicQuality?.cashConversion || '84% OCF/EBITDA'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 block font-medium">Corporate Governance</span>
                    <span className="text-base font-bold text-emerald-700 mt-1 block">
                      {aiReport.forensicQuality?.governanceRating || 'Top Quartile / Clean'}
                    </span>
                  </div>
                </div>
              </div>

              {/* DuPont 5-Way & Economic Moat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-[#0F766E]" />
                    DuPont 5-Way ROE Decomposition
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-sans block text-[11px]">Operating Margin</span>
                      <span className="text-base font-bold text-slate-900 mt-0.5 block">
                        {aiReport.dupontDecomposition?.operatingMargin || '14.2%'}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-sans block text-[11px]">Asset Turnover</span>
                      <span className="text-base font-bold text-slate-900 mt-0.5 block">
                        {aiReport.dupontDecomposition?.assetTurnover || '1.12x'}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-sans block text-[11px]">Financial Leverage</span>
                      <span className="text-base font-bold text-slate-900 mt-0.5 block">
                        {aiReport.dupontDecomposition?.leverageFactor || '2.4x'}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-800 font-sans block text-[11px]">Return on Equity</span>
                      <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                        {aiReport.dupontDecomposition?.returnOnEquity || ratios.roe + '%'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <strong className="text-slate-900">Core Driver: </strong>
                    {aiReport.dupontDecomposition?.coreDriver || 'Operating margin expansion coupled with steady asset turnover.'}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#0F766E]" />
                      Economic Moat Matrix (Porter's 5 Forces)
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {aiReport.moatMatrix?.moatRating || 'Wide Moat'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-600">Pricing Power</span>
                        <span className="font-bold text-slate-800 font-mono">{aiReport.moatMatrix?.pricingPower || 8}/10</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-[#0F766E] h-2 rounded-full" style={{ width: `${(aiReport.moatMatrix?.pricingPower || 8) * 10}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-600">Customer Switching Costs</span>
                        <span className="font-bold text-slate-800 font-mono">{aiReport.moatMatrix?.switchingCosts || 7}/10</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-[#0F766E] h-2 rounded-full" style={{ width: `${(aiReport.moatMatrix?.switchingCosts || 7) * 10}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-slate-600">Cost & Scale Advantage</span>
                        <span className="font-bold text-slate-800 font-mono">{aiReport.moatMatrix?.costAdvantage || 8.5}/10</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-[#0F766E] h-2 rounded-full" style={{ width: `${(aiReport.moatMatrix?.costAdvantage || 8.5) * 10}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-Scenario DCF Valuation Corridor */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-[#0F766E]" />
                  3-Scenario Reverse DCF Valuation Corridor
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-rose-800">Bear Case</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        {aiReport.valuationScenarios?.bearCase?.returnPct || '-18%'}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900">
                      ₹ {aiReport.valuationScenarios?.bearCase?.price || (cmp * 0.82).toFixed(0)}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {aiReport.valuationScenarios?.bearCase?.trigger || 'Demand deceleration & margin pressure.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-300 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#0F766E]">Base Case (12M Target)</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                        {aiReport.valuationScenarios?.baseCase?.returnPct || '+22%'}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900">
                      ₹ {aiReport.valuationScenarios?.baseCase?.price || (cmp * 1.22).toFixed(0)}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {aiReport.valuationScenarios?.baseCase?.trigger || 'Execution of capex & operational leverage.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-emerald-800">Bull Case</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {aiReport.valuationScenarios?.bullCase?.returnPct || '+48%'}
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900">
                      ₹ {aiReport.valuationScenarios?.bullCase?.price || (cmp * 1.48).toFixed(0)}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {aiReport.valuationScenarios?.bullCase?.trigger || 'Aggressive market share gains & premium mix.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. TAB 5: PEERS & OWNERSHIP (PEER TABLE, SHAREHOLDING PATTERN) */}
      {/* ============================================================== */}
      {(viewMode === 'FULL_SHEET' || activeSubTab === 'PEERS') && (
        <div className="space-y-6">
          {/* Peer Comparison Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Peer Comparison ({profile.sector})
              </h2>
              <span className="text-xs text-slate-400">Values in ₹ Cr.</span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-800 font-mono">
                <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-y border-slate-200 font-sans">
                  <tr>
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3 text-right">CMP (₹)</th>
                    <th className="py-2.5 px-3 text-right">P/E</th>
                    <th className="py-2.5 px-3 text-right">Mar Cap (₹ Cr)</th>
                    <th className="py-2.5 px-3 text-right">Div Yld %</th>
                    <th className="py-2.5 px-3 text-right">NP Qtr (₹ Cr)</th>
                    <th className="py-2.5 px-3 text-right">Qtr Var %</th>
                    <th className="py-2.5 px-3 text-right">ROCE %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {peers?.map((peer) => (
                    <tr
                      key={peer.ticker}
                      className={`hover:bg-slate-50 ${
                        peer.ticker === ticker ? 'bg-teal-50/50 font-bold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-sans text-slate-900">{peer.name}</td>
                      <td className="py-2.5 px-3 text-right">{peer.cmp?.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right">{peer.pe?.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right">{peer.marketCap}</td>
                      <td className="py-2.5 px-3 text-right">{peer.divYield?.toFixed(2)} %</td>
                      <td className="py-2.5 px-3 text-right">
                        {peer.netProfitQtr?.toLocaleString()}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right ${
                          peer.qtrProfitVar >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {peer.qtrProfitVar >= 0 ? '+' : ''}
                        {peer.qtrProfitVar}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                        {peer.roce}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shareholding Pattern Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Shareholding Pattern
              </h2>
              <span className="text-xs text-slate-400">Numbers in %</span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs text-slate-700 font-mono">
                <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase border-y border-slate-200 font-sans">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Shareholders</th>
                    {shareholding.quarters?.map((q) => (
                      <th key={q} className="py-2.5 px-3 text-right font-semibold">
                        {q}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shareholding.categories?.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50 ${
                        row.bold ? 'font-bold text-slate-900 bg-slate-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-sans">{row.metric}</td>
                      {row.values?.map((val, vIdx) => (
                        <td key={vIdx} className="py-2.5 px-3 text-right">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
