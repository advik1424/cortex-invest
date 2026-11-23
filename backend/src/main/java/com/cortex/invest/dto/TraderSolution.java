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
public class TraderSolution {
    // 1. Direct Action Verdict
    private String action; // "STRONG BUY" | "BUY ON PULLBACK" | "HOLD / ACCUMULATE" | "AVOID / WAIT" | "SELL / PROFIT BOOK"
    private String horizon; // "Swing Trading (3 - 15 Days)" | "Positional (1 - 3 Months)" | "Short-Term Momentum"
    private Integer convictionPct; // e.g. 88 (88%)
    private String directVerdictSummary; // Clear 1-2 sentence direct decision in plain trader language

    // 2. Exact Execution Levels
    private Double currentPrice;
    private String entryRange; // e.g. "₹1,350 - ₹1,375"
    private Double stopLoss; // e.g. 1315.0
    private String stopLossPct; // e.g. "-4.5%"
    private Double target1; // e.g. 1440.0
    private String target1Pct; // e.g. "+4.5%"
    private Double target2; // e.g. 1520.0
    private String target2Pct; // e.g. "+10.3%"
    private Double target3; // e.g. 1610.0
    private String target3Pct; // e.g. "+16.9%"
    private String riskRewardRatio; // e.g. "1 : 2.6"
    private String positionSizeRecommendation; // e.g. "Allocate 8% - 10% of portfolio. Enter 50% at CMP, 50% on dip."

    // 3. Direct 3-Point Trade Rationale
    private String whyBuy; // Core trigger
    private String riskWarning; // Key downside risk
    private String invalidationRule; // What voids this trade

    // 4. Step-by-Step Execution Plan
    private List<String> executionSteps;

    // 5. Trader Radar / Health Meters
    private String trendSignal; // "Strong Bullish" | "Consolidation" | "Bearish"
    private String momentumSignal; // "Strong Positive" | "Neutral" | "Overbought"
    private String institutionalFlow; // "Accumulation Detected" | "Neutral" | "Distribution"
    private String overallRiskMeter; // "Low Risk" | "Moderate Risk" | "High Risk"
}
