package com.cortex.invest.controller;

import com.cortex.invest.dto.AiAnalysisRequest;
import com.cortex.invest.dto.AiAnalysisResponse;
import com.cortex.invest.dto.AskAnalystRequest;
import com.cortex.invest.dto.AskAnalystResponse;
import com.cortex.invest.dto.ScreenerDataResponse;
import com.cortex.invest.service.GeminiService;
import com.cortex.invest.service.ScreenerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/screener")
@RequiredArgsConstructor
public class ScreenerController {

    private final ScreenerService screenerService;
    private final GeminiService geminiService;

    // Comprehensive universe of Indian and international equities across all sectors
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
    public ResponseEntity<List<Map<String, String>>> searchCompanies(@RequestParam("q") String query) {
        String qLower = query != null ? query.toLowerCase().trim() : "";
        String qUpper = query != null ? query.toUpperCase().trim() : "";

        List<Map<String, String>> results = new ArrayList<>();

        if (!qLower.isEmpty()) {
            // Find in catalog
            for (Map<String, String> c : catalog) {
                if (c.get("ticker").toLowerCase().contains(qLower) || c.get("name").toLowerCase().contains(qLower) || c.get("sector").toLowerCase().contains(qLower)) {
                    results.add(c);
                }
            }

            // If not found in catalog, dynamically provide the typed ticker so user can search ANY stock in the world
            boolean exactMatchExists = results.stream().anyMatch(r -> r.get("ticker").equalsIgnoreCase(qUpper));
            if (!exactMatchExists && qUpper.length() >= 2) {
                results.add(0, Map.of(
                        "ticker", qUpper,
                        "name", qUpper + " Limited",
                        "sector", "NSE / BSE Listed Equity"
                ));
            }
        }

        return ResponseEntity.ok(results);
    }
}
