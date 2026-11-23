package com.cortex.invest.controller;

import com.cortex.invest.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketDataService marketDataService;

    @GetMapping("/quote/{ticker}")
    public ResponseEntity<MarketDataService.LiveQuote> getQuote(@PathVariable String ticker) {
        return ResponseEntity.ok(marketDataService.fetchLiveQuote(ticker));
    }
}
