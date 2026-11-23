package com.cortex.invest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioAuditItemDto {
    private String symbol;
    private String company;
    private String sector;
    private Double avgBuyPrice;
    private Integer quantity;
    private Double investedAmount;
    private Double currentPrice;
    private Double currentValue;
    private Double pnlAmount;
    private Double pnlPercentage;
    private Double fiftyTwoWeekHigh;
    private Double discountPct;
    private Double sma200;
    private Double dist200SmaPct;
    private Double rsi14;
    private Double pe;
    private Double roe;
    private Double debtToEquity;
    private Double promoterHolding;
    private Double instHolding;
    private String fundamentalHealth;      // "A (INSTITUTIONAL MOAT)", "B+ (SOLID QUALITY)", "RED FLAG (HIGH DEBT)"
    private String systemRecommendation;   // "🟢 AVERAGE DOWN (Tranche 2)", "🟢 DEEP ACCUMULATE (Tranche 3)", "🔴 EXIT / DO NOT AVERAGE (RED FLAG)", "⚪ HOLD (WAIT FOR TRANCHE 2)", "🟡 TRIM PROFIT (Book 25-30%)", "🟢 STRONG HOLD (COMPOUND)"
    private Integer suggestedAddQty;       // Exact Add Qty (0, 35%, 50%)
    private Double newEstimatedAvgPrice;   // Revised Average Price
    private String actionPlan;             // Deep institutional advice plan
    private Boolean isAveragingBlocked;    // True if D/E > 1.8 or loss-making (Anti-Capital Destruction)
}
