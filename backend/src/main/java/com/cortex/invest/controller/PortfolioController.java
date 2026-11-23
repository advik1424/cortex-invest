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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final DualEngineRadarService dualEngineRadarService;

    private String resolveEmail(String headerEmail, String paramEmail) {
        if (headerEmail != null && !headerEmail.isBlank()) return headerEmail.trim().toLowerCase();
        if (paramEmail != null && !paramEmail.isBlank()) return paramEmail.trim().toLowerCase();
        return "guest@cortex.invest";
    }

    @GetMapping
    public ResponseEntity<List<PortfolioHolding>> getHoldings(
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail,
            @RequestParam(value = "userEmail", required = false) String paramEmail) {
        String email = resolveEmail(headerEmail, paramEmail);
        return ResponseEntity.ok(portfolioService.getAllHoldings(email));
    }

    @PostMapping("/add")
    public ResponseEntity<PortfolioHolding> addHolding(
            @RequestBody PortfolioHolding holding,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail,
            @RequestParam(value = "userEmail", required = false) String paramEmail) {
        String email = resolveEmail(headerEmail, paramEmail);
        return ResponseEntity.ok(portfolioService.addHolding(holding, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHolding(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail,
            @RequestParam(value = "userEmail", required = false) String paramEmail) {
        String email = resolveEmail(headerEmail, paramEmail);
        portfolioService.deleteHolding(id, email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/diagnose")
    public ResponseEntity<PortfolioDiagnoseResponse> runDiagnosis(
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail,
            @RequestParam(value = "userEmail", required = false) String paramEmail) {
        String email = resolveEmail(headerEmail, paramEmail);
        return ResponseEntity.ok(portfolioService.runPortfolioDiagnosis(email));
    }

    @GetMapping("/audit")
    public ResponseEntity<PortfolioAuditResponse> runAudit(
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail,
            @RequestParam(value = "userEmail", required = false) String paramEmail) {
        String email = resolveEmail(headerEmail, paramEmail);
        List<PortfolioHolding> holdings = portfolioService.getAllHoldings(email);
        return ResponseEntity.ok(dualEngineRadarService.auditPortfolio(holdings));
    }

    @PostMapping("/discuss-stock")
    public ResponseEntity<DiscussStockResponse> discussStock(@RequestBody DiscussStockRequest req) {
        return ResponseEntity.ok(portfolioService.discussIndividualStock(req));
    }
}
