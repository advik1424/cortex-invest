import React, { useState, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import HomeLanding from './components/HomeLanding';
import { AuthProvider } from './context/AuthContext';
import { Loader2 } from 'lucide-react';

// Code-split heavy views to minimize initial bundle size and boost Lighthouse performance
const ScreenerMain = lazy(() => import('./components/ScreenerMain'));
const ChartVisionLight = lazy(() => import('./components/ChartVisionLight'));
const PortfolioLight = lazy(() => import('./components/PortfolioLight'));
const RadarDualEngine = lazy(() => import('./components/RadarDualEngine'));

function ViewLoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] space-y-3">
      <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
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
      <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-teal-100 selection:text-[#0F766E]">
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

        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-12">
          <div className="max-w-[1320px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-800">Cortex Invest Terminal</span>
              <span>•</span>
              <span>Financial Statements, Key Ratios &amp; Forensic Fundamental Analysis</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px] text-slate-400">
              <span>Powered by Spring Boot 3 Engine</span>
              <span>•</span>
              <span>Real-time NSE/BSE Market Data</span>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
