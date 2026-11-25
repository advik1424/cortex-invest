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
  const [holdings, setHoldings] = useState(() => {
    try {
      const saved = localStorage.getItem('cortex_portfolio_holdings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
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
  const [modalSearchInput, setModalSearchInput] = useState('');
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
      if (res.data && res.data.length > 0) {
        setHoldings(res.data);
        localStorage.setItem('cortex_portfolio_holdings', JSON.stringify(res.data));
      } else {
        const saved = localStorage.getItem('cortex_portfolio_holdings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0) {
            setHoldings(parsed);
            // Bidirectionally populate backend DB so data is never lost across browser cache clears
            parsed.forEach((h) => {
              const { id, ...cleanH } = h;
              portfolioApi.addHolding(cleanH).catch(() => {});
            });
          }
        }
      }
    } catch (err) {
      console.warn('Network error, restoring from localStorage:', err);
      const saved = localStorage.getItem('cortex_portfolio_holdings');
      if (saved) {
        try { setHoldings(JSON.parse(saved)); } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
    fetchAudit();
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

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setModalSearchInput('');
    setTickerSuggestions([]);
    setShowTickerDropdown(false);
    setSelectedSuggestionIndex(-1);
    setNewHolding({
      ticker: '',
      companyName: '',
      quantity: '',
      avgBuyPrice: '',
      currentMarketPrice: '',
      sector: 'Banking & Financials',
      category: 'Compounder',
    });
  };

  // Live autocomplete for Company / Ticker in Add Holding Modal
  useEffect(() => {
    const q = (modalSearchInput || '').trim();
    if (q.length < 1) {
      setTickerSuggestions([]);
      setShowTickerDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await screenerApi.search(q);
        const list = res.data || [];
        setTickerSuggestions(list);
        setShowTickerDropdown(list.length > 0);
      } catch (err) {
        console.error('Ticker search error:', err);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [modalSearchInput]);

  const handleSelectTickerSuggestion = (item) => {
    const price = item.currentPrice || item.price || 1000;
    setNewHolding((prev) => ({
      ...prev,
      ticker: item.ticker,
      companyName: item.name || item.ticker,
      sector: item.sector || prev.sector,
      currentMarketPrice: price,
      avgBuyPrice: prev.avgBuyPrice || price,
    }));
    setModalSearchInput(`${item.name} (${item.ticker})`);
    setShowTickerDropdown(false);
    setTickerSuggestions([]);
    setSelectedSuggestionIndex(-1);
  };

  const handleDirectTickerSubmit = async (symbol) => {
    if (!symbol || symbol.trim().length < 2) return;
    const cleanSym = symbol.trim().toUpperCase();
    setFetchingQuote(true);
    try {
      const res = await screenerApi.getData(cleanSym);
      if (res.data) {
        const price = res.data.ratios?.currentPrice || 1000;
        const name = res.data.profile?.name || cleanSym;
        const sector = res.data.profile?.sector || 'Diversified';
        setNewHolding((prev) => ({
          ...prev,
          ticker: cleanSym,
          companyName: name,
          sector: sector,
          currentMarketPrice: price,
          avgBuyPrice: prev.avgBuyPrice || price,
        }));
        setModalSearchInput(`${name} (${cleanSym})`);
        setShowTickerDropdown(false);
      }
    } catch (e) {
      console.warn('Quote fetch fallback:', e);
    } finally {
      setFetchingQuote(false);
    }
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

  const handleAddHolding = async (e) => {
    e.preventDefault();
    if (!newHolding.ticker || !newHolding.quantity || !newHolding.avgBuyPrice) return;
    
    const cleanHolding = {
      ticker: (newHolding.ticker || '').toUpperCase().trim(),
      companyName: newHolding.companyName || newHolding.ticker,
      quantity: parseInt(newHolding.quantity) || 1,
      avgBuyPrice: parseFloat(newHolding.avgBuyPrice) || 0,
      currentMarketPrice: parseFloat(newHolding.currentMarketPrice) || parseFloat(newHolding.avgBuyPrice) || 0,
      sector: newHolding.sector || 'Diversified',
      category: newHolding.category || 'Compounder',
    };

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

    try {
      const res = await portfolioApi.addHolding(cleanHolding);
      const savedItem = res?.data || { ...cleanHolding, id: Date.now() };
      setHoldings((prev) => {
        const updated = [...prev, savedItem];
        localStorage.setItem('cortex_portfolio_holdings', JSON.stringify(updated));
        return updated;
      });
      fetchAudit();
    } catch (err) {
      console.warn('Backend sync deferred, saving locally:', err);
      const fallbackItem = { ...cleanHolding, id: Date.now() };
      setHoldings((prev) => {
        const updated = [...prev, fallbackItem];
        localStorage.setItem('cortex_portfolio_holdings', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleDelete = async (id) => {
    // Instant local deletion
    setHoldings((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      localStorage.setItem('cortex_portfolio_holdings', JSON.stringify(updated));
      return updated;
    });

    try {
      await portfolioApi.deleteHolding(id);
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
  const handleAskStockDiscussion = async (customQuestion, explicitHolding) => {
    const targetHolding = explicitHolding || activeDiscussHolding;
    if (!targetHolding) return;
    const queryToAsk = customQuestion || discussQuery || 'Aapka is holding par kya verdict hai? Why is this stock lagging and what is the recovery horizon?';
    setDiscussLoading(true);
    try {
      const payload = {
        ticker: targetHolding.ticker,
        companyName: targetHolding.companyName,
        quantity: targetHolding.quantity,
        avgBuyPrice: targetHolding.avgBuyPrice,
        currentMarketPrice: targetHolding.currentMarketPrice,
        sector: targetHolding.sector,
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

  const openDiscussModal = (holding) => {
    setActiveDiscussHolding(holding);
    setDiscussQuery('');
    setDiscussResponse(null);
    handleAskStockDiscussion('What is the forensic institutional diagnosis for this holding? Detail why the stock is underperforming, how long to wait, and specific concall catalysts to track.', holding);
  };

  // User session state (non-blocking for seamless local persistence)
  const isGuest = !user;

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
      {/* User Session Banner (Supports both Google and Persistent Guest mode) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        {user ? (
          <div className="flex items-center gap-3">
            <img src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} alt={user.name} className="w-7 h-7 rounded-full border border-teal-600 shadow-2xs" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{user.name}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Google Cloud Synced
                </span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">{user.email}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Private Local Portfolio Session</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  Persisted on Device
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                Added positions are preserved on refresh. Sign in with Google anytime to back up to the cloud.
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          {!user && (
            <button
              onClick={() => loginWithGoogle()}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In with Google</span>
            </button>
          )}
          <span className="text-[11px] text-slate-400 font-medium hidden md:inline-block">
            Auto-Sync Active
          </span>
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
              onClick={handleOpenAddModal}
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
                        onClick={handleOpenAddModal}
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

      {/* ============================================================== */}
      {/* STEP-BY-STEP PER-STOCK ACTIONABLE ADVICE & DECISION ENGINE     */}
      {/* ============================================================== */}
      {auditData?.auditedHoldings?.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#0F766E]" />
                <span>Step-by-Step Per-Stock Decision Engine (Hold / Average / Buy / Sell)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent institutional analysis for each holding explaining WHY to hold, average, or exit, plus critical support &amp; resistance levels.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditData.auditedHoldings.map((stock) => {
              const isProfit = stock.pnlPercentage >= 0;
              const isRedFlag = stock.isAveragingBlocked || stock.systemRecommendation?.includes('EXIT');
              const isAverage = stock.systemRecommendation?.includes('AVERAGE') || stock.systemRecommendation?.includes('ACCUMULATE');
              const isTrim = stock.systemRecommendation?.includes('TRIM');

              const supportLvl = stock.supportLevel || (stock.sma200 ? stock.sma200.toFixed(1) : (stock.currentPrice * 0.94).toFixed(1));
              const resistanceLvl = stock.resistanceLevel || (stock.fiftyTwoWeekHigh ? stock.fiftyTwoWeekHigh.toFixed(1) : (stock.currentPrice * 1.15).toFixed(1));

              return (
                <div key={stock.symbol} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5 hover:border-slate-300 transition-all">
                  {/* Stock Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-slate-900">{stock.symbol}</span>
                        <span className="text-[11px] font-semibold text-slate-500">({stock.company})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {stock.sector}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-slate-500 font-mono">Qty: <strong className="text-slate-800">{stock.quantity}</strong></span>
                        <span>•</span>
                        <span className="text-slate-500 font-mono">Avg: ₹{stock.avgBuyPrice?.toFixed(1)}</span>
                        <span>•</span>
                        <span className="text-slate-900 font-mono font-bold">CMP: ₹{stock.currentPrice?.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-xs font-bold font-mono ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isProfit ? '+' : ''}{stock.pnlPercentage?.toFixed(1)}% (₹{stock.pnlAmount?.toFixed(0)})
                      </div>
                      <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isAverage
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isRedFlag
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : isTrim
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {stock.systemRecommendation}
                      </span>
                    </div>
                  </div>

                  {/* Why Section */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px]">
                      <Info className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>Kyun karein? (Clear Decision Rationale):</span>
                    </span>
                    <p className="text-slate-700 leading-relaxed font-sans">
                      {stock.whyReason || stock.actionPlan}
                    </p>
                  </div>

                  {/* Critical Support & Resistance Levels to Wait For */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl">
                      <span className="text-[10px] font-sans font-bold text-emerald-800 block uppercase">
                        Support Floor (Wait Level)
                      </span>
                      <span className="text-sm font-bold text-emerald-900 mt-0.5 block">
                        ₹{supportLvl}
                      </span>
                      <span className="text-[10px] font-sans text-emerald-700 block mt-0.5">
                        200-SMA Institutional Bedrock
                      </span>
                    </div>

                    <div className="p-2.5 bg-blue-50/50 border border-blue-200/80 rounded-xl">
                      <span className="text-[10px] font-sans font-bold text-blue-800 block uppercase">
                        Resistance Hurdle
                      </span>
                      <span className="text-sm font-bold text-blue-900 mt-0.5 block">
                        ₹{resistanceLvl}
                      </span>
                      <span className="text-[10px] font-sans text-blue-700 block mt-0.5">
                        52W High / Trend Ceiling
                      </span>
                    </div>
                  </div>

                  {/* Corporate Activities & Concall Guidance */}
                  {stock.corporateActivitySummary && (
                    <div className="p-2.5 bg-teal-50/40 border border-teal-200/60 rounded-xl text-xs space-y-0.5">
                      <span className="text-[10px] font-bold text-teal-900 uppercase block font-sans">
                        Company Structure &amp; Concall Activities:
                      </span>
                      <p className="text-slate-700 font-sans leading-relaxed text-[11px]">
                        {stock.corporateActivitySummary}
                      </p>
                    </div>
                  )}

                  {/* Tranche Action Card */}
                  {stock.suggestedAddQty > 0 && (
                    <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-bold text-emerald-950 font-sans block text-[11px]">
                          Tranche Playbook: Add +{stock.suggestedAddQty} Shares @ CMP
                        </span>
                        <span className="text-[10px] text-emerald-800 font-sans">
                          Lowers your average cost from ₹{stock.avgBuyPrice?.toFixed(1)} ➔ ₹{stock.newEstimatedAvgPrice?.toFixed(1)}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-800 text-white rounded font-mono font-bold text-[10px]">
                        TRANCHE READY
                      </span>
                    </div>
                  )}

                  {/* 1-Click Discuss Button */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openDiscussModal({
                        ticker: stock.symbol,
                        companyName: stock.company,
                        quantity: stock.quantity,
                        avgBuyPrice: stock.avgBuyPrice,
                        currentMarketPrice: stock.currentPrice,
                        sector: stock.sector
                      })}
                      className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                      <span>Deep AI Analysis for {stock.symbol}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
                  'Kyun is company mein averaging karein ya hold karein?',
                  'Kyun fall aa raha hai aur company ke structural reason kya hain?',
                  'Kaun se critical support floor aur resistance level hain jiska wait karein?',
                  'Recent meeting & concall mein kya discuss hua aur future outlook kya hai?',
                  'Should I hold, book partial profits, or average down at CMP?'
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

      {/* Add Holding Modal (Groww + Screener.in Fast Autocomplete) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add Stock to Portfolio</h3>
                <p className="text-xs text-slate-500">Search company or enter ticker to auto-fetch live market price.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddHolding} className="space-y-4 mt-4">
              {/* Unified Company & Stock Search Field (Merged into ONE) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Company / Stock (Search by Name or Symbol)
                </label>
                <div className="relative" ref={tickerDropdownRef}>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required={!newHolding.ticker && !newHolding.companyName}
                      placeholder="Type company name (e.g. Tata Motors, State Bank, HDFC, Reliance, Infosys)..."
                      value={modalSearchInput}
                      onFocus={() => {
                        if (tickerSuggestions.length > 0) setShowTickerDropdown(true);
                      }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setModalSearchInput(val);
                        // Also sync companyName dynamically
                        setNewHolding((prev) => ({
                          ...prev,
                          companyName: val,
                          ticker: prev.ticker || val.toUpperCase(),
                        }));
                      }}
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
                          e.preventDefault();
                          if (showTickerDropdown && selectedSuggestionIndex >= 0 && tickerSuggestions[selectedSuggestionIndex]) {
                            handleSelectTickerSuggestion(tickerSuggestions[selectedSuggestionIndex]);
                          } else if (showTickerDropdown && tickerSuggestions.length > 0) {
                            handleSelectTickerSuggestion(tickerSuggestions[0]);
                          } else if (modalSearchInput.trim()) {
                            handleDirectTickerSubmit(modalSearchInput.trim());
                          }
                        } else if (e.key === 'Escape') {
                          setShowTickerDropdown(false);
                        }
                      }}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-2xs"
                    />
                    {modalSearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setModalSearchInput('');
                          setTickerSuggestions([]);
                          setShowTickerDropdown(false);
                          setNewHolding((prev) => ({
                            ...prev,
                            ticker: '',
                            companyName: '',
                            currentMarketPrice: '',
                          }));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        title="Clear selection"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {fetchingQuote && (
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-sans">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Fetching live CMP &amp; company metrics...</span>
                    </div>
                  )}

                  {/* Autocomplete Dropdown */}
                  {showTickerDropdown && tickerSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                      {tickerSuggestions.map((item, idx) => (
                        <button
                          key={item.ticker}
                          type="button"
                          onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectTickerSuggestion(item);
                          }}
                          className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            selectedSuggestionIndex === idx ? 'bg-emerald-50 text-emerald-950 font-medium' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
                              {item.ticker.slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 font-sans">{item.name}</div>
                              <div className="text-[10px] text-slate-400 font-sans">{item.sector}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-700 block text-xs">
                              {item.priceFormatted || (item.currentPrice ? `₹${item.currentPrice}` : 'Live')}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 uppercase">
                              {item.ticker}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Stock Live Badge */}
                  {newHolding.ticker && (
                    <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-150">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{newHolding.companyName}</span>
                            <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                              {newHolding.ticker}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{newHolding.sector}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-800 text-xs bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                          Live CMP: ₹{newHolding.currentMarketPrice || '---'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setModalSearchInput('');
                            setTickerSuggestions([]);
                            setShowTickerDropdown(false);
                            setNewHolding((prev) => ({
                              ...prev,
                              ticker: '',
                              companyName: '',
                              currentMarketPrice: '',
                            }));
                          }}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Shares & Buy Price in 2 Columns */}
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
                    className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-emerald-600 rounded-xl text-xs font-mono focus:outline-none shadow-2xs"
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
                    className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-emerald-600 rounded-xl text-xs font-mono focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Current Market Price (Auto-fetched) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Current Market Price (CMP ₹)</label>
                  <span className="text-[10px] text-emerald-600 font-semibold">Live auto-synced</span>
                </div>
                <input
                  type="number"
                  step="0.05"
                  required
                  placeholder="Auto-fetched or enter CMP"
                  value={newHolding.currentMarketPrice}
                  onChange={(e) => setNewHolding({ ...newHolding, currentMarketPrice: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 focus:border-emerald-600 rounded-xl text-xs font-mono focus:outline-none shadow-2xs bg-slate-50/50"
                />
              </div>

              {/* Classification Tag Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Holding Classification</label>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  {['Compounder', 'Value Moat', 'Growth Momentum', 'Turnaround'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewHolding({ ...newHolding, category: cat })}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                        newHolding.category === cat
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newHolding.ticker || !newHolding.quantity || !newHolding.avgBuyPrice}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
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
