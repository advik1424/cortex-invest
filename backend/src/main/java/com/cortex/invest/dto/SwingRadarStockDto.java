package com.cortex.invest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwingRadarStockDto {
    private Integer rank;
    private String symbol;
    private String company;
    private String sector;
    private String selectionBucket;    // "THEME LEADER (Defence)", "MARKET ALPHA", "IPO ALPHA", "VOLUME BUZZER", "52W BREAKOUT"
    private String setupType;          // "IPO BASE BREAKOUT", "MULTI-YEAR BREAKOUT", "52W BREAKOUT", "44-EMA PULLBACK", "21-EMA PULLBACK", "TRENDING (HH/HL)"
    private String signal;             // "BUY SETUP", "ACTIVE HOLD (PROFIT LOCK)", "BUY (HALF SIZE)"
    private Double score;              // 0 to 100
    private Double close;              // CMP
    private Double maxBuyPrice;        // Max buy chase limit (Anti-Late Entry)
    private Double stopLoss;           // ATR/EMA based stop loss
    private Double target;             // Target (2.0R to 3.5R)
    private Double target1;            // 2.0R (Book 50% profit)
    private Double target2;            // 3.0R (Runner)
    private Double target3;            // 3.5R (Extension)
    private Double riskRewardRatio;    // >= 2.0R
    private Integer tradeQty;          // Sized based on 1% account risk
    private Double investedCapital;    // Capital allocated
    private Double riskAmount;         // Absolute risk in INR
    private Double ema21;
    private Double ema44;
    private Double rsi14;
    private Double relativeStrength1M; // Relative strength vs Nifty
    private Double volumeRatio;        // Volume vs 20-DMA (>= 1.25x - 1.35x)
    private Double closingRangePct;    // Daily closing range (>= 0.70)
    private Double avgTurnoverCr;      // Turnover in Cr
    private String breakevenLockStatus;// "ACTIVE (+0.1R LOCKED AT +1.0R GAIN)" or "PENDING"
    private Double breakevenTriggerPrice; // Price where breakeven activates
    private String technicalThesis;
    private String invalidationRule;   // Rule that invalidates setup
    private String dataDate;

    // 15-Year Quantitative Backtest Metrics (65% - 85% Win-Rate Filter)
    private Double historicalWinRatePct;   // 65.0% - 85.0%
    private Double profitFactor;           // e.g. 2.74
    private Integer backtestSampleSize;    // e.g. 1420 historical setups
    private Double maxBacktestDrawdown;    // e.g. 8.4%
    private Double avgHoldingDays;         // e.g. 6.2 days
    private String marketCyclePerformance; // Bull, Sideways, Volatile breakdown
    private Double expectancyRatio;        // Expectancy = (W * AvgWin) - (L * AvgLoss) in R (e.g. +1.58R)
    private Double sharpeRatio;            // Historical Sharpe Ratio (e.g. 2.15)
    private Integer maxConsecutiveLosses;  // Max losing streak across 15 years (e.g. 2)
    private Double kellyCriterionPct;      // Kelly sizing recommendation (e.g. 14.5%)
}
