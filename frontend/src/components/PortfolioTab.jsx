import React, { useState, useEffect } from 'react';
import { portfolioApi } from '../services/api';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw, Loader2, Sparkles, TrendingDown, CheckCircle2 } from 'lucide-react';

export default function PortfolioTab() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newHolding, setNewHolding] = useState({
    ticker: '',
    companyName: '',
    quantity: 10,
    avgBuyPrice: 1000,
    currentMarketPrice: 1050,
    sector: 'Banking & Financials',
    category: 'Compounder',
  });

  const fetchHoldings = async () => {
    setLoading(true);
    try {
      const res = await portfolioApi.getHoldings();
      setHoldings(res.data);
    } catch (err) {
      console.error('Failed to fetch holdings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  const handleAddHolding = async (e) => {
    e.preventDefault();
    try {
      await portfolioApi.addHolding(newHolding);
      setShowAddModal(false);
      setNewHolding({
        ticker: '',
        companyName: '',
        quantity: 10,
        avgBuyPrice: 1000,
        currentMarketPrice: 1050,
        sector: 'Banking & Financials',
        category: 'Compounder',
      });
      fetchHoldings();
    } catch (err) {
      console.error('Failed to add holding:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await portfolioApi.deleteHolding(id);
      fetchHoldings();
    } catch (err) {
      console.error('Failed to delete holding:', err);
    }
  };

  const handleDiagnose = async () => {
    setDiagnosing(true);
    try {
      const res = await portfolioApi.diagnose();
      setDiagnosis(res.data);
    } catch (err) {
      console.error('Failed to run diagnosis:', err);
    } finally {
      setDiagnosing(false);
    }
  };

  const totalInvested = holdings.reduce((sum, h) => sum + (h.avgBuyPrice * h.quantity), 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + (h.currentMarketPrice * h.quantity), 0);
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Groww Style Portfolio Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-5">
          <span className="text-xs font-medium text-zinc-400 block">Total Invested</span>
          <span className="text-2xl font-bold text-white mt-1.5 block">
            ₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[11px] text-zinc-500 mt-1 block">{holdings.length} Active Positions</span>
        </div>

        <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-5">
          <span className="text-xs font-medium text-zinc-400 block">Current Portfolio Value</span>
          <span className="text-2xl font-bold text-white mt-1.5 block">
            ₹{totalCurrent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[11px] text-[#00D09C] mt-1 block">Live CMP Synchronized</span>
        </div>

        <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-5">
          <span className="text-xs font-medium text-zinc-400 block">Total Profit / Loss</span>
          <div className={`text-2xl font-bold mt-1.5 flex items-center gap-1.5 ${totalPnl >= 0 ? 'text-[#00D09C]' : 'text-[#EB5757]'}`}>
            {totalPnl >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            {totalPnl >= 0 ? '+' : ''}₹{Math.abs(totalPnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <span className={`text-[11px] font-semibold mt-1 block ${totalPnl >= 0 ? 'text-[#00D09C]' : 'text-[#EB5757]'}`}>
            {totalPnl >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}% Overall Returns
          </span>
        </div>
      </div>

      {/* 2. Holdings Table & Header Controls */}
      <div className="bg-[#181A20] border border-[#262A34] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#262A34] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Stock Holdings</h3>
            <p className="text-xs text-zinc-400">Classified by Screener-grade compounders vs dead capital risk.</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#232732] hover:bg-[#2D3342] text-zinc-200 border border-[#2F3646] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Stock
            </button>
            <button
              onClick={handleDiagnose}
              disabled={diagnosing || holdings.length === 0}
              className="px-4 py-1.5 rounded-xl bg-[#00D09C] hover:bg-[#00B789] text-[#0F1015] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              {diagnosing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Simulating Stress-Test...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run Portfolio Health AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Groww / Dhan Style Clean Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#12141A] text-[11px] uppercase text-zinc-400 font-semibold border-b border-[#262A34]">
              <tr>
                <th className="py-3 px-5">Stock Name</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">Shares</th>
                <th className="py-3 px-4 text-right">Avg Price</th>
                <th className="py-3 px-4 text-right">Live CMP</th>
                <th className="py-3 px-4 text-right">Returns (P&L)</th>
                <th className="py-3 px-4 text-center">AI Classification</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262A34]">
              {holdings.map((h) => {
                const invested = h.avgBuyPrice * h.quantity;
                const current = h.currentMarketPrice * h.quantity;
                const pnl = current - invested;
                const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
                const isPos = pnl >= 0;

                return (
                  <tr key={h.id} className="hover:bg-[#1C1F28] transition-colors">
                    <td className="py-3.5 px-5 font-bold text-white">
                      {h.ticker}
                      <span className="text-[11px] text-zinc-400 block font-normal">{h.companyName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400 font-medium">{h.sector}</td>
                    <td className="py-3.5 px-4 text-right font-medium">{h.quantity}</td>
                    <td className="py-3.5 px-4 text-right">₹{h.avgBuyPrice?.toFixed(2)}</td>
                    <td className="py-3.5 px-4 text-right text-white font-bold">₹{h.currentMarketPrice?.toFixed(2)}</td>
                    <td className={`py-3.5 px-4 text-right font-bold ${isPos ? 'text-[#00D09C]' : 'text-[#EB5757]'}`}>
                      {isPos ? '+' : ''}₹{pnl.toFixed(0)} ({isPos ? '+' : ''}{pnlPct.toFixed(2)}%)
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                        h.category === 'Compounder' ? 'bg-[#00D09C]/15 text-[#00D09C] border-[#00D09C]/30' :
                        h.category === 'Cyclical' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                        'bg-[#EB5757]/15 text-[#EB5757] border-[#EB5757]/30'
                      }`}>
                        {h.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button onClick={() => handleDelete(h.id)} className="text-zinc-500 hover:text-[#EB5757] p-1 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. AI Portfolio Health Diagnostic & 8% Stress-Test Report */}
      {diagnosis && (
        <div className="bg-[#181A20] border border-[#262A34] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-[#262A34]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#12141A] border border-[#2B313C] flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{diagnosis.healthScore}</span>
                <span className="text-[9px] text-zinc-400 uppercase font-semibold">Health / 100</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Portfolio Exposure & Concentration Audit</h4>
                <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
                  {diagnosis.concentrationRiskAssessment}
                </p>
              </div>
            </div>

            <div className="bg-[#EB5757]/10 border border-[#EB5757]/30 rounded-xl p-4 text-right">
              <span className="text-xs font-bold text-[#EB5757] flex items-center justify-end gap-1.5 uppercase">
                <TrendingDown className="w-4 h-4" /> -8% Market Crash Stress-Test
              </span>
              <p className="text-xs text-zinc-200 mt-1 max-w-xs font-medium">
                {diagnosis.stressTestSummary}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#00D09C] uppercase tracking-wider flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              Actionable AI Capital Rebalancing Blueprint
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {diagnosis.rebalancingBlueprint?.map((item, idx) => (
                <div key={idx} className="bg-[#12141A] border border-[#232732] rounded-xl p-3.5 text-xs text-zinc-300 leading-relaxed">
                  <span className="w-5 h-5 rounded-md bg-[#00D09C]/15 text-[#00D09C] inline-flex items-center justify-center font-bold text-[10px] mr-2 mb-1">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181A20] border border-[#2B313C] rounded-2xl p-6 max-w-md w-full text-xs space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Add Stock to Portfolio</h3>
            <form onSubmit={handleAddHolding} className="space-y-3">
              <div>
                <label className="text-zinc-400 block mb-1">Stock Ticker (e.g. INFY, TCS, RELIANCE)</label>
                <input
                  type="text"
                  required
                  value={newHolding.ticker}
                  onChange={(e) => setNewHolding({ ...newHolding, ticker: e.target.value.toUpperCase() })}
                  className="w-full bg-[#12141A] border border-[#2B313C] rounded-xl p-2.5 text-white uppercase focus:outline-none focus:border-[#00D09C]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newHolding.quantity}
                    onChange={(e) => setNewHolding({ ...newHolding, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#12141A] border border-[#2B313C] rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-1">Avg Buy Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newHolding.avgBuyPrice}
                    onChange={(e) => setNewHolding({ ...newHolding, avgBuyPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#12141A] border border-[#2B313C] rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-zinc-400 hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-[#00D09C] hover:bg-[#00B789] text-[#0F1015] font-bold rounded-xl">
                  Save Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
