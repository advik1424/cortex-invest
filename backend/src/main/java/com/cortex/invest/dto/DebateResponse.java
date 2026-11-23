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
public class DebateResponse {
    private String ticker;
    private String horizon;
    private Integer convictionScore; // 0 to 100
    private String verdict;          // e.g. "STRONG BUY", "ACCUMULATE ON DIP", "HIGH RISK / AVOID"
    private String bullArgument;
    private String bearArgument;
    private String riskOfficerSynthesis;
    private List<String> keyCatalysts;
    private List<String> criticalRisks;
}
