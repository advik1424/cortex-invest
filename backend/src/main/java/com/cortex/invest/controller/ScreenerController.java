package com.cortex.invest.controller;

import com.cortex.invest.dto.AiAnalysisRequest;
import com.cortex.invest.dto.AiAnalysisResponse;
import com.cortex.invest.dto.AskAnalystRequest;
import com.cortex.invest.dto.AskAnalystResponse;
import com.cortex.invest.dto.ScreenerDataResponse;
import com.cortex.invest.service.GeminiService;
import com.cortex.invest.service.MarketDataService;
import com.cortex.invest.service.ScreenerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/screener")
@RequiredArgsConstructor
public class ScreenerController {

    private final ScreenerService screenerService;
    private final GeminiService geminiService;
    private final MarketDataService marketDataService;

    // Comprehensive universe of Indian equities across all sectors
    private final List<Map<String, String>> catalog = List.of(
            Map.of("ticker", "RELIANCE", "name", "Reliance Industries Ltd", "sector", "Oil & Gas / Retail / Telecom"),
            Map.of("ticker", "TATAMOTORS", "name", "Tata Motors Ltd", "sector", "Automobile & EV"),
            Map.of("ticker", "HDFCBANK", "name", "HDFC Bank Ltd", "sector", "Banking & Finance"),
            Map.of("ticker", "ICICIBANK", "name", "ICICI Bank Ltd", "sector", "Private Sector Bank"),
            Map.of("ticker", "SBIN", "name", "State Bank of India", "sector", "Public Sector Bank"),
            Map.of("ticker", "KOTAKBANK", "name", "Kotak Mahindra Bank Ltd", "sector", "Banking & Finance"),
            Map.of("ticker", "AXISBANK", "name", "Axis Bank Ltd", "sector", "Banking & Finance"),
            Map.of("ticker", "INFY", "name", "Infosys Ltd", "sector", "Information Technology"),
            Map.of("ticker", "TCS", "name", "Tata Consultancy Services Ltd", "sector", "Information Technology"),
            Map.of("ticker", "WIPRO", "name", "Wipro Ltd", "sector", "Information Technology"),
            Map.of("ticker", "HCLTECH", "name", "HCL Technologies Ltd", "sector", "Information Technology"),
            Map.of("ticker", "LTIM", "name", "LTIMindtree Ltd", "sector", "Information Technology"),
            Map.of("ticker", "SUZLON", "name", "Suzlon Energy Ltd", "sector", "Renewable Green Energy"),
            Map.of("ticker", "ITC", "name", "ITC Ltd", "sector", "FMCG / Cigarettes / Hotels"),
            Map.of("ticker", "HINDUNILVR", "name", "Hindustan Unilever Ltd", "sector", "FMCG / Consumer Care"),
            Map.of("ticker", "NESTLEIND", "name", "Nestlé India Ltd", "sector", "FMCG / Food Products"),
            Map.of("ticker", "DABUR", "name", "Dabur India Ltd", "sector", "FMCG / Ayurvedic Products"),
            Map.of("ticker", "ZOMATO", "name", "Zomato Ltd", "sector", "Consumer Tech / Quick Commerce"),
            Map.of("ticker", "PAYTM", "name", "One97 Communications Ltd (Paytm)", "sector", "Fintech / Payments"),
            Map.of("ticker", "CDSL", "name", "Central Depository Services Ltd", "sector", "Capital Markets / Depository"),
            Map.of("ticker", "HAL", "name", "Hindustan Aeronautics Ltd", "sector", "Aerospace & Defense"),
            Map.of("ticker", "BEL", "name", "Bharat Electronics Ltd", "sector", "Defense Electronics"),
            Map.of("ticker", "IREDA", "name", "Indian Renewable Energy Development Agency", "sector", "Green Energy NBFC"),
            Map.of("ticker", "TITAN", "name", "Titan Company Ltd", "sector", "Consumer Luxury / Jewellery"),
            Map.of("ticker", "BAJFINANCE", "name", "Bajaj Finance Ltd", "sector", "Financial Services / NBFC"),
            Map.of("ticker", "MARUTI", "name", "Maruti Suzuki India Ltd", "sector", "Automobile & Passenger Vehicles"),
            Map.of("ticker", "LT", "name", "Larsen & Toubro Ltd", "sector", "Infrastructure & Engineering"),
            Map.of("ticker", "ADANIENT", "name", "Adani Enterprises Ltd", "sector", "Conglomerate & Incubator"),
            Map.of("ticker", "ADANIPORTS", "name", "Adani Ports and SEZ Ltd", "sector", "Ports & Logistics"),
            Map.of("ticker", "NTPC", "name", "NTPC Ltd", "sector", "Power Generation"),
            Map.of("ticker", "POWERGRID", "name", "Power Grid Corporation of India", "sector", "Power Transmission"),
            Map.of("ticker", "ONGC", "name", "Oil and Natural Gas Corporation", "sector", "Oil & Gas Exploration"),
            Map.of("ticker", "COALINDIA", "name", "Coal India Ltd", "sector", "Mining & Minerals"),
            Map.of("ticker", "TATASTEEL", "name", "Tata Steel Ltd", "sector", "Iron & Steel"),
            Map.of("ticker", "JSWSTEEL", "name", "JSW Steel Ltd", "sector", "Iron & Steel"),
            Map.of("ticker", "ULTRACEMCO", "name", "UltraTech Cement Ltd", "sector", "Cement & Building Materials"),
            Map.of("ticker", "SUNPHARMA", "name", "Sun Pharmaceutical Industries Ltd", "sector", "Pharmaceuticals"),
            Map.of("ticker", "TRENT", "name", "Trent Ltd (Westside & Zudio)", "sector", "Retail / Apparel Fashion")
    );

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

