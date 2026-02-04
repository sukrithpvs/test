package com.portfolio.manager.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.manager.dto.response.MarketMoverResponse;
import com.portfolio.manager.dto.response.StockDetailResponse;
import com.portfolio.manager.dto.response.StockHistoryResponse;
import com.portfolio.manager.dto.response.StockHistoryResponse.HistoricalDataPoint;
import com.portfolio.manager.entity.MarketCache;
import com.portfolio.manager.repository.MarketCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import yahoofinance.Stock;
import yahoofinance.YahooFinance;
import yahoofinance.histquotes.HistoricalQuote;
import yahoofinance.histquotes.Interval;
import yahoofinance.quotes.stock.StockQuote;
import yahoofinance.quotes.stock.StockStats;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataService {

    private final MarketCacheRepository cacheRepository;
    private final FinnhubService finnhubService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final long CACHE_TTL_MINUTES = 300; // 5 hours
    private static final String CACHE_KEY_GAINERS = "top_gainers";
    private static final String CACHE_KEY_LOSERS = "top_losers";
    private static final String CACHE_KEY_INDICES = "market_indices";
    private static final String CACHE_KEY_TRENDING = "trending_stocks";

    private static final List<String> US_STOCKS = Arrays.asList(
            "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM", "V", "WMT",
            "NFLX", "DIS", "PYPL", "INTC", "AMD", "CRM", "UBER", "SHOP", "SQ", "COIN");

    private static final Map<String, MockStockData> MOCK_STOCKS = new HashMap<>();

    static {
        MOCK_STOCKS.put("AAPL",
                new MockStockData("Apple Inc.", 182.50, 2.85, 2.85e12, 28.5, "Technology", "Consumer Electronics"));
        MOCK_STOCKS.put("MSFT",
                new MockStockData("Microsoft Corp.", 378.90, 1.8, 2.81e12, 35.2, "Technology", "Software"));
        MOCK_STOCKS.put("GOOGL",
                new MockStockData("Alphabet Inc.", 141.80, 2.1, 1.78e12, 25.8, "Technology", "Internet"));
        MOCK_STOCKS.put("AMZN",
                new MockStockData("Amazon.com Inc.", 178.25, 3.2, 1.86e12, 62.3, "Consumer Cyclical", "E-Commerce"));
        MOCK_STOCKS.put("TSLA",
                new MockStockData("Tesla Inc.", 248.75, -1.4, 790e9, 72.5, "Consumer Cyclical", "Auto Manufacturers"));
        MOCK_STOCKS.put("META",
                new MockStockData("Meta Platforms", 485.60, 2.8, 1.24e12, 32.1, "Technology", "Social Media"));
        MOCK_STOCKS.put("NVDA",
                new MockStockData("NVIDIA Corp.", 682.35, 4.2, 1.68e12, 65.4, "Technology", "Semiconductors"));
        MOCK_STOCKS.put("JPM", new MockStockData("JPMorgan Chase", 195.40, 0.5, 562e9, 11.2, "Financial", "Banks"));
        MOCK_STOCKS.put("V", new MockStockData("Visa Inc.", 275.20, 1.1, 565e9, 29.8, "Financial", "Credit Services"));
        MOCK_STOCKS.put("WMT",
                new MockStockData("Walmart Inc.", 165.80, 0.8, 446e9, 28.4, "Consumer Defensive", "Retail"));
        MOCK_STOCKS.put("NFLX", new MockStockData("Netflix Inc.", 545.20, 1.5, 236e9, 42.3, "Technology", "Streaming"));
        MOCK_STOCKS.put("DIS",
                new MockStockData("Walt Disney Co.", 112.45, -0.2, 205e9, 68.5, "Consumer Cyclical", "Entertainment"));
        MOCK_STOCKS.put("PYPL",
                new MockStockData("PayPal Holdings", 62.50, -2.1, 68e9, 15.2, "Financial", "Payment Services"));
        MOCK_STOCKS.put("INTC",
                new MockStockData("Intel Corp.", 42.80, 0.9, 180e9, 22.1, "Technology", "Semiconductors"));
        MOCK_STOCKS.put("AMD", new MockStockData("AMD Inc.", 145.25, 3.5, 235e9, 45.8, "Technology", "Semiconductors"));
        MOCK_STOCKS.put("CRM",
                new MockStockData("Salesforce Inc.", 265.40, 1.2, 258e9, 38.5, "Technology", "Software"));
        MOCK_STOCKS.put("UBER",
                new MockStockData("Uber Technologies", 72.35, 2.4, 150e9, 85.2, "Technology", "Ride-Sharing"));
        MOCK_STOCKS.put("SHOP",
                new MockStockData("Shopify Inc.", 78.90, -0.8, 100e9, 52.3, "Technology", "E-Commerce"));
        MOCK_STOCKS.put("SQ", new MockStockData("Block Inc.", 68.45, 1.8, 42e9, 28.9, "Financial", "Fintech"));
        MOCK_STOCKS.put("COIN",
                new MockStockData("Coinbase Global", 185.60, 5.2, 45e9, 55.2, "Financial", "Cryptocurrency"));
    }

    // =============== PUBLIC METHODS ===============

    @Transactional(readOnly = true)
    public List<MarketMoverResponse> getTopGainers() {
        return getCachedOrFetch(CACHE_KEY_GAINERS, this::fetchTopGainers);
    }

    @Transactional(readOnly = true)
    public List<MarketMoverResponse> getTopLosers() {
        return getCachedOrFetch(CACHE_KEY_LOSERS, this::fetchTopLosers);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMarketIndices() {
        return getCachedOrFetch(CACHE_KEY_INDICES, this::fetchMarketIndices);
    }

    @Transactional(readOnly = true)
    public List<MarketMoverResponse> getTrendingStocks() {
        return getCachedOrFetch(CACHE_KEY_TRENDING, this::fetchTrendingStocks);
    }

    /**
     * Search stocks by ticker or name - tries to fetch ANY ticker from
     * Yahoo/Finnhub
     */
    public List<StockDetailResponse> searchStocks(String query) {
        String upperQuery = query.toUpperCase().trim();
        List<StockDetailResponse> results = new ArrayList<>();

        // Always try the query as a direct ticker first (for ANY stock like VIX, SPY,
        // etc.)
        if (upperQuery.length() >= 1 && upperQuery.length() <= 6) {
            try {
                StockDetailResponse stock = getStockDetail(upperQuery);
                if (stock != null && stock.getPrice() != null) {
                    results.add(stock);
                }
            } catch (Exception e) {
                log.debug("Could not fetch stock for query: {}", upperQuery);
            }
        }

        // Also add matches from known stocks list
        for (String ticker : US_STOCKS) {
            if (ticker.contains(upperQuery) && results.stream().noneMatch(r -> r.getTicker().equals(ticker))) {
                try {
                    results.add(getStockDetail(ticker));
                    if (results.size() >= 10)
                        break;
                } catch (Exception e) {
                    log.debug("Failed to get details for: {}", ticker);
                }
            }
        }

        return results;
    }

    // =============== SCHEDULED CACHE REFRESH ===============

    @Scheduled(initialDelay = 18000000, fixedRate = 18000000) // First run after 5 hours, then every 5 hours
    @Transactional
    public void refreshAllCaches() {
        log.info("Starting scheduled cache refresh at {}", LocalDateTime.now());
        try {
            updateCache(CACHE_KEY_GAINERS, fetchTopGainers());
            updateCache(CACHE_KEY_LOSERS, fetchTopLosers());
            updateCache(CACHE_KEY_INDICES, fetchMarketIndices());
            updateCache(CACHE_KEY_TRENDING, fetchTrendingStocks());
            log.info("Cache refresh completed successfully");
        } catch (Exception e) {
            log.error("Cache refresh failed: {}", e.getMessage());
        }
    }

    // =============== CACHE HELPER METHODS ===============

    @SuppressWarnings("unchecked")
    private <T> T getCachedOrFetch(String key, java.util.function.Supplier<T> fetcher) {
        try {
            Optional<MarketCache> cached = cacheRepository.findByCacheKey(key);
            if (cached.isPresent() && !cached.get().isExpired(CACHE_TTL_MINUTES)) {
                log.info("✅ CACHE HIT for key: {} (cached at {})", key, cached.get().getUpdatedAt());
                return (T) objectMapper.readValue(cached.get().getCacheValue(), new TypeReference<Object>() {
                });
            } else {
                log.info("⚠️ CACHE MISS for key: {} - fetching fresh data", key);
            }
        } catch (Exception e) {
            log.warn("Cache read error for {}: {}", key, e.getMessage());
        }

        // Fetch fresh data
        T data = fetcher.get();
        updateCache(key, data);
        return data;
    }

    @Transactional
    public void updateCache(String key, Object data) {
        try {
            String json = objectMapper.writeValueAsString(data);
            MarketCache cache = cacheRepository.findByCacheKey(key)
                    .orElse(MarketCache.builder().cacheKey(key).build());
            cache.setCacheValue(json);
            cache.setUpdatedAt(LocalDateTime.now());
            cacheRepository.save(cache);
            log.debug("Updated cache for key: {}", key);
        } catch (Exception e) {
            log.error("Cache update error for {}: {}", key, e.getMessage());
        }
    }

    // =============== DATA FETCHING METHODS ===============

    private List<MarketMoverResponse> fetchTopGainers() {
        log.info("Fetching fresh top gainers data");
        List<MarketMoverResponse> gainers = new ArrayList<>();

        for (String ticker : US_STOCKS.subList(0, 10)) {
            try {
                StockDetailResponse stock = getStockDetail(ticker);
                if (stock.getChangePercent() != null && stock.getChangePercent().compareTo(BigDecimal.ZERO) > 0) {
                    gainers.add(toMarketMover(stock));
                }
            } catch (Exception e) {
                log.warn("Error fetching {}: {}", ticker, e.getMessage());
            }
        }

        gainers.sort((a, b) -> b.getChangePercent().compareTo(a.getChangePercent()));
        return gainers.stream().limit(5).toList();
    }

    private List<MarketMoverResponse> fetchTopLosers() {
        log.info("Fetching fresh top losers data");
        List<MarketMoverResponse> losers = new ArrayList<>();

        for (String ticker : US_STOCKS.subList(0, 10)) {
            try {
                StockDetailResponse stock = getStockDetail(ticker);
                if (stock.getChangePercent() != null && stock.getChangePercent().compareTo(BigDecimal.ZERO) < 0) {
                    losers.add(toMarketMover(stock));
                }
            } catch (Exception e) {
                log.warn("Error fetching {}: {}", ticker, e.getMessage());
            }
        }

        losers.sort(Comparator.comparing(MarketMoverResponse::getChangePercent));
        return losers.stream().limit(5).toList();
    }

    private List<MarketMoverResponse> fetchTrendingStocks() {
        log.info("Fetching trending stocks");
        List<MarketMoverResponse> trending = new ArrayList<>();

        for (String ticker : US_STOCKS.subList(0, 8)) {
            try {
                StockDetailResponse stock = getStockDetail(ticker);
                trending.add(toMarketMover(stock));
            } catch (Exception e) {
                log.warn("Error fetching trending {}: {}", ticker, e.getMessage());
            }
        }

        return trending;
    }

    private List<Map<String, Object>> fetchMarketIndices() {
        log.info("Fetching market indices");
        List<Map<String, Object>> indices = new ArrayList<>();
        Random rand = new Random();

        // Simulate realistic index data
        indices.add(createIndex("S&P 500", 5021.84, rand.nextDouble() * 2 - 0.5));
        indices.add(createIndex("NASDAQ", 15990.66, rand.nextDouble() * 3 - 0.8));
        indices.add(createIndex("DOW", 38519.84, rand.nextDouble() * 1.5 - 0.3));
        indices.add(createIndex("FTSE 100", 7952.62, rand.nextDouble() * 1.2 - 0.6));
        indices.add(createIndex("DAX", 17049.45, rand.nextDouble() * 1.8 - 0.4));
        indices.add(createIndex("NIKKEI", 36286.71, rand.nextDouble() * 2.5 - 1.0));

        return indices;
    }

    private Map<String, Object> createIndex(String name, double baseValue, double changePercent) {
        double change = baseValue * changePercent / 100;
        Map<String, Object> index = new HashMap<>();
        index.put("name", name);
        index.put("value", Math.round(baseValue * 100) / 100.0);
        index.put("change", Math.round(change * 100) / 100.0);
        index.put("changePercent", Math.round(changePercent * 100) / 100.0);
        return index;
    }

    // =============== STOCK DETAIL METHODS ===============

    /**
     * Get stock with 5-year history - uses cache for explore page stocks
     * Cache key: stock_history_{ticker}
     */
    public StockHistoryResponse getStockWithHistory(String ticker) {
        String upperTicker = ticker.toUpperCase();
        String cacheKey = "stock_history_" + upperTicker;

        // Check if this is an explore page stock (known stock)
        boolean isExploreStock = US_STOCKS.contains(upperTicker);

        // For explore stocks, check cache first
        if (isExploreStock) {
            try {
                Optional<MarketCache> cached = cacheRepository.findByCacheKey(cacheKey);
                if (cached.isPresent() && !cached.get().isExpired(CACHE_TTL_MINUTES)) {
                    log.debug("Returning cached 5-year history for: {}", upperTicker);
                    return objectMapper.readValue(cached.get().getCacheValue(), StockHistoryResponse.class);
                }
            } catch (Exception e) {
                log.warn("Cache read error for stock history {}: {}", upperTicker, e.getMessage());
            }
        }

        // Fetch fresh data
        log.info("Fetching stock data with 5-year history for: {}", upperTicker);
        StockHistoryResponse data = fetchStockHistoryFromApi(upperTicker);

        // Cache if it's an explore stock
        if (isExploreStock) {
            try {
                String json = objectMapper.writeValueAsString(data);
                MarketCache cache = cacheRepository.findByCacheKey(cacheKey)
                        .orElse(MarketCache.builder().cacheKey(cacheKey).build());
                cache.setCacheValue(json);
                cache.setUpdatedAt(LocalDateTime.now());
                cacheRepository.save(cache);
                log.info("Cached 5-year history for: {}", upperTicker);
            } catch (Exception e) {
                log.error("Failed to cache stock history for {}: {}", upperTicker, e.getMessage());
            }
        }

        return data;
    }

    /**
     * Fetch fresh stock history from API (used for search - not cached)
     */
    public StockHistoryResponse getStockWithHistoryFresh(String ticker) {
        String upperTicker = ticker.toUpperCase();
        log.info("Fetching FRESH stock data with 5-year history for: {}", upperTicker);
        return fetchStockHistoryFromApi(upperTicker);
    }

    /**
     * Fetch stock history from Yahoo Finance API - 5 years of data
     */
    private StockHistoryResponse fetchStockHistoryFromApi(String ticker) {
        try {
            Calendar from = Calendar.getInstance();
            from.add(Calendar.YEAR, -5); // Changed from 6 months to 5 YEARS
            Calendar to = Calendar.getInstance();

            Stock stock = YahooFinance.get(ticker, from, to, Interval.DAILY);

            if (stock != null && stock.getQuote() != null) {
                return buildFromYahooWithHistory(stock);
            }
        } catch (Exception e) {
            log.warn("Yahoo Finance unavailable for {}, using mock: {}", ticker, e.getMessage());
        }

        return buildMockResponseWithHistory(ticker);
    }

    public StockDetailResponse getStockDetail(String ticker) {
        String upperTicker = ticker.toUpperCase();

        // Try Yahoo Finance first
        try {
            Stock stock = YahooFinance.get(upperTicker);
            if (stock != null && stock.getQuote() != null) {
                return buildDetailFromYahoo(stock);
            }
        } catch (Exception e) {
            log.debug("Yahoo Finance unavailable for {}: {}", upperTicker, e.getMessage());
        }

        // Fallback to Finnhub
        try {
            StockDetailResponse finnhubData = finnhubService.getStockQuote(upperTicker);
            if (finnhubData != null && finnhubData.getPrice() != null) {
                log.info("Using Finnhub data for {}", upperTicker);
                return finnhubData;
            }
        } catch (Exception e) {
            log.debug("Finnhub also unavailable for {}: {}", upperTicker, e.getMessage());
        }

        // Last resort: mock data
        return buildMockDetail(upperTicker);
    }

    // =============== RESPONSE BUILDERS ===============

    private StockHistoryResponse buildFromYahooWithHistory(Stock stock) {
        StockQuote quote = stock.getQuote();
        StockStats stats = stock.getStats();

        List<HistoricalDataPoint> historicalData = new ArrayList<>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

        try {
            List<HistoricalQuote> history = stock.getHistory();
            if (history != null) {
                for (HistoricalQuote hq : history) {
                    if (hq.getClose() != null) {
                        historicalData.add(HistoricalDataPoint.builder()
                                .date(sdf.format(hq.getDate().getTime()))
                                .open(hq.getOpen())
                                .high(hq.getHigh())
                                .low(hq.getLow())
                                .close(hq.getClose())
                                .volume(hq.getVolume())
                                .build());
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to get history: {}", e.getMessage());
        }

        historicalData.sort(Comparator.comparing(HistoricalDataPoint::getDate));

        return StockHistoryResponse.builder()
                .ticker(stock.getSymbol())
                .name(stock.getName())
                .exchange(stock.getStockExchange())
                .currency(stock.getCurrency())
                .price(quote.getPrice())
                .change(quote.getChange())
                .changePercent(quote.getChangeInPercent())
                .open(quote.getOpen())
                .high(quote.getDayHigh())
                .low(quote.getDayLow())
                .previousClose(quote.getPreviousClose())
                .volume(quote.getVolume())
                .avgVolume(quote.getAvgVolume())
                .marketCap(stats != null ? stats.getMarketCap() : null)
                .peRatio(stats != null ? stats.getPe() : null)
                .eps(stats != null ? stats.getEps() : null)
                .fiftyTwoWeekHigh(quote.getYearHigh())
                .fiftyTwoWeekLow(quote.getYearLow())
                .historicalData(historicalData)
                .build();
    }

    private StockHistoryResponse buildMockResponseWithHistory(String ticker) {
        MockStockData mock = MOCK_STOCKS.getOrDefault(ticker,
                new MockStockData(ticker, 100 + Math.random() * 200, Math.random() * 6 - 3, 50e9, 25.0, "Technology",
                        "Software"));

        double basePrice = mock.price;
        double changePercent = mock.changePercent;
        double change = basePrice * changePercent / 100;

        List<HistoricalDataPoint> historicalData = generateMockHistory(basePrice, 1825); // 5 years of data

        return StockHistoryResponse.builder()
                .ticker(ticker)
                .name(mock.name)
                .exchange("NASDAQ")
                .currency("USD")
                .price(BigDecimal.valueOf(basePrice).setScale(2, RoundingMode.HALF_UP))
                .change(BigDecimal.valueOf(change).setScale(2, RoundingMode.HALF_UP))
                .changePercent(BigDecimal.valueOf(changePercent).setScale(2, RoundingMode.HALF_UP))
                .open(BigDecimal.valueOf(basePrice * 0.995).setScale(2, RoundingMode.HALF_UP))
                .high(BigDecimal.valueOf(basePrice * 1.02).setScale(2, RoundingMode.HALF_UP))
                .low(BigDecimal.valueOf(basePrice * 0.98).setScale(2, RoundingMode.HALF_UP))
                .previousClose(BigDecimal.valueOf(basePrice - change).setScale(2, RoundingMode.HALF_UP))
                .volume((long) (Math.random() * 50000000 + 10000000))
                .avgVolume((long) (Math.random() * 30000000 + 15000000))
                .marketCap(BigDecimal.valueOf(mock.marketCap))
                .peRatio(BigDecimal.valueOf(mock.peRatio).setScale(2, RoundingMode.HALF_UP))
                .eps(BigDecimal.valueOf(basePrice / mock.peRatio).setScale(2, RoundingMode.HALF_UP))
                .fiftyTwoWeekHigh(BigDecimal.valueOf(basePrice * 1.35).setScale(2, RoundingMode.HALF_UP))
                .fiftyTwoWeekLow(BigDecimal.valueOf(basePrice * 0.65).setScale(2, RoundingMode.HALF_UP))
                .sector(mock.sector)
                .industry(mock.industry)
                .historicalData(historicalData)
                .build();
    }

    private List<HistoricalDataPoint> generateMockHistory(double currentPrice, int days) {
        List<HistoricalDataPoint> history = new ArrayList<>();
        Random rand = new Random(42);
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, -days);

        double price = currentPrice * (0.7 + rand.nextDouble() * 0.2);
        double trend = (currentPrice - price) / days;
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

        for (int i = 0; i < days; i++) {
            int dayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
            if (dayOfWeek == Calendar.SATURDAY || dayOfWeek == Calendar.SUNDAY) {
                cal.add(Calendar.DAY_OF_YEAR, 1);
                continue;
            }

            double dailyChange = (rand.nextDouble() - 0.45) * 0.03 * price;
            price = Math.max(price + dailyChange + trend, currentPrice * 0.5);

            double dayHigh = price * (1 + rand.nextDouble() * 0.02);
            double dayLow = price * (1 - rand.nextDouble() * 0.02);
            double dayOpen = (dayHigh + dayLow) / 2 + (rand.nextDouble() - 0.5) * (dayHigh - dayLow);

            history.add(HistoricalDataPoint.builder()
                    .date(sdf.format(cal.getTime()))
                    .open(BigDecimal.valueOf(dayOpen).setScale(2, RoundingMode.HALF_UP))
                    .high(BigDecimal.valueOf(dayHigh).setScale(2, RoundingMode.HALF_UP))
                    .low(BigDecimal.valueOf(dayLow).setScale(2, RoundingMode.HALF_UP))
                    .close(BigDecimal.valueOf(price).setScale(2, RoundingMode.HALF_UP))
                    .volume((long) (rand.nextDouble() * 50000000 + 5000000))
                    .build());

            cal.add(Calendar.DAY_OF_YEAR, 1);
        }
        return history;
    }

    private StockDetailResponse buildDetailFromYahoo(Stock stock) {
        StockQuote quote = stock.getQuote();
        StockStats stats = stock.getStats();

        return StockDetailResponse.builder()
                .ticker(stock.getSymbol())
                .name(stock.getName())
                .exchange(stock.getStockExchange())
                .currency(stock.getCurrency())
                .price(quote.getPrice())
                .open(quote.getOpen())
                .high(quote.getDayHigh())
                .low(quote.getDayLow())
                .previousClose(quote.getPreviousClose())
                .volume(quote.getVolume())
                .avgVolume(quote.getAvgVolume())
                .change(quote.getChange())
                .changePercent(quote.getChangeInPercent())
                .marketCap(stats != null ? stats.getMarketCap() : null)
                .peRatio(stats != null ? stats.getPe() : null)
                .eps(stats != null ? stats.getEps() : null)
                .fiftyTwoWeekHigh(quote.getYearHigh())
                .fiftyTwoWeekLow(quote.getYearLow())
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    private StockDetailResponse buildMockDetail(String ticker) {
        MockStockData mock = MOCK_STOCKS.getOrDefault(ticker,
                new MockStockData(ticker, 100 + Math.random() * 200, Math.random() * 6 - 3, 50e9, 25.0, "Technology",
                        "Software"));

        double price = mock.price * (1 + (Math.random() - 0.5) * 0.02);
        double change = price * mock.changePercent / 100;

        return StockDetailResponse.builder()
                .ticker(ticker)
                .name(mock.name)
                .exchange("NASDAQ")
                .currency("USD")
                .price(BigDecimal.valueOf(price).setScale(2, RoundingMode.HALF_UP))
                .open(BigDecimal.valueOf(price * 0.99).setScale(2, RoundingMode.HALF_UP))
                .high(BigDecimal.valueOf(price * 1.02).setScale(2, RoundingMode.HALF_UP))
                .low(BigDecimal.valueOf(price * 0.98).setScale(2, RoundingMode.HALF_UP))
                .previousClose(BigDecimal.valueOf(price - change).setScale(2, RoundingMode.HALF_UP))
                .volume((long) (Math.random() * 50000000))
                .avgVolume((long) (Math.random() * 30000000))
                .change(BigDecimal.valueOf(change).setScale(2, RoundingMode.HALF_UP))
                .changePercent(BigDecimal.valueOf(mock.changePercent).setScale(2, RoundingMode.HALF_UP))
                .marketCap(BigDecimal.valueOf(mock.marketCap))
                .peRatio(BigDecimal.valueOf(mock.peRatio).setScale(2, RoundingMode.HALF_UP))
                .eps(BigDecimal.valueOf(price / mock.peRatio).setScale(2, RoundingMode.HALF_UP))
                .fiftyTwoWeekHigh(BigDecimal.valueOf(price * 1.3).setScale(2, RoundingMode.HALF_UP))
                .fiftyTwoWeekLow(BigDecimal.valueOf(price * 0.7).setScale(2, RoundingMode.HALF_UP))
                .sector(mock.sector)
                .industry(mock.industry)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }

    private MarketMoverResponse toMarketMover(StockDetailResponse stock) {
        return MarketMoverResponse.builder()
                .ticker(stock.getTicker())
                .name(stock.getName())
                .price(stock.getPrice())
                .change(stock.getChange())
                .changePercent(stock.getChangePercent())
                .volume(stock.getVolume())
                .marketCap(stock.getMarketCap())
                .build();
    }

    private static class MockStockData {
        String name;
        double price;
        double changePercent;
        double marketCap;
        double peRatio;
        String sector;
        String industry;

        MockStockData(String name, double price, double changePercent, double marketCap, double peRatio, String sector,
                String industry) {
            this.name = name;
            this.price = price;
            this.changePercent = changePercent;
            this.marketCap = marketCap;
            this.peRatio = peRatio;
            this.sector = sector;
            this.industry = industry;
        }
    }
}
