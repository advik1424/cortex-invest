package com.cortex.invest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscussStockRequest {
    private String ticker;
    private String companyName;
    private Integer quantity;
    private Double avgBuyPrice;
    private Double currentMarketPrice;
    private String sector;
    private String userQuery;
}
