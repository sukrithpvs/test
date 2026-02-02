package com.portfolio.manager.config;

import com.portfolio.manager.entity.Holding;
import com.portfolio.manager.entity.Portfolio;
import com.portfolio.manager.repository.HoldingRepository;
import com.portfolio.manager.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (portfolioRepository.count() == 0) {
            log.info("Database is empty. Seeding demo data...");
            seedDemoData();
        } else {
            log.info("Database already contains data. Skipping seeding.");
        }
    }

    private void seedDemoData() {
        // Create portfolio
        Portfolio portfolio = Portfolio.builder()
                .name("My Portfolio")
                .build();
        portfolio = portfolioRepository.save(portfolio);
        log.info("Created portfolio: {}", portfolio.getName());

        // Create holdings
        createHolding(portfolio, "AAPL", new BigDecimal("10"), new BigDecimal("150.00"));
        createHolding(portfolio, "TSLA", new BigDecimal("5"), new BigDecimal("700.00"));
        createHolding(portfolio, "AMZN", new BigDecimal("2"), new BigDecimal("120.00"));

        log.info("Demo data seeded successfully!");
        log.info("Portfolio: {} with {} holdings", portfolio.getName(), 3);
    }

    private void createHolding(Portfolio portfolio, String ticker, BigDecimal quantity, BigDecimal avgBuyPrice) {
        Holding holding = Holding.builder()
                .portfolio(portfolio)
                .ticker(ticker)
                .quantity(quantity)
                .avgBuyPrice(avgBuyPrice)
                .createdAt(LocalDateTime.now())
                .build();
        holdingRepository.save(holding);
        log.info("Created holding: {} - {} shares @ ${}", ticker, quantity, avgBuyPrice);
    }
}
