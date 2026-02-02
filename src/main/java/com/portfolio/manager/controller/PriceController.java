package com.portfolio.manager.controller;

import com.portfolio.manager.dto.response.PriceResponse;
import com.portfolio.manager.service.YahooFinanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/prices")
@RequiredArgsConstructor
@Tag(name = "Prices", description = "Live stock price endpoints")
public class PriceController {

    private final YahooFinanceService yahooFinanceService;

    @GetMapping("/{ticker}")
    @Operation(summary = "Get live stock price for a ticker")
    public ResponseEntity<PriceResponse> getStockPrice(@PathVariable String ticker) {
        PriceResponse response = yahooFinanceService.getStockPrice(ticker);
        return ResponseEntity.ok(response);
    }
}
