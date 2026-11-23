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
public class PortfolioDiagnoseResponse {
    private Integer healthScore; // 0 to 100
    private String concentrationRiskAssessment;
    private String stressTestSummary; // Impact of -8% to -10% market crash
    private List<StockDiagnosis> categorizedHoldings;
    private List<String> rebalancingBlueprint;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockDiagnosis {
        private String ticker;
        private String category; // Compounder, Cyclical, Dead Capital
        private String diagnosisReason;
        private String recommendation; // HOLD, ADD, TRIM, EXIT
    }
}
