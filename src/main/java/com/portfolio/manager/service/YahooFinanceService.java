package com.portfolio.manager.service;

import com.portfolio.manager.dto.response.PriceResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import yahoofinance.Stock;
import yahoofinance.YahooFinance;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class YahooFinanceService {

    // Mock prices for testing when Yahoo Finance API is unavailable
    private static final Map<String, BigDecimal> MOCK_PRICES = new HashMap<>();

    static {
        MOCK_PRICES.put("AAPL", new BigDecimal("182.50"));
        MOCK_PRICES.put("TSLA", new BigDecimal("248.75"));
        MOCK_PRICES.put("AMZN", new BigDecimal("178.25"));
        MOCK_PRICES.put("GOOGL", new BigDecimal("141.80"));
        MOCK_PRICES.put("MSFT", new BigDecimal("378.90"));
        MOCK_PRICES.put("META", new BigDecimal("485.60"));
        MOCK_PRICES.put("NVDA", new BigDecimal("682.35"));
        MOCK_PRICES.put("JPM", new BigDecimal("195.40"));
        MOCK_PRICES.put("V", new BigDecimal("275.20"));
        MOCK_PRICES.put("WMT", new BigDecimal("165.80"));
    }

    public PriceResponse getStockPrice(String ticker) {
        String upperTicker = ticker.toUpperCase();
        log.info("Fetching price for ticker: {}", upperTicker);

        try {
            // Try Yahoo Finance API first
            Stock stock = YahooFinance.get(upperTicker);

            if (stock != null && stock.getQuote() != null && stock.getQuote().getPrice() != null) {
                BigDecimal price = stock.getQuote().getPrice();
                String currency = stock.getCurrency() != null ? stock.getCurrency() : "USD";

                log.info("Retrieved live price for {}: {} {}", upperTicker, price, currency);

                return PriceResponse.builder()
                        .ticker(upperTicker)
                        .price(price)
                        .currency(currency)
                        .timestamp(LocalDateTime.now())
                        .build();
            } else {
                log.warn("No price data available from Yahoo Finance for {}. Using mock data.", upperTicker);
                return getMockPrice(upperTicker);
            }
        } catch (Exception e) {
            log.warn("Error fetching price from Yahoo Finance for {}: {}. Using mock data.", upperTicker,
                    e.getMessage());
            return getMockPrice(upperTicker);
        }
    }

    public BigDecimal getPrice(String ticker) {
        PriceResponse response = getStockPrice(ticker);
        return response.getPrice();
    }

    private PriceResponse getMockPrice(String ticker) {
        BigDecimal mockPrice = MOCK_PRICES.getOrDefault(ticker, generateRandomPrice());

        log.info("Using mock price for {}: {}", ticker, mockPrice);

        return PriceResponse.builder()
                .ticker(ticker)
                .price(mockPrice)
                .currency("USD")
                .timestamp(LocalDateTime.now())
                .build();
    }

    private BigDecimal generateRandomPrice() {
        // Generate a random price between 50 and 500 for unknown tickers
        double price = 50 + (Math.random() * 450);
        return BigDecimal.valueOf(price).setScale(2, java.math.RoundingMode.HALF_UP);
    }
}
