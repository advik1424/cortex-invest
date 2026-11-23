package com.cortex.invest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisRequest {
    private String ticker;
    private String analysisType; // FORENSIC_AUDIT, MOAT_ANALYSIS, CONCALL_SCRUTINY, VALUATION_THESIS
    private Double currentPrice;
    private String companyName;
    private String sector;
}
