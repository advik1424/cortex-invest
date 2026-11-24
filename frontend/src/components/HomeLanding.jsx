import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  TrendingUp, 
  Compass, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  BarChart3, 
  Layers, 
  ChevronRight,
  Sparkles,
  FileText,
  Filter,
  X,
  Activity,
  RefreshCw,
  Newspaper,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { screenerApi, marketApi } from '../services/api';

export default function HomeLanding({ onSelectTicker, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);

  // AI Market Intelligence State
  const [intelligence, setIntelligence] = useState(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState('');

  const fetchIntelligenceData = async () => {
    setIsLoadingIntelligence(true);
    try {
      const res = await marketApi.getIntelligence();
      if (res && res.data) {
        setIntelligence(res.data);
        setLastRefreshedTime(res.data.generatedTimestamp || new Date().toLocaleTimeString('en-IN'));
      }
    } catch (err) {
      console.warn('Using baseline market intelligence fallback:', err);
    } finally {
      setIsLoadingIntelligence(false);
    }
  };

  useEffect(() => {
    fetchIntelligenceData();
  }, []);

  const handleSelectTicker = (ticker) => {
    if (!ticker) return;
    onSelectTicker(ticker);
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedIndex(-1);
  };

  const handleSearchSubmit = () => {
    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
      handleSelectTicker(searchResults[selectedIndex].ticker);
    } else if (searchResults.length > 0) {
      handleSelectTicker(searchResults[0].ticker);
    } else if (searchQuery.trim()) {
      handleSelectTicker(searchQuery.trim().toUpperCase());
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsSearching(true);
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsSearching(true);
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsSearching(false);
      setSelectedIndex(-1);
    }
  };

  // Click outside to dismiss search results
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearching(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSelectedIndex(-1);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await screenerApi.search(searchQuery);
        setSearchResults(res.data || []);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fallback indices if intelligence is loading
  const macro = intelligence?.macroRegime;
  const indicesList = [
    { 
      name: 'NIFTY 50', 
      value: macro?.nifty50 ? `₹${macro.nifty50.toLocaleString('en-IN')}` : '24,180.80', 
      change: macro?.niftyChange ? `+${macro.niftyChange.toFixed(2)}` : '+102.40', 
      pct: macro?.niftyChangePct ? `+${macro.niftyChangePct.toFixed(2)}%` : '+0.43%', 
      isUp: true 
    },
    { 
      name: 'SENSEX', 
      value: macro?.sensex ? `₹${macro.sensex.toLocaleString('en-IN')}` : '79,402.20', 
      change: '+318.15', 
      pct: '+0.40%', 
      isUp: true 
    },
    { 
      name: 'BANK NIFTY', 
      value: '51,950.50', 
      change: '+338.90', 
      pct: '+0.66%', 
      isUp: true 
    },
    { 
      name: 'INDIA VIX', 
      value: macro?.indiaVix ? macro.indiaVix.toFixed(2) : '13.80', 
      change: macro?.vixRegime ? macro.vixRegime : 'Low Volatility (<15)', 
      pct: '-2.21%', 
      isUp: false 
    },
  ];

  // Curated Popular Equities
  const featuredEquities = [
    { ticker: 'RELIANCE', name: 'Reliance Industries Ltd', price: '₹1,265.50', pe: '24.2', mcap: '₹17.1L Cr', change: '+1.45%', isUp: true, sector: 'Oil & Gas / Retail' },
    { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd', price: '₹782.30', pe: '10.8', mcap: '₹2.9L Cr', change: '+2.10%', isUp: true, sector: 'Automobiles' },
    { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd', price: '₹1,745.00', pe: '18.9', mcap: '₹13.3L Cr', change: '+0.85%', isUp: true, sector: 'Private Banking' },
    { ticker: 'INFY', name: 'Infosys Ltd', price: '₹1,890.20', pe: '27.4', mcap: '₹7.8L Cr', change: '-0.42%', isUp: false, sector: 'IT Services' },
    { ticker: 'ITC', name: 'ITC Ltd', price: '₹472.60', pe: '28.1', mcap: '₹5.9L Cr', change: '+0.30%', isUp: true, sector: 'FMCG / Hotels' },
    { ticker: 'ZOMATO', name: 'Zomato Ltd', price: '₹264.40', pe: '95.6', mcap: '₹2.3L Cr', change: '+3.20%', isUp: true, sector: 'Consumer Tech' },
  ];

  // Thematic Pre-Built Screens
  const prebuiltScreens = [
    {
      title: 'High ROE Compounders',
      desc: 'Companies with ROE > 20%, low debt-to-equity, and 5-year sales growth > 15%.',
      metric: 'Avg ROE 24.8%',
      tag: 'Quality Compounders',
      tickerTarget: 'HDFCBANK',
    },
    {
      title: 'Contrarian Value Radar',
      desc: 'Solid businesses trading at significant discount to their 5-year median PE multiple.',
      metric: 'Margin of Safety > 30%',
      tag: 'Deep Value',
      tickerTarget: 'TATAMOTORS',
    },
    {
      title: 'Earnings Momentum Leaders',
      desc: 'Operating margin expansion with accelerating YoY profit growth in the latest quarter.',
      metric: 'YoY PAT Growth > 25%',
      tag: 'Growth Momentum',
      tickerTarget: 'RELIANCE',
    },
    {
      title: 'Cash Flow Kings',
      desc: 'Consistently positive free cash flow generation exceeding reported net profit.',
      metric: 'FCF / Net Profit > 1.2x',
      tag: 'Cash Generative',
      tickerTarget: 'INFY',
    },
  ];

  return (
    <div className="space-y-10 py-2">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#0F766E] text-xs font-semibold mb-4 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse"></span>
          Institutional Financial Research Terminal
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Stock analysis and financial research platform for Indian investors
        </h1>

        <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-2xl mx-auto leading-relaxed">
          10-year restated financial statements, key forensic ratios, dual-engine market scanning, and private portfolio intelligence.
        </p>

        {/* Global Hero Search Bar */}
        <div className="mt-7 relative max-w-2xl mx-auto" ref={searchRef}>
          <div className="relative shadow-md rounded-xl overflow-hidden border border-slate-300 focus-within:border-[#0F766E] focus-within:ring-2 focus-within:ring-teal-600/10 transition-all bg-white">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearching(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search for a company (e.g. Reliance, Tata Motors, HDFC Bank, Infosys)..."
              className="w-full pl-12 pr-10 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setSelectedIndex(-1);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 text-left overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-80 overflow-y-auto">
              {searchResults.map((r, idx) => (
                <button
                  key={r.ticker}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectTicker(r.ticker);
                  }}
                  className={`w-full px-5 py-3 text-left flex items-center justify-between transition-colors cursor-pointer ${
                    selectedIndex === idx ? 'bg-teal-50/80 text-teal-900' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{r.name}</span>
                    <span className="text-xs text-slate-500 ml-2 font-mono">({r.ticker})</span>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{r.sector}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Search Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs">
            <span className="text-slate-400 font-medium mr-1">Popular:</span>
            {['RELIANCE', 'TATAMOTORS', 'HDFCBANK', 'INFY', 'ITC', 'ZOMATO', 'SUZLON', 'HAL', 'BEL'].map((ticker) => (
              <button
                key={ticker}
                onClick={() => handleSelectTicker(ticker)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-md text-slate-700 font-semibold text-[11px] transition-colors shadow-2xs"
              >
                {ticker}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI Market Intelligence & Institutional Regime Section */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F766E]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">AI Market Intelligence &amp; Institutional Pulse</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">Institutional Macro Regime, Sector Rotations, News Sentiment &amp; Market Drivers</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {lastRefreshedTime && (
              <span className="text-slate-400 text-[11px] font-mono">Synced: {lastRefreshedTime}</span>
            )}
            <button
              onClick={fetchIntelligenceData}
              disabled={isLoadingIntelligence}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingIntelligence ? 'animate-spin text-[#0F766E]' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Macro Regime Status & Live Indices */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Macro Regime Badge & Institutional Flow */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Macro Stance</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {macro?.regime || 'BULLISH (Full Size Deployment)'}
                </span>
              </div>

              <div className="space-y-2 mt-4">
                <div className="text-xs text-slate-300 font-medium">Institutional Flow Verdict:</div>
                <div className="text-sm font-semibold text-emerald-400 leading-snug">
                  {macro?.institutionalFlowVerdict || 'Net Institutional Inflow: +₹2,260 Cr (DII Absorption Active)'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-700/60 text-xs">
              <div className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">FII Net Flow</span>
                <span className="text-emerald-400 font-mono font-bold text-sm block mt-0.5">
                  {macro?.fiiNetCrores ? `+₹${macro.fiiNetCrores.toFixed(1)} Cr` : '+₹840.5 Cr'}
                </span>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-2.5 border border-slate-700/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">DII Net Flow</span>
                <span className="text-emerald-400 font-mono font-bold text-sm block mt-0.5">
                  {macro?.diiNetCrores ? `+₹${macro.diiNetCrores.toFixed(1)} Cr` : '+₹1,420.3 Cr'}
                </span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Market Breadth:</span>
              <span className="font-mono font-bold text-slate-200">
                {macro?.advanceDeclineRatio || '1.62 : 1 (Positive)'}
              </span>
            </div>
          </div>

          {/* Right Column: Live Indices Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-3">
            {indicesList.map((idx) => (
              <div key={idx.name} className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">{idx.name}</span>
                  <span className={`text-[11px] font-bold font-mono flex items-center ${idx.isUp ? 'text-emerald-700' : 'text-slate-600'}`}>
                    {idx.isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : null}
                    {idx.pct}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-base sm:text-lg font-black font-mono text-slate-900">{idx.value}</span>
                  <span className="text-[11px] font-mono text-slate-500">{idx.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Market Explanation ("Why is the market moving today?") */}
        {intelligence?.marketExplanation && (
          <div className="bg-teal-50/50 border border-teal-200/70 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-[#0F766E] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    {intelligence.marketExplanation.title}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-[#0F766E] bg-white border border-teal-200 px-2 py-0.5 rounded shadow-2xs">
                    Institutional Narrative
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {intelligence.marketExplanation.coreDriver}
                </p>

                <div className="mt-3 pt-3 border-t border-teal-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {intelligence.marketExplanation.executionRules?.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 bg-white/80 p-2 rounded-lg border border-teal-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>

                {intelligence.marketExplanation.riskWarning && (
                  <div className="flex items-center gap-2 mt-2 text-[11px] font-medium text-amber-800 bg-amber-50/80 px-3 py-1.5 rounded-md border border-amber-200/80">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span><strong>Risk Sentinel:</strong> {intelligence.marketExplanation.riskWarning}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sector Rotation & Insights */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Sector-Level Rotations &amp; Institutional Stance</h3>
            </div>
            <span className="text-[11px] text-slate-400">Relative Strength &amp; Leaders</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(intelligence?.sectorInsights || []).map((sec) => (
              <div 
                key={sec.sector}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 truncate" title={sec.sector}>{sec.sector}</span>
                    <span className={`font-mono font-bold text-[11px] ${sec.performance1D >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {sec.performance1DPct}
                    </span>
                  </div>

                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
                    sec.institutionalStance === 'OVERWEIGHT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : sec.institutionalStance === 'ACCUMULATE ON DIP'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {sec.institutionalStance}
                  </span>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {sec.catalystSummary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Leader</span>
                    <span className="font-mono font-bold text-xs text-slate-800">{sec.topLeader}</span>
                  </div>
                  <button
                    onClick={() => handleSelectTicker(sec.topLeader)}
                    className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 rounded text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time News Sentiment Analysis Feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#0F766E]" />
              <h3 className="text-sm font-bold text-slate-900">Live Financial News &amp; Sentiment Analysis</h3>
            </div>
            <span className="text-[11px] text-slate-400">AI Sentiment Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(intelligence?.newsSentiment || []).map((news) => (
              <div 
                key={news.id} 
                className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    news.sentiment === 'BULLISH'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : news.sentiment === 'CAUTION'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {news.sentiment} ({Math.round(news.sentimentScore * 100)}% score)
                  </span>
                  <span className="text-[10px] text-slate-400">{news.timeAgo}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {news.headline}
                </h4>

                <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">
                  "{news.institutionalTakeaway}"
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-400 text-[10px]">{news.source}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 mr-0.5">Impact:</span>
                    {news.impactedTickers?.map((t) => (
                      <button
                        key={t}
                        onClick={() => handleSelectTicker(t)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-teal-50 hover:text-[#0F766E] border border-slate-200 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
                        title={`Analyze ${t}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Thematic Screener Buckets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pre-Built Research Screens</h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated fundamental screens based on institutional investing frameworks</p>
          </div>
          <button
            onClick={() => onNavigate('radar')}
            className="text-xs font-bold text-[#0F766E] hover:text-[#0D655E] flex items-center gap-1 cursor-pointer"
          >
            Open Market Radar <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prebuiltScreens.map((screen) => (
            <div
              key={screen.title}
              onClick={() => handleSelectTicker(screen.tickerTarget)}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                    {screen.tag}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                  {screen.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {screen.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Benchmark</span>
                <span className="font-bold font-mono text-slate-800">{screen.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Market Leaders Table */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Market Heavyweights &amp; Active Equities</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any company to open complete 10-year financials and ratios</p>
          </div>
          <button
            onClick={() => onNavigate('screener')}
            className="text-xs font-bold text-[#0F766E] hover:text-[#0D655E] flex items-center gap-1 cursor-pointer"
          >
            View All Equities <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px] bg-slate-50/50">
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3">Sector</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3 text-right">1D Change</th>
                <th className="py-2.5 px-3 text-right">P/E</th>
                <th className="py-2.5 px-3 text-right">Market Cap</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {featuredEquities.map((eq) => (
                <tr 
                  key={eq.ticker} 
                  onClick={() => handleSelectTicker(eq.ticker)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 block">{eq.name}</span>
                    <span className="text-[11px] font-mono text-slate-500">{eq.ticker}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{eq.sector}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{eq.price}</td>
                  <td className={`py-3 px-3 text-right font-mono font-bold ${eq.isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {eq.change}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">{eq.pe}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">{eq.mcap}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTicker(eq.ticker);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#0F766E] bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors cursor-pointer"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4 Pillars of Cortex Terminal */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
        <div 
          onClick={() => onNavigate('screener')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">10-Year Financials</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            P&amp;L, Balance Sheet, Cash Flow, Forensic Ratios, and Peer Comparison tables.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('radar')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] mb-3">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Market Radar</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Dual-engine screeners for Contrarian Value and High-Momentum breakouts.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('chart')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Technical Charts</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Multi-timeframe candlestick analysis with volume overlays and key levels.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('portfolio')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Portfolio Ledger</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Private stock tracking with real-time CMP syncing and risk stress tests.
          </p>
        </div>
      </section>
    </div>
  );
}
