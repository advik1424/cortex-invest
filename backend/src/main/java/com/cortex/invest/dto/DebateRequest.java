package com.cortex.invest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DebateRequest {
    private String ticker;
    private String horizon; // Short-term (1-3M), Medium-term (6-12M), Long-term (2-5Y)
    private String additionalContext;
}
