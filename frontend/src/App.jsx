import React, { useState, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import HomeLanding from './components/HomeLanding';
import { AuthProvider } from './context/AuthContext';
import { Loader2, ShieldCheck, ExternalLink } from 'lucide-react';

// Code-split heavy views to minimize initial bundle size and boost Lighthouse performance
const ScreenerMain = lazy(() => import('./components/ScreenerMain'));
const ChartVisionLight = lazy(() => import('./components/ChartVisionLight'));
const PortfolioLight = lazy(() => import('./components/PortfolioLight'));
const RadarDualEngine = lazy(() => import('./components/RadarDualEngine'));

function ViewLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      <span className="text-xs font-semibold text-slate-500 font-mono tracking-wide">
        Loading Terminal Workspace...
      </span>
    </div>
  );
}

export default function App() {
  const [selectedTicker, setSelectedTicker] = useState('RELIANCE');
  const [activeView, setActiveView] = useState('home');

  const handleSelectTicker = (ticker) => {
    setSelectedTicker(ticker);
    setActiveView('screener');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <Navbar
          selectedTicker={selectedTicker}
          onSelectCompany={handleSelectTicker}
          activeView={activeView}
          setActiveView={setActiveView}
        />

        <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 py-6">
          <Suspense fallback={<ViewLoadingFallback />}>
            {activeView === 'home' && (
              <HomeLanding
                onSelectTicker={handleSelectTicker}
                onNavigate={(view) => setActiveView(view)}
              />
            )}
            {activeView === 'screener' && (
              <ScreenerMain 
                ticker={selectedTicker} 
                onSelectTicker={handleSelectTicker} 
              />
            )}
            {activeView === 'chart' && (
              <ChartVisionLight
                ticker={selectedTicker}
                onNavigateToFinancials={() => setActiveView('screener')}
                onSelectTicker={setSelectedTicker}
              />
            )}
            {activeView === 'radar' && (
              <RadarDualEngine
                onSelectTicker={handleSelectTicker}
                onNavigateToFinancials={() => setActiveView('screener')}
                onNavigateToChart={() => setActiveView('chart')}
              />
            )}
            {activeView === 'portfolio' && (
              <PortfolioLight 
                onSelectTicker={handleSelectTicker}
                onNavigateToFinancials={() => setActiveView('screener')}
              />
            )}
          </Suspense>
        </main>

        {/* Screener.in + Groww Style Clean Footer */}
        <footer className="border-t border-slate-200 bg-white pt-8 pb-6 text-xs text-slate-500 mt-12">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    C
                  </div>
                  <span className="font-bold text-slate-900 text-sm">CORTEX INVEST SCREENER</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-semibold">
                    v2.4 LTS
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Institutional stock screening, forensic financial ratios, and automated balance sheet intelligence for Indian equities.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <button 
                  onClick={() => setActiveView('home')} 
                  className="text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  Home
                </button>
                <button 
                  onClick={() => setActiveView('radar')} 
                  className="text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  Popular Screens
                </button>
                <button 
                  onClick={() => setActiveView('screener')} 
                  className="text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  10Y Financials
                </button>
                <button 
                  onClick={() => setActiveView('chart')} 
                  className="text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  Technical Charts
                </button>
                <button 
                  onClick={() => setActiveView('portfolio')} 
                  className="text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  Portfolio Tracker
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Calibrated exclusively for NSE &amp; BSE listed companies. Data updated post market close.</span>
              </div>
              <div className="flex items-center gap-3">
                <span>SEBI Non-Advisory Research Terminal</span>
                <span>•</span>
                <span>Institutional Tranche Sizing Engine</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
