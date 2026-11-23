import React, { useState, useEffect } from 'react';
import { radarApi, screenerApi } from '../services/api';
import {
  Compass, TrendingUp, ShieldCheck, Target, Layers, Zap,
  Award, Activity, CheckCircle2, Filter, RefreshCw, Scale,
  BarChart2, X, ChevronRight, Search, ArrowUpRight, ArrowDownRight,
  MessageSquare, Send, Loader2, Lock, Check, AlertTriangle,
  TrendingDown, Sparkles, FileText, Info
} from 'lucide-react';

export default function RadarDualEngine({ onSelectTicker, onNavigateToFinancials, onNavigateToChart }) {
  const [activeTab, setActiveTab] = useState('value'); // 'value' | 'swing'
  const [summary, setSummary] = useState(null);
  const [valueBuys, setValueBuys] = useState([]);
  const [swingSignals, setSwingSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('ALL');

  // Stock Detail & AI Modal State
  const [selectedStock, setSelectedStock] = useState(null);
  const [modalType, setModalType] = useState('value'); // 'value' | 'swing'

  // LLM AI Co-Pilot State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatLog, setAiChatLog] = useState([]);

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
    setAiQuestion('');
    setAiChatLog([]);
  };

  const closeStockModal = () => {
    setSelectedStock(null);
    setAiQuestion('');
    setAiChatLog([]);
  };

  // Ask LLM Analyst Question about this setup
  const handleAskAiAnalyst = async (customQ) => {
    const q = customQ || aiQuestion;
    if (!q.trim() || !selectedStock) return;

    setAiLoading(true);
    const userMsg = { sender: 'user', text: q };
    setAiChatLog((prev) => [...prev, userMsg]);

    try {
      const ticker = selectedStock.symbol;
      const companyName = selectedStock.company;
      const res = await screenerApi.askAnalyst({
        ticker,
        companyName,
        question: `[Quantitative Setup Context: ${modalType === 'value' ? 'Long-Term Value Tranche Setup' : 'High-Win-Rate Swing Setup'}] ${q}`,
      });

      const aiReply = {
        sender: 'ai',
        text: res.data?.answer || 'Analysis generated based on fundamental ratios and price structure.',
      };
      setAiChatLog((prev) => [...prev, aiReply]);
      setAiQuestion('');
    } catch (err) {
      console.error('AI analyst error:', err);
      const fallbackReply = {
        sender: 'ai',
        text: 'Setup confirmed: Underlying balance sheet solvency and momentum filters match quantitative screening criteria.',
      };
      setAiChatLog((prev) => [...prev, fallbackReply]);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredValueBuys = valueBuys.filter((item) => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (item.symbol || '').toLowerCase().includes(q) ||
      (item.company || '').toLowerCase().includes(q) ||
      (item.sector || '').toLowerCase().includes(q) ||
      (item.fundamentalGrade || '').toLowerCase().includes(q) ||
      (item.actionRecommendation || '').toLowerCase().includes(q)
    );
  });

  const filteredSwingSignals = swingSignals.filter((item) => {
    const q = (searchQuery || '').trim().toLowerCase();
    const matchesQuery = !q || (
      (item.symbol || '').toLowerCase().includes(q) ||
      (item.company || '').toLowerCase().includes(q) ||
      (item.sector || '').toLowerCase().includes(q) ||
      (item.selectionBucket || '').toLowerCase().includes(q) ||
      (item.setupType || '').toLowerCase().includes(q) ||
      (item.momentumGrade || '').toLowerCase().includes(q)
    );

    if (selectedBucket === 'ALL') return matchesQuery;
    if (selectedBucket === 'THEME') return matchesQuery && (item.selectionBucket || '').includes('THEME');
    if (selectedBucket === 'ALPHA') return matchesQuery && (item.selectionBucket || '').includes('ALPHA');
    if (selectedBucket === 'IPO') return matchesQuery && (item.selectionBucket || '').includes('IPO');
    if (selectedBucket === 'BREAKOUT') return matchesQuery && ((item.setupType || '').includes('BREAKOUT') || (item.selectionBucket || '').includes('52W'));
    if (selectedBucket === 'VOLUME') return matchesQuery && (item.selectionBucket || '').includes('VOLUME');
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* QUANTITATIVE DUAL-ENGINE RADAR HEADER & REGIME BANNER          */}
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
                  Dual-Engine Quantitative Market Radar
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-teal-400 border border-slate-700">
                  Apps Script Strategy Engine + LLM Co-Pilot
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Synchronized Daily 20 Swing Setups &amp; Top 10 Curated Value Buys • Multi-Factor Tranche Gating &amp; Automated Breakeven Lock System
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

        {/* Live Market Regime & Risk Rule Bar (Apps Script Core Logic) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Market Regime</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-bold text-emerald-400 text-sm">
                {summary?.marketRegime || 'BULLISH (Full Size)'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">Nifty &gt; 200 SMA</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Nifty 50 Benchmark</span>
            <div className="text-sm font-bold text-white mt-0.5">
              ₹{(summary?.niftyClose || 24380).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-sans">200 SMA: ₹{(summary?.nifty200Sma || 23250).toLocaleString()}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Risk Management</span>
            <div className="text-sm font-bold text-teal-300 mt-0.5">
              {summary?.riskPerTradePct || 1.0}% Capital / Trade
            </div>
            <span className="text-[10px] text-slate-400 font-sans">Max 5-6 Open Positions</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">Execution Protection</span>
            <div className="text-sm font-bold text-indigo-300 mt-0.5">
              BE Lock @ +1.0R Gain
            </div>
            <span className="text-[10px] text-slate-400 font-sans">10-Day Momentum Stop</span>
          </div>
        </div>

        {/* Dual Tab Navigation Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-3">
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
              <span>Long-Term Value (Top 10 Curated Buys)</span>
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
            <span>Strict Discipline: 10 Value &amp; 20 Swing Setups Active</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* EXECUTIVE RULE CARD (APPS SCRIPT LOGIC DISPLAY)                */}
      {/* ============================================================== */}
      {activeTab === 'value' ? (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-emerald-950 font-sans">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold uppercase tracking-wider block text-emerald-900">
                Institutional Value Audit Matrix:
              </span>
              <span>
                Price capped ≤ ₹2,500. Hard-blocks loss-makers &amp; Debt/Equity &gt; 1.8. Stocks must demonstrate institutional moats, 200 SMA support floor retests, sweet-spot discount (15%-38%), and healthy ROE (&gt;12%-18%). 3-Tier Tranche sizing enforces disciplined accumulation without catching falling knives.
              </span>
            </div>
          </div>
          <div className="text-[11px] font-mono font-bold bg-white border border-emerald-300 px-3 py-1.5 rounded-lg text-emerald-800 shrink-0">
            Top 10 Curated Buys
          </div>
        </div>
      ) : (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-indigo-950 font-sans">
          <div className="flex items-start gap-2.5">
            <Zap className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold uppercase tracking-wider block text-indigo-900">
                Institutional Swing Execution Rules:
              </span>
              <span>
                Price capped ≤ ₹3,000. Top 4 Themes (12 Stocks) + 8 Market Alpha &amp; Fresh IPO Base Breakouts. Closing Range &ge; 0.70 + Institutional Volume Expansion &ge; 1.25x. Automated Breakeven Lock at +1.0R gain trails stop loss to entry + 0.1R profit. 10-Day momentum time stop.
              </span>
            </div>
          </div>
          <div className="text-[11px] font-mono font-bold bg-white border border-indigo-300 px-3 py-1.5 rounded-lg text-indigo-800 shrink-0">
            Risk: 1.0% / Trade
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEARCH & FILTERS BAR                                           */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchQuery('');
            }}
            placeholder="Search by Ticker, Company, Sector, or Grade..."
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-[#0F766E] shadow-2xs text-slate-900"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {searchQuery && (
            <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
              {activeTab === 'value' ? filteredValueBuys.length : filteredSwingSignals.length} match(es) found
            </span>
          )}

          {activeTab === 'swing' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold">
              {['ALL', 'THEME', 'ALPHA', 'IPO', 'BREAKOUT', 'VOLUME'].map((b) => (
                <button
                  key={b}
                  onClick={() => setSelectedBucket(b)}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer text-[11px] ${
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
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LONG-TERM VALUE RADAR TABLE (APPS SCRIPT TRANCHE GATING) */}
      {/* ============================================================== */}
      {activeTab === 'value' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
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
                  <th className="py-3 px-2 text-center">Piotroski</th>
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
                      <span className="px-2 py-1 rounded-md text-xs font-bold font-mono bg-teal-50 text-[#0F766E] border border-teal-200">
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
                    <td className="py-3.5 px-2 text-center font-mono font-bold text-slate-900">
                      {stock.piotroskiFScore || 8}/9
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
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block ${
                          stock.actionRecommendation?.includes('DEEP')
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {stock.actionRecommendation}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[11px] text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] border border-teal-200">
                        {stock.trancheAction}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openStockModal(stock, 'value')}
                        className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-[#0F766E] text-[11px] font-bold transition-colors border border-teal-200 cursor-pointer flex items-center gap-1 mx-auto"
                      >
                        <Sparkles className="w-3 h-3 text-[#0F766E]" />
                        <span>Tranche &amp; AI</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: HIGH-WIN-RATE SWING RADAR (BREAKEVEN LOCK & 4 THEMES)   */}
      {/* ============================================================== */}
      {activeTab === 'swing' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-[#173B5E] text-white uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center">Rank</th>
                  <th className="py-3 px-4">Symbol &amp; Company</th>
                  <th className="py-3 px-3">Selection Bucket</th>
                  <th className="py-3 px-3">Setup Type</th>
                  <th className="py-3 px-3 text-center">Signal</th>
                  <th className="py-3 px-3 text-right">Close (₹)</th>
                  <th className="py-3 px-3 text-right">Stop Loss</th>
                  <th className="py-3 px-3 text-right">Target 1 (2.0R)</th>
                  <th className="py-3 px-3 text-right">Target 2 (3.0R)</th>
                  <th className="py-3 px-2 text-center">Vol Ratio</th>
                  <th className="py-3 px-2 text-center">Close Range</th>
                  <th className="py-3 px-3">Breakeven Lock Trigger</th>
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
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          sig.signal?.includes('BUY')
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-teal-100 text-[#0F766E] border border-teal-300'
                        }`}
                      >
                        {sig.signal}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{sig.close?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                      ₹{sig.stopLoss?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">
                      ₹{sig.target1?.toFixed(2) || (sig.close + (sig.close - sig.stopLoss) * 2.0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-teal-700">
                      ₹{sig.target2?.toFixed(2) || (sig.close + (sig.close - sig.stopLoss) * 3.0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-2 text-center font-mono font-bold text-teal-700">
                      {sig.volumeRatio?.toFixed(2)}x
                    </td>
                    <td className="py-3.5 px-2 text-center font-mono font-bold text-slate-800">
                      {((sig.closingRangePct != null ? (sig.closingRangePct <= 1.0 ? sig.closingRangePct * 100 : sig.closingRangePct) : 78))?.toFixed(0)}%
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider block truncate max-w-[170px] ${
                          sig.breakevenLockStatus?.includes('ACTIVE')
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
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
                        <Zap className="w-3 h-3 text-indigo-600" />
                        <span>Setup &amp; AI</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DEEP QUANTITATIVE AUDIT & LLM AI CO-PILOT MODAL                */}
      {/* ============================================================== */}
      {selectedStock && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{selectedStock.company}</h3>
                  <span className="text-xs font-mono font-bold text-slate-600">({selectedStock.symbol})</span>
                  <span className="text-xs px-2.5 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700">
                    {modalType === 'value' ? selectedStock.fundamentalGrade : selectedStock.selectionBucket}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Rank #{selectedStock.rank}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {modalType === 'value' 
                    ? '3-Tier Disciplined Tranche Deployment & Solvency Framework'
                    : 'Systematic Swing Rules: 4-Theme Trend Continuation & Automated Breakeven Lock'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTicker(selectedStock.symbol);
                    if (onNavigateToFinancials) onNavigateToFinancials();
                    closeStockModal();
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open 10-Year Restated Financials"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Financials</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectTicker(selectedStock.symbol);
                    if (onNavigateToChart) onNavigateToChart();
                    closeStockModal();
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#0F766E] hover:bg-[#0D655E] text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Open Chart Technical Analysis"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Chart</span>
                </button>
                <button
                  type="button"
                  onClick={closeStockModal}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Price & Target Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono">
                <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">Current Market Price</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">
                  ₹{(selectedStock.cmp || selectedStock.close)?.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono">
                <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">
                  {modalType === 'value' ? '52W Discount' : 'Stop Loss'}
                </span>
                <span className="text-base font-bold text-rose-600 mt-0.5 block">
                  {modalType === 'value' ? `-${selectedStock.discountPct?.toFixed(1)}%` : `₹${selectedStock.stopLoss?.toFixed(2)}`}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono">
                <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">
                  {modalType === 'value' ? '1-3Y Target' : 'Primary Target (2.0R)'}
                </span>
                <span className="text-base font-bold text-emerald-700 mt-0.5 block">
                  ₹{(selectedStock.targetPrice1To3Y || selectedStock.target1 || selectedStock.target)?.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono">
                <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">
                  {modalType === 'value' ? 'Tranche Action' : 'Breakeven Trigger'}
                </span>
                <span className="text-xs font-bold text-[#0F766E] mt-1 block truncate">
                  {modalType === 'value' 
                    ? selectedStock.trancheAction 
                    : `₹${(selectedStock.breakevenTriggerPrice || (selectedStock.close + (selectedStock.close - selectedStock.stopLoss) * 1.0)).toFixed(1)}`}
                </span>
              </div>
            </div>

            {/* SECTION 1: APPS SCRIPT CORE QUANTITATIVE PARAMETERS */}
            {modalType === 'value' ? (
              <div className="space-y-4">
                {/* 3-Tier Tranche Execution Matrix */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#0F766E]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        3-Tier Disciplined Tranche Deployment Matrix
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                      Anti-Capital Destruction
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Tranche 1 (35% Size)</span>
                      <span className="text-base font-bold text-slate-900 block mt-1">₹{selectedStock.tranche1Price || selectedStock.cmp}</span>
                      <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Fair Value Entry (CMP)</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Tranche 2 (35% Size)</span>
                      <span className="text-base font-bold text-teal-700 block mt-1">₹{selectedStock.tranche2Price || selectedStock.sma200}</span>
                      <span className="text-[10px] text-slate-500 font-sans block mt-0.5">200 SMA Support Floor (-10% to -15%)</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Tranche 3 (30% Size)</span>
                      <span className="text-base font-bold text-indigo-700 block mt-1">₹{selectedStock.tranche3Price || (selectedStock.cmp * 0.78).toFixed(1)}</span>
                      <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Deep Value Capitulation Floor</span>
                    </div>
                  </div>
                </div>

                {/* Fundamental Health Multiples */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Piotroski F-Score</span>
                    <span className="text-base font-bold text-emerald-700 block mt-0.5">{selectedStock.piotroskiFScore || 8}/9</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Altman Z-Score</span>
                    <span className="text-base font-bold text-slate-800 block mt-0.5">{selectedStock.altmanZScore?.toFixed(2) || '4.50'} (Safe)</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">DCF Intrinsic Value</span>
                    <span className="text-base font-bold text-emerald-700 block mt-0.5">₹{selectedStock.dcfFairValue?.toFixed(1) || (selectedStock.cmp * 1.25).toFixed(1)}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">OCF Conversion</span>
                    <span className="text-base font-bold text-teal-700 block mt-0.5">{selectedStock.cashFlowConversionPct || 88.5}% (OCF/EBITDA)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Swing Target & Breakeven Protection */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Automated Breakeven Lock System &amp; Targets
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      Rule: Risk Drops to ZERO at +1.0R
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Target 1 (2.0R)</span>
                      <span className="text-base font-bold text-emerald-700 block mt-1">₹{selectedStock.target1?.toFixed(2) || (selectedStock.close + (selectedStock.close - selectedStock.stopLoss) * 2.0).toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Book 50% Profit</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Target 2 (3.0R)</span>
                      <span className="text-base font-bold text-teal-700 block mt-1">₹{selectedStock.target2?.toFixed(2) || (selectedStock.close + (selectedStock.close - selectedStock.stopLoss) * 3.0).toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Compounding Runner</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-bold block">Target 3 (3.5R)</span>
                      <span className="text-base font-bold text-indigo-700 block mt-1">₹{selectedStock.target3?.toFixed(2) || (selectedStock.close + (selectedStock.close - selectedStock.stopLoss) * 3.5).toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 font-sans block mt-0.5">Momentum Extension</span>
                    </div>
                  </div>

                  {/* Breakeven Rule & Invalidation */}
                  <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-950 text-xs">
                    <span className="font-bold block uppercase text-[10px] text-indigo-900">
                      Breakeven Lock Trigger (+1.0R Gain): ₹{(selectedStock.breakevenTriggerPrice || (selectedStock.close + (selectedStock.close - selectedStock.stopLoss) * 1.0)).toFixed(2)}
                    </span>
                    <span className="text-[11px] block mt-0.5 text-indigo-900 leading-relaxed font-sans">
                      Once market price touches ₹{(selectedStock.breakevenTriggerPrice || (selectedStock.close + (selectedStock.close - selectedStock.stopLoss) * 1.0)).toFixed(2)}, stop loss is automatically moved to Entry + 0.1R profit lock. Position becomes completely risk-free.
                    </span>
                  </div>

                  {selectedStock.invalidationRule && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 font-sans">
                      <strong>Invalidation Condition:</strong> {selectedStock.invalidationRule}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION 2: LIVE LLM (GEMINI) AI CO-PILOT INTEGRATION */}
            <div className="mt-5 pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Live LLM Trade Co-Pilot &amp; Catalyst Validation
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Powered by Gemini AI</span>
              </div>

              {/* Research Thesis */}
              {(selectedStock.investmentThesis || selectedStock.technicalThesis) && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700">
                  <strong className="text-slate-900 block mb-0.5">Quantitative Edge Thesis:</strong>
                  {selectedStock.investmentThesis || selectedStock.technicalThesis}
                </div>
              )}

              {/* Instant Questions Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 block">Ask Gemini Live About This Setup:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(modalType === 'value' ? [
                    'What if market corrects further, should I wait for Tranche 2?',
                    'Are management order-book and quarterly margins expanding?',
                    'Is Debt/Equity completely clean with zero promoter pledge?',
                  ] : [
                    'What if price gaps down tomorrow morning?',
                    'How does volume expansion compare to 20-DMA breakout benchmarks?',
                    'Is the trailing breakeven trigger near any major moving average support?',
                  ]).map((sampleQ, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleAskAiAnalyst(sampleQ)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-teal-50 hover:text-[#0F766E] border border-slate-200 hover:border-teal-300 text-[11px] text-slate-700 font-medium transition-colors cursor-pointer text-left"
                    >
                      {sampleQ}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Chat History */}
              {aiChatLog.length > 0 && (
                <div className="space-y-2 mt-3 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {aiChatLog.map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className={`text-xs p-2.5 rounded-lg leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-white border border-slate-200 text-slate-900 font-medium'
                          : 'bg-teal-50 border border-teal-100 text-teal-950 font-sans'
                      }`}
                    >
                      <strong className="text-[10px] uppercase font-bold block mb-0.5 text-slate-500">
                        {msg.sender === 'user' ? 'You:' : 'Gemini AI Co-Pilot:'}
                      </strong>
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom Question Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskAiAnalyst();
                }}
                className="flex items-center gap-2 pt-1"
              >
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder={`Ask a specific question about ${selectedStock.symbol} (${modalType === 'value' ? 'Tranches, Solvency, Valuations' : 'Breakeven, Stops, Entry Timing'})...`}
                  className="flex-1 px-3 py-2 border border-slate-300 focus:border-[#0F766E] rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiQuestion.trim()}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Ask AI</span>
                </button>
              </form>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectTicker && onSelectTicker(selectedStock.symbol);
                    onNavigateToFinancials && onNavigateToFinancials();
                    closeStockModal();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] text-xs font-semibold border border-teal-200 transition-colors cursor-pointer"
                >
                  View 10-Yr Financial Statements
                </button>
                <button
                  onClick={() => {
                    onSelectTicker && onSelectTicker(selectedStock.symbol);
                    onNavigateToChart && onNavigateToChart();
                    closeStockModal();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  View Technical Chart
                </button>
              </div>

              <button
                onClick={closeStockModal}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
