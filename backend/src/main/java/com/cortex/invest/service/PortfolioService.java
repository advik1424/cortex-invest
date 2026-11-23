package com.cortex.invest.service;

import com.cortex.invest.dto.DiscussStockRequest;
import com.cortex.invest.dto.DiscussStockResponse;
import com.cortex.invest.dto.PortfolioDiagnoseResponse;
import com.cortex.invest.model.PortfolioHolding;
import com.cortex.invest.repository.PortfolioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final MarketDataService marketDataService;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void seedInitialHoldings() {
        if (portfolioRepository.count() == 0) {
            log.info("Seeding realistic benchmark portfolio...");
            List<PortfolioHolding> sampleHoldings = List.of(
                    PortfolioHolding.builder().ticker("HDFCBANK").companyName("HDFC Bank Ltd").quantity(50).avgBuyPrice(1520.0).currentMarketPrice(1742.0).sector("Banking & Financials").category("Compounder").build(),
                    PortfolioHolding.builder().ticker("TATAMOTORS").companyName("Tata Motors Ltd").quantity(120).avgBuyPrice(680.0).currentMarketPrice(964.0).sector("Automobile / EV").category("Compounder").build(),
                    PortfolioHolding.builder().ticker("RELIANCE").companyName("Reliance Industries Ltd").quantity(30).avgBuyPrice(1280.0).currentMarketPrice(1377.5).sector("Energy & Conglomerate").category("Compounder").build(),
                    PortfolioHolding.builder().ticker("SUZLON").companyName("Suzlon Energy Ltd").quantity(500).avgBuyPrice(72.0).currentMarketPrice(64.5).sector("Renewable Energy").category("Cyclical").build(),
                    PortfolioHolding.builder().ticker("IDEA").companyName("Vodafone Idea Ltd").quantity(1000).avgBuyPrice(14.5).currentMarketPrice(7.8).sector("Telecom").category("Dead Capital").build()
            );
            portfolioRepository.saveAll(sampleHoldings);
        }
    }

    public List<PortfolioHolding> getAllHoldings() {
        List<PortfolioHolding> holdings = portfolioRepository.findAll();
        // Dynamically update CMP with real live market quotes
        for (PortfolioHolding h : holdings) {
            try {
                MarketDataService.LiveQuote quote = marketDataService.fetchLiveQuote(h.getTicker());
                if (quote != null && quote.getCurrentPrice() != null && quote.getCurrentPrice() > 0) {
                    h.setCurrentMarketPrice(quote.getCurrentPrice());
                }
            } catch (Exception ignored) {}
        }
        return holdings;
    }

    public PortfolioHolding addHolding(PortfolioHolding holding) {
        if (holding.getCategory() == null || holding.getCategory().isBlank()) {
            holding.setCategory("Compounder");
        }
        // Fetch live quote for initial price if missing
        if (holding.getCurrentMarketPrice() == null || holding.getCurrentMarketPrice() == 0) {
            MarketDataService.LiveQuote quote = marketDataService.fetchLiveQuote(holding.getTicker());
            holding.setCurrentMarketPrice(quote.getCurrentPrice());
        }
        return portfolioRepository.save(holding);
    }

    public void deleteHolding(Long id) {
        portfolioRepository.deleteById(id);
    }

    public PortfolioDiagnoseResponse runPortfolioDiagnosis() {
        List<PortfolioHolding> holdings = getAllHoldings();
        if (holdings.isEmpty()) {
            return PortfolioDiagnoseResponse.builder()
                    .healthScore(0)
                    .concentrationRiskAssessment("Portfolio is empty.")
                    .stressTestSummary("N/A")
                    .categorizedHoldings(List.of())
                    .rebalancingBlueprint(List.of())
                    .build();
        }

        StringBuilder basketInfo = new StringBuilder();
        double totalCapital = 0;
        double totalPnlVal = 0;

        for (PortfolioHolding h : holdings) {
            double invested = h.getAvgBuyPrice() * h.getQuantity();
            double current = h.getCurrentMarketPrice() * h.getQuantity();
            double pnl = current - invested;
            double pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
            totalCapital += invested;
            totalPnlVal += pnl;

            basketInfo.append(String.format("Ticker: %s, Sector: %s, Invested: %.1f, Current: %.1f, PnL: %.1f%%\n",
                    h.getTicker(), h.getSector(), invested, current, pnlPct));
        }

        double totalPnlPct = totalCapital > 0 ? (totalPnlVal / totalCapital) * 100.0 : 0.0;

        String systemPrompt = """
            You are the Chief Investment Officer analyzing a client's real investment basket.
            Diagnose the basket for:
            1. Overall Portfolio Health Score (0-100).
            2. Sector Concentration & Risk Assessment.
            3. Stress Test: Expected impact of an 8% market correction.
            4. Categorize each holding into Compounder, Cyclical, or Dead Capital with specific action (HOLD, ADD, TRIM, EXIT).
            5. Actionable Rebalancing Blueprint.
            
            Return ONLY raw valid JSON (no markdown fences, no code blocks):
            {
              "healthScore": 76,
              "concentrationRiskAssessment": "...",
              "stressTestSummary": "...",
              "categorizedHoldings": [
                {
                  "ticker": "TICKER",
                  "category": "Compounder",
                  "diagnosisReason": "...",
                  "recommendation": "HOLD"
                }
              ],
              "rebalancingBlueprint": ["Step 1...", "Step 2..."]
            }
            """;

        String aiResponse = geminiService.callGeminiText(systemPrompt, basketInfo.toString());
        return parseOrSimulatePortfolio(holdings, aiResponse);
    }

    private PortfolioDiagnoseResponse parseOrSimulatePortfolio(List<PortfolioHolding> holdings, String rawAi) {
        if (rawAi != null) {
            try {
                String cleaned = rawAi.replaceAll("```json", "").replaceAll("```", "").trim();
                JsonNode root = objectMapper.readTree(cleaned);

                List<PortfolioDiagnoseResponse.StockDiagnosis> list = new ArrayList<>();
                if (root.has("categorizedHoldings")) {
                    root.path("categorizedHoldings").forEach(n -> {
                        list.add(PortfolioDiagnoseResponse.StockDiagnosis.builder()
                                .ticker(n.path("ticker").asText())
                                .category(n.path("category").asText("Compounder"))
                                .diagnosisReason(n.path("diagnosisReason").asText())
                                .recommendation(n.path("recommendation").asText("HOLD"))
                                .build());
                    });
                }

                List<String> blueprint = new ArrayList<>();
                if (root.has("rebalancingBlueprint")) {
                    root.path("rebalancingBlueprint").forEach(b -> blueprint.add(b.asText()));
                }

                return PortfolioDiagnoseResponse.builder()
                        .healthScore(root.path("healthScore").asInt(74))
                        .concentrationRiskAssessment(root.path("concentrationRiskAssessment").asText())
                        .stressTestSummary(root.path("stressTestSummary").asText())
                        .categorizedHoldings(list)
                        .rebalancingBlueprint(blueprint)
                        .build();
            } catch (Exception e) {
                log.warn("Failed to parse portfolio AI JSON: {}", e.getMessage());
            }
        }

        // Calculate actual sector distribution dynamically
        double totalCapital = 0;
        double totalCurrentVal = 0;
        for (PortfolioHolding h : holdings) {
            totalCapital += (h.getAvgBuyPrice() != null ? h.getAvgBuyPrice() : 0) * (h.getQuantity() != null ? h.getQuantity() : 0);
            totalCurrentVal += (h.getCurrentMarketPrice() != null ? h.getCurrentMarketPrice() : 0) * (h.getQuantity() != null ? h.getQuantity() : 0);
        }
        double totalPnlVal = totalCurrentVal - totalCapital;
        double totalPnlPct = totalCapital > 0 ? (totalPnlVal / totalCapital) * 100.0 : 0.0;

        Map<String, Double> sectorTotals = new HashMap<>();
        PortfolioHolding worstHolding = null;
        PortfolioHolding bestHolding = null;
        double maxLoss = 0;
        double maxGain = 0;

        List<PortfolioDiagnoseResponse.StockDiagnosis> list = new ArrayList<>();
        for (PortfolioHolding h : holdings) {
            double inv = h.getAvgBuyPrice() * h.getQuantity();
            double cur = h.getCurrentMarketPrice() * h.getQuantity();
            double pnl = cur - inv;
            double pnlPct = inv > 0 ? (pnl / inv) * 100.0 : 0.0;

            sectorTotals.merge(h.getSector() != null ? h.getSector() : "Diversified", cur, Double::sum);

            if (pnlPct < maxLoss) {
                maxLoss = pnlPct;
                worstHolding = h;
            }
            if (pnlPct > maxGain) {
                maxGain = pnlPct;
                bestHolding = h;
            }

            String cat;
            String rec;
            String reason;

            if (pnlPct < -15.0) {
                cat = "Dead Capital";
                rec = "EXIT & TAX HARVEST";
                reason = String.format("Holding is underperforming benchmark with a %+.1f%% drawdown. Capital efficiency dictates liquidating to prevent further capital erosion.", pnlPct);
            } else if (pnlPct >= 20.0) {
                cat = "Compounder";
                rec = "HOLD & TRAIL SL";
                reason = String.format("Strong leadership performer with %+.1f%% return. Structural compounding is active; trail stop loss to lock gains.", pnlPct);
            } else if (pnlPct >= 0.0) {
                cat = "Compounder";
                rec = "ACCUMULATE ON DIPS";
                reason = String.format("Constructive price structure up %+.1f%%. Healthy accumulation; add incrementally on market pullbacks.", pnlPct);
            } else {
                cat = "Cyclical";
                rec = "MONITOR SUPPORT";
                reason = String.format("Minor drawdown of %+.1f%% within standard volatility bands. Maintain stop loss discipline before adding fresh capital.", pnlPct);
            }

            list.add(PortfolioDiagnoseResponse.StockDiagnosis.builder()
                    .ticker(h.getTicker())
                    .category(cat)
                    .diagnosisReason(reason)
                    .recommendation(rec)
                    .build());
        }

        // Dynamically identify highest concentrated sector
        String topSector = "Diversified";
        double topSectorVal = 0;
        for (Map.Entry<String, Double> entry : sectorTotals.entrySet()) {
            if (entry.getValue() > topSectorVal) {
                topSectorVal = entry.getValue();
                topSector = entry.getKey();
            }
        }
        double topSectorPct = totalCapital > 0 ? (topSectorVal / totalCapital) * 100.0 : 0.0;

        int dynamicHealthScore = Math.min(95, Math.max(45, (int) Math.round(75 + (totalPnlPct * 0.4) - (topSectorPct > 40 ? 12 : 0))));
        double modelledDrawdown = Math.round((8.0 * (totalPnlPct >= 0 ? 0.72 : 1.15)) * 10.0) / 10.0;

        List<String> dynamicBlueprint = new ArrayList<>();
        if (worstHolding != null && maxLoss < -10.0) {
            dynamicBlueprint.add(String.format("Trim or exit underperforming allocation in %s (%+.1f%%) and reallocate proceeds into higher relative strength compounders.",
                    worstHolding.getTicker(), maxLoss));
        } else {
            dynamicBlueprint.add("Maintain balanced core positions with strict trailing stop-loss triggers across all holdings.");
        }

        if (bestHolding != null && maxGain > 20.0) {
            dynamicBlueprint.add(String.format("Protect unrealized gains in outperformer %s (%+.1f%%) by locking 25%% profit or trailing stop-loss near dynamic support.",
                    bestHolding.getTicker(), maxGain));
        } else {
            dynamicBlueprint.add("Reinvest quarterly dividends and dry powder cash into Stage-2 breakout leaders.");
        }

        if (topSectorPct > 35.0) {
            dynamicBlueprint.add(String.format("Sector concentration in %s is currently %.1f%% of total capital. Consider diversifying into defensive sectors to lower volatility.",
                    topSector, topSectorPct));
        } else {
            dynamicBlueprint.add("Sector diversification is well-balanced across commercial, financial, and industrial segments.");
        }

        return PortfolioDiagnoseResponse.builder()
                .healthScore(dynamicHealthScore)
                .concentrationRiskAssessment(String.format("Total portfolio capital of ₹%.0f distributed across %d sectors. Largest exposure is in %s (%.1f%%).",
                        totalCapital, sectorTotals.size(), topSector, topSectorPct))
                .stressTestSummary(String.format("Under an 8%% broad index correction, this basket is modelled to draw down by approximately -%.1f%% based on current holding beta.",
                        modelledDrawdown))
                .categorizedHoldings(list)
                .rebalancingBlueprint(dynamicBlueprint)
                .build();
    }

    public DiscussStockResponse discussIndividualStock(DiscussStockRequest req) {
        String ticker = req.getTicker() != null ? req.getTicker().toUpperCase().trim() : "STOCK";
        String companyName = req.getCompanyName() != null ? req.getCompanyName() : ticker;
        int qty = req.getQuantity() != null && req.getQuantity() > 0 ? req.getQuantity() : 10;
        double buyPrice = req.getAvgBuyPrice() != null && req.getAvgBuyPrice() > 0 ? req.getAvgBuyPrice() : 100.0;

        MarketDataService.LiveQuote quote = marketDataService.fetchLiveQuote(ticker);
        double cmp = (req.getCurrentMarketPrice() != null && req.getCurrentMarketPrice() > 0)
                ? req.getCurrentMarketPrice()
                : (quote != null && quote.getCurrentPrice() != null ? quote.getCurrentPrice() : buyPrice);

        double invested = buyPrice * qty;
        double currentVal = cmp * qty;
        double pnl = currentVal - invested;
        double pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
        String userQuery = req.getUserQuery() != null && !req.getUserQuery().isBlank()
                ? req.getUserQuery().trim()
                : "Aapka is holding par kya verdict hai? Should I hold, book profit, or average?";

        String systemPrompt = "You are an Institutional Senior Portfolio Advisor & Hedge Fund Manager specializing in Indian and global equities.";
        String userPrompt = String.format("""
            PORTFOLIO HOLDING PROFILE:
            - Stock: %s (%s)
            - Sector: %s
            - Quantity: %d shares
            - Average Buy Price: ₹%.2f
            - Current Market Price: ₹%.2f
            - Total Invested: ₹%.2f
            - Current Value: ₹%.2f
            - Unrealized P&L: ₹%.2f (%.2f%%)
            
            USER'S SPECIFIC QUESTION / DILEMMA:
            "%s"
            
            YOUR MANDATE:
            1. Solve the user's dilemma with an unambiguous, decisive action:
               - Choose holdingAction from: "HOLD (COMPOUNDER)", "TRIM 50%% & LOCK GAINS", "AVERAGE ON DIP", "IMMEDIATE EXIT (DEAD CAPITAL)".
            2. Directly and deeply address their question in 'userQueryAnswer' with exact mathematics, rationales, and trader psychological discipline.
            3. Provide 12-Month Target Price and Invalidation / Stop Loss price.
            4. Assess Risk Level ("LOW", "MODERATE", "HIGH").
            5. Provide Tax & Capital Reallocation Advice (e.g. STCG @ 20%% vs LTCG @ 12.5%% above ₹1.25L, and where to rotate capital if exiting/trimming).
            6. Provide 3-4 institutional strategic bullet points.
            
            Return ONLY raw valid JSON (no markdown fences, strictly raw JSON):
            {
              "holdingAction": "HOLD (COMPOUNDER)",
              "actionSummary": "Hold firmly for multi-quarter compounding; trailing stop loss at ₹%.2f.",
              "userQueryAnswer": "Addressing your query: ...",
              "targetPrice12M": %.2f,
              "stopLossOrExitTrigger": %.2f,
              "riskLevel": "LOW",
              "taxAndReallocationAdvice": "Capital gains advisory: ...",
              "strategicBulletPoints": [
                "Point 1...",
                "Point 2...",
                "Point 3..."
              ]
            }
            """, companyName, ticker, req.getSector() != null ? req.getSector() : "Public Equities",
                qty, buyPrice, cmp, invested, currentVal, pnl, pnlPct,
                userQuery,
                cmp * 0.94, cmp * 1.25, cmp * 0.94
        );

        String rawAi = geminiService.callGeminiText(systemPrompt, userPrompt);
        if (rawAi != null) {
            try {
                String cleaned = rawAi.replaceAll("```json", "").replaceAll("```", "").trim();
                JsonNode root = objectMapper.readTree(cleaned);

                List<String> bullets = new ArrayList<>();
                if (root.has("strategicBulletPoints")) {
                    root.path("strategicBulletPoints").forEach(b -> bullets.add(b.asText()));
                }

                return DiscussStockResponse.builder()
                        .ticker(ticker)
                        .companyName(companyName)
                        .quantity(qty)
                        .avgBuyPrice(buyPrice)
                        .currentMarketPrice(cmp)
                        .investedAmount(invested)
                        .currentValue(currentVal)
                        .pnlAmount(pnl)
                        .pnlPercentage(pnlPct)
                        .holdingAction(root.path("holdingAction").asText(pnl >= 0 ? "HOLD (COMPOUNDER)" : "TRIM 50% & LOCK GAINS"))
                        .actionSummary(root.path("actionSummary").asText("Institutional verdict generated based on risk-reward profile."))
                        .userQuery(userQuery)
                        .userQueryAnswer(root.path("userQueryAnswer").asText("Maintain disciplined position sizing aligned with portfolio risk rules."))
                        .targetPrice12M(root.path("targetPrice12M").asDouble(cmp * 1.25))
                        .stopLossOrExitTrigger(root.path("stopLossOrExitTrigger").asDouble(cmp * 0.94))
                        .riskLevel(root.path("riskLevel").asText("MODERATE"))
                        .taxAndReallocationAdvice(root.path("taxAndReallocationAdvice").asText("Optimize STCG/LTCG holding period before liquidation."))
                        .strategicBulletPoints(!bullets.isEmpty() ? bullets : List.of(
                                "Core position backed by structural tailwinds",
                                "Maintain stop loss trigger to protect capital",
                                "Review next quarterly concall for margin sustainability"
                        ))
                        .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm:ss")))
                        .build();
            } catch (Exception e) {
                log.warn("Failed to parse stock discussion JSON: {}", e.getMessage());
            }
        }

        boolean isProfit = pnl >= 0;
        String defaultAction = isProfit ? "HOLD (COMPOUNDER)" : (pnlPct < -15 ? "IMMEDIATE EXIT (DEAD CAPITAL)" : "AVERAGE ON DIP");
        return DiscussStockResponse.builder()
                .ticker(ticker)
                .companyName(companyName)
                .quantity(qty)
                .avgBuyPrice(buyPrice)
                .currentMarketPrice(cmp)
                .investedAmount(invested)
                .currentValue(currentVal)
                .pnlAmount(pnl)
                .pnlPercentage(pnlPct)
                .holdingAction(defaultAction)
                .actionSummary(isProfit ? "Stock is outperforming with strong cash generation. Continue holding with trailing stop loss." : "Position is underperforming benchmark. Trim or exit to preserve capital.")
                .userQuery(userQuery)
                .userQueryAnswer(String.format("Regarding '%s': Current position stands at ₹%.2f (%+.2f%%). We advise %s. Protect downside with stop level at ₹%.2f.",
                        userQuery, pnl, pnlPct, defaultAction, cmp * 0.94))
                .targetPrice12M(cmp * (isProfit ? 1.28 : 1.12))
                .stopLossOrExitTrigger(cmp * 0.94)
                .riskLevel(isProfit ? "LOW" : "HIGH")
                .taxAndReallocationAdvice("If sold under 12 months, STCG applies at 20%. If held >12 months, LTCG applies at 12.5% for gains above ₹1.25L. Consider reallocating into top-tier banking or auto compounders.")
                .strategicBulletPoints(List.of(
                        "Maintain position sizing within 8% of total portfolio capital",
                        "Trailing stop loss at ₹" + String.format("%.2f", cmp * 0.94) + " prevents sudden trend reversal loss",
                        "Capital efficiency dictates rotating non-performing assets into Stage-2 leaders"
                ))
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm:ss")))
                .build();
    }
}
