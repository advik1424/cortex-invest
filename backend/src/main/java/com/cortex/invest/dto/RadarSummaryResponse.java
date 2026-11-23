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
public class RadarSummaryResponse {
    private String marketRegime;           // "BULLISH (Full Size)", "CAUTION / PULLBACK", "BEARISH (DEFENSIVE)"
    private Double niftyClose;
    private Double nifty200Sma;
    private Double riskPerTradePct;        // 1.0%
    private String tradingRulesSummary;    // "Price Capped ≤ ₹3,000 | Top 4 Themes + Market Alpha & IPOs | BE @ +1.0R | 10-Day Stop"
    private List<String> topThemes;        // Top 4 weekly themes
    private List<SwingRadarStockDto> swingSignals;
    private List<LongTermValueStockDto> top10ValueBuys;

    // 15-Year Quantitative Backtesting Basket Summary
    private Double swingBasketWinRate;         // e.g. 78.2%
    private Double swingBasketProfitFactor;     // e.g. 2.74
    private Integer swingBasketSampleSize;      // e.g. 18,400 trades
    private Double longTermBasketCagr15Y;       // e.g. 22.8%
    private Double longTermBasketWinRate3Y;     // e.g. 86.4%
    private Double longTermBasketProfitFactor;  // e.g. 3.25
}
