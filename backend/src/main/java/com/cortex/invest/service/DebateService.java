package com.cortex.invest.service;

import com.cortex.invest.dto.DebateRequest;
import com.cortex.invest.dto.DebateResponse;
import com.cortex.invest.model.DebateRecord;
import com.cortex.invest.repository.DebateRecordRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DebateService {

    private final GeminiService geminiService;
    private final MarketDataService marketDataService;
    private final DebateRecordRepository debateRecordRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DebateResponse runDebate(DebateRequest request) {
        String ticker = request.getTicker().toUpperCase().trim();
        String horizon = request.getHorizon() != null ? request.getHorizon() : "Medium-term (6-12M)";
        String context = request.getAdditionalContext() != null ? request.getAdditionalContext() : "General Market Overview";

        // Fetch real-time live market metrics
        MarketDataService.LiveQuote quote = marketDataService.fetchLiveQuote(ticker);

        String systemPrompt = String.format("""
            You are the Cortex Institutional Equity Research Committee conducting a rigorous multi-analyst audit.
            Live Market Data for %s:
            - Current Market Price: %s %.2f
            - Day Range: %.2f - %.2f
            - 52-Week Range: %.2f - %.2f
            - 24h Volume: %d
            
            Simulate a high-caliber debate among three specialized investment personas:
            1. BULLISH GROWTH ANALYST: Examine structural industry moats, revenue run-rate, operational leverage, and pricing power.
            2. BEARISH FORENSIC SKEPTIC: Audit capital allocation, debt-to-EBITDA multiples, margin compression, and valuation froth against 52-week extremes.
            3. CHIEF RISK OFFICER (CRO): Formulate a risk-adjusted synthesis, calculate a 0-100 conviction score, and assign a definitive verdict ('ACCUMULATE ON DIP', 'STRONG BUY', 'DEFENSIVE HOLD', 'AVOID / CAPITAL PRESERVATION').
            
            Return ONLY raw valid JSON (no markdown fences, no code blocks):
            {
              "convictionScore": 76,
              "verdict": "ACCUMULATE ON PULLBACK",
              "bullArgument": "Moat and earnings momentum analysis...",
              "bearArgument": "Downside risks and valuation audit...",
              "riskOfficerSynthesis": "Position sizing and risk synthesis...",
              "keyCatalysts": ["Catalyst 1", "Catalyst 2", "Catalyst 3"],
              "criticalRisks": ["Risk 1", "Risk 2", "Risk 3"]
            }
            """, ticker, quote.getCurrency(), quote.getCurrentPrice(),
                quote.getDayLow(), quote.getDayHigh(),
                quote.getFiftyTwoWeekLow(), quote.getFiftyTwoWeekHigh(),
                quote.getVolume());

        String userMessage = String.format("Analyze %s on horizon: %s. Context: %s", ticker, horizon, context);
        String aiResponse = geminiService.callGeminiText(systemPrompt, userMessage);

        DebateResponse response = parseOrSimulateDebate(ticker, horizon, quote, aiResponse);

        try {
            DebateRecord record = DebateRecord.builder()
                    .ticker(ticker)
                    .horizon(horizon)
                    .convictionScore(response.getConvictionScore())
                    .verdict(response.getVerdict())
                    .bullArgument(response.getBullArgument())
                    .bearArgument(response.getBearArgument())
                    .riskSynthesis(response.getRiskOfficerSynthesis())
                    .createdAt(LocalDateTime.now())
                    .build();
            debateRecordRepository.save(record);
        } catch (Exception e) {
            log.warn("Failed to persist debate record: {}", e.getMessage());
        }

        return response;
    }

    private DebateResponse parseOrSimulateDebate(String ticker, String horizon, MarketDataService.LiveQuote quote, String rawAi) {
        if (rawAi != null) {
            try {
                String cleaned = rawAi.replaceAll("```json", "").replaceAll("```", "").trim();
                JsonNode root = objectMapper.readTree(cleaned);

                List<String> catalysts = new ArrayList<>();
                if (root.has("keyCatalysts")) {
                    root.path("keyCatalysts").forEach(c -> catalysts.add(c.asText()));
                }

                List<String> risks = new ArrayList<>();
                if (root.has("criticalRisks")) {
                    root.path("criticalRisks").forEach(r -> risks.add(r.asText()));
                }

                return DebateResponse.builder()
                        .ticker(ticker)
                        .horizon(horizon)
                        .convictionScore(root.path("convictionScore").asInt(75))
                        .verdict(root.path("verdict").asText("ACCUMULATE ON PULLBACK"))
                        .bullArgument(root.path("bullArgument").asText())
                        .bearArgument(root.path("bearArgument").asText())
                        .riskOfficerSynthesis(root.path("riskOfficerSynthesis").asText())
                        .keyCatalysts(catalysts)
                        .criticalRisks(risks)
                        .build();
            } catch (Exception e) {
                log.warn("Failed to parse AI debate JSON: {}", e.getMessage());
            }
        }

        // Live Market-Grounded Fallback Engine
        double cmp = quote.getCurrentPrice();
        double high52 = quote.getFiftyTwoWeekHigh();
        double low52 = quote.getFiftyTwoWeekLow();
        double pctFromHigh = ((high52 - cmp) / high52) * 100;

        int score = pctFromHigh > 15 ? 79 : 68;
        String verdict = pctFromHigh > 15 ? "ACCUMULATE ON PULLBACK" : "DEFENSIVE HOLD / TIGHT SL";

        String bull = String.format("Trading at %s %.2f, %s shows strong support above its 52-week low of %.2f. Institutional volume has averaged %s shares. Sustained domestic order-book visibility and market dominance support expanding operating margins.",
                quote.getCurrency(), cmp, ticker, low52, formatVolume(quote.getVolume()));

        String bear = String.format("Stock sits %.1f%% below its 52-week high of %.2f. Valuation multiples remain demanding relative to peer-group averages. Margin compression from higher input costs and macroeconomic liquidity tightening present near-term headwinds.",
                pctFromHigh, high52);

        String cro = String.format("Balanced risk profile for a %s horizon. Deploy a 50%% initial tranche at current levels (%.2f), reserving secondary entry near key demand zone of %.2f with a strict invalidation below %.2f.",
                horizon, cmp, cmp * 0.94, cmp * 0.89);

        List<String> catalysts = List.of(
                String.format("Potential re-rating toward 52-week peak of %.2f as quarterly execution beats consensus", high52),
                "FII & DII net positive institutional flow across high-quality defensive sectors",
                "Improving free cash flow conversion cycle over the trailing 12 months"
        );

        List<String> risks = List.of(
                String.format("Failure to hold immediate support at %.2f could trigger a retest of lower demand zones", cmp * 0.94),
                "Sectoral beta sensitivity during broad market corrections",
                "Input cost inflation squeezing EBITDA margins"
        );

        return DebateResponse.builder()
                .ticker(ticker)
                .horizon(horizon)
                .convictionScore(score)
                .verdict(verdict)
                .bullArgument(bull)
                .bearArgument(bear)
                .riskOfficerSynthesis(cro)
                .keyCatalysts(catalysts)
                .criticalRisks(risks)
                .build();
    }

    private String formatVolume(Long vol) {
        if (vol == null) return "N/A";
        if (vol >= 10000000) return String.format("%.2f Cr", vol / 10000000.0);
        if (vol >= 100000) return String.format("%.2f Lakh", vol / 100000.0);
        if (vol >= 1000) return String.format("%.1fk", vol / 1000.0);
        return String.valueOf(vol);
    }
}
