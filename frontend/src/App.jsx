import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomeLanding from './components/HomeLanding';
import ScreenerMain from './components/ScreenerMain';
import ChartVisionLight from './components/ChartVisionLight';
import PortfolioLight from './components/PortfolioLight';
import RadarDualEngine from './components/RadarDualEngine';
import { AuthProvider } from './context/AuthContext';

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
          {activeView === 'home' && (
            <HomeLanding
              onSelectTicker={handleSelectTicker}
              onNavigate={(view) => setActiveView(view)}
            />
          )}
          {activeView === 'screener' && (
            <ScreenerMain ticker={selectedTicker} />
          )}
          {activeView === 'chart' && (
            <ChartVisionLight
              ticker={selectedTicker}
              onNavigateToWarRoom={() => setActiveView('screener')}
              onSelectTicker={setSelectedTicker}
            />
          )}
          {activeView === 'radar' && (
            <RadarDualEngine
              onSelectTicker={handleSelectTicker}
              onNavigateToWarRoom={() => setActiveView('screener')}
              onNavigateToChart={() => setActiveView('chart')}
            />
          )}
          {activeView === 'portfolio' && (
            <PortfolioLight />
          )}
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
