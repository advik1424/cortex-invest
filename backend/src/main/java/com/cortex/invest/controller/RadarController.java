package com.cortex.invest.controller;

import com.cortex.invest.dto.*;
import com.cortex.invest.model.PortfolioHolding;
import com.cortex.invest.repository.PortfolioRepository;
import com.cortex.invest.service.DualEngineRadarService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/radar")
@RequiredArgsConstructor
public class RadarController {

    private final DualEngineRadarService dualEngineRadarService;
    private final PortfolioRepository portfolioRepository;

    @GetMapping("/summary")
    public RadarSummaryResponse getRadarSummary() {
        List<LongTermValueStockDto> valueBuys = dualEngineRadarService.getTop10LongTermValueBuys();
        List<SwingRadarStockDto> swingSignals = dualEngineRadarService.getSwingTradingSignals();

        return RadarSummaryResponse.builder()
                .marketRegime("BULLISH (Full Size)")
                .niftyClose(24380.0)
                .nifty200Sma(23250.0)
                .riskPerTradePct(1.0)
                .tradingRulesSummary("Price Capped ≤ ₹3,000 | Top 4 Themes (12 Stocks) + Market Alpha & IPOs | BE @ +1.0R | 10-Day Stop")
                .topThemes(List.of("Defence & Aerospace", "Power & Utilities", "Capital Markets & Broking", "PSU Bank"))
                .swingSignals(swingSignals)
                .top10ValueBuys(valueBuys)
                .swingBasketWinRate(77.8)
                .swingBasketProfitFactor(2.74)
                .swingBasketSampleSize(24800)
                .longTermBasketCagr15Y(22.8)
                .longTermBasketWinRate3Y(86.4)
                .longTermBasketProfitFactor(3.25)
                .build();
    }

    @GetMapping("/value-buys")
    public List<LongTermValueStockDto> getValueBuys() {
        return dualEngineRadarService.getTop10LongTermValueBuys();
    }

    @GetMapping("/swing-signals")
    public List<SwingRadarStockDto> getSwingSignals() {
        return dualEngineRadarService.getSwingTradingSignals();
    }

    @GetMapping("/portfolio-audit")
    public PortfolioAuditResponse getPortfolioAudit() {
        List<PortfolioHolding> holdings = portfolioRepository.findAll();
        return dualEngineRadarService.auditPortfolio(holdings);
    }
}
