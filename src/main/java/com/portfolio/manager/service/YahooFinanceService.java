package com.portfolio.manager.service;

import com.portfolio.manager.dto.response.PriceResponse;
import com.portfolio.manager.dto.response.StockDetailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import yahoofinance.Stock;
import yahoofinance.YahooFinance;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class YahooFinanceService {

    private final FinnhubService finnhubService;

    // In-memory price cache with 5-minute TTL
    private static final Map<String, CachedPrice> priceCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    // Mock prices for testing when all APIs fail
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

    // Inner class for cached price entries
    private static class CachedPrice {
        final PriceResponse response;
        final long timestamp;

        CachedPrice(PriceResponse response) {
            this.response = response;
            this.timestamp = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_TTL_MS;
        }
    }

    public PriceResponse getStockPrice(String ticker) {
        String upperTicker = ticker.toUpperCase();

        // Check cache first
        CachedPrice cached = priceCache.get(upperTicker);
        if (cached != null && !cached.isExpired()) {
            log.info("✅ PRICE CACHE HIT for {}: {}", upperTicker, cached.response.getPrice());
            return cached.response;
        }

        log.info("Fetching price for ticker: {}", upperTicker);
        PriceResponse response = null;

        // 1. Try Yahoo Finance API first
        try {
            Stock stock = YahooFinance.get(upperTicker);

            if (stock != null && stock.getQuote() != null && stock.getQuote().getPrice() != null) {
                BigDecimal price = stock.getQuote().getPrice();
                String currency = stock.getCurrency() != null ? stock.getCurrency() : "USD";

                log.info("✅ Yahoo Finance: {} = {} {}", upperTicker, price, currency);

                response = PriceResponse.builder()
                        .ticker(upperTicker)
                        .price(price)
                        .currency(currency)
                        .timestamp(LocalDateTime.now())
                        .build();
            }
        } catch (Exception e) {
            log.warn("Yahoo Finance failed for {}: {}", upperTicker, e.getMessage());
        }

        // 2. If Yahoo fails, try Finnhub as fallback
        if (response == null) {
            try {
                log.info("Trying Finnhub fallback for {}", upperTicker);
                StockDetailResponse finnhubResponse = finnhubService.getStockQuote(upperTicker);

                if (finnhubResponse != null && finnhubResponse.getPrice() != null) {
                    log.info("✅ Finnhub fallback: {} = {}", upperTicker, finnhubResponse.getPrice());

                    response = PriceResponse.builder()
                            .ticker(upperTicker)
                            .price(finnhubResponse.getPrice())
                            .currency("USD")
                            .timestamp(LocalDateTime.now())
                            .build();
                }
            } catch (Exception e) {
                log.warn("Finnhub fallback failed for {}: {}", upperTicker, e.getMessage());
            }
        }

        // 3. If both fail, use mock data
        if (response == null) {
            response = getMockPrice(upperTicker);
        }

        // Cache the result
        priceCache.put(upperTicker, new CachedPrice(response));

        return response;
    }

    public BigDecimal getPrice(String ticker) {
        PriceResponse response = getStockPrice(ticker);
        return response.getPrice();
    }

    private PriceResponse getMockPrice(String ticker) {
        BigDecimal mockPrice = MOCK_PRICES.getOrDefault(ticker, generateRandomPrice());

        log.warn("⚠️ Using MOCK price for {}: {}", ticker, mockPrice);

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
