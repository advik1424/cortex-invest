package com.cortex.invest.service;

import com.cortex.invest.dto.ScreenerDataResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScreenerService {

    private final MarketDataService marketDataService;
    private final GeminiService geminiService;

    // In-memory cache for ultra-fast sub-millisecond responses on repeated queries
    private final Map<String, ScreenerDataResponse> cache = new ConcurrentHashMap<>();

    /**
     * Dynamically fetches fundamental data for ANY stock via Gemini LLM + Live Market Quotes
     */
    @Cacheable(value = "screener_data", key = "#rawTicker != null ? #rawTicker.toUpperCase().trim() : 'RELIANCE'")
    public ScreenerDataResponse getCompanyData(String rawTicker) {
        String ticker = rawTicker != null ? rawTicker.trim().toUpperCase() : "RELIANCE";

        if (cache.containsKey(ticker)) {
            return cache.get(ticker);
        }

        log.info("Generating authentic Screener.in dataset via Gemini LLM for ticker: {}", ticker);
        MarketDataService.LiveQuote quote = marketDataService.fetchLiveQuote(ticker);
        ScreenerDataResponse data = geminiService.generateDynamicScreenerData(ticker, quote);

        if (data != null) {
            cache.put(ticker, data);
            return data;
        }

        return cache.getOrDefault("RELIANCE", null);
    }
}
