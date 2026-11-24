package com.cortex.invest;

import com.cortex.invest.dto.MarketIntelligenceDto;
import com.cortex.invest.service.MarketDataService;
import com.cortex.invest.service.MarketIntelligenceService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class MarketIntelligenceTest {

    private MarketIntelligenceService service;

    @BeforeEach
    void setUp() {
        MarketDataService marketDataService = new MarketDataService();
        service = new MarketIntelligenceService(marketDataService);
    }

    @Test
    void testMarketIntelligencePayloadIntegrity() {
        MarketIntelligenceDto intelligence = service.getMarketIntelligence();
        Assertions.assertNotNull(intelligence, "Market intelligence payload should not be null");

        // Macro regime checks
        MarketIntelligenceDto.MacroRegime regime = intelligence.getMacroRegime();
        Assertions.assertNotNull(regime, "Macro regime should not be null");
        Assertions.assertTrue(regime.getNifty50() > 0, "Nifty 50 level must be positive");
        Assertions.assertTrue(regime.getSensex() > 0, "Sensex level must be positive");
        Assertions.assertTrue(regime.getIndiaVix() > 0, "VIX must be positive");
        Assertions.assertNotNull(regime.getRegime(), "Regime status should be defined");
        Assertions.assertNotNull(regime.getInstitutionalFlowVerdict(), "Institutional flow verdict required");

        // Sector insights checks
        Assertions.assertNotNull(intelligence.getSectorInsights(), "Sector insights must be populated");
        Assertions.assertFalse(intelligence.getSectorInsights().isEmpty(), "Sector insights should have items");
        for (MarketIntelligenceDto.SectorInsight sector : intelligence.getSectorInsights()) {
            Assertions.assertNotNull(sector.getSector(), "Sector name cannot be null");
            Assertions.assertNotNull(sector.getInstitutionalStance(), "Institutional stance required");
            Assertions.assertNotNull(sector.getTopLeader(), "Top leader ticker required");
            Assertions.assertTrue(sector.getLeaderCmp() > 0, "Leader CMP must be positive");
        }

        // News sentiment checks
        Assertions.assertNotNull(intelligence.getNewsSentiment(), "News sentiment list must be populated");
        Assertions.assertFalse(intelligence.getNewsSentiment().isEmpty(), "News sentiment must contain items");
        for (MarketIntelligenceDto.NewsSentimentItem news : intelligence.getNewsSentiment()) {
            Assertions.assertNotNull(news.getHeadline(), "Headline required");
            Assertions.assertNotNull(news.getSentiment(), "Sentiment required (BULLISH/NEUTRAL/CAUTION)");
            Assertions.assertFalse(news.getImpactedTickers().isEmpty(), "Impacted tickers should not be empty");
        }

        // Market explanation checks
        MarketIntelligenceDto.MarketExplanation explanation = intelligence.getMarketExplanation();
        Assertions.assertNotNull(explanation, "Market explanation card should not be null");
        Assertions.assertNotNull(explanation.getTitle(), "Explanation title required");
        Assertions.assertNotNull(explanation.getCoreDriver(), "Core driver required");
        Assertions.assertFalse(explanation.getExecutionRules().isEmpty(), "Execution rules must not be empty");
    }
}
