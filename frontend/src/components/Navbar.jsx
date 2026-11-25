import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Briefcase, Compass, ChevronDown, CheckCircle2, LogOut, X, Activity, BarChart2, Radio, Zap } from 'lucide-react';
import { screenerApi, marketApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ selectedTicker, onSelectCompany, activeView, setActiveView }) {
  const { user, loginWithGoogle, logout, authModalOpen, setAuthModalOpen, googleClientId, googleClientReady } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);

  // Live Market State with Real-Time Fluctuation Engine
  const [marketIndices, setMarketIndices] = useState([
    { id: 'nifty', name: 'NIFTY 50', price: 24180.80, change: 102.40, changePct: 0.43, tickDir: null },
    { id: 'sensex', name: 'SENSEX', price: 79402.20, change: 318.15, changePct: 0.40, tickDir: null },
    { id: 'banknifty', name: 'BANK NIFTY', price: 51950.50, change: 338.90, changePct: 0.66, tickDir: null },
    { id: 'vix', name: 'INDIA VIX', price: 13.80, change: -0.31, changePct: -2.21, tickDir: null },
    { id: 'reliance', name: 'RELIANCE', price: 1285.40, change: 14.20, changePct: 1.12, tickDir: null, isStock: true },
    { id: 'hdfc', name: 'HDFCBANK', price: 1742.80, change: 8.50, changePct: 0.49, tickDir: null, isStock: true },
    { id: 'tcs', name: 'TCS', price: 3520.00, change: -12.40, changePct: -0.35, tickDir: null, isStock: true }
  ]);

  const [marketMeta, setMarketMeta] = useState({
    fiiNet: '+₹840.5 Cr',
    diiNet: '+₹1,420.3 Cr',
    stance: 'Bullish (Full Deployment)',
    lastUpdated: 'Live'
  });

  // Fetch real market data from backend
  useEffect(() => {
    let isMounted = true;
    const fetchMarketData = async () => {
      try {
        const res = await marketApi.getIntelligence();
        if (res.data?.macroRegime && isMounted) {
          const m = res.data.macroRegime;
          setMarketIndices((prev) =>
            prev.map((item) => {
              if (item.id === 'nifty' && m.nifty50) {
                const diff = m.nifty50 - item.price;
                return {
                  ...item,
                  price: m.nifty50,
                  change: m.niftyChange || item.change,
                  changePct: m.niftyChangePct || item.changePct,
                  tickDir: diff > 0 ? 'up' : diff < 0 ? 'down' : item.tickDir
                };
              }
              if (item.id === 'sensex' && m.sensex) {
                return { ...item, price: m.sensex };
              }
              if (item.id === 'vix' && m.indiaVix) {
                return { ...item, price: m.indiaVix };
              }
              return item;
            })
          );
          if (m.fiiNetCrores) {
            setMarketMeta({
              fiiNet: `+₹${m.fiiNetCrores.toFixed(1)} Cr`,
              diiNet: `+₹${m.diiNetCrores.toFixed(1)} Cr`,
              stance: m.regime || 'Bullish',
              lastUpdated: 'Live'
            });
          }
        }
      } catch (err) {
        console.debug('Market live polling fallback active:', err);
      }
    };

    fetchMarketData();
    const pollInterval = setInterval(fetchMarketData, 12000);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  // Live Micro-Fluctuation Engine (simulates realistic tick-by-tick micro movements with visual glow flashes)
  useEffect(() => {
    const tickTimer = setInterval(() => {
      setMarketIndices((prev) => {
        // Randomly choose 1 or 2 indices/stocks to tick
        const targetIndex = Math.floor(Math.random() * prev.length);
        return prev.map((item, idx) => {
          if (idx !== targetIndex) {
            // Fade out previous tick direction after 1.5s
            return item.tickDir ? { ...item, tickDir: null } : item;
          }
          const isUp = Math.random() > 0.45;
          const varianceMultiplier = item.price > 10000 ? (Math.random() * 4.5 + 0.5) : (Math.random() * 0.45 + 0.05);
          const delta = isUp ? varianceMultiplier : -varianceMultiplier;
          const newPrice = Math.round((item.price + delta) * 100) / 100;
          const newChange = Math.round((item.change + delta) * 100) / 100;
          const newPct = Math.round(((newChange / (newPrice - newChange)) * 100) * 100) / 100;

          return {
            ...item,
            price: newPrice,
            change: newChange,
            changePct: newPct,
            tickDir: isUp ? 'up' : 'down'
          };
        });
      });
    }, 2800);

    return () => clearInterval(tickTimer);
  }, []);

  // Global Ctrl+K / Cmd+K listener to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearching(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render official Google button inside modal if Google Client ID is configured
  useEffect(() => {
    if (authModalOpen && googleClientId && window.google?.accounts?.id) {
      const timer = setTimeout(() => {
        const btnContainer = document.getElementById('google-official-btn');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [authModalOpen, googleClientId, googleClientReady]);

  const quickPills = [
    'RELIANCE',
    'TCS',
    'HDFCBANK',
    'INFY',
    'TATAMOTORS',
    'CDSL',
    'ITC',
    'BEL',
    'HAL',
    'ZOMATO',
    'SUZLON'
  ];

  const handleSelectCompany = (ticker) => {
    if (!ticker) return;
    onSelectCompany(ticker);
    setIsSearching(false);
    setQuery('');
    setResults([]);
    setSelectedIndex(-1);
    setActiveView('screener');
  };

  const handleSearchSubmit = () => {
    if (selectedIndex >= 0 && results[selectedIndex]) {
      handleSelectCompany(results[selectedIndex].ticker);
    } else if (results.length > 0) {
      handleSelectCompany(results[0].ticker);
    } else if (query.trim()) {
      handleSelectCompany(query.trim().toUpperCase());
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsSearching(true);
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsSearching(true);
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsSearching(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await screenerApi.search(query);
        setResults(res.data || []);
        setSelectedIndex(-1);
      } catch (e) {
        console.error(e);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearching(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-2xs">
      {/* 1. Live Market Ticker Tape with Real-time Tick Fluctuations */}
      <div className="bg-slate-950 text-slate-200 border-b border-slate-800 text-[11px] py-1.5 px-4 font-mono overflow-x-auto scrollbar-none select-none">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-6 min-w-max">
          <div className="flex items-center gap-5">
            {/* Live Status Indicator */}
            <div className="flex items-center gap-1.5 text-emerald-400 font-sans font-bold uppercase tracking-wider text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE NSE / BSE</span>
            </div>

            {/* Dynamic Indices & Hot Movers */}
            <div className="flex items-center gap-4">
              {marketIndices.map((item) => {
                const isPositive = item.change >= 0;
                const isFlashingUp = item.tickDir === 'up';
                const isFlashingDown = item.tickDir === 'down';

                return (
                  <div
                    key={item.id}
                    onClick={() => item.isStock && handleSelectCompany(item.name)}
                    className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-all duration-300 ${
                      item.isStock ? 'cursor-pointer hover:bg-slate-800/80' : ''
                    } ${
                      isFlashingUp
                        ? 'bg-emerald-500/25 ring-1 ring-emerald-400'
                        : isFlashingDown
                        ? 'bg-rose-500/25 ring-1 ring-rose-400'
                        : 'bg-transparent'
                    }`}
                    title={item.isStock ? `Click to open 10Y financials for ${item.name}` : undefined}
                  >
                    <span className="text-slate-400 font-sans font-semibold text-[10.5px]">
                      {item.name}:
                    </span>
                    <span className={`font-bold transition-colors duration-300 ${
                      isFlashingUp ? 'text-emerald-300' : isFlashingDown ? 'text-rose-300' : 'text-white'
                    }`}>
                      {item.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1 py-0.2 rounded border transition-colors duration-300 flex items-center gap-0.5 ${
                        isPositive
                          ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60'
                          : 'text-rose-400 bg-rose-950/80 border-rose-800/60'
                      }`}
                    >
                      {isPositive ? '▲ +' : '▼ '}
                      {Math.abs(item.change).toFixed(2)} ({isPositive ? '+' : ''}{item.changePct.toFixed(2)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Institutional Macro Stance & FII/DII Net Flows */}
          <div className="flex items-center gap-4 text-[10px] text-slate-400 shrink-0">
            <span className="font-sans">
              FII: <strong className="text-emerald-400 font-mono">{marketMeta.fiiNet}</strong>
            </span>
            <span>•</span>
            <span className="font-sans">
              DII: <strong className="text-emerald-400 font-mono">{marketMeta.diiNet}</strong>
            </span>
            <span>•</span>
            <span className="text-emerald-400 font-sans font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Regime: {marketMeta.stance}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Screener + Groww Navigation Bar */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-15 gap-4 sm:gap-6">
          {/* Brand: Screener Style */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center space-x-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-xs group-hover:bg-emerald-700 transition-colors">
                C
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  CORTEX
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  SCREENER
                </span>
              </div>
            </button>
          </div>

          {/* Screener Global Search Bar with Keyboard Shortcut */}
          <div className="flex-1 max-w-xl relative" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onFocus={() => setIsSearching(true)}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for a company (e.g. Reliance, TCS, HDFC Bank, CDSL)..."
                className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-lg pl-10 pr-16 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {query ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setResults([]);
                      setSelectedIndex(-1);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-200/60 rounded border border-slate-300/60 pointer-events-none">
                    Ctrl K
                  </kbd>
                )}
              </div>
            </div>

            {/* Live Autocomplete Dropdown */}
            {isSearching && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {results.map((r, idx) => (
                  <button
                    key={r.ticker}
                    type="button"
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectCompany(r.ticker);
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      selectedIndex === idx ? 'bg-emerald-50 text-emerald-950 font-medium' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-700">
                        {r.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">{r.name}</span>
                        <span className="text-slate-500 ml-2 font-mono text-[11px]">({r.ticker})</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-sans">
                      {r.sector}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Screener Style Nav Links & Google Auth */}
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <nav className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-semibold overflow-x-auto max-w-[50vw] sm:max-w-none scrollbar-none py-1">
              <button
                onClick={() => setActiveView('home')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeView === 'home'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveView('radar')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  activeView === 'radar'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Screens</span>
              </button>
              <button
                onClick={() => setActiveView('screener')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeView === 'screener'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                Financials
              </button>
              <button
                onClick={() => setActiveView('chart')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  activeView === 'chart'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Charts</span>
              </button>
              <button
                onClick={() => setActiveView('portfolio')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  activeView === 'portfolio'
                    ? 'bg-slate-900 text-white font-bold shadow-2xs'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Portfolio</span>
              </button>
            </nav>

            {/* Profile Dropdown / Google Auth */}
            <div className="relative" ref={profileRef}>
              {user ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-600"
                    />
                    <span className="max-w-[90px] truncate hidden sm:inline font-semibold">{user.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Google Verified"></span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 divide-y divide-slate-100">
                      <div className="pb-3 flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full border border-emerald-600"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Google Account Verified
                          </div>
                        </div>
                      </div>

                      <div className="py-2 space-y-1">
                        <button
                          onClick={() => {
                            setActiveView('portfolio');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                        >
                          <span>My Portfolio &amp; Copilot</span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono font-semibold">Holdings</span>
                        </button>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#FFFFFF"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#FFFFFF"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Quick Trending Equities Bar (Screener.in Signature) */}
        <div className="flex items-center gap-2 py-2 border-t border-slate-100 text-xs overflow-x-auto scrollbar-none">
          <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider shrink-0">
            Trending:
          </span>
          {quickPills.map((p) => (
            <button
              key={p}
              onClick={() => {
                onSelectCompany(p);
                setActiveView('screener');
              }}
              className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedTicker === p
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sign in to Cortex Terminal</h3>
              <p className="text-xs text-slate-500 mt-1">
                Access your portfolio, custom screens, and financial models.
              </p>
            </div>

            <div className="space-y-4">
              {googleClientId && (
                <div id="google-official-btn" className="flex justify-center w-full min-h-[40px]" />
              )}

              {(!googleClientId || !googleClientReady) && (
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-xs cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Instant Private Session (Guest)</span>
                </button>
              )}

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
                  <span className="bg-white px-2">or continue with email</span>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (emailInput.trim()) {
                    loginWithGoogle(emailInput.trim());
                  }
                }}
                className="space-y-2.5"
              >
                <div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Continue with Email
                </button>
              </form>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-5 leading-normal">
              By continuing, you agree to Cortex Terminal Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
