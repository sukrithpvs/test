package com.portfolio.manager.controller;

import com.portfolio.manager.dto.response.MarketMoverResponse;
import com.portfolio.manager.dto.response.MutualFundResponse;
import com.portfolio.manager.dto.response.StockDetailResponse;
import com.portfolio.manager.dto.response.StockHistoryResponse;
import com.portfolio.manager.service.MarketDataService;
import com.portfolio.manager.service.MutualFundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
@Tag(name = "Market Data", description = "Market data and stock information")
public class MarketDataController {

    private final MarketDataService marketDataService;
    private final MutualFundService mutualFundService;

    @GetMapping("/stock/{ticker}")
    @Operation(summary = "Get detailed stock information with OHLCV and fundamentals")
    public ResponseEntity<StockDetailResponse> getStockDetail(@PathVariable String ticker) {
        return ResponseEntity.ok(marketDataService.getStockDetail(ticker));
    }

    @GetMapping("/stock/{ticker}/history")
    @Operation(summary = "Get stock with 6-month historical data for charts")
    public ResponseEntity<StockHistoryResponse> getStockWithHistory(@PathVariable String ticker) {
        return ResponseEntity.ok(marketDataService.getStockWithHistory(ticker));
    }

    @GetMapping("/gainers")
    @Operation(summary = "Get top gaining stocks")
    public ResponseEntity<List<MarketMoverResponse>> getTopGainers() {
        return ResponseEntity.ok(marketDataService.getTopGainers());
    }

    @GetMapping("/losers")
    @Operation(summary = "Get top losing stocks")
    public ResponseEntity<List<MarketMoverResponse>> getTopLosers() {
        return ResponseEntity.ok(marketDataService.getTopLosers());
    }

    @GetMapping("/mutualfunds")
    @Operation(summary = "Get top mutual funds")
    public ResponseEntity<List<MutualFundResponse>> getTopMutualFunds() {
        return ResponseEntity.ok(mutualFundService.getTopMutualFunds());
    }

    @GetMapping("/mutualfunds/{schemeCode}")
    @Operation(summary = "Get mutual fund details by scheme code")
    public ResponseEntity<MutualFundResponse> getMutualFundDetails(@PathVariable String schemeCode) {
        return ResponseEntity.ok(mutualFundService.getMutualFundDetails(schemeCode));
    }

    @GetMapping("/mutualfunds/search")
    @Operation(summary = "Search mutual funds")
    public ResponseEntity<List<MutualFundResponse>> searchMutualFunds(@RequestParam String q) {
        return ResponseEntity.ok(mutualFundService.searchMutualFunds(q));
    }
}
