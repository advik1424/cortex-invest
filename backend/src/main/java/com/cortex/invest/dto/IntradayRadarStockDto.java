package com.cortex.invest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntradayRadarStockDto {
    private Integer rank;
    private String symbol;
    private String company;
    private String sector;
    private String setupType;          // "ORB BREAKOUT (15M)", "VWAP PULLBACK REBOUND", "EMA 9/21 GOLDEN CROSS", "HIGH VOLUME MOMENTUM SURGE"
    private String signal;             // "BUY SETUP", "ACTIVE TRAILING"
    private Double score;              // 90.0 to 100.0
    private Double cmp;                // Current Market Price
    private Double vwap;               // Volume Weighted Average Price
    private Double dayOpen;            // Session Open
    private Double orbHigh;            // Opening 15-min range high
    private Double orbLow;             // Opening 15-min range low
    private Double stopLoss;           // Tight Intraday SL (0.5% - 0.8% risk)
    private Double target1;            // 1.0R (Book 60% profit)
    private Double target2;            // 2.0R (Trail remaining)
    private Double riskRewardRatio;    // e.g. 2.0 or 2.5
    private Double volumeRatio;        // Relative Volume surge vs 5D average (e.g. 2.8x)
    private Double rsi15M;             // 15-min RSI
    private String timeframe;          // "15 Min (15M)" or "5 Min (5M)"
    private String squareOffTime;      // "3:15 PM IST (Auto Square-off)"
    private String intradayThesis;     // Technical catalyst explanation
    private String ruleWarning;        // "Strict 3:15 PM square-off. Never carry overnight on leverage."

    // News Factor & Momentum Intelligence
    private String newsSentiment;      // "VERY BULLISH", "BULLISH CATALYST", "MOMENTUM FLOW"
    private Double newsSentimentScore; // 0.85
    private String newsHeadline;       // Breaking catalyst headline
    private Double newsWeightagePct;   // 45.0% news factor weight
}
