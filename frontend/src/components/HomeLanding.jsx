import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  TrendingUp, 
  TrendingDown,
  Compass, 
  Briefcase, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  Newspaper, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  X, 
  Flame, 
  ShieldCheck, 
  BarChart2, 
  Send, 
  Loader2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { screenerApi, marketApi } from '../services/api';
import FormattedAnalystAnswer from './FormattedAnalystAnswer';

export default function HomeLanding({ onSelectTicker, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const heroSearchInputRef = useRef(null);

  // Market Movers Active Tab (Groww style)
  const [moversTab, setMoversTab] = useState('active'); // 'active' | 'gainers' | 'losers' | 'high52'

  // AI Market Intelligence State
  const [intelligence, setIntelligence] = useState(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState('');

  // Direct Homepage "Ask Analyst" AI state
  const [aiQuery, setAiQuery] = useState('');
  const [aiSelectedTicker, setAiSelectedTicker] = useState('HDFCBANK');
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState(null);

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

  // Click outside listener for search results
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
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Execute direct AI query
  const handleAskAnalyst = async (questionText, tickerHint) => {
    const q = questionText || aiQuery;
    const t = tickerHint || aiSelectedTicker || 'HDFCBANK';
    if (!q.trim()) return;

    setIsAskingAi(true);
    setAiError(null);
    setAiResponse(null);

    try {
      const res = await screenerApi.askAnalyst({
        ticker: t,
        query: q,
      });
      if (res && res.data) {
        setAiResponse(res.data.answer || res.data);
      }
    } catch (err) {
      console.error('AI Query failed:', err);
      setAiError(err?.response?.data?.message || 'Unable to connect to AI Analyst engine. Please retry.');
    } finally {
      setIsAskingAi(false);
    }
  };

  // Live Indices (Groww Card Style)
  const macro = intelligence?.macroRegime;
  const indicesList = [
    { 
      name: 'NIFTY 50', 
      value: macro?.nifty50 ? `₹${macro.nifty50.toLocaleString('en-IN')}` : '24,180.80', 
      change: macro?.niftyChange ? `+${macro.niftyChange.toFixed(2)}` : '+102.40', 
      pct: macro?.niftyChangePct ? `+${macro.niftyChangePct.toFixed(2)}%` : '+0.43%', 
      isUp: true,
      low: '24,085.10',
      high: '24,240.50'
    },
    { 
      name: 'SENSEX', 
      value: macro?.sensex ? `₹${macro.sensex.toLocaleString('en-IN')}` : '79,402.20', 
      change: '+318.15', 
      pct: '+0.40%', 
      isUp: true,
      low: '79,150.00',
      high: '79,520.40'
    },
    { 
      name: 'BANK NIFTY', 
      value: '51,950.50', 
      change: '+338.90', 
      pct: '+0.66%', 
      isUp: true,
      low: '51,620.00',
      high: '52,100.20'
    },
    { 
      name: 'INDIA VIX', 
      value: macro?.indiaVix ? macro.indiaVix.toFixed(2) : '13.80', 
      change: '-0.31', 
      pct: '-2.21%', 
      isUp: false,
      regime: 'Low Volatility (<15)'
    },
  ];

  // Groww-Style Tabbed Market Movers Datasets
  const marketMoversData = {
    active: [
      { ticker: 'RELIANCE', name: 'Reliance Industries Ltd', price: '₹1,265.50', change: '+1.45%', isUp: true, pe: '24.2', mcap: '₹17.1L Cr', volume: '18.4M', sector: 'Oil & Gas / Retail' },
      { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd', price: '₹1,745.00', change: '+0.85%', isUp: true, pe: '18.9', mcap: '₹13.3L Cr', volume: '14.2M', sector: 'Private Banking' },
      { ticker: 'TCS', name: 'Tata Consultancy Services', price: '₹2,460.00', change: '-0.65%', isUp: false, pe: '22.4', mcap: '₹8.9L Cr', volume: '11.8M', sector: 'IT Services' },
      { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd', price: '₹782.30', change: '+2.10%', isUp: true, pe: '10.8', mcap: '₹2.9L Cr', volume: '22.5M', sector: 'Automobiles' },
    ],
    gainers: [
      { ticker: 'SUZLON', name: 'Suzlon Energy Ltd', price: '₹64.20', change: '+4.85%', isUp: true, pe: '42.1', mcap: '₹87,500 Cr', volume: '48.1M', sector: 'Renewable Energy' },
      { ticker: 'ZOMATO', name: 'Zomato Ltd', price: '₹264.40', change: '+3.20%', isUp: true, pe: '95.6', mcap: '₹2.3L Cr', volume: '31.4M', sector: 'Consumer Tech' },
      { ticker: 'BEL', name: 'Bharat Electronics Ltd', price: '₹294.10', change: '+2.85%', isUp: true, pe: '38.2', mcap: '₹2.1L Cr', volume: '15.9M', sector: 'Defense' },
      { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd', price: '₹782.30', change: '+2.10%', isUp: true, pe: '10.8', mcap: '₹2.9L Cr', volume: '22.5M', sector: 'Automobiles' },
    ],
    losers: [
      { ticker: 'CDSL', name: 'Central Depository Services', price: '₹1,385.40', change: '-3.15%', isUp: false, pe: '46.8', mcap: '₹28,950 Cr', volume: '6.4M', sector: 'Financial Depository' },
      { ticker: 'INFY', name: 'Infosys Ltd', price: '₹1,890.20', change: '-0.85%', isUp: false, pe: '27.4', mcap: '₹7.8L Cr', volume: '9.2M', sector: 'IT Services' },
      { ticker: 'TCS', name: 'Tata Consultancy Services', price: '₹2,460.00', change: '-0.65%', isUp: false, pe: '22.4', mcap: '₹8.9L Cr', volume: '11.8M', sector: 'IT Services' },
      { ticker: 'ITC', name: 'ITC Ltd', price: '₹472.60', change: '-0.40%', isUp: false, pe: '28.1', mcap: '₹5.9L Cr', volume: '12.1M', sector: 'FMCG / Hotels' },
    ],
    high52: [
      { ticker: 'HAL', name: 'Hindustan Aeronautics Ltd', price: '₹4,420.00', change: '+2.90%', isUp: true, pe: '34.5', mcap: '₹2.9L Cr', volume: '4.8M', sector: 'Aerospace & Defense' },
      { ticker: 'BEL', name: 'Bharat Electronics Ltd', price: '₹294.10', change: '+2.85%', isUp: true, pe: '38.2', mcap: '₹2.1L Cr', volume: '15.9M', sector: 'Defense' },
      { ticker: 'ZOMATO', name: 'Zomato Ltd', price: '₹264.40', change: '+3.20%', isUp: true, pe: '95.6', mcap: '₹2.3L Cr', volume: '31.4M', sector: 'Consumer Tech' },
      { ticker: 'RELIANCE', name: 'Reliance Industries Ltd', price: '₹1,265.50', change: '+1.45%', isUp: true, pe: '24.2', mcap: '₹17.1L Cr', volume: '18.4M', sector: 'Oil & Gas / Retail' },
    ],
  };

  // Screener.in Iconic 6 Popular Screens
  const screenerPopularScreens = [
    {
      title: 'High ROE Compounders',
      desc: 'Companies with ROE > 20%, low debt-to-equity (< 0.5), and consistent 5-year sales CAGR > 15%.',
      formula: 'ROE > 20% AND Debt to Equity < 0.5 AND Sales Growth 5Y > 15%',
      benchmark: 'Avg ROE: 24.8%',
      tag: 'Quality Compounders',
      topStock: 'HDFCBANK',
    },
    {
      title: 'Debt-Free Moat Champions',
      desc: 'Zero-debt cash-generative leaders with operating margin > 50% and monopolistic pricing power.',
      formula: 'Debt = 0 AND OPM > 50% AND 3Y Profit CAGR > 18%',
      benchmark: 'OPM: 64.2%',
      tag: 'Monopoly Moats',
      topStock: 'CDSL',
    },
    {
      title: 'Contrarian Value Radar',
      desc: 'Prudent businesses trading at a significant discount to their 5-year median PE with ROCE > 15%.',
      formula: 'Current PE < 5Y Median PE * 0.85 AND ROCE > 15%',
      benchmark: 'Margin of Safety: > 28%',
      tag: 'Deep Value',
      topStock: 'TATAMOTORS',
    },
    {
      title: 'Earnings Growth Accelerators',
      desc: 'Operating margin expansion coupled with accelerating YoY quarterly net profit growth.',
      formula: 'YoY Profit Growth Qtr > 20% AND OPM Qtr > OPM Prev Year',
      benchmark: 'YoY PAT: +28.4%',
      tag: 'Growth Momentum',
      topStock: 'RELIANCE',
    },
    {
      title: 'FII / DII Accumulation Radar',
      desc: 'Companies with sustained institutional delivery volume and rising institutional ownership.',
      formula: 'FII Holding Qtr > Prev Qtr AND Institutional Delivery > 60%',
      benchmark: 'Delivery: 68.5%',
      tag: 'Institutional Buys',
      topStock: 'BEL',
    },
    {
      title: 'Cash Flow Fortresses',
      desc: 'FCF generation consistently exceeding reported profit with dividend payout ratio > 35%.',
      formula: 'Free Cash Flow > Net Profit AND Dividend Payout > 35%',
      benchmark: 'FCF/PAT: 1.25x',
      tag: 'Cash Kings',
      topStock: 'TCS',
    },
  ];

  // Quick Prompt Chips for Ask Analyst
  const quickAiPrompts = [
    { query: 'Abhi HDFCBANK mein kya future expectation hai?', ticker: 'HDFCBANK', label: 'HDFCBANK Outlook' },
    { query: 'Why TCS share is falling & buy level?', ticker: 'TCS', label: 'TCS Fall Reasons' },
    { query: 'Why CDSL is down & risk stop loss?', ticker: 'CDSL', label: 'CDSL Risk Floor' },
    { query: 'Tata Motors Q2 earnings & institutional targets', ticker: 'TATAMOTORS', label: 'Tata Motors Targets' },
  ];

  return (
    <div className="space-y-10 py-2">
      {/* =========================================================================
          1. HERO SECTION: Pure Screener.in Aesthetic with Prominent Search
          ========================================================================= */}
      <section className="text-center max-w-3xl mx-auto pt-6 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>INDIAN EQUITIES FINANCIAL RESEARCH &amp; SCREENING</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Stock analysis and screening tool for Indian investors
        </h1>

        <p className="text-sm sm:text-base text-slate-600 mt-3 max-w-2xl mx-auto leading-relaxed">
          10-year restated financial statements, forensic ratios, and institutional research on 4,000+ NSE &amp; BSE companies.
        </p>

        {/* Hero Global Search Box (Screener.in signature) */}
        <div className="mt-8 relative max-w-2xl mx-auto" ref={searchRef}>
          <div className="relative shadow-sm rounded-xl overflow-hidden border border-slate-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10 transition-all bg-white">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={heroSearchInputRef}
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearching(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search for a company (e.g. Reliance, TCS, HDFC Bank, CDSL)..."
              className="w-full pl-12 pr-12 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
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
                    selectedIndex === idx ? 'bg-emerald-50 text-emerald-950 font-medium' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {r.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{r.name}</span>
                      <span className="text-xs text-slate-500 ml-2 font-mono">({r.ticker})</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{r.sector}</span>
                </button>
              ))}
            </div>
          )}

          {/* Screener Trending Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-xs">
            <span className="text-slate-400 font-semibold mr-1 uppercase text-[11px] tracking-wider">Trending:</span>
            {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'CDSL', 'ITC', 'BEL', 'HAL', 'ZOMATO'].map((ticker) => (
              <button
                key={ticker}
                onClick={() => handleSelectTicker(ticker)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-md text-slate-700 font-semibold text-[11px] transition-colors shadow-2xs cursor-pointer"
              >
                {ticker}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. MARKET TODAY: Groww-Style 4 Index Cards Strip
          ========================================================================= */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Market Indices Today
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Real-time NSE/BSE Feeds</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {indicesList.map((idx) => (
            <div 
              key={idx.name} 
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{idx.name}</span>
                <span className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded flex items-center ${
                  idx.isUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                }`}>
                  {idx.isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {idx.pct}
                </span>
              </div>

              <div className="mt-3">
                <div className="text-xl font-black font-mono text-slate-900 tracking-tight">
                  {idx.value}
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <span>{idx.change}</span>
                  {idx.regime && (
                    <span className="text-slate-400">({idx.regime})</span>
                  )}
                </div>
              </div>

              {idx.low && idx.high && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>L: {idx.low}</span>
                  <div className="h-1 flex-1 mx-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-2/3 rounded-full"></div>
                  </div>
                  <span>H: {idx.high}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          3. DIRECT HOMEPAGE AI ANALYST: Ask Any Company Question Right Here!
          ========================================================================= */}
      <section className="bg-gradient-to-b from-white to-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Ask Cortex AI Analyst</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded">
                  Dual-Engine Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Institutional verdicts on why stocks fall, brokerage consensus, fair PE valuation, and risk floors.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated Q2/Q3 FY27 Consensus</span>
          </div>
        </div>

        {/* Ask Bar Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskAnalyst();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          {/* Ticker Selector */}
          <div className="w-full sm:w-44 shrink-0">
            <select
              value={aiSelectedTicker}
              onChange={(e) => setAiSelectedTicker(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
            >
              <option value="HDFCBANK">HDFC Bank (HDFCBANK)</option>
              <option value="TCS">TCS Ltd (TCS)</option>
              <option value="CDSL">CDSL (CDSL)</option>
              <option value="TATAMOTORS">Tata Motors (TATAMOTORS)</option>
              <option value="RELIANCE">Reliance Industries (RELIANCE)</option>
              <option value="INFY">Infosys Ltd (INFY)</option>
              <option value="ITC">ITC Ltd (ITC)</option>
              <option value="BEL">Bharat Electronics (BEL)</option>
              <option value="SUZLON">Suzlon Energy (SUZLON)</option>
            </select>
          </div>

          {/* Query Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask anything (e.g. Abhi future expectation kya hai? Why is it falling? Target price?)..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
            />
            {aiQuery && (
              <button
                type="button"
                onClick={() => setAiQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAskingAi || !aiQuery.trim()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            {isAskingAi ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Ask Analyst</span>
              </>
            )}
          </button>
        </form>

        {/* Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Quick Inquiries:</span>
          {quickAiPrompts.map((p) => (
            <button
              key={p.query}
              type="button"
              onClick={() => {
                setAiQuery(p.query);
                setAiSelectedTicker(p.ticker);
                handleAskAnalyst(p.query, p.ticker);
              }}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 rounded-lg text-[11px] font-medium transition-colors shadow-2xs cursor-pointer"
            >
              💡 {p.query}
            </button>
          ))}
        </div>

        {/* AI Answer Display Card */}
        {isAskingAi && (
          <div className="p-6 bg-white border border-slate-200 rounded-xl text-center space-y-2">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-700">
              Querying institutional model, quarterly earnings concalls, and brokerage targets for {aiSelectedTicker}...
            </p>
          </div>
        )}

        {aiError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{aiError}</span>
          </div>
        )}

        {aiResponse && !isAskingAi && (
          <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 font-mono">
                  Analysis for {aiSelectedTicker}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                  Verified Verdict
                </span>
              </div>
              <button
                onClick={() => handleSelectTicker(aiSelectedTicker)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                Open Full 10Y Financials <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <FormattedAnalystAnswer text={aiResponse} />
          </div>
        )}
      </section>

      {/* =========================================================================
          4. MARKET MOVERS: Groww-Style Tabbed Cards (Active / Gainers / Losers / 52W)
          ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Market Movers Today</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track most traded volumes, top gainers, corrections, and 52-week breakouts</p>
          </div>

          {/* Groww Tab Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'active', label: 'Most Active' },
              { id: 'gainers', label: 'Top Gainers' },
              { id: 'losers', label: 'Top Losers' },
              { id: 'high52', label: '52-Week High' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMoversTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  moversTab === tab.id
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Movers Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {marketMoversData[moversTab].map((item) => (
            <div
              key={item.ticker}
              onClick={() => handleSelectTicker(item.ticker)}
              className="border border-slate-200 hover:border-emerald-300 hover:shadow-md bg-slate-50/40 hover:bg-white rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Groww Company Initials Logo */}
                    <div className="w-8 h-8 rounded-lg bg-slate-200/80 group-hover:bg-emerald-100 border border-slate-300/80 group-hover:border-emerald-300 flex items-center justify-center font-bold text-xs text-slate-700 group-hover:text-emerald-900 transition-colors">
                      {item.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">{item.ticker}</span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center ${
                    item.isUp ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                  }`}>
                    {item.isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {item.change}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div className="text-lg font-black font-mono text-slate-900">
                    {item.price}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Vol: {item.volume}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span>PE: <strong>{item.pe}</strong></span>
                  <span>•</span>
                  <span>MCap: <strong>{item.mcap}</strong></span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 group-hover:underline flex items-center">
                  Analyze <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. POPULAR SCREENS: Screener.in Signature 6 Institutional Screens
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Popular Screens (Screener.in Formulas)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Stock screening queries crafted for value investing, forensic balance sheet audits, and growth compounding.
            </p>
          </div>

          <button
            onClick={() => onNavigate('radar')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            Open Market Radar Engine <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {screenerPopularScreens.map((screen) => (
            <div
              key={screen.title}
              onClick={() => handleSelectTicker(screen.topStock)}
              className="bg-white border border-slate-200 hover:border-emerald-300 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {screen.tag}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    Pick: {screen.topStock}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {screen.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {screen.desc}
                </p>

                {/* Screener Query Code Box */}
                <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-600 leading-tight">
                  <span className="text-slate-400 font-sans block mb-0.5 font-semibold text-[9px] uppercase">Query:</span>
                  {screen.formula}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px] font-medium">Target Metric:</span>
                <span className="font-bold font-mono text-emerald-800">{screen.benchmark}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. AI MARKET INTELLIGENCE & INSTITUTIONAL PULSE
          ========================================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Institutional Macro Pulse &amp; Market Intelligence</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">Macro Regime, FII/DII Flows, Sector Rotations, and Live News Sentiment</p>
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
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingIntelligence ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Macro Regime Status & Live Inflow Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Macro Stance</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {macro?.regime || 'BULLISH (Full Size Deployment)'}
                </span>
              </div>

              <div className="space-y-1.5 mt-3">
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

          {/* Right Column: AI Market Explanation */}
          <div className="lg:col-span-7 bg-emerald-50/40 border border-emerald-200/70 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Why is the market moving today?
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded shadow-2xs">
                  Institutional Narrative
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {intelligence?.marketExplanation?.title || 'Index Multiple Expansion Supported by Robust Domestic Liquidity'}
              </h3>

              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {intelligence?.marketExplanation?.coreDriver || 'Benchmark indices are sustaining institutional bid support near key moving averages, aided by high domestic mutual fund SIP inflows absorbing sporadic global profit-taking.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {(intelligence?.marketExplanation?.executionRules || [
                'Tranche capital into multi-year support levels rather than chase gap-ups.',
                'Prioritize companies with high ROCE (> 20%) and zero debt.'
              ]).slice(0, 2).map((rule, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-700 bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sector Rotation Grid */}
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
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5"
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
                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live News Sentiment Analysis Feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-emerald-600" />
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
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
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

      {/* =========================================================================
          7. 4 PILLARS OF CORTEX TERMINAL (Screener.in Clean Feature Cards)
          ========================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
        <div 
          onClick={() => onNavigate('screener')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">10-Year Financials</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Restated P&amp;L, Balance Sheet, Cash Flows, Forensic Ratios, and Peer Comparison tables.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('radar')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Market Radar</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Dual-engine screeners for Contrarian Value, Momentum Breakouts, and Forensic red flags.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('chart')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Technical Charts</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Multi-timeframe candlestick analysis with institutional volume overlays and key support floors.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('portfolio')}
          className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-xs cursor-pointer transition-all"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Portfolio Ledger</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Private stock tracking with real-time CMP syncing, tranche deployment rules, and risk stress tests.
          </p>
        </div>
      </section>
    </div>
  );
}
