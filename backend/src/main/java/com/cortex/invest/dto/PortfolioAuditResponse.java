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
public class PortfolioAuditResponse {
    private Double totalInvested;
    private Double totalCurrentValue;
    private Double netPnl;
    private Double netPnlPercentage;
    private Integer totalStocksAudited;
    private Integer redFlagCount;
    private Integer trancheOpportunitiesCount;
    private String executiveSummary;
    private List<PortfolioAuditItemDto> auditedHoldings;
}
