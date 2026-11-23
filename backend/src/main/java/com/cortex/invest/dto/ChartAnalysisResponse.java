package com.cortex.invest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartAnalysisResponse {
    // 1. Chart OCR & Metadata Extracted from Image
    private String ticker;
    private String detectedTickerOnChart;       // OCR read symbol (e.g. "RELIANCE", "NIFTY 50", "TATAMOTORS")
    private String detectedTimeframe;           // OCR read timeframe (e.g. "15m", "1D", "1h")
    private Double detectedPriceOnChart;       // OCR read price from chart Y-axis or header
    private String tradingCategory;            // "INTRADAY" | "SWING" | "SHORT_TERM" | "LONG_TERM"

    // 2. Direct Action Verdict
    private String actionVerdict;              // "STRONG BUY (BREAKOUT)" | "BUY ON PULLBACK" | "WAIT" | "SELL / SHORT"
    private Integer convictionScore;           // e.g. 88
    private String marketStructure;            // "Stage-2 Institutional Markup" | "Consolidation Base"
    private String patternIdentified;          // "VCP Contraction Breakout + 20 EMA Rebound"

    // 3. Exact Execution Levels (Calculated directly from chart scale)
    private Double entryPrice;
    private Double stopLoss;
    private Double target1;
    private Double target2;
    private Double target3;
    private Double riskRewardRatio;

    // 4. In-Depth Technical Evidence (Key Points Extracted from Chart)
    private String candlePatternAnalysis;      // Detailed candlestick structure & wicks
    private String volumeActionAnalysis;       // Volume bar expansion / dry-up
    private String rsiSignal;                  // RSI momentum status
    private String trendStatus;                // Moving average alignment
    private String invalidationRule;           // Trade invalidation rule

    // 5. Hierarchy & Execution Steps
    private List<String> keySupportResistance; // S/R levels read from chart
    private List<String> executionSteps;        // Step-by-step roadmap
    private List<String> checklist;             // Institutional validation checklist
    private String fundamentalSafeguard;       // Fundamental health audit
    private String executionPlaybook;          // Summary strategy

    // 6. User Custom Query & Multi-Chart Confluence
    private String userQuery;                  // Custom question asked by trader
    private String userQueryAnswer;            // AI direct resolution to user's question
    private Integer chartCount;                // Total charts analyzed (1 or multiple)
    private String multiTimeframeConfluence;   // Cross-timeframe alignment report

    // 7. Techno-Fundamental & News Confluence Architecture
    private String tripleConfluenceGrade;       // "AAA (MAXIMUM CONVICTION)" | "AA (STRONG CONFLUENCE)" | "B (TECHNICAL-ONLY / DIVERGENCE WARNING)"
    private String confluenceVerdict;           // Master synthesized thesis combining Chart + Fundamentals + News
    private String fundamentalHealthStatus;     // "PRIME COMPOUNDER (High ROCE, Clean Balance Sheet, High OCF)"
    private String fundamentalImpactOnChart;    // Detailed explanation of how balance sheet moats solidify technical targets
    private String newsSentimentStatus;         // "BULLISH CATALYST (Concall Margin Expansion + Growth Tailwinds)"
    private String newsImpactOnChart;           // How news/concall tone validates the breakout vs warns of an earnings trap
    private String divergenceOrTrapWarning;     // Warnings if chart is bullish but news/fundamentals are weak
    private List<String> fundamentalPillars;    // Key quantitative pillars (e.g. ROCE, OCF/EBITDA, Debt/Equity)
    private List<String> newsCatalysts;         // Key management guidance / news triggers

    // 8. 10-15 Year Quantitative Backtest & Statistical Edge Engine (65% - 85% Win-Rate Filter)
    private Double historicalWinRatePct;        // Quantitative 15-year backtest win-rate (65.0% - 85.0%)
    private Integer backtestSampleSize;         // Number of historical setups backtested (e.g. 1,420)
    private Double profitFactor;                // Profit Factor (Gross Profits / Gross Losses, e.g. 2.65)
    private Double maxHistoricalDrawdown;       // Maximum historical drawdown (e.g. 9.8%)
    private String backtestPeriod;              // "15-Year Empirical Backtest (2010 - 2025)"
    private String statisticalEdgeSummary;      // Edge breakdown based on 10-15 year price action & fundamentals
    private String modelCalibrationStatus;      // "Calibrated to 65%-85% High-Probability Filter"
    private List<String> backtestCyclePerformance; // Performance across Bull, Sideways & Bear market regimes
}
