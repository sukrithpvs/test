package com.portfolio.manager.service;

import com.portfolio.manager.dto.response.PortfolioSummaryResponse;
import com.portfolio.manager.entity.Holding;
import com.portfolio.manager.entity.Portfolio;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortfolioAnalyticsService {

    private final HoldingService holdingService;
    private final PortfolioService portfolioService;
    private final YahooFinanceService yahooFinanceService;

    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getPortfolioSummary() {
        log.info("Calculating portfolio summary");

        Portfolio portfolio = portfolioService.getPortfolioEntity();
        List<Holding> holdings = holdingService.getAllHoldingEntities();

        if (holdings.isEmpty()) {
            log.info("No holdings found, returning wallet balance only");
            return PortfolioSummaryResponse.builder()
                    .cashBalance(portfolio.getCashBalance().setScale(2, RoundingMode.HALF_UP))
                    .totalInvested(BigDecimal.ZERO)
                    .currentValue(BigDecimal.ZERO)
                    .profitLoss(BigDecimal.ZERO)
                    .returnPercent(BigDecimal.ZERO)
                    .build();
        }

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;

        for (Holding holding : holdings) {
            // Calculate invested amount: quantity * avgBuyPrice
            BigDecimal investedAmount = holding.getQuantity().multiply(holding.getAvgBuyPrice());
            totalInvested = totalInvested.add(investedAmount);

            // Get current price and calculate current value
            BigDecimal currentPrice = yahooFinanceService.getPrice(holding.getTicker());
            BigDecimal holdingValue = holding.getQuantity().multiply(currentPrice);
            currentValue = currentValue.add(holdingValue);

            log.debug("Holding {}: invested={}, currentPrice={}, value={}",
                    holding.getTicker(), investedAmount, currentPrice, holdingValue);
        }

        // Calculate profit/loss
        BigDecimal profitLoss = currentValue.subtract(totalInvested);

        // Calculate return percentage
        BigDecimal returnPercent = BigDecimal.ZERO;
        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {
            returnPercent = profitLoss
                    .divide(totalInvested, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        log.info("Portfolio summary: cash={}, invested={}, current={}, P&L={}, return={}%",
                portfolio.getCashBalance(), totalInvested, currentValue, profitLoss, returnPercent);

        return PortfolioSummaryResponse.builder()
                .cashBalance(portfolio.getCashBalance().setScale(2, RoundingMode.HALF_UP))
                .totalInvested(totalInvested.setScale(2, RoundingMode.HALF_UP))
                .currentValue(currentValue.setScale(2, RoundingMode.HALF_UP))
                .profitLoss(profitLoss.setScale(2, RoundingMode.HALF_UP))
                .returnPercent(returnPercent)
                .build();
    }
}
