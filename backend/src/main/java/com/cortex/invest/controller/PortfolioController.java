package com.cortex.invest.controller;

import com.cortex.invest.dto.DiscussStockRequest;
import com.cortex.invest.dto.DiscussStockResponse;
import com.cortex.invest.dto.PortfolioAuditResponse;
import com.cortex.invest.dto.PortfolioDiagnoseResponse;
import com.cortex.invest.model.PortfolioHolding;
import com.cortex.invest.service.DualEngineRadarService;
import com.cortex.invest.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final DualEngineRadarService dualEngineRadarService;

    @GetMapping
    public ResponseEntity<List<PortfolioHolding>> getHoldings() {
        return ResponseEntity.ok(portfolioService.getAllHoldings());
    }

    @PostMapping("/add")
    public ResponseEntity<PortfolioHolding> addHolding(@RequestBody PortfolioHolding holding) {
        return ResponseEntity.ok(portfolioService.addHolding(holding));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHolding(@PathVariable Long id) {
        portfolioService.deleteHolding(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/diagnose")
    public ResponseEntity<PortfolioDiagnoseResponse> runDiagnosis() {
        return ResponseEntity.ok(portfolioService.runPortfolioDiagnosis());
    }

    @GetMapping("/audit")
    public ResponseEntity<PortfolioAuditResponse> runAudit() {
        List<PortfolioHolding> holdings = portfolioService.getAllHoldings();
        return ResponseEntity.ok(dualEngineRadarService.auditPortfolio(holdings));
    }

    @PostMapping("/discuss-stock")
    public ResponseEntity<DiscussStockResponse> discussStock(@RequestBody DiscussStockRequest req) {
        return ResponseEntity.ok(portfolioService.discussIndividualStock(req));
    }
}
