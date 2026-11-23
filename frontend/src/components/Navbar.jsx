import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Briefcase, ExternalLink, Activity, LogIn, LogOut, User, CheckCircle2, ChevronDown, Compass, X } from 'lucide-react';
import { screenerApi } from '../services/api';
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
  const profileRef = useRef(null);

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

  const quickPills = ['RELIANCE', 'TATAMOTORS', 'HDFCBANK', 'INFY', 'TCS', 'SUZLON', 'ITC', 'ZOMATO', 'CDSL', 'HAL', 'SBIN'];

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
    }, 200);

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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        {/* Main Navbar */}
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-6">
          {/* Brand */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center space-x-2.5 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                C
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 block">
                  Cortex Invest
                </span>
                <span className="text-[10px] text-slate-500 block -mt-0.5">
                  Financial Research Terminal
                </span>
              </div>
            </button>
          </div>

          {/* Screener.in Global Search Bar */}
          <div className="flex-1 max-w-lg relative" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onFocus={() => setIsSearching(true)}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for a company (e.g. Reliance, Tata Motors, HDFC Bank)..."
                className="w-full bg-slate-50 border border-slate-300 focus:border-[#0F766E] focus:bg-white rounded-lg pl-10 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-2xs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setSelectedIndex(-1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
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
                      selectedIndex === idx ? 'bg-teal-50/80 text-teal-900' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-900">{r.name}</span>
                      <span className="text-slate-500 ml-2 font-mono">({r.ticker})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-sans">{r.sector}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Screener Navigation Tabs & Auth */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <nav className="flex items-center space-x-1 sm:space-x-2 text-xs font-semibold">
              <button
                onClick={() => setActiveView('home')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeView === 'home'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveView('screener')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeView === 'screener'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Financials
              </button>
              <button
                onClick={() => setActiveView('chart')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeView === 'chart'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-slate-700" />
                <span>Chart Analysis</span>
              </button>
              <button
                onClick={() => setActiveView('radar')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeView === 'radar'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-slate-700" />
                <span>Market Radar</span>
              </button>
              <button
                onClick={() => setActiveView('portfolio')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeView === 'portfolio'
                    ? 'bg-slate-100 text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-slate-700" />
                <span>Portfolio</span>
              </button>
            </nav>

            {/* Google Authentication Control */}
            <div className="relative" ref={profileRef}>
              {user ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-800 transition-colors"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover border border-teal-600"
                    />
                    <span className="max-w-[100px] truncate hidden sm:inline font-semibold">{user.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Google Verified"></span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 divide-y divide-slate-100">
                      <div className="pb-3 flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full border border-teal-600"
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
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                        >
                          <span>My Portfolio & Copilot</span>
                          <span className="text-[10px] bg-teal-50 text-[#0F766E] px-1.5 py-0.5 rounded font-mono font-bold">5 Stocks</span>
                        </button>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
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
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold flex items-center gap-2 shadow-2xs hover:bg-slate-50 transition-all"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Sign in with Google</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tickers Sub-bar */}
        <div className="flex items-center gap-2 py-2 border-t border-slate-100 text-xs overflow-x-auto">
          <span className="text-slate-400 text-[11px] font-medium shrink-0">Popular Screens:</span>
          {quickPills.map((p) => (
            <button
              key={p}
              onClick={() => {
                onSelectCompany(p);
                setActiveView('screener');
              }}
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
                selectedTicker === p
                  ? 'bg-teal-50 text-[#0F766E] border border-teal-200 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Authentication Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-5 h-5 text-[#0F766E]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sign in to Cortex Invest</h3>
              <p className="text-xs text-slate-500 mt-1">
                Access your portfolio, saved radar filters, and financial models.
              </p>
            </div>

            <div className="space-y-4">
              {/* Google Button Container (when Google Client ID is configured) */}
              {googleClientId && (
                <div id="google-official-btn" className="flex justify-center w-full min-h-[40px]" />
              )}

              {/* Standard Clean Google Button */}
              {(!googleClientId || !googleClientReady) && (
                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
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
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Continue with Email
                </button>
              </form>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-5 leading-normal">
              By continuing, you agree to Cortex Invest Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
