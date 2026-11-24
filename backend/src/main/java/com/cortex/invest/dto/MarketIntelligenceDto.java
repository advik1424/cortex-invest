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
public class MarketIntelligenceDto {

    private MacroRegime macroRegime;
    private List<SectorInsight> sectorInsights;
    private List<NewsSentimentItem> newsSentiment;
    private MarketExplanation marketExplanation;
    private String generatedTimestamp;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MacroRegime {
        private String regime; // BULLISH, CAUTIOUS_ACCUMULATE, DEFENSIVE
        private Double nifty50;
        private Double niftyChange;
        private Double niftyChangePct;
        private Double sensex;
        private Double indiaVix;
        private String vixRegime;
        private Double fiiNetCrores;
        private Double diiNetCrores;
        private String institutionalFlowVerdict;
        private String advanceDeclineRatio;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectorInsight {
        private String sector;
        private Double performance1D;
        private String performance1DPct;
        private String institutionalStance; // OVERWEIGHT, ACCUMULATE ON DIP, NEUTRAL, UNDERWEIGHT
        private String catalystSummary;
        private String topLeader;
        private Double leaderCmp;
        private String leaderAction;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NewsSentimentItem {
        private String id;
        private String headline;
        private String source;
        private String timeAgo;
        private String sentiment; // BULLISH, NEUTRAL, CAUTION
        private Double sentimentScore; // -1.0 to +1.0
        private List<String> impactedTickers;
        private String institutionalTakeaway;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarketExplanation {
        private String title;
        private String coreDriver;
        private String institutionalPosture;
        private List<String> executionRules;
        private String riskWarning;
    }
}
