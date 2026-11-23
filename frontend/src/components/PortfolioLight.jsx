import React, { useState, useEffect, useRef } from 'react';
import { portfolioApi, screenerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FormattedAnalystAnswer from './FormattedAnalystAnswer';
import {
  Plus, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2, Activity,
  TrendingDown, Check, MessageSquare, ShieldCheck, Lock, LogIn, AlertCircle,
  HelpCircle, Target, ShieldAlert, DollarSign, PieChart, Info, Send, BarChart3,
  Layers, Wallet, TrendingUp, AlertOctagon, CheckCircle2, Search, X, FileText
} from 'lucide-react';

export default function PortfolioLight({ onSelectTicker, onNavigateToFinancials }) {
  const { user, loginWithGoogle, setAuthModalOpen } = useAuth();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [portfolioSearchQuery, setPortfolioSearchQuery] = useState('');

  // Discuss Stock Modal State
  const [activeDiscussHolding, setActiveDiscussHolding] = useState(null);
  const [discussQuery, setDiscussQuery] = useState('');
  const [discussLoading, setDiscussLoading] = useState(false);
  const [discussResponse, setDiscussResponse] = useState(null);

  // Add Stock Modal State & Autocomplete
  const [showAddModal, setShowAddModal] = useState(false);
  const [fetchingQuote, setFetchingQuote] = useState(false);
  const [tickerSuggestions, setTickerSuggestions] = useState([]);
  const [showTickerDropdown, setShowTickerDropdown] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const tickerDropdownRef = useRef(null);

  const [newHolding, setNewHolding] = useState({
    ticker: '',
    companyName: '',
    quantity: '',
    avgBuyPrice: '',
    currentMarketPrice: '',
    sector: 'Banking & Financials',
    category: 'Compounder',
  });

  const [auditData, setAuditData] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const fetchAudit = async () => {
    setLoadingAudit(true);
    try {
      const res = await portfolioApi.audit();
      setAuditData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchHoldings = async () => {
    setLoading(true);
    try {
      const res = await portfolioApi.getHoldings();
      setHoldings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHoldings();
      fetchAudit();
    }
  }, [user]);

  // Click outside to dismiss ticker dropdown in modal
  useEffect(() => {
    function handleClickOutside(e) {
      if (tickerDropdownRef.current && !tickerDropdownRef.current.contains(e.target)) {
        setShowTickerDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live autocomplete for Ticker in Add Holding Modal
  useEffect(() => {
    if (!newHolding.ticker || newHolding.ticker.trim().length < 1) {
      setTickerSuggestions([]);
      setShowTickerDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await screenerApi.search(newHolding.ticker.trim());
        setTickerSuggestions(res.data || []);
        setShowTickerDropdown((res.data || []).length > 0);
      } catch (err) {
        console.error(err);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [newHolding.ticker]);

  const handleSelectTickerSuggestion = async (item) => {
    setNewHolding((prev) => ({
      ...prev,
      ticker: item.ticker,
      companyName: item.name || prev.companyName,
      sector: item.sector || prev.sector,
    }));
    setShowTickerDropdown(false);
    setTickerSuggestions([]);
    setSelectedSuggestionIndex(-1);
    await handleTickerBlur(item.ticker);
  };

  // Filter holdings safely
  const filteredHoldings = holdings.filter((h) => {
    const q = (portfolioSearchQuery || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (h.ticker || '').toLowerCase().includes(q) ||
      (h.companyName || '').toLowerCase().includes(q) ||
      (h.sector || '').toLowerCase().includes(q) ||
      (h.category || '').toLowerCase().includes(q)
    );
  });

  // Auto-fetch CMP when user types a valid ticker in Add Stock modal
  const handleTickerBlur = async (tickerSymbol) => {
    if (!tickerSymbol || tickerSymbol.length < 2) return;
    setFetchingQuote(true);
    try {
      const res = await screenerApi.getData(tickerSymbol.toUpperCase().trim());
      if (res.data?.ratios?.currentPrice) {
        setNewHolding((prev) => ({
          ...prev,
          currentMarketPrice: res.data.ratios.currentPrice,
          companyName: res.data.profile?.name || prev.companyName || tickerSymbol,
          sector: res.data.profile?.sector || prev.sector,
        }));
      }
    } catch (e) {
      // Ignore if not found
    } finally {
      setFetchingQuote(false);
    }
  };

  const handleAddHolding = async (e) => {
    e.preventDefault();
    if (!newHolding.ticker || !newHolding.quantity || !newHolding.avgBuyPrice) return;
    try {
      await portfolioApi.addHolding({
        ...newHolding,
        quantity: parseInt(newHolding.quantity) || 1,
        avgBuyPrice: parseFloat(newHolding.avgBuyPrice) || 0,
        currentMarketPrice: parseFloat(newHolding.currentMarketPrice) || parseFloat(newHolding.avgBuyPrice) || 0,
      });
      setShowAddModal(false);
      setNewHolding({
        ticker: '',
        companyName: '',
        quantity: '',
        avgBuyPrice: '',
        currentMarketPrice: '',
        sector: 'Banking & Financials',
        category: 'Compounder',
      });
      fetchHoldings();
      fetchAudit();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await portfolioApi.deleteHolding(id);
      fetchHoldings();
      fetchAudit();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDiagnose = async () => {
    setDiagnosing(true);
    try {
      const res = await portfolioApi.diagnose();
      setDiagnosis(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDiagnosing(false);
    }
  };

  // Discuss Stock Handlers
  const openDiscussModal = (holding) => {
    setActiveDiscussHolding(holding);
    setDiscussQuery('');
    setDiscussResponse(null);
  };

  const handleAskStockDiscussion = async (customQuestion) => {
    if (!activeDiscussHolding) return;
    const queryToAsk = customQuestion || discussQuery || 'Aapka is holding par kya verdict hai? Should I hold, book profit, or average?';
    setDiscussLoading(true);
    try {
      const payload = {
        ticker: activeDiscussHolding.ticker,
        companyName: activeDiscussHolding.companyName,
        quantity: activeDiscussHolding.quantity,
        avgBuyPrice: activeDiscussHolding.avgBuyPrice,
        currentMarketPrice: activeDiscussHolding.currentMarketPrice,
        sector: activeDiscussHolding.sector,
        userQuery: queryToAsk,
      };
      const res = await portfolioApi.discussStock(payload);
      setDiscussResponse(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDiscussLoading(false);
    }
  };

  // If user is not authenticated with Google, show the Auth Gate
  if (!user) {
    return (
      <div className="max-w-[800px] mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-14 shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-[#0F766E]"></div>
          
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-center justify-center mx-auto mb-6 shadow-xs">
            <Lock className="w-8 h-8 text-[#0F766E]" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] bg-teal-50 border border-teal-200/80 px-3 py-1 rounded-full inline-block mb-3.5">
            Private Portfolio
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign In to Access Your Portfolio
          </h2>

          <p className="text-sm text-slate-600 max-w-lg mx-auto mt-3 leading-relaxed">
            Track real-time NSE/BSE stock holdings, performance analytics, and dual-engine research on your private positions.
          </p>

          {/* Benefits Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
              <h4 className="text-xs font-bold text-slate-900">Private Ledger</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Real-time CMP synchronization across NSE/BSE with isolated storage.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <MessageSquare className="w-5 h-5 text-[#0F766E] mb-2" />
              <h4 className="text-xs font-bold text-slate-900">Holding Intelligence</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Deep dive into fundamentals, valuation multiples, and quarterly updates.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <Activity className="w-5 h-5 text-teal-600 mb-2" />
              <h4 className="text-xs font-bold text-slate-900">Portfolio Health Audit</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Stress test impact of market corrections and sector diversification.</p>
            </div>
          </div>

          {/* Sign In Call to Action */}
          <div className="max-w-md mx-auto space-y-3">
            <button
              onClick={() => loginWithGoogle()}
              className="w-full py-3 px-5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 text-sm font-semibold flex items-center justify-center gap-3 transition-all shadow-xs"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={() => setAuthModalOpen(true)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-4"
            >
              Sign in with email
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculations
  const totalInvested = holdings.reduce((sum, h) => sum + (h.avgBuyPrice * h.quantity), 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + (h.currentMarketPrice * h.quantity), 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  // Sector breakdown
  const sectorColors = [
    'bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500'
  ];
  const sectorBreakdown = holdings.reduce((acc, h) => {
    const val = (h.currentMarketPrice || h.avgBuyPrice) * h.quantity;
    const sec = h.sector || 'Diversified';
    acc[sec] = (acc[sec] || 0) + val;
    return acc;
  }, {});

  const sectorEntries = Object.entries(sectorBreakdown).map(([sec, val], i) => ({
    sector: sec,
    value: val,
    pct: totalCurrent > 0 ? (val / totalCurrent) * 100 : 0,
    color: sectorColors[i % sectorColors.length],
  }));

  return (
    <div className="space-y-6 max-w-[1320px] mx-auto py-2">
      {/* User Session Banner */}
      <div className="bg-teal-50/70 border border-teal-200/70 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full border border-teal-600 shadow-2xs" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{user.name}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Google Verified
              </span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">{user.email}</span>
          </div>
        </div>
        <div className="text-[11px] text-teal-800 flex items-center gap-2 font-medium">
          <span>Active Encrypted Session</span>
          <span>•</span>
          <span>Click <b>"Analyze Position"</b> on any holding to evaluate allocation and risk</span>
        </div>
      </div>

      {/* Overview Cards with Visual Mini Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Total Invested Capital</span>
          <span className="text-3xl font-black text-slate-900 mt-1.5 block font-mono">
            ₹ {totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-xs text-slate-500 mt-1.5 block font-medium">{holdings.length} Active Holdings</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Current Portfolio Value</span>
          <span className="text-3xl font-black text-slate-900 mt-1.5 block font-mono">
            ₹ {totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-teal-700 font-medium">Real-time CMP Synchronized</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Total Profit & Loss</span>
          <div className={`text-3xl font-black mt-1.5 flex items-center gap-1.5 font-mono ${totalPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {totalPnl >= 0 ? <ArrowUpRight className="w-6 h-6 stroke-[3]" /> : <ArrowDownRight className="w-6 h-6 stroke-[3]" />}
            {totalPnl >= 0 ? '+' : ''}₹ {Math.abs(totalPnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className={`text-xs font-bold mt-1.5 block ${totalPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}% Overall Portfolio Returns
          </span>
        </div>
      </div>

      {/* Asset Allocation & Sector Visualizer */}
      {sectorEntries.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#0F766E]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Asset Allocation & Sector Exposure
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">{sectorEntries.length} Sectors Active</span>
          </div>

          {/* Multi-Color Progress Bar */}
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/70">
            {sectorEntries.map((sec, idx) => (
              <div
                key={idx}
                className={`${sec.color} h-full first:rounded-l-full last:rounded-r-full transition-all duration-300`}
                style={{ width: `${sec.pct}%` }}
                title={`${sec.sector}: ${sec.pct.toFixed(1)}%`}
              ></div>
            ))}
          </div>

          {/* Sector Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {sectorEntries.map((sec, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-sans">
                <span className={`w-2.5 h-2.5 rounded-full ${sec.color}`}></span>
                <span className="text-slate-700 font-medium">{sec.sector}</span>
                <span className="text-slate-400 font-mono font-bold text-[11px]">({sec.pct.toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">Portfolio Holdings &amp; Asset Allocation</h3>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {holdings.length} Positions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Click <b>"Analyze"</b> on any row to evaluate valuation multiples and position health.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Holdings Quick Filter */}
            {holdings.length > 0 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={portfolioSearchQuery}
                  onChange={(e) => setPortfolioSearchQuery(e.target.value)}
                  placeholder="Filter holdings..."
                  className="pl-8 pr-7 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E] w-36 sm:w-48 text-slate-800"
                />
                {portfolioSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setPortfolioSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Stock
            </button>
            <button
              onClick={fetchAudit}
              disabled={loadingAudit || holdings.length === 0}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loadingAudit ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Audit Portfolio Health</span>
                </>
              )}
            </button>
            <button
              onClick={handleDiagnose}
              disabled={diagnosing || holdings.length === 0}
              className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {diagnosing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Diagnosing...</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Run Stress Test</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 font-mono">
            <thead className="bg-slate-50/80 text-[11px] uppercase text-slate-500 font-sans border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-6">Stock Symbol</th>
                <th className="py-3.5 px-4">Sector</th>
                <th className="py-3.5 px-4 text-right">Shares</th>
                <th className="py-3.5 px-4 text-right">Avg Buy Price</th>
                <th className="py-3.5 px-4 text-right">Live CMP</th>
                <th className="py-3.5 px-4 text-right">Returns (P&L)</th>
                <th className="py-3.5 px-4 text-center">Classification</th>
                <th className="py-3.5 px-4 text-center">Analysis</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holdings.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-14 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-[#0F766E] shadow-2xs">
                        <Plus className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900 font-sans">
                        Your Portfolio is Clean &amp; Empty
                      </h4>
                      <p className="text-xs text-slate-500 font-sans leading-relaxed">
                        No positions recorded yet under <span className="font-mono font-semibold text-slate-700">{user.email}</span>. Click below to add your first stock holding.
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 font-sans cursor-pointer mt-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Stock</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {filteredHoldings.length === 0 && holdings.length > 0 && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-500 font-sans text-xs">
                    No holdings match your search for "{portfolioSearchQuery}".
                  </td>
                </tr>
              )}
              {filteredHoldings.map((h) => {
                const invested = h.avgBuyPrice * h.quantity;
                const current = h.currentMarketPrice * h.quantity;
                const pnl = current - invested;
                const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
                const isPos = pnl >= 0;

                return (
                  <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold font-sans text-slate-900">
                      <div 
                        onClick={() => {
                          if (onSelectTicker) {
                            onSelectTicker(h.ticker);
                            if (onNavigateToFinancials) onNavigateToFinancials();
                          }
                        }}
                        className={`flex items-center gap-2 group ${onSelectTicker ? 'cursor-pointer' : ''}`}
                        title={onSelectTicker ? `Click to view ${h.ticker} 10-year financials` : undefined}
                      >
                        <span className={`w-2 h-2 rounded-full ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span className="group-hover:text-[#0F766E] transition-colors">{h.ticker}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block font-normal ml-4">{h.companyName}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-sans">{h.sector}</td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">{h.quantity}</td>
                    <td className="py-4 px-4 text-right">₹{h.avgBuyPrice?.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">₹{h.currentMarketPrice?.toFixed(2)}</td>
                    <td className={`py-4 px-4 text-right font-bold ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPos ? '+' : ''}₹{pnl.toFixed(0)} ({isPos ? '+' : ''}{pnlPct.toFixed(2)}%)
                    </td>
                    <td className="py-4 px-4 text-center font-sans">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        h.category === 'Compounder' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        h.category === 'Cyclical' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {h.category}
                      </span>
                    </td>
                    {/* Discuss Single Stock Button */}
                    <td className="py-4 px-4 text-center font-sans">
                      <button
                        onClick={() => openDiscussModal(h)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-300 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 mx-auto hover:shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Discuss Stock</span>
                      </button>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button onClick={() => handleDelete(h.id)} className="text-slate-300 hover:text-rose-600 transition-colors p-1" title="Delete holding">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* PORTFOLIO FUNDAMENTAL & TECHNICAL AUDIT                        */}
      {/* ============================================================== */}
      {holdings.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-5">
          {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0F766E] shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Portfolio Fundamental &amp; Risk Audit
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Institutional Framework
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Evaluation across valuation multiples (P/E, ROE), debt solvency, promoter ownership, and 200-day moving average position.
              </span>
            </div>
          </div>

          <button
            onClick={fetchAudit}
            disabled={loadingAudit}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 self-start md:self-auto shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
            <span>Re-Audit Portfolio</span>
          </button>
        </div>

        {/* Executive Summary Bar */}
        {auditData && (
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold font-sans">{auditData.executiveSummary}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="px-2.5 py-1 rounded bg-rose-950/90 text-rose-300 border border-rose-700 text-[11px] font-bold">
                Red Flags: {auditData.redFlagCount}
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-700 text-[11px] font-bold">
                Tranche Adds: {auditData.trancheOpportunitiesCount}
              </span>
            </div>
          </div>
        )}

        {/* Table of Audited Holdings */}
        {auditData && auditData.auditedHoldings && auditData.auditedHoldings.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs divide-y divide-slate-100">
              <thead className="bg-[#283593] text-white uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-3">Symbol</th>
                  <th className="py-3 px-3">Sub-Sector</th>
                  <th className="py-3 px-3 text-right">Avg Price</th>
                  <th className="py-3 px-2 text-center">Qty</th>
                  <th className="py-3 px-3 text-right">CMP (₹)</th>
                  <th className="py-3 px-3 text-right">P&amp;L (%)</th>
                  <th className="py-3 px-3 text-right">52W Drop</th>
                  <th className="py-3 px-3 text-right">200 SMA</th>
                  <th className="py-3 px-2 text-center">RSI</th>
                  <th className="py-3 px-2 text-center">P/E</th>
                  <th className="py-3 px-2 text-center">ROE %</th>
                  <th className="py-3 px-2 text-center">D/E</th>
                  <th className="py-3 px-3 text-center">Health Grade</th>
                  <th className="py-3 px-4 text-center">System Recommendation</th>
                  <th className="py-3 px-3 text-center">Add Qty</th>
                  <th className="py-3 px-3 text-right">New Avg (₹)</th>
                  <th className="py-3 px-4">Action Plan &amp; Advice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {auditData.auditedHoldings.map((h) => {
                  const isRedFlag = h.isAveragingBlocked || h.systemRecommendation?.includes('EXIT') || h.fundamentalHealth?.includes('RED FLAG');
                  const isTrancheAdd = h.suggestedAddQty > 0;
                  const isProfit = h.pnlPercentage >= 0;

                  return (
                    <tr key={h.symbol} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-bold font-mono text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isRedFlag ? 'bg-rose-500' : isProfit ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          <span>{h.symbol}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-slate-600 font-medium">{h.sector}</td>
                      <td className="py-3.5 px-3 text-right font-mono">₹{h.avgBuyPrice?.toFixed(2)}</td>
                      <td className="py-3.5 px-2 text-center font-mono font-bold text-slate-800">{h.quantity}</td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900">₹{h.currentPrice?.toFixed(2)}</td>
                      <td className={`py-3.5 px-3 text-right font-mono font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isProfit ? '+' : ''}{h.pnlPercentage?.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-rose-600">-{h.discountPct?.toFixed(1)}%</td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-600">₹{h.sma200?.toFixed(1)}</td>
                      <td className="py-3.5 px-2 text-center font-mono">{h.rsi14?.toFixed(1)}</td>
                      <td className="py-3.5 px-2 text-center font-mono">{h.pe ? h.pe.toFixed(1) : '-'}</td>
                      <td className="py-3.5 px-2 text-center font-mono font-bold text-emerald-700">{h.roe?.toFixed(1)}%</td>
                      <td className={`py-3.5 px-2 text-center font-mono font-bold ${h.debtToEquity > 1.8 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {h.debtToEquity?.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          h.fundamentalHealth?.includes('A')
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : h.fundamentalHealth?.includes('RED')
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {h.fundamentalHealth}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider block whitespace-nowrap ${
                          h.systemRecommendation?.includes('AVERAGE') || h.systemRecommendation?.includes('ACCUMULATE')
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : h.systemRecommendation?.includes('EXIT')
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : h.systemRecommendation?.includes('TRIM')
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}>
                          {h.systemRecommendation}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-900">
                        {isTrancheAdd ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            +{h.suggestedAddQty} sh
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-teal-800">
                        {isTrancheAdd ? `₹${h.newEstimatedAvgPrice?.toFixed(2)}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-slate-700 max-w-xs leading-relaxed">
                        {h.actionPlan}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs font-sans">
            Click <b>"Re-Audit Portfolio"</b> to execute the comprehensive fundamental and technical audit.
          </div>
        )}
      </div>
      )}

      {/* Stress-Test & Rebalancing Blueprint */}
      {diagnosis && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col items-center justify-center font-mono shadow-2xs">
                <span className="text-2xl font-black text-[#0F766E]">{diagnosis.healthScore}</span>
                <span className="text-[9px] text-slate-500 uppercase font-sans font-bold">Health / 100</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Portfolio Concentration & Risk Profile</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                  {diagnosis.concentrationRiskAssessment}
                </p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-4 w-full md:w-80">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                <TrendingDown className="w-4 h-4" />
                <span>-8% Market Stress Test</span>
              </div>
              <p className="text-[11px] text-rose-800 mt-1.5 font-mono leading-relaxed">
                {diagnosis.stressTestSummary}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-sans">
              Portfolio Rebalancing Blueprint
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {diagnosis.rebalancingBlueprint?.map((step, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 font-mono">
                    {idx + 1}
                  </div>
                  <span className="text-xs text-slate-700 leading-relaxed font-sans">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Discuss Single Stock Modal */}
      {activeDiscussHolding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Close Button & Financials Link */}
            <div className="absolute top-5 right-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onSelectTicker) onSelectTicker(activeDiscussHolding.ticker);
                  if (onNavigateToFinancials) onNavigateToFinancials();
                  setActiveDiscussHolding(null);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Open complete 10-year financials"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Financials</span>
              </button>
              <button
                onClick={() => setActiveDiscussHolding(null)}
                className="text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Header with Holding Stats */}
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-md">
                  Position Research &amp; Advisory
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-sans">{activeDiscussHolding.sector}</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
                {activeDiscussHolding.companyName} ({activeDiscussHolding.ticker})
              </h3>

              {/* Holding Key Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">Holding Shares</span>
                  <span className="font-bold text-slate-900 text-sm">{activeDiscussHolding.quantity} qty</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">Avg Buy Price</span>
                  <span className="font-bold text-slate-900 text-sm">₹{activeDiscussHolding.avgBuyPrice?.toFixed(2)}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">Live CMP</span>
                  <span className="font-bold text-slate-900 text-sm">₹{activeDiscussHolding.currentMarketPrice?.toFixed(2)}</span>
                </div>
                <div className={`p-3 rounded-xl border ${
                  activeDiscussHolding.currentMarketPrice >= activeDiscussHolding.avgBuyPrice
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                  <span className="text-[10px] font-sans uppercase font-bold block">Unrealized P&L</span>
                  <span className="font-bold text-sm">
                    {activeDiscussHolding.currentMarketPrice >= activeDiscussHolding.avgBuyPrice ? '+' : ''}
                    {(((activeDiscussHolding.currentMarketPrice - activeDiscussHolding.avgBuyPrice) / activeDiscussHolding.avgBuyPrice) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Query Pills */}
            <div className="my-5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2 font-sans">
                Sample Analytical Questions:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Should I hold, book partial profits, or trail stop loss at current levels?',
                  'Fundamental risk assessment: Is the underlying business thesis intact?',
                  '12-Month fair value target and key downside support levels',
                  'Capital efficiency: How does this stock compare to sector peers?'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDiscussQuery(q);
                      handleAskStockDiscussion(q);
                    }}
                    className="text-left text-xs px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 hover:text-[#0F766E] hover:border-teal-300 border border-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Query Textarea */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block font-sans">
                Ask a specific query about this holding:
              </label>
              <div className="relative">
                <textarea
                  rows="2"
                  value={discussQuery}
                  onChange={(e) => setDiscussQuery(e.target.value)}
                  placeholder="e.g. Evaluate whether to maintain allocation through the upcoming quarterly earnings release"
                  className="w-full p-3.5 text-xs border border-slate-300 focus:border-[#0F766E] rounded-xl focus:outline-none transition-colors shadow-2xs font-sans leading-relaxed"
                />
              </div>
              <button
                onClick={() => handleAskStockDiscussion()}
                disabled={discussLoading}
                className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50"
              >
                {discussLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Position Fundamentals...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generate Position Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Response Card */}
            {discussResponse && (
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-4 animate-in fade-in duration-300">
                {discussResponse.holdingAction === 'SCOPE NOTICE' || discussResponse.userQueryAnswer?.includes('Scope Notice') ? (
                  <FormattedAnalystAnswer text={discussResponse.userQueryAnswer} />
                ) : (
                  <>
                    {/* Holding Action Verdict Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Recommended Action</span>
                        <span className={`text-base font-black mt-0.5 inline-block ${
                          discussResponse.holdingAction?.includes('HOLD') ? 'text-emerald-700' :
                          discussResponse.holdingAction?.includes('TRIM') ? 'text-amber-700' :
                          discussResponse.holdingAction?.includes('AVERAGE') ? 'text-blue-700' : 'text-rose-700'
                        }`}>
                          {discussResponse.holdingAction}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">12M Target</span>
                          <span className="font-bold text-emerald-600">₹{discussResponse.targetPrice12M?.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">Stop Loss / Trigger</span>
                          <span className="font-bold text-rose-600">₹{discussResponse.stopLossOrExitTrigger?.toFixed(1)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold block">Risk Level</span>
                          <span className="font-bold text-slate-700">{discussResponse.riskLevel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Answer to User's Question */}
                    <div className="p-5 rounded-2xl bg-white border border-teal-200 shadow-2xs">
                      <div className="flex items-center gap-2 text-[#0F766E] font-bold text-xs mb-2 font-sans border-b border-teal-50 pb-1.5">
                        <Target className="w-4 h-4 text-[#0F766E]" />
                        <span>Direct Resolution to Your Query: "{discussResponse.userQuery}"</span>
                      </div>
                      <FormattedAnalystAnswer text={discussResponse.userQueryAnswer} />
                    </div>

                    {/* Tax & Reallocation Blueprint */}
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs font-sans">
                      <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Tax Advisory & Capital Reallocation Blueprint</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        {discussResponse.taxAndReallocationAdvice}
                      </p>
                    </div>

                    {/* Strategic Institutional Bullet Points */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2 font-sans">
                        Strategic Investment Takeaways:
                      </span>
                      <div className="space-y-2">
                        {discussResponse.strategicBulletPoints?.map((pt, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-sans">
                            <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono text-right">
                      Analysis Timestamp: {discussResponse.timestamp}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Holding Modal (Clean, No Hardcoded Values) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-1">Add Stock to Portfolio</h3>
            <p className="text-xs text-slate-500 mb-4">Search company or enter ticker to auto-fetch live market price.</p>
            
            <form onSubmit={handleAddHolding} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Search Company or Ticker (NSE/BSE)</label>
                <div className="relative" ref={tickerDropdownRef}>
                  <input
                    type="text"
                    required
                    placeholder="Search e.g. Tata, Reliance, INFY, HDFC Bank..."
                    value={newHolding.ticker}
                    onFocus={() => {
                      if (tickerSuggestions.length > 0) setShowTickerDropdown(true);
                    }}
                    onChange={(e) => setNewHolding({ ...newHolding, ticker: e.target.value.toUpperCase() })}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown' && tickerSuggestions.length > 0) {
                        e.preventDefault();
                        setShowTickerDropdown(true);
                        setSelectedSuggestionIndex((prev) => (prev < tickerSuggestions.length - 1 ? prev + 1 : 0));
                      } else if (e.key === 'ArrowUp' && tickerSuggestions.length > 0) {
                        e.preventDefault();
                        setShowTickerDropdown(true);
                        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : tickerSuggestions.length - 1));
                      } else if (e.key === 'Enter') {
                        if (showTickerDropdown && selectedSuggestionIndex >= 0 && tickerSuggestions[selectedSuggestionIndex]) {
                          e.preventDefault();
                          handleSelectTickerSuggestion(tickerSuggestions[selectedSuggestionIndex]);
                        } else if (showTickerDropdown && tickerSuggestions.length > 0) {
                          e.preventDefault();
                          handleSelectTickerSuggestion(tickerSuggestions[0]);
                        }
                      } else if (e.key === 'Escape') {
                        setShowTickerDropdown(false);
                      }
                    }}
                    onBlur={(e) => {
                      setTimeout(() => {
                        handleTickerBlur(e.target.value);
                      }, 200);
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#0F766E] shadow-2xs"
                  />
                  {fetchingQuote && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-teal-600 font-sans">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Fetching quote...</span>
                    </div>
                  )}

                  {/* Autocomplete Dropdown */}
                  {showTickerDropdown && tickerSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                      {tickerSuggestions.map((item, idx) => (
                        <button
                          key={item.ticker}
                          type="button"
                          onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectTickerSuggestion(item);
                          }}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            selectedSuggestionIndex === idx ? 'bg-teal-50 text-teal-900' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-slate-900 font-sans">{item.name}</span>
                            <span className="text-slate-500 ml-1.5 font-mono">({item.ticker})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-sans">{item.sector}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infosys Ltd"
                  value={newHolding.companyName}
                  onChange={(e) => setNewHolding({ ...newHolding, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0F766E] shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Shares (Qty)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    value={newHolding.quantity}
                    onChange={(e) => setNewHolding({ ...newHolding, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0F766E] shadow-2xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Avg Buy Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder="e.g. 1540.00"
                    value={newHolding.avgBuyPrice}
                    onChange={(e) => setNewHolding({ ...newHolding, avgBuyPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0F766E] shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Current Market Price (CMP ₹)</label>
                <input
                  type="number"
                  step="0.05"
                  placeholder="Auto-fetched or enter CMP"
                  value={newHolding.currentMarketPrice}
                  onChange={(e) => setNewHolding({ ...newHolding, currentMarketPrice: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#0F766E] shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold transition-all shadow-xs"
                >
                  Save to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
