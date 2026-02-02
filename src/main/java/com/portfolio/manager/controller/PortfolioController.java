package com.portfolio.manager.controller;

import com.portfolio.manager.dto.request.CreatePortfolioRequest;
import com.portfolio.manager.dto.response.PortfolioResponse;
import com.portfolio.manager.dto.response.PortfolioSummaryResponse;
import com.portfolio.manager.service.PortfolioAnalyticsService;
import com.portfolio.manager.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio", description = "Portfolio management endpoints")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final PortfolioAnalyticsService analyticsService;

    @PostMapping
    @Operation(summary = "Create a new portfolio")
    public ResponseEntity<PortfolioResponse> createPortfolio(
            @Valid @RequestBody CreatePortfolioRequest request) {
        PortfolioResponse response = portfolioService.createPortfolio(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Get portfolio with all holdings")
    public ResponseEntity<PortfolioResponse> getPortfolio() {
        PortfolioResponse response = portfolioService.getPortfolio();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    @Operation(summary = "Get portfolio summary with P&L calculations")
    public ResponseEntity<PortfolioSummaryResponse> getPortfolioSummary() {
        PortfolioSummaryResponse summary = analyticsService.getPortfolioSummary();
        return ResponseEntity.ok(summary);
    }
}
