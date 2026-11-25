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
public class DiscussStockResponse {
    private String ticker;
    private String companyName;
    private Integer quantity;
    private Double avgBuyPrice;
    private Double currentMarketPrice;
    private Double investedAmount;
    private Double currentValue;
    private Double pnlAmount;
    private Double pnlPercentage;

    // AI Strategic Verdict
    private String holdingAction;             // "HOLD (COMPOUNDER)" | "ACCUMULATE ON DIP (TRANCHE 2)" | "TRIM 50% & LOCK GAINS" | "RELIEF EXIT"
    private String actionSummary;             // One-line punchy verdict
    private String underperformanceReason;   // Why the stock is down / root cause analysis
    private String patienceHorizon;           // How long to wait / recovery timeline (e.g. 2-3 Quarters)
    private List<String> newsAndCatalystsToTrack; // Specific news, concall metrics & data points to monitor
    private String userQuery;                 // User's original question
    private String userQueryAnswer;           // Direct solution to user's specific dilemma
    private Double targetPrice12M;            // Expected 12-month upside target
    private Double stopLossOrExitTrigger;     // Invalidation / Stop loss price
    private String riskLevel;                 // "LOW" | "MODERATE" | "HIGH"
    private String taxAndReallocationAdvice;  // Tax (STCG/LTCG) implications & where to rotate freed capital
    private List<String> strategicBulletPoints;// 3-4 institutional bullet points
    private String timestamp;
}
