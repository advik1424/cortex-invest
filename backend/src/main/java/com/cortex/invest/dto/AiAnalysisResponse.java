package com.cortex.invest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResponse {
    private String ticker;
    private String analysisType;
    private String title;
    private String content;
    private Double convictionScore;
    private String sentiment;
    private Double targetPrice12M;
    private String impliedUpside;
    private String riskRewardRatio;

    // DIRECT TRADER SOLUTION (Action, Entry, SL, Targets, Plan, Meters)
    private TraderSolution traderSolution;

    // Structured Institutional Lens Models
    private Map<String, String> forensicQuality;
    private Map<String, String> dupontDecomposition;
    private Map<String, Object> moatMatrix;
    private Map<String, Object> valuationScenarios;
    private Map<String, Object> concallForensics;

    private List<String> redFlags;
    private List<String> growthCatalysts;
    private String timestamp;
    private String sourceModel;
}
