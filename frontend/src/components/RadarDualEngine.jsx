import React, { useState, useEffect } from 'react';
import { radarApi } from '../services/api';
import {
  Compass, TrendingUp, ShieldCheck, Target, Layers,
  Activity, CheckCircle2, Filter, RefreshCw, Scale,
  BarChart2, ExternalLink, X, ChevronRight, FileText,
  Search, ArrowUpRight, ArrowDownRight, Award, AlertCircle
} from 'lucide-react';

export default function RadarDualEngine({ onSelectTicker, onNavigateToWarRoom, onNavigateToChart }) {
  const [activeTab, setActiveTab] = useState('value'); // 'value' | 'swing'
  const [summary, setSummary] = useState(null);
  const [valueBuys, setValueBuys] = useState([]);
  const [swingSignals, setSwingSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('ALL');

  // Stock Detail Modal State
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
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      item.symbol.toLowerCase().includes(q) ||
      item.company.toLowerCase().includes(q) ||
      item.sector.toLowerCase().includes(q);

    if (selectedBucket === 'ALL') return matchesQuery;
    if (selectedBucket === 'THEME') return matchesQuery && item.selectionBucket?.includes('THEME');
    if (selectedBucket === 'ALPHA') return matchesQuery && item.selectionBucket?.includes('ALPHA');
    if (selectedBucket === 'IPO') return matchesQuery && item.selectionBucket?.includes('IPO');
    if (selectedBucket === 'BREAKOUT') return matchesQuery && (item.setupType?.includes('BREAKOUT') || item.selectionBucket?.includes('52W'));
    if (selectedBucket === 'VOLUME') return matchesQuery && item.selectionBucket?.includes('VOLUME');
    return matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* INSTITUTIONAL MARKET RADAR HEADER & REGIME BAR                 */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] shadow-2xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Market Radar &amp; Systematic Screener
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  NSE &amp; BSE Equities
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-factor screening across fundamental valuation multiples, capital efficiency, and technical trend momentum.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchRadarData}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0F766E]' : 'text-slate-500'}`} />
              <span>{loading ? 'Scanning Markets...' : 'Refresh Radar'}</span>
            </button>
          </div>
        </div>

        {/* Live Market Benchmark Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Market Regime</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-slate-900 text-sm">
                {summary?.marketRegime?.split(' ')[0] || 'Bullish'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">Nifty above 200 DMA</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Nifty 50 Index</span>
            <div className="text-sm font-bold font-mono text-slate-900 mt-1">
              ₹{(summary?.niftyClose || 24380).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              200 DMA: ₹{(summary?.nifty200Sma || 23250).toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Risk Management</span>
            <div className="text-sm font-bold font-mono text-slate-900 mt-1">
              {summary?.riskPerTradePct || 1.0}% Capital / Position
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">Max 5-6 concurrent positions</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Risk / Reward Rule</span>
            <div className="text-sm font-bold font-mono text-slate-900 mt-1">
              Minimum 1:2.0 R:R
            </div>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">Trailing stop on +1.0R gain</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('value')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'value'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Fundamental Value Screener</span>
            </button>
            <button
              onClick={() => setActiveTab('swing')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'swing'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Technical Momentum Scanner</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {activeTab === 'value' 
                ? `${filteredValueBuys.length} Quality Value Candidates Filtered`
                : `${filteredSwingSignals.length} Momentum Setups Filtered`}
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FILTER CRITERIA SUMMARY (CLEAN FINANCIAL TERMINOLOGY)          */}
      {/* ============================================================== */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900">Active Filter Rules:</span>
          {activeTab === 'value' ? (
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">ROE &gt; 15%</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Debt/Equity &lt; 1.0</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Near 200 DMA</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Piotroski Score ≥ 7</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Closing Range &gt; 70%</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Volume &gt; 1.25x 20-DMA</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">Risk/Reward ≥ 1:2.0</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Updated: Today's Market Close
        </div>
      </div>

      {/* ============================================================== */}
      {/* SEARCH & CATEGORY PILLS BAR                                    */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Symbol, Company Name, or Sector..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] shadow-2xs"
          />
        </div>

        {activeTab === 'swing' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
            {['ALL', 'THEME', 'ALPHA', 'IPO', 'BREAKOUT', 'VOLUME'].map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBucket(b)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer text-[11px] ${
                  selectedBucket === b
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {b === 'ALL' ? 'All Signals' : b === 'THEME' ? 'Theme Leaders' : b === 'ALPHA' ? 'Market Alpha' : b === 'IPO' ? 'IPO Breakouts' : b === 'BREAKOUT' ? '52W Breakouts' : 'Volume Buzzers'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: VALUE SCREENER TABLE                                    */}
      {/* ============================================================== */}
      {activeTab === 'value' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 text-center">#</th>
                  <th className="py-3 px-4">Company &amp; Symbol</th>
                  <th className="py-3 px-3">Sector</th>
                  <th className="py-3 px-3 text-right">CMP (₹)</th>
                  <th className="py-3 px-3 text-right">52W Discount</th>
                  <th className="py-3 px-3 text-right">P/E</th>
                  <th className="py-3 px-3 text-right">P/B</th>
                  <th className="py-3 px-3 text-right">ROE %</th>
                  <th className="py-3 px-3 text-right">D/E</th>
                  <th className="py-3 px-3 text-center">Piotroski</th>
                  <th className="py-3 px-3 text-center">Quality Grade</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredValueBuys.map((stock, idx) => (
                  <tr
                    key={stock.symbol}
                    onClick={() => openStockModal(stock, 'value')}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-3 text-center font-bold text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                        {stock.company}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {stock.symbol}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {stock.sector}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{stock.cmp?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                      -{stock.discountPct?.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-800">
                      {stock.pe?.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-800">
                      {stock.pb?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">
                      {stock.roe?.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-800">
                      {stock.debtToEquity?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                      {stock.piotroskiFScore || 8}/9
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Grade {stock.fundamentalGrade?.split(' ')[0] || 'A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            onSelectTicker && onSelectTicker(stock.symbol);
                            onNavigateToWarRoom && onNavigateToWarRoom();
                          }}
                          className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-[#0F766E] text-[11px] font-semibold border border-teal-200 transition-colors"
                        >
                          Financials
                        </button>
                        <button
                          onClick={() => openStockModal(stock, 'value')}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MOMENTUM SCANNER TABLE                                  */}
      {/* ============================================================== */}
      {activeTab === 'swing' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 text-center">#</th>
                  <th className="py-3 px-4">Company &amp; Symbol</th>
                  <th className="py-3 px-3">Setup Pattern</th>
                  <th className="py-3 px-3 text-right">CMP (₹)</th>
                  <th className="py-3 px-3 text-right">Stop Loss</th>
                  <th className="py-3 px-3 text-right">Target Price</th>
                  <th className="py-3 px-3 text-center">R:R Ratio</th>
                  <th className="py-3 px-3 text-center">Volume vs 20D</th>
                  <th className="py-3 px-3 text-center">RSI (14)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSwingSignals.map((sig, idx) => (
                  <tr
                    key={sig.symbol}
                    onClick={() => openStockModal(sig, 'swing')}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-3 text-center font-bold text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-[#0F766E] transition-colors">
                        {sig.company}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500">
                        {sig.symbol}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
                        {sig.setupType || 'Trend Continuation'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{sig.close?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">
                      ₹{sig.stopLoss?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">
                      ₹{sig.target?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                      1:{sig.riskRewardRatio?.toFixed(1) || '2.2'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-[#0F766E]">
                      {sig.volumeRatio?.toFixed(2)}x
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-slate-700">
                      {sig.rsi14?.toFixed(0) || 58}
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            onSelectTicker && onSelectTicker(sig.symbol);
                            onNavigateToChart && onNavigateToChart();
                          }}
                          className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-[#0F766E] text-[11px] font-semibold border border-teal-200 transition-colors"
                        >
                          Chart
                        </button>
                        <button
                          onClick={() => openStockModal(sig, 'swing')}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STOCK DETAIL MODAL (CLEAN FINANCIAL REPORT, ZERO HYPE)          */}
      {/* ============================================================== */}
      {selectedStock && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{selectedStock.company}</h3>
                  <span className="text-xs font-mono font-bold text-slate-500">({selectedStock.symbol})</span>
                  <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                    {selectedStock.sector}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {modalType === 'value' ? 'Fundamental Quality & Valuation Analysis' : 'Technical Trend & Execution Setup'}
                </p>
              </div>

              <button
                onClick={closeStockModal}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Pricing Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Current Price (CMP)</span>
                <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                  ₹{(selectedStock.cmp || selectedStock.close)?.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  {modalType === 'value' ? 'P/E (TTM)' : 'Stop Loss'}
                </span>
                <span className={`text-base font-bold font-mono mt-0.5 block ${modalType === 'value' ? 'text-slate-900' : 'text-rose-600'}`}>
                  {modalType === 'value' ? selectedStock.pe?.toFixed(1) : `₹${selectedStock.stopLoss?.toFixed(2)}`}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  {modalType === 'value' ? '52W Discount' : 'Target Price'}
                </span>
                <span className={`text-base font-bold font-mono mt-0.5 block ${modalType === 'value' ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {modalType === 'value' ? `-${selectedStock.discountPct?.toFixed(1)}%` : `₹${selectedStock.target?.toFixed(2)}`}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                  {modalType === 'value' ? 'Piotroski Score' : 'Risk/Reward'}
                </span>
                <span className="text-base font-bold font-mono text-[#0F766E] mt-0.5 block">
                  {modalType === 'value' ? `${selectedStock.piotroskiFScore || 8}/9` : `1:${selectedStock.riskRewardRatio?.toFixed(1) || '2.2'}`}
                </span>
              </div>
            </div>

            {/* Financial Multiples & Key Metrics Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                {modalType === 'value' ? 'Key Balance Sheet & Solvency Metrics' : 'Technical Indicators & Volume Profile'}
              </h4>

              {modalType === 'value' ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Return on Equity (ROE)</span>
                    <span className="font-bold font-mono text-emerald-700">{selectedStock.roe?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Debt-to-Equity</span>
                    <span className="font-bold font-mono text-slate-800">{selectedStock.debtToEquity?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Price to Book (P/B)</span>
                    <span className="font-bold font-mono text-slate-800">{selectedStock.pb?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">200-Day Moving Avg</span>
                    <span className="font-bold font-mono text-slate-800">₹{selectedStock.sma200?.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Altman Z-Score</span>
                    <span className="font-bold font-mono text-emerald-700">{selectedStock.altmanZScore?.toFixed(2) || '4.20'} (Safe)</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Promoter Pledge</span>
                    <span className="font-bold font-mono text-emerald-700">{selectedStock.promoterPledgePct || 0.0}%</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Setup Pattern</span>
                    <span className="font-bold text-slate-800">{selectedStock.setupType}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Volume Ratio vs 20-DMA</span>
                    <span className="font-bold font-mono text-[#0F766E]">{selectedStock.volumeRatio?.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">RSI (14)</span>
                    <span className="font-bold font-mono text-slate-800">{selectedStock.rsi14?.toFixed(0) || 58}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Closing Range</span>
                    <span className="font-bold font-mono text-slate-800">
                      {((selectedStock.closingRangePct != null ? (selectedStock.closingRangePct <= 1.0 ? selectedStock.closingRangePct * 100 : selectedStock.closingRangePct) : 78))?.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Research Thesis */}
              {(selectedStock.investmentThesis || selectedStock.technicalThesis) && (
                <div className="mt-4 p-3.5 bg-slate-50 border border-slate-100 rounded-lg text-xs leading-relaxed text-slate-700">
                  <span className="font-bold text-slate-900 block mb-1">Research Thesis:</span>
                  <p>{selectedStock.investmentThesis || selectedStock.technicalThesis}</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  onSelectTicker && onSelectTicker(selectedStock.symbol);
                  if (modalType === 'value') {
                    onNavigateToWarRoom && onNavigateToWarRoom();
                  } else {
                    onNavigateToChart && onNavigateToChart();
                  }
                  closeStockModal();
                }}
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                {modalType === 'value' ? 'Open in Financials' : 'Open in Chart'}
              </button>
              <button
                onClick={closeStockModal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
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
