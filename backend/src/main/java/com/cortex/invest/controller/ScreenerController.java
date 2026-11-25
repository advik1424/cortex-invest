package com.cortex.invest.controller;

import com.cortex.invest.dto.AiAnalysisRequest;
import com.cortex.invest.dto.AiAnalysisResponse;
import com.cortex.invest.dto.AskAnalystRequest;
import com.cortex.invest.dto.AskAnalystResponse;
import com.cortex.invest.dto.ScreenerDataResponse;
import com.cortex.invest.service.GeminiService;
import com.cortex.invest.service.MarketDataService;
import com.cortex.invest.service.ScreenerService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@RequestMapping("/api/screener")
@RequiredArgsConstructor
public class ScreenerController {

    private final ScreenerService screenerService;
    private final GeminiService geminiService;
    private final MarketDataService marketDataService;

    // Comprehensive universe of Indian equities loaded dynamically from official NSE 500
    private final List<Map<String, String>> catalog = new ArrayList<>();
    private final Map<String, String> aliasMap = new ConcurrentHashMap<>();

    @PostConstruct
    public void initCatalog() {
        // Seed common company nickname / multi-word aliases to official NSE tickers
        aliasMap.put("PNB", "PNB");
        aliasMap.put("PUNJAB NATIONAL BANK", "PNB");
        aliasMap.put("PNB BANK", "PNB");
        aliasMap.put("PUNJAB BANK", "PNB");
        aliasMap.put("TATA", "TATAMOTORS");
        aliasMap.put("TATA MOTORS", "TATAMOTORS");
        aliasMap.put("TATA MOTOR", "TATAMOTORS");
        aliasMap.put("TATA CONSULTANCY", "TCS");
        aliasMap.put("TATA STEEL", "TATASTEEL");
        aliasMap.put("HDFC", "HDFCBANK");
        aliasMap.put("HDFC BANK", "HDFCBANK");
        aliasMap.put("SBI", "SBIN");
        aliasMap.put("STATE BANK", "SBIN");
        aliasMap.put("STATE BANK OF INDIA", "SBIN");
        aliasMap.put("ICICI", "ICICIBANK");
        aliasMap.put("ICICI BANK", "ICICIBANK");
        aliasMap.put("KOTAK", "KOTAKBANK");
        aliasMap.put("KOTAK BANK", "KOTAKBANK");
        aliasMap.put("AXIS", "AXISBANK");
        aliasMap.put("AXIS BANK", "AXISBANK");
        aliasMap.put("RIL", "RELIANCE");
        aliasMap.put("RELIANCE", "RELIANCE");
        aliasMap.put("RELIANCE INDUSTRIES", "RELIANCE");
        aliasMap.put("INFOSYS", "INFY");
        aliasMap.put("INFY", "INFY");
        aliasMap.put("HUL", "HINDUNILVR");
        aliasMap.put("HINDUSTAN UNILEVER", "HINDUNILVR");
        aliasMap.put("L&T", "LT");
        aliasMap.put("LARSEN", "LT");
        aliasMap.put("LARSEN & TOUBRO", "LT");
        aliasMap.put("CDSL", "CDSL");
        aliasMap.put("BEL", "BEL");
        aliasMap.put("HAL", "HAL");
        aliasMap.put("MARUTI", "MARUTI");
        aliasMap.put("SUN PHARMA", "SUNPHARMA");
        aliasMap.put("ZOMATO", "ZOMATO");
        aliasMap.put("PAYTM", "PAYTM");
        aliasMap.put("SUZLON", "SUZLON");
        aliasMap.put("ITC", "ITC");
        aliasMap.put("TITAN", "TITAN");

        // Load 500+ NSE constituents from classpath resource
        try {
            ClassPathResource res = new ClassPathResource("nifty500.csv");
            if (res.exists()) {
                try (BufferedReader br = new BufferedReader(new InputStreamReader(res.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    boolean isHeader = true;
                    while ((line = br.readLine()) != null) {
                        if (isHeader) {
                            isHeader = false;
                            continue;
                        }
                        String[] parts = line.split(",");
                        if (parts.length >= 3) {
                            String companyName = parts[0].trim();
                            String industry = parts[1].trim();
                            String symbol = parts[2].trim().toUpperCase();

                            if (!symbol.isEmpty()) {
                                catalog.add(Map.of(
                                        "ticker", symbol,
                                        "name", companyName,
                                        "sector", industry
                                ));
                                aliasMap.put(symbol, symbol);
                                aliasMap.put(companyName.toUpperCase(), symbol);
                            }
                        }
                    }
                }
                log.info("Successfully loaded {} stocks into ScreenerController catalog from nifty500.csv", catalog.size());
            }
        } catch (Exception e) {
            log.warn("Could not load nifty500.csv: {}", e.getMessage());
        }

        // Fallback seed if CSV loading was empty
        if (catalog.isEmpty()) {
            catalog.addAll(List.of(
                    Map.of("ticker", "PNB", "name", "Punjab National Bank", "sector", "Public Sector Bank"),
                    Map.of("ticker", "RELIANCE", "name", "Reliance Industries Ltd", "sector", "Oil & Gas / Retail / Telecom"),
                    Map.of("ticker", "TATAMOTORS", "name", "Tata Motors Ltd", "sector", "Automobile & EV"),
                    Map.of("ticker", "HDFCBANK", "name", "HDFC Bank Ltd", "sector", "Banking & Finance"),
                    Map.of("ticker", "ICICIBANK", "name", "ICICI Bank Ltd", "sector", "Private Sector Bank"),
                    Map.of("ticker", "SBIN", "name", "State Bank of India", "sector", "Public Sector Bank"),
                    Map.of("ticker", "INFY", "name", "Infosys Ltd", "sector", "Information Technology"),
                    Map.of("ticker", "TCS", "name", "Tata Consultancy Services Ltd", "sector", "Information Technology")
            ));
        }
    }

    @GetMapping("/{ticker}")
    public ResponseEntity<ScreenerDataResponse> getScreenerData(@PathVariable String ticker) {
        return ResponseEntity.ok(screenerService.getCompanyData(ticker));
    }

    @PostMapping("/ai-analysis")
    public ResponseEntity<AiAnalysisResponse> getAiAnalysis(@RequestBody AiAnalysisRequest request) {
        return ResponseEntity.ok(geminiService.performDeepAnalysis(request));
    }

    @PostMapping("/ask-analyst")
    public ResponseEntity<AskAnalystResponse> askAnalyst(@RequestBody AskAnalystRequest request) {
        return ResponseEntity.ok(geminiService.answerAnalystQuestion(request));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchCompanies(@RequestParam("q") String query) {
        String qClean = query != null ? query.trim() : "";
        if (qClean.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        String qLower = qClean.toLowerCase();
        String qUpper = qClean.toUpperCase();

        String targetTicker = aliasMap.get(qUpper);

        List<Map<String, Object>> results = new ArrayList<>();
        Set<String> addedTickers = new HashSet<>();

        // 1. First priority: Exact ticker or alias match
        for (Map<String, String> c : catalog) {
            String ticker = c.get("ticker");
            if (ticker.equalsIgnoreCase(qUpper) || (targetTicker != null && ticker.equalsIgnoreCase(targetTicker))) {
                results.add(buildSearchResult(c, 100));
                addedTickers.add(ticker);
            }
        }

        // 2. Second priority: Prefix match on company name or ticker
        for (Map<String, String> c : catalog) {
            String ticker = c.get("ticker");
            if (addedTickers.contains(ticker)) continue;

            String name = c.get("name").toLowerCase();
            String tick = ticker.toLowerCase();
            if (tick.startsWith(qLower)) {
                results.add(buildSearchResult(c, 90));
                addedTickers.add(ticker);
            } else if (name.startsWith(qLower)) {
                results.add(buildSearchResult(c, 85));
                addedTickers.add(ticker);
            }
        }

        // 3. Third priority: Multi-word token match across company name & sector
        String[] tokens = qLower.split("\\s+");
        for (Map<String, String> c : catalog) {
            if (results.size() >= 15) break;
            String ticker = c.get("ticker");
            if (addedTickers.contains(ticker)) continue;

            String name = c.get("name").toLowerCase();
            String sector = c.get("sector").toLowerCase();
            String tick = ticker.toLowerCase();

            boolean allTokensMatch = Arrays.stream(tokens).allMatch(tok ->
                    tick.contains(tok) || name.contains(tok) || sector.contains(tok)
            );

            if (allTokensMatch) {
                results.add(buildSearchResult(c, 70));
                addedTickers.add(ticker);
            }
        }

        // 4. Fourth priority: Loose substring match
        for (Map<String, String> c : catalog) {
            if (results.size() >= 20) break;
            String ticker = c.get("ticker");
            if (addedTickers.contains(ticker)) continue;

            String name = c.get("name").toLowerCase();
            String sector = c.get("sector").toLowerCase();
            String tick = ticker.toLowerCase();
            if (tick.contains(qLower) || name.contains(qLower) || sector.contains(qLower)) {
                results.add(buildSearchResult(c, 50));
                addedTickers.add(ticker);
            }
        }

        // Sort by score descending
        results.sort((a, b) -> Integer.compare((Integer) b.get("score"), (Integer) a.get("score")));

        // 5. If query not found in catalog, fetch actual live quote dynamically from MarketDataService (NEVER hardcode 750)
        if (!addedTickers.contains(qUpper) && qUpper.length() >= 2 && results.isEmpty()) {
            Double dynamicPrice = null;
            try {
                MarketDataService.LiveQuote liveQ = marketDataService.fetchLiveQuote(qUpper);
                if (liveQ != null && liveQ.getCurrentPrice() != null) {
                    dynamicPrice = liveQ.getCurrentPrice();
                }
            } catch (Exception ignored) {}

            double finalP = dynamicPrice != null && dynamicPrice > 0 ? dynamicPrice : 100.0;
            results.add(Map.of(
                    "ticker", qUpper,
                    "name", qUpper + " Ltd",
                    "sector", "NSE / BSE Listed Equity",
                    "currentPrice", finalP,
                    "priceFormatted", String.format("₹%.2f", finalP),
                    "score", 10
            ));
        }

        return ResponseEntity.ok(results.size() > 10 ? results.subList(0, 10) : results);
    }

    private Map<String, Object> buildSearchResult(Map<String, String> c, int score) {
        String ticker = c.get("ticker");
        Double price = null;
        try {
            MarketDataService.LiveQuote quote = marketDataService.fetchLiveQuote(ticker);
            if (quote != null && quote.getCurrentPrice() != null) {
                price = quote.getCurrentPrice();
            }
        } catch (Exception ignored) {}

        double finalPrice = price != null ? price : 100.0;
        Map<String, Object> map = new HashMap<>();
        map.put("ticker", ticker);
        map.put("name", c.get("name"));
        map.put("sector", c.get("sector"));
        map.put("currentPrice", finalPrice);
        map.put("priceFormatted", String.format("₹%.2f", finalPrice));
        map.put("score", score);
        return map;
    }
}
