package com.cortex.invest.controller;

import com.cortex.invest.dto.MarketIntelligenceDto;
import com.cortex.invest.dto.MarketIntelligenceDto.NewsSentimentItem;
import com.cortex.invest.dto.MarketIntelligenceDto.SectorInsight;
import com.cortex.invest.service.MarketDataService;
import com.cortex.invest.service.MarketIntelligenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketDataService marketDataService;
    private final MarketIntelligenceService marketIntelligenceService;

    @GetMapping("/quote/{ticker}")
    public ResponseEntity<MarketDataService.LiveQuote> getQuote(@PathVariable String ticker) {
        return ResponseEntity.ok(marketDataService.fetchLiveQuote(ticker));
    }

    @GetMapping("/live-indices")
    public ResponseEntity<List<MarketDataService.LiveQuote>> getLiveIndices() {
        return ResponseEntity.ok(marketDataService.getLiveIndices());
    }

    @GetMapping("/intelligence")
    public ResponseEntity<MarketIntelligenceDto> getMarketIntelligence() {
        return ResponseEntity.ok(marketIntelligenceService.getMarketIntelligence());
    }

    @GetMapping("/news-sentiment")
    public ResponseEntity<List<NewsSentimentItem>> getNewsSentiment() {
        return ResponseEntity.ok(marketIntelligenceService.getMarketIntelligence().getNewsSentiment());
    }

    @GetMapping("/sector-insights")
    public ResponseEntity<List<SectorInsight>> getSectorInsights() {
        return ResponseEntity.ok(marketIntelligenceService.getMarketIntelligence().getSectorInsights());
    }
}