        // Common company nickname / multi-word alias mapping to official NSE tickers
        Map<String, String> aliasMap = new HashMap<>();
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
        aliasMap.put("LARSEN AND TOUBRO", "LT");
        aliasMap.put("CDSL", "CDSL");
        aliasMap.put("CENTRAL DEPOSITORY", "CDSL");
        aliasMap.put("BEL", "BEL");
        aliasMap.put("BHARAT ELECTRONICS", "BEL");
        aliasMap.put("HAL", "HAL");
        aliasMap.put("HINDUSTAN AERONAUTICS", "HAL");
        aliasMap.put("MARUTI", "MARUTI");
        aliasMap.put("MARUTI SUZUKI", "MARUTI");
        aliasMap.put("SUN PHARMA", "SUNPHARMA");
        aliasMap.put("SUN PHARMACEUTICAL", "SUNPHARMA");
        aliasMap.put("NESTLE", "NESTLEIND");
        aliasMap.put("DABUR", "DABUR");
        aliasMap.put("ZOMATO", "ZOMATO");
        aliasMap.put("PAYTM", "PAYTM");
        aliasMap.put("SUZLON", "SUZLON");
        aliasMap.put("ITC", "ITC");
        aliasMap.put("TITAN", "TITAN");

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

        // 5. If query length >= 2 and not found in catalog, provide dynamic uncataloged option at the end
        if (!addedTickers.contains(qUpper) && qUpper.length() >= 2 && results.isEmpty()) {
            Double dynamicPrice = 750.0;
            results.add(Map.of(
                    "ticker", qUpper,
                    "name", qUpper + " Ltd",
                    "sector", "NSE / BSE Listed Equity",
                    "currentPrice", dynamicPrice,
                    "priceFormatted", String.format("₹%.2f", dynamicPrice),
                    "score", 10
            ));
        }

        return ResponseEntity.ok(results);
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

        double finalPrice = price != null ? price : 1000.0;
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
