import React, { useState, useEffect } from 'react';
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
  Filter
} from 'lucide-react';
import { screenerApi } from '../services/api';

export default function HomeLanding({ onSelectTicker, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Live Autocomplete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await screenerApi.search(searchQuery);
        setSearchResults(res.data || []);
      } catch (err) {
        console.error('Search error:', err);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Market Indices Overview
  const marketIndices = [
    { name: 'NIFTY 50', value: '24,180.80', change: '+102.40', pct: '+0.43%', isUp: true },
    { name: 'SENSEX', value: '79,402.20', change: '+318.15', pct: '+0.40%', isUp: true },
    { name: 'BANK NIFTY', value: '51,950.50', change: '+338.90', pct: '+0.66%', isUp: true },
    { name: 'NIFTY MIDCAP', value: '55,320.10', change: '-45.20', pct: '-0.08%', isUp: false },
    { name: 'INDIA VIX', value: '14.18', change: '-0.32', pct: '-2.21%', isUp: false },
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
      <section className="text-center max-w-3xl mx-auto pt-6 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#0F766E] text-xs font-semibold mb-5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse"></span>
          Institutional Financial Research Terminal
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Stock analysis and financial research platform for Indian investors
        </h1>

        <p className="text-sm sm:text-base text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
          10-year restated financial statements, key forensic ratios, dual-engine market scanning, and private portfolio intelligence.
        </p>

        {/* Global Hero Search Bar */}
        <div className="mt-8 relative max-w-2xl mx-auto">
          <div className="relative shadow-md rounded-xl overflow-hidden border border-slate-300 focus-within:border-[#0F766E] focus-within:ring-2 focus-within:ring-teal-600/10 transition-all bg-white">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearching(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a company (e.g. Reliance, Tata Motors, HDFC Bank, Infosys)..."
              className="w-full pl-12 pr-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 text-left overflow-hidden divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
              {searchResults.map((r) => (
                <button
                  key={r.ticker}
                  onClick={() => {
                    onSelectTicker(r.ticker);
                    setIsSearching(false);
                    setSearchQuery('');
                  }}
                  className="w-full px-5 py-3 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
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
            {['RELIANCE', 'TATAMOTORS', 'HDFCBANK', 'INFY', 'ITC', 'ZOMATO', 'SUZLON'].map((ticker) => (
              <button
                key={ticker}
                onClick={() => onSelectTicker(ticker)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-md text-slate-700 font-semibold text-[11px] transition-colors shadow-2xs"
              >
                {ticker}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Live Market Pulse Bar */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Indian Market Indices</span>
          </div>
          <span className="text-[11px] text-slate-400">Live Snapshot</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {marketIndices.map((idx) => (
            <div key={idx.name} className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-lg">
              <span className="text-[11px] font-semibold text-slate-500 block">{idx.name}</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold font-mono text-slate-900">{idx.value}</span>
                <span className={`text-[11px] font-bold font-mono flex items-center ${idx.isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {idx.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {idx.pct}
                </span>
              </div>
            </div>
          ))}
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
            className="text-xs font-bold text-[#0F766E] hover:text-[#0D655E] flex items-center gap-1"
          >
            Open Market Radar <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prebuiltScreens.map((screen) => (
            <div
              key={screen.title}
              onClick={() => onSelectTicker(screen.tickerTarget)}
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
            <h2 className="text-base font-bold text-slate-900">Market Heavyweights & Active Equities</h2>
            <p className="text-xs text-slate-500 mt-0.5">Click any company to open complete 10-year financials and ratios</p>
          </div>
          <button
            onClick={() => onNavigate('screener')}
            className="text-xs font-bold text-[#0F766E] hover:text-[#0D655E] flex items-center gap-1"
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
                  onClick={() => onSelectTicker(eq.ticker)}
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
                        onSelectTicker(eq.ticker);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#0F766E] bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors"
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
            P&L, Balance Sheet, Cash Flow, Forensic Ratios, and Peer Comparison tables.
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
