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
public class ScreenerDataResponse {
    private CompanyProfile profile;
    private KeyRatios ratios;
    private ProsAndCons prosCons;
    private List<PeerCompany> peers;
    private FinancialStatement quarterlyResults;
    private FinancialStatement profitAndLoss;
    private CompoundGrowth compoundedGrowth;
    private ShareholdingPattern shareholding;
    private ConcallAnalysis concallAnalysis;
    private WhyFallingAnalysis whyFallingAnalysis;
    private BoardMeetingAnalysis boardMeetingAnalysis;
    private FinancialEvolution financialEvolution;
    private InstitutionalFlowAnalysis institutionalFlowAnalysis;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompanyProfile {
        private String name;
        private String ticker;
        private String bseCode;
        private String nseCode;
        private String sector;
        private String industry;
        private String website;
        private String about;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KeyRatios {
        private String marketCap;
        private Double currentPrice;
        private Double dayChange;
        private Double dayChangePercent;
        private String highLow52W;
        private Double stockPe;
        private Double bookValue;
        private Double dividendYield;
        private Double roce;
        private Double roe;
        private Double faceValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProsAndCons {
        private List<String> pros;
        private List<String> cons;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeerCompany {
        private String name;
        private String ticker;
        private Double cmp;
        private Double pe;
        private String marketCap;
        private Double divYield;
        private Double netProfitQtr;
        private Double qtrProfitVar;
        private Double salesQtr;
        private Double roce;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialStatement {
        private List<String> periods;
        private List<RowData> rows;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class RowData {
            private String metric;
            private List<String> values;
            private boolean isBold;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CompoundGrowth {
        private GrowthBlock salesGrowth;
        private GrowthBlock profitGrowth;
        private GrowthBlock stockPriceCagr;
        private GrowthBlock returnOnEquity;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class GrowthBlock {
            private String tenYears;
            private String fiveYears;
            private String threeYears;
            private String ttmOrLastYear;
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareholdingPattern {
        private List<String> quarters;
        private List<FinancialStatement.RowData> categories;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConcallAnalysis {
        private String quarter;
        private String overallSentiment;
        private String managementTone;
        private List<String> keyHighlights;
        private List<String> futureGuidance;
        private List<String> analystRedFlags;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WhyFallingAnalysis {
        private String clarification;
        private String directVerdict;
        private List<String> primaryDrivers;
        private String fundamentalCushion;
        private String technicalSupportFloor;
        private String recoveryCatalysts;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoardMeetingAnalysis {
        private String meetingDate;
        private String directVerdict;
        private List<String> resolutions;
        private String managementGuidance;
        private String strategicTakeaway;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialEvolution {
        private List<String> improvements;
        private List<String> deteriorationsOrHeadwinds;
        private String capitalAllocationVerdict;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InstitutionalFlowAnalysis {
        private String promoterHoldingStatus;
        private String fiiActivity;
        private String diiActivity;
        private String institutionalThesis;
    }
}
