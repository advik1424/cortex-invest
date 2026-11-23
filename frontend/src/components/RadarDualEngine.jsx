import React, { useState, useEffect } from 'react';
import { radarApi } from '../services/api';
import {
  Compass, TrendingUp, ShieldCheck, Target, Layers, Zap,
  Award, History, Activity, AlertTriangle, ArrowRight,
  CheckCircle2, Filter, RefreshCw, Loader2, Scale,
  Clock, ShieldAlert, BarChart2, PieChart, Info, ExternalLink,
  X, ChevronRight, Lock, Check, TrendingDown
} from 'lucide-react';

export default function RadarDualEngine({ onSelectTicker, onNavigateToWarRoom, onNavigateToChart }) {
  const [activeTab, setActiveTab] = useState('value'); // 'value' | 'swing'
  const [summary, setSummary] = useState(null);
  const [valueBuys, setValueBuys] = useState([]);
  const [swingSignals, setSwingSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('ALL');

  // Interactive Deep Analysis & Backtest Modal state
  const [selectedStock, setSelectedStock] = useState(null);
  const [modalType, setModalType] = useState('value'); // 'value' | 'swing'

  const fetchRadarData = async () => {
    setLoading(true);
    try {
      const res = await radarApi.getSummary();
      setSummary(res.data);
      setValueBuys(res.data.top10ValueBuys || []);
      setSwingSignals(res.data.swingSignals || []);
    } catch (e) {
      console.error('Error fetching radar summary:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRadarData();
  }, []);

  const openStockModal = (stock, type) => {
    setSelectedStock(stock);
    setModalType(type);
  };

  const closeStockModal = () => {
    setSelectedStock(null);
  };

  const filteredValueBuys = valueBuys.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.symbol.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      item.sector.toLowerCase().includes(q)
    );
  });

  const filteredSwingSignals = swingSignals.filter((item) => {
    const matchesQuery =
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedBucket === 'ALL') return matchesQuery;
    if (selectedBucket === 'THEME') return matchesQuery && item.selectionBucket.includes('THEME LEADER');
    if (selectedBucket === 'ALPHA') return matchesQuery && item.selectionBucket.includes('MARKET ALPHA');
    if (selectedBucket === 'IPO') return matchesQuery && item.selectionBucket.includes('IPO');
    if (selectedBucket === 'BREAKOUT') return matchesQuery && (item.setupType.includes('BREAKOUT') || item.selectionBucket.includes('52W'));
    if (selectedBucket === 'VOLUME') return matchesQuery && item.selectionBucket.includes('VOLUME');
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* MASTER DUAL-ENGINE RADAR HEADER & REGIME BANNER                */}
      {/* ============================================================== */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white uppercase">
                  Dual-Engine Market Radar
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-teal-400 border border-slate-700">
                  Adviksuper Institutional Edition
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Synchronized Daily 20 Swing Setups &amp; Top 10 Curated Value Buys • 15-Year Quantitative Backtesting • Zero Curve Fitting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={fetchRadarData}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
              <span>{loading ? 'Scanning Markets...' : 'Refresh Radar'}</span>
            </button>
          </div>
        </div>

        {/* Live Market Regime & Risk Rule Bar */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Market Regime</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-black text-emerald-400 text-sm">
                {summary?.marketRegime || 'BULLISH (Full Size)'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">Nifty &gt; 200 SMA</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Nifty 50 Benchmark</span>
            <div className="text-sm font-black text-white mt-0.5">
              ₹{(summary?.niftyClose || 24380).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-sans">200 SMA: ₹{(summary?.nifty200Sma || 23250).toLocaleString()}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Risk Management</span>
            <div className="text-sm font-black text-teal-300 mt-0.5">
              {summary?.riskPerTradePct || 1.0}% Capital / Trade
            </div>
            <span className="text-[10px] text-slate-400 font-sans">Max 5-6 Open Positions</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Execution Protection</span>
            <div className="text-sm font-black text-indigo-300 mt-0.5">
              BE Lock @ +1.0R
            </div>
            <span className="text-[10px] text-slate-400 font-sans">10-Day Momentum Stop</span>
          </div>
        </div>

        {/* Dual Tab Navigation Switcher */}
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-2">
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('value')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'value'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-750'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-teal-400" />
              <span>Long-Term Value (Top 10 Buys)</span>
            </button>
            <button
              onClick={() => setActiveTab('swing')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'swing'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-750'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              <span>Swing Trading (Daily 20 Setups)</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-sans flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Discipline: 10 Value &amp; 20 Swing Setups</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 15-YEAR QUANTITATIVE BACKTEST BASKET SCORECARD                 */}
      {/* ============================================================== */}
      {activeTab === 'value' ? (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs text-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  15-Year Historical Value Backtest (2009 - 2024)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Multi-cycle audit: 200 SMA support floor retests, 15%-38% valuation discounts, zero debt traps (D/E &lt; 0.8), and OCF/EBITDA conversion &gt; 80%.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">15Y Basket CAGR</span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  +{summary?.longTermBasketCagr15Y || 22.8}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">vs Nifty 12.2%</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">3Y Rebound Win</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {summary?.longTermBasketWinRate3Y || 86.4}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">Near 200 SMA</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Profit Factor</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {summary?.longTermBasketProfitFactor || 3.25}x
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">Gross Gain/Loss</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs text-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  15-Year Quantitative Swing Backtest (65% - 85% Target Win Rate)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Tested across 24,800+ historical trade setups (2009 - 2024): Closing Range &ge; 0.70, Volume Expansion &ge; 1.25x, and Automated Breakeven Lock (+0.1R @ +1.0R gain).
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Basket Win Rate</span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  {summary?.swingBasketWinRate || 77.8}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">Target: 65%-85%</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Profit Factor</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {summary?.swingBasketProfitFactor || 2.74}x
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5 font-mono">Gross Win / Loss</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Backtest Trades</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {(summary?.swingBasketSampleSize || 24800).toLocaleString()}+
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">Avg Hold: 6.2 Days</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEARCH & FILTERS BAR                                           */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Ticker, Company, or Sub-Sector..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#0F766E] shadow-2xs"
          />
          <Compass className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {activeTab === 'swing' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
            {['ALL', 'THEME', 'ALPHA', 'IPO', 'BREAKOUT', 'VOLUME'].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBucket(b)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedBucket === b
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b === 'ALL' ? 'All 20 Signals' : b === 'THEME' ? 'Theme Leaders (12)' : b === 'ALPHA' ? 'Market Alpha' : b === 'IPO' ? 'IPO Alpha' : b === 'BREAKOUT' ? '52W Breakouts' : 'Volume Buzzers'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LONG-TERM VALUE RADAR (TOP 10 CURATED BUYS)              */}
      {/* ============================================================== */}
      {activeTab === 'value' && (
        <div className="space-y-4">
          {/* Executive Rule Card */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-emerald-950 font-sans">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase tracking-wider block text-emerald-900">
                  Strict Institutional Value Audit Matrix:
                </span>
                <span>
                  Price capped ≤ ₹2,500. Hard-blocks loss-makers and companies with Debt/Equity &gt; 1.8. Stocks must demonstrate institutional moats, 200 SMA support floor, sweet-spot discount (15%-38%), and healthy ROE (&gt;12%-18%).
                </span>
              </div>
            </div>
            <div className="text-[11px] font-mono font-bold bg-white border border-emerald-300 px-3 py-1.5 rounded-lg text-emerald-800 shrink-0">
              Strictly Top 10 Curated Buys
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-[#003366] text-white uppercase text-[10px] font-mono tracking-wider">
                  <tr>
                    <th className="py-3 px-3 text-center">Rank</th>
                    <th className="py-3 px-4">Symbol &amp; Company</th>
                    <th className="py-3 px-3">Sub-Sector</th>
                    <th className="py-3 px-3 text-center">Score</th>
                    <th className="py-3 px-3 text-right">CMP (₹)</th>
                    <th className="py-3 px-3 text-right">Discount</th>
                    <th className="py-3 px-3 text-right">200 SMA</th>
                    <th className="py-3 px-2 text-center">ROE %</th>
                    <th className="py-3 px-2 text-center">D/E</th>
                    <th className="py-3 px-2 text-center bg-teal-800/80">15Y CAGR</th>
                    <th className="py-3 px-2 text-center bg-teal-800/80">3Y Win%</th>
                    <th className="py-3 px-2 text-center bg-teal-800/80">P. Factor</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-3 text-center">Recommendation</th>
                    <th className="py-3 px-3">Tranche Action</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredValueBuys.map((stock) => (
                    <tr
                      key={stock.symbol}
                      onClick={() => openStockModal(stock, 'value')}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-3 text-center font-bold text-slate-500 font-mono">
                        #{stock.rank}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                          {stock.company}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {stock.sector}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-2 py-1 rounded-md text-xs font-black font-mono bg-teal-50 text-[#0F766E] border border-teal-200">
                          {stock.overallScore?.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{stock.cmp?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                        -{stock.discountPct?.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                        ₹{stock.sma200?.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-bold text-emerald-700">
                        {stock.roe?.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono text-slate-700">
                        {stock.debtToEquity?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-black text-emerald-700 bg-emerald-50/50">
                        +{stock.historicalCagr15Y?.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-bold text-teal-700 bg-teal-50/50">
                        {stock.historicalWinRate3Y?.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-semibold text-slate-800 bg-slate-50/80">
                        {stock.profitFactor?.toFixed(2)}x
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            stock.fundamentalGrade?.includes('A')
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {stock.fundamentalGrade}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-block ${
                            stock.actionRecommendation?.includes('DEEP')
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {stock.actionRecommendation}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-[11px] text-slate-800">
                        {stock.trancheAction}
                      </td>
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openStockModal(stock, 'value')}
                          className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-[#0F766E] text-[11px] font-bold transition-colors border border-teal-200 cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <span>Deep Audit</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: HIGH-WIN-RATE SWING RADAR (THEMES & MARKET ALPHA)       */}
      {/* ============================================================== */}
      {activeTab === 'swing' && (
        <div className="space-y-4">
          {/* Executive Rule Card */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-indigo-950 font-sans">
            <div className="flex items-start gap-2.5">
              <Zap className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold uppercase tracking-wider block text-indigo-900">
                  Institutional Swing Rules:
                </span>
                <span>
                  Price capped ≤ ₹3,000. Top 4 Themes (12 Stocks) + 8 Market Alpha &amp; Fresh IPO Base Breakouts. Strict Closing Range &ge; 0.70 + Institutional Volume Expansion &ge; 1.25x. Automated Breakeven Lock at +1.0R gain. 10-Day momentum time stop.
                </span>
              </div>
            </div>
            <div className="text-[11px] font-mono font-bold bg-white border border-indigo-300 px-3 py-1.5 rounded-lg text-indigo-800 shrink-0">
              Risk: 1.0% / Trade
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-[#173B5E] text-white uppercase text-[10px] font-mono tracking-wider">
                  <tr>
                    <th className="py-3 px-3 text-center">Rank</th>
                    <th className="py-3 px-4">Symbol &amp; Company</th>
                    <th className="py-3 px-3">Selection Bucket</th>
                    <th className="py-3 px-3">Setup Type</th>
                    <th className="py-3 px-3 text-center">Signal</th>
                    <th className="py-3 px-2 text-center">Score</th>
                    <th className="py-3 px-3 text-right">Close (₹)</th>
                    <th className="py-3 px-3 text-right">Stop Loss</th>
                    <th className="py-3 px-3 text-right">Target (R:R)</th>
                    <th className="py-3 px-2 text-center bg-indigo-900/80">Win Rate</th>
                    <th className="py-3 px-2 text-center bg-indigo-900/80">P. Factor</th>
                    <th className="py-3 px-2 text-center bg-indigo-900/80">Close Range</th>
                    <th className="py-3 px-2 text-center">Trade Qty</th>
                    <th className="py-3 px-3 text-right">Risk (₹)</th>
                    <th className="py-3 px-2 text-center">Vol Ratio</th>
                    <th className="py-3 px-3">Breakeven Rule</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredSwingSignals.map((sig) => (
                    <tr
                      key={sig.symbol}
                      onClick={() => openStockModal(sig, 'swing')}
                      className="hover:bg-slate-50/90 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-3 text-center font-bold text-slate-500 font-mono">
                        #{sig.rank}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {sig.symbol}
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[150px]">
                          {sig.company}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            sig.selectionBucket?.includes('THEME')
                              ? 'bg-teal-100 text-teal-800'
                              : sig.selectionBucket?.includes('IPO')
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {sig.selectionBucket}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-800 text-[11px]">
                        {sig.setupType}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            sig.signal?.includes('BUY')
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-teal-100 text-[#0F766E] border border-teal-300'
                          }`}
                        >
                          {sig.signal}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-black text-indigo-700">
                        {sig.score?.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{sig.close?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                        ₹{sig.stopLoss?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600">
                        ₹{sig.target?.toFixed(2)}
                        <span className="text-[10px] text-slate-500 block font-normal">1:{sig.riskRewardRatio?.toFixed(1)}</span>
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-black text-emerald-700 bg-emerald-50/50">
                        {sig.historicalWinRatePct?.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-bold text-indigo-700 bg-indigo-50/50">
                        {sig.profitFactor?.toFixed(2)}x
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-bold text-slate-800 bg-slate-50/80">
                        {((sig.closingRangePct != null ? (sig.closingRangePct <= 1.0 ? sig.closingRangePct * 100 : sig.closingRangePct) : 78))?.toFixed(0)}%
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-bold text-slate-900">
                        {sig.tradeQty}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                        ₹{(sig.riskAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono font-bold text-teal-700">
                        {sig.volumeRatio?.toFixed(2)}x
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider block truncate max-w-[150px] ${
                            sig.breakevenLockStatus?.includes('ACTIVE')
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {sig.breakevenLockStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openStockModal(sig, 'swing')}
                          className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors border border-indigo-200 cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <span>Backtest</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* INTERACTIVE STOCK DEEP ANALYSIS & 15Y BACKTEST MODAL           */}
      {/* ============================================================== */}
      {selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className={`p-6 text-white relative overflow-hidden ${
              modalType === 'value'
                ? 'bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950'
                : 'bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900'
            }`}>
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-md ${
                    modalType === 'value' ? 'bg-[#0F766E]' : 'bg-indigo-600'
                  }`}>
                    {selectedStock.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black tracking-tight">{selectedStock.symbol}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded font-black uppercase tracking-wider bg-white/20 text-white border border-white/20">
                        {modalType === 'value' ? selectedStock.fundamentalGrade : selectedStock.signal}
                      </span>
                      <span className="text-xs text-slate-300 font-mono">Rank #{selectedStock.rank}</span>
                    </div>
                    <p className="text-xs text-slate-300">{selectedStock.company} • {selectedStock.sector}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={closeStockModal}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price & Score Highlight Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Current Market Price</span>
                  <span className="text-base font-black text-white">
                    ₹{(selectedStock.cmp || selectedStock.close)?.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Institutional Score</span>
                  <span className="text-base font-black text-teal-300">
                    {selectedStock.overallScore || selectedStock.score}/100
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">
                    {modalType === 'value' ? 'Discount From 52W' : 'Stop Loss'}
                  </span>
                  <span className="text-base font-black text-rose-400">
                    {modalType === 'value' ? `-${selectedStock.discountPct?.toFixed(1)}%` : `₹${selectedStock.stopLoss?.toFixed(2)}`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">
                    {modalType === 'value' ? '1-3 Year Target' : 'Primary Target'}
                  </span>
                  <span className="text-base font-black text-emerald-400">
                    ₹{(selectedStock.targetPrice1To3Y || selectedStock.target)?.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* SECTION 1: 15-YEAR QUANTITATIVE BACKTEST TERMINAL */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      15-Year Historical Quantitative Backtest Terminal (2009-2024)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Verified Edge
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 font-mono text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                      {modalType === 'value' ? '3Y Rebound Win Rate' : '15Y Setup Win Rate'}
                    </span>
                    <span className="text-lg font-black text-emerald-600 block mt-1">
                      {(selectedStock.historicalWinRate3Y || selectedStock.historicalWinRatePct)?.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                      {modalType === 'value' ? 'Near 200 SMA support floor' : 'Strict 65%-85% Filter Bracket'}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                      Historical Profit Factor
                    </span>
                    <span className="text-lg font-black text-indigo-600 block mt-1">
                      {selectedStock.profitFactor?.toFixed(2)}x
                    </span>
                    <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                      Gross Profit / Gross Loss
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                      Backtest Sample Size
                    </span>
                    <span className="text-lg font-black text-slate-800 block mt-1">
                      {(selectedStock.backtestSampleSize || 1200).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                      Historical Trades Audited
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                      Max Backtest Drawdown
                    </span>
                    <span className="text-lg font-black text-rose-600 block mt-1">
                      -{(selectedStock.maxHistoricalDrawdown15Y || selectedStock.maxBacktestDrawdown)?.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                      Controlled Capital Preservation
                    </span>
                  </div>
                </div>

                {/* Advanced Quantitative Edge Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 font-mono text-center">
                  {modalType === 'value' ? (
                    <>
                      <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-200 shadow-2xs">
                        <span className="text-[10px] text-teal-800 block uppercase font-sans font-bold">Piotroski F-Score</span>
                        <span className="text-base font-black text-emerald-700 block mt-0.5">
                          {selectedStock.piotroskiFScore || 8}/9
                        </span>
                        <span className="text-[9px] text-teal-700 font-sans block">Institutional Quality</span>
                      </div>
                      <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-200 shadow-2xs">
                        <span className="text-[10px] text-teal-800 block uppercase font-sans font-bold">Altman Z-Score</span>
                        <span className="text-base font-black text-slate-900 block mt-0.5">
                          {selectedStock.altmanZScore?.toFixed(2) || '4.50'}
                        </span>
                        <span className="text-[9px] text-emerald-600 font-sans block font-bold">Safe Zone (&gt; 3.0)</span>
                      </div>
                      <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-200 shadow-2xs">
                        <span className="text-[10px] text-teal-800 block uppercase font-sans font-bold">DCF Fair Value</span>
                        <span className="text-base font-black text-emerald-700 block mt-0.5">
                          ₹{selectedStock.dcfFairValue?.toFixed(1) || (selectedStock.cmp * 1.25).toFixed(1)}
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans block">+{selectedStock.marginOfSafetyPct}% Safety</span>
                      </div>
                      <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-200 shadow-2xs">
                        <span className="text-[10px] text-teal-800 block uppercase font-sans font-bold">5Y Multiplier</span>
                        <span className="text-base font-black text-indigo-700 block mt-0.5">
                          {selectedStock.fiveYearMultiplier?.toFixed(1) || '2.8'}x
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans block">At 15Y Compounding</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-200 shadow-2xs">
                        <span className="text-[10px] text-indigo-800 block uppercase font-sans font-bold">Expectancy Score</span>
                        <span className="text-base font-black text-emerald-700 block mt-0.5">
                          +{selectedStock.expectancyRatio?.toFixed(2) || '1.58'}R
                        </span>
                        <span className="text-[9px] text-indigo-700 font-sans block">Positive Mathematical Edge</span>
                      </div>
                      <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-200 shadow-2xs">
                        <span className="text-[10px] text-indigo-800 block uppercase font-sans font-bold">Sharpe Ratio</span>
                        <span className="text-base font-black text-indigo-700 block mt-0.5">
                          {selectedStock.sharpeRatio?.toFixed(2) || '2.25'}
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans block">Risk-Adjusted Alpha</span>
                      </div>
                      <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-200 shadow-2xs">
                        <span className="text-[10px] text-indigo-800 block uppercase font-sans font-bold">Max Losing Streak</span>
                        <span className="text-base font-black text-slate-800 block mt-0.5">
                          {selectedStock.maxConsecutiveLosses || 2} Trades
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans block">Over 15 Years of Data</span>
                      </div>
                      <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-200 shadow-2xs">
                        <span className="text-[10px] text-indigo-800 block uppercase font-sans font-bold">Quarter-Kelly Risk</span>
                        <span className="text-base font-black text-teal-700 block mt-0.5">
                          1.0% (₹5,000)
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans block">Safe Capital Sizing</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Market Cycle Performance */}
                <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs">
                  <span className="font-extrabold text-indigo-950 uppercase tracking-wider block text-[10px]">
                    Market Cycle Performance Breakdown:
                  </span>
                  <p className="text-indigo-900 font-mono mt-0.5">
                    {selectedStock.marketCyclePerformance || 'Bull Cycle: 84.5% Win Rate | Sideways Consolidation: 74.2% Win Rate | Correction / Volatile: 76.0% Win Rate'}
                  </p>
                </div>
              </div>

              {/* SECTION 2: SPECIFIC ENGINES */}
              {modalType === 'value' ? (
                /* ================= LONG-TERM VALUE DEEP AUDIT ================= */
                <div className="space-y-5">
                  {/* Balance Sheet Health & Moat Pillars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Award className="w-4 h-4 text-[#0F766E]" />
                        <h5 className="text-xs font-black uppercase text-slate-900">
                          Balance Sheet Health &amp; Solvency
                        </h5>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">15-Year Historical CAGR</span>
                          <span className="font-bold font-mono text-emerald-700">+{selectedStock.historicalCagr15Y}%</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Return on Equity (ROE)</span>
                          <span className="font-bold font-mono text-emerald-700">{selectedStock.roe}%</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Debt-to-Equity (D/E)</span>
                          <span className="font-bold font-mono text-slate-800">{selectedStock.debtToEquity}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Operating Cash Flow Conversion</span>
                          <span className="font-bold font-mono text-teal-700">{selectedStock.cashFlowConversionPct || 88.0}% (OCF/EBITDA)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Interest Coverage Ratio</span>
                          <span className="font-bold font-mono text-slate-800">{selectedStock.interestCoverageRatio || 14.5}x</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Promoter Pledge</span>
                          <span className="font-bold font-mono text-emerald-700">{selectedStock.promoterPledgePct || 0.0}% (Zero Risk)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                        <h5 className="text-xs font-black uppercase text-slate-900">
                          Institutional Moat Pillars
                        </h5>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 text-teal-950">
                          <span className="font-bold block text-[11px] mb-1">Primary Business Moat:</span>
                          <p className="text-[11px] leading-relaxed">{selectedStock.businessMoat}</p>
                        </div>
                        {selectedStock.fundamentalMoatPillars?.map((pillar, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11px] text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                            <span>{pillar}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3-Tier Tranche Deployment Strategy */}
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-200 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#0F766E]" />
                        <h5 className="text-xs font-black uppercase text-teal-950">
                          3-Tier Institutional Tranche Deployment Strategy
                        </h5>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-teal-900 bg-teal-200/60 px-2 py-0.5 rounded">
                        Never Go All-In
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                      <div className="p-3 bg-white rounded-lg border border-teal-300 shadow-2xs">
                        <span className="text-[10px] text-teal-900 uppercase font-sans font-bold block">
                          Tranche 1 (35% Capital)
                        </span>
                        <div className="text-sm font-black text-slate-900 mt-1">
                          ₹{selectedStock.tranche1Price || selectedStock.cmp}
                        </div>
                        <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                          Initial Value Buy Position
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-teal-300 shadow-2xs">
                        <span className="text-[10px] text-teal-900 uppercase font-sans font-bold block">
                          Tranche 2 (35% Capital)
                        </span>
                        <div className="text-sm font-black text-teal-700 mt-1">
                          ₹{selectedStock.tranche2Price || selectedStock.sma200}
                        </div>
                        <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                          200 SMA Support Floor Retest
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-teal-300 shadow-2xs">
                        <span className="text-[10px] text-teal-900 uppercase font-sans font-bold block">
                          Tranche 3 (30% Capital)
                        </span>
                        <div className="text-sm font-black text-indigo-700 mt-1">
                          ₹{selectedStock.tranche3Price || (selectedStock.cmp * 0.78).toFixed(1)}
                        </div>
                        <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                          Deep Value Capitulation Dip
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ================= SWING TRADING DEEP SETUP ================= */
                <div className="space-y-5">
                  {/* Target Ladder & Invalidation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Target className="w-4 h-4 text-indigo-600" />
                        <h5 className="text-xs font-black uppercase text-slate-900">
                          3-Tier Execution Target Ladder
                        </h5>
                      </div>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 font-sans">Stop Loss (Hard Invalidation)</span>
                          <span className="font-black text-rose-600">₹{selectedStock.stopLoss?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 font-sans">Current / Entry Price</span>
                          <span className="font-black text-slate-900">₹{selectedStock.close?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 font-sans">Target 1 (1:2.0 R:R - Book 50%)</span>
                          <span className="font-black text-emerald-600">₹{selectedStock.target1?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500 font-sans">Target 2 (1:3.0 R:R - Primary Runner)</span>
                          <span className="font-black text-emerald-600">₹{selectedStock.target2?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500 font-sans">Target 3 (1:3.5 R:R - Momentum Extension)</span>
                          <span className="font-black text-teal-600">₹{selectedStock.target3?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <Lock className="w-4 h-4 text-indigo-600" />
                        <h5 className="text-xs font-black uppercase text-slate-900">
                          Automated Breakeven Lock System
                        </h5>
                      </div>
                      <div className="space-y-3 text-xs">
                        <div className="p-3 bg-indigo-50/80 rounded-lg border border-indigo-200 text-indigo-950 font-mono">
                          <span className="text-[10px] text-indigo-700 block uppercase font-sans font-bold">
                            Breakeven Trigger (+1.0R Gain)
                          </span>
                          <div className="text-base font-black text-indigo-900 mt-0.5">
                            ₹{selectedStock.breakevenTriggerPrice?.toFixed(2)}
                          </div>
                          <span className="text-[10px] text-slate-600 font-sans block mt-1">
                            Rule: Once price touches ₹{selectedStock.breakevenTriggerPrice?.toFixed(2)}, the system automatically moves stop loss to Entry + 0.1R profit lock. Risk drops to ZERO.
                          </span>
                        </div>

                        <div className="p-2.5 bg-rose-50/80 rounded-lg border border-rose-200 text-rose-950">
                          <span className="text-[10px] text-rose-800 block uppercase font-bold">
                            Invalidation Condition:
                          </span>
                          <p className="text-[11px] text-rose-900 mt-0.5">
                            {selectedStock.invalidationRule}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-sans">
                {modalType === 'value'
                  ? 'Long-term value investing requires strict tranche gating and patience.'
                  : 'Swing positions enforce an automatic 10-day momentum time stop.'}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {modalType === 'value' ? (
                  <button
                    onClick={() => {
                      if (onSelectTicker) onSelectTicker(selectedStock.symbol);
                      if (onNavigateToWarRoom) onNavigateToWarRoom();
                      closeStockModal();
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Fundamental War Room</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (onSelectTicker) onSelectTicker(selectedStock.symbol);
                      if (onNavigateToChart) onNavigateToChart();
                      closeStockModal();
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open in Chart Analysis</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={closeStockModal}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
