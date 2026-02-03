package com.portfolio.manager.service;

import com.portfolio.manager.dto.response.MarketMoverResponse;
import com.portfolio.manager.dto.response.StockDetailResponse;
import com.portfolio.manager.dto.response.StockHistoryResponse;
import com.portfolio.manager.dto.response.StockHistoryResponse.HistoricalDataPoint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
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
@Slf4j
public class MarketDataService {

    private static final List<String> US_STOCKS = Arrays.asList(
            "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM", "V", "WMT");

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
    }

    public StockHistoryResponse getStockWithHistory(String ticker) {
        String upperTicker = ticker.toUpperCase();
        log.info("Fetching stock data with 6-month history for: {}", upperTicker);

        try {
            Calendar from = Calendar.getInstance();
            from.add(Calendar.MONTH, -6);
            Calendar to = Calendar.getInstance();

            Stock stock = YahooFinance.get(upperTicker, from, to, Interval.DAILY);

            if (stock != null && stock.getQuote() != null) {
                return buildFromYahooWithHistory(stock);
            }
        } catch (Exception e) {
            log.warn("Yahoo Finance unavailable for {}, using mock: {}", upperTicker, e.getMessage());
        }

        return buildMockResponseWithHistory(upperTicker);
    }

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

        List<HistoricalDataPoint> historicalData = generateMockHistory(basePrice, 180);

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

    public StockDetailResponse getStockDetail(String ticker) {
        String upperTicker = ticker.toUpperCase();
        log.info("Fetching stock detail for: {}", upperTicker);

        try {
            Stock stock = YahooFinance.get(upperTicker);
            if (stock != null && stock.getQuote() != null) {
                return buildDetailFromYahoo(stock);
            }
        } catch (Exception e) {
            log.warn("Yahoo Finance unavailable for {}: {}", upperTicker, e.getMessage());
        }

        return buildMockDetail(upperTicker);
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

    public List<MarketMoverResponse> getTopGainers() {
        log.info("Fetching top gainers");
        List<MarketMoverResponse> gainers = new ArrayList<>();

        for (String ticker : US_STOCKS) {
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

    public List<MarketMoverResponse> getTopLosers() {
        log.info("Fetching top losers");
        List<MarketMoverResponse> losers = new ArrayList<>();

        for (String ticker : US_STOCKS) {
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
