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
public class LongTermValueStockDto {
    private Integer rank;
    private String symbol;
    private String company;
    private String sector;
    private String businessMoat;
    private Double overallScore;      // 0 to 100
    private Double cmp;               // Current Market Price
    private Double fiftyTwoWeekHigh;
    private Double discountPct;       // Discount from 52W High
    private Double sma200;            // 200 SMA support floor
    private Double dist200SmaPct;     // Distance from 200 SMA
    private Double rsi14;
    private Double pe;                // P/E (TTM)
    private Double pb;                // Price to Book
    private Double roe;               // ROE %
    private Double debtToEquity;      // D/E
    private Double patGrowthYoY;      // Net Profit Growth YoY %
    private Double promoterHolding;   // Insider Holding %
    private Double instHolding;       // FII + DII Holding %
    private String fundamentalGrade;  // "A (INSTITUTIONAL MOAT)", "B+ (SOLID QUALITY)", "B (STANDARD)", "RED FLAG"
    private String actionRecommendation; // "💎 DEEP VALUE BUY", "🟢 ACCUMULATE ON DIP", "🟢 FRESH VALUE BUY"
    private String trancheAction;     // "TRANCHE 1 (35% Sizing)", "TRANCHE 2 (35% Sizing)", "TRANCHE 3 (30% Sizing)"
    private String valueBuyRange;     // e.g. "₹1280.0 - ₹1330.0"
    private Double targetPrice1To3Y;  // 1-3Y Target
    private String investmentThesis;  // Comprehensive thesis

    // 15-Year Quantitative Backtesting & Deep Fundamental Balance Sheet Fields
    private Double historicalCagr15Y;         // 15-Year Compounding CAGR % (e.g. 21.8%)
    private Double historicalWinRate3Y;       // Win-rate over 3-year holding when bought near 200 SMA (e.g. 86.4%)
    private Double profitFactor;              // Gross Wins / Gross Losses (e.g. 3.15)
    private Integer backtestSampleSize;       // Sample historical accumulation zones
    private Double maxHistoricalDrawdown15Y;  // Max Drawdown over 15 years (e.g. 18.2%)
    private Double marginOfSafetyPct;         // Margin of safety vs intrinsic fair value
    private Double cashFlowConversionPct;     // Operating Cash Flow / EBITDA (e.g. 88.5%)
    private Double interestCoverageRatio;     // EBIT / Interest (e.g. 16.4x)
    private Double promoterPledgePct;         // Promoter pledge (0.0% clean)
    private String institutionalTrend;        // FII/DII accumulation status
    private Double tranche1Price;             // Fair value entry price (CMP)
    private Double tranche2Price;             // 200 SMA support floor (-10% to -15%)
    private Double tranche3Price;             // Deep value base (-25% to -35%)
    private Double threeYearTargetPrice;      // 3-Year compounding target
    private List<String> fundamentalMoatPillars; // Key qualitative moats
    private Integer piotroskiFScore;          // Piotroski F-Score (8 or 9 out of 9)
    private Double altmanZScore;              // Altman Z-Score (> 3.0 safe zone)
    private Double dcfFairValue;              // DCF intrinsic valuation
    private Double fiveYearMultiplier;        // 5-Year historical compounding multiplier (e.g. 2.8x)

    // News & Corporate Concall Catalyst Intelligence
    private String newsSentiment;      // "BULLISH (LONG-TERM)", "STRUCTURAL ACCUMULATION"
    private Double newsSentimentScore; // 0.82
    private String newsHeadline;       // Management guidance / concall highlight
    private Double newsWeightagePct;   // 35.0%
}
