package com.portfolio.manager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.manager.entity.MarketCache;
import com.portfolio.manager.repository.MarketCacheRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Service to fetch market news from Yahoo Finance
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NewsService {

    private final MarketCacheRepository cacheRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String CACHE_KEY_NEWS = "market_news";
    private static final long CACHE_TTL_MINUTES = 300; // 5 hours

    /**
     * Get cached news or fetch fresh if expired/forced
     */
    @Transactional
    public List<Map<String, Object>> getNews(boolean forceRefresh) {
        if (!forceRefresh) {
            Optional<MarketCache> cached = cacheRepository.findByCacheKey(CACHE_KEY_NEWS);
            if (cached.isPresent() && !cached.get().isExpired(CACHE_TTL_MINUTES)) {
                try {
                    log.debug("Returning cached news");
                    return objectMapper.readValue(cached.get().getCacheValue(),
                            objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));
                } catch (Exception e) {
                    log.warn("Failed to parse cached news: {}", e.getMessage());
                }
            }
        }

        // Fetch fresh news
        List<Map<String, Object>> news = fetchNewsFromYahoo();

        // Cache the result
        try {
            String json = objectMapper.writeValueAsString(news);
            MarketCache cache = cacheRepository.findByCacheKey(CACHE_KEY_NEWS)
                    .orElse(MarketCache.builder().cacheKey(CACHE_KEY_NEWS).build());
            cache.setCacheValue(json);
            cache.setUpdatedAt(LocalDateTime.now());
            cacheRepository.save(cache);
            log.info("Cached {} news articles", news.size());
        } catch (Exception e) {
            log.error("Failed to cache news: {}", e.getMessage());
        }

        return news;
    }

    /**
     * Get news for a specific stock ticker
     * Tries Yahoo Finance RSS first, then Finnhub, then generates mock news
     */
    @Transactional
    public List<Map<String, Object>> getStockNews(String ticker) {
        String upperTicker = ticker.toUpperCase();
        String cacheKey = "stock_news_" + upperTicker;

        // Check cache first (shorter TTL for stock news - 1 hour)
        Optional<MarketCache> cached = cacheRepository.findByCacheKey(cacheKey);
        if (cached.isPresent() && !cached.get().isExpired(60)) { // 1 hour TTL
            try {
                log.info("✅ Returning cached news for {}", upperTicker);
                return objectMapper.readValue(cached.get().getCacheValue(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class));
            } catch (Exception e) {
                log.warn("Failed to parse cached stock news: {}", e.getMessage());
            }
        }

        log.info("Fetching news for stock: {}", upperTicker);

        // Try Yahoo Finance RSS for specific stock
        List<Map<String, Object>> news = fetchStockNewsFromYahoo(upperTicker);

        // If Yahoo fails, try Finnhub
        if (news.isEmpty()) {
            news = fetchStockNewsFromFinnhub(upperTicker);
        }

        // If both fail, generate mock news
        if (news.isEmpty()) {
            news = generateMockStockNews(upperTicker);
        }

        // Cache the result
        try {
            String json = objectMapper.writeValueAsString(news);
            MarketCache cache = cacheRepository.findByCacheKey(cacheKey)
                    .orElse(MarketCache.builder().cacheKey(cacheKey).build());
            cache.setCacheValue(json);
            cache.setUpdatedAt(LocalDateTime.now());
            cacheRepository.save(cache);
        } catch (Exception e) {
            log.error("Failed to cache stock news: {}", e.getMessage());
        }

        return news;
    }

    /**
     * Fetch news for specific stock from Yahoo Finance RSS
     */
    private List<Map<String, Object>> fetchStockNewsFromYahoo(String ticker) {
        List<Map<String, Object>> newsList = new ArrayList<>();

        try {
            String urlStr = "https://feeds.finance.yahoo.com/rss/2.0/headline?s=" + ticker + "&region=US&lang=en-US";
            log.info("Fetching news from Yahoo Finance RSS for {}", ticker);

            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");

            if (conn.getResponseCode() == 200) {
                try (InputStream is = conn.getInputStream()) {
                    String content = new String(is.readAllBytes());
                    newsList = parseRssFeed(content, ticker);
                }
            } else {
                log.warn("Yahoo RSS for {} returned status: {}", ticker, conn.getResponseCode());
            }
        } catch (Exception e) {
            log.error("Failed to fetch Yahoo news for {}: {}", ticker, e.getMessage());
        }

        return newsList;
    }

    /**
     * Fetch news from Finnhub API as fallback
     */
    private List<Map<String, Object>> fetchStockNewsFromFinnhub(String ticker) {
        List<Map<String, Object>> newsList = new ArrayList<>();

        try {
            // Finnhub company news endpoint
            String apiKey = "d612sv1r01qjrrugoe70d612sv1r01qjrrugoe7g";
            String today = java.time.LocalDate.now().toString();
            String weekAgo = java.time.LocalDate.now().minusDays(7).toString();
            String urlStr = "https://finnhub.io/api/v1/company-news?symbol=" + ticker +
                    "&from=" + weekAgo + "&to=" + today + "&token=" + apiKey;

            log.info("Fetching news from Finnhub for {}", ticker);

            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            if (conn.getResponseCode() == 200) {
                try (InputStream is = conn.getInputStream()) {
                    JsonNode jsonArray = objectMapper.readTree(is);

                    int id = 1;
                    for (int i = 0; i < Math.min(jsonArray.size(), 8); i++) {
                        JsonNode item = jsonArray.get(i);

                        Map<String, Object> news = new HashMap<>();
                        news.put("id", id++);
                        news.put("title", item.has("headline") ? item.get("headline").asText() : "News Update");
                        news.put("source", item.has("source") ? item.get("source").asText() : "Finnhub");
                        news.put("time", formatFinnhubTime(item.has("datetime") ? item.get("datetime").asLong() : 0));
                        news.put("category", categorizeNews(item.has("headline") ? item.get("headline").asText() : ""));
                        news.put("link", item.has("url") ? item.get("url").asText() : "");
                        news.put("ticker", ticker);
                        news.put("description",
                                item.has("summary")
                                        ? item.get("summary").asText().substring(0,
                                                Math.min(200, item.get("summary").asText().length())) + "..."
                                        : "");

                        newsList.add(news);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch Finnhub news for {}: {}", ticker, e.getMessage());
        }

        return newsList;
    }

    private String formatFinnhubTime(long timestamp) {
        if (timestamp == 0)
            return "Recently";
        try {
            java.time.Instant instant = java.time.Instant.ofEpochSecond(timestamp);
            java.time.Duration diff = java.time.Duration.between(instant, java.time.Instant.now());

            if (diff.toHours() < 1)
                return diff.toMinutes() + " min ago";
            if (diff.toHours() < 24)
                return diff.toHours() + " hours ago";
            return diff.toDays() + " days ago";
        } catch (Exception e) {
            return "Recently";
        }
    }

    private List<Map<String, Object>> generateMockStockNews(String ticker) {
        List<Map<String, Object>> news = new ArrayList<>();

        String companyName = getCompanyName(ticker);

        news.add(createNews(1, companyName + " Reports Strong Quarterly Results", "Earnings", "2 hours ago", "Reuters",
                ticker));
        news.add(createNews(2, companyName + " Announces New Product Line Expansion", "Business", "4 hours ago",
                "Bloomberg", ticker));
        news.add(createNews(3, "Analysts Upgrade " + ticker + " Stock Rating to Buy", "Analysis", "5 hours ago", "CNBC",
                ticker));
        news.add(createNews(4, companyName + " CEO Discusses Future Growth Strategy", "Interview", "8 hours ago", "WSJ",
                ticker));
        news.add(createNews(5, ticker + " Stock Sees Increased Trading Volume", "Market", "12 hours ago", "MarketWatch",
                ticker));

        return news;
    }

    private String getCompanyName(String ticker) {
        Map<String, String> names = Map.of(
                "AAPL", "Apple",
                "MSFT", "Microsoft",
                "GOOGL", "Alphabet",
                "AMZN", "Amazon",
                "TSLA", "Tesla",
                "META", "Meta",
                "NVDA", "NVIDIA",
                "JPM", "JPMorgan",
                "V", "Visa");
        return names.getOrDefault(ticker, ticker);
    }

    private List<Map<String, Object>> fetchNewsFromYahoo() {
        List<Map<String, Object>> newsList = new ArrayList<>();

        try {
            // Yahoo Finance RSS feed for market news
            String urlStr = "https://feeds.finance.yahoo.com/rss/2.0/headline?s=^GSPC,AAPL,MSFT,GOOGL,AMZN&region=US&lang=en-US";
            log.info("Fetching news from Yahoo Finance RSS");

            URL url = new URL(urlStr);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setRequestProperty("User-Agent", "Mozilla/5.0");

            if (conn.getResponseCode() == 200) {
                try (InputStream is = conn.getInputStream()) {
                    // Parse RSS XML
                    String content = new String(is.readAllBytes());
                    newsList = parseRssFeed(content, null);
                }
            } else {
                log.warn("Yahoo RSS returned status: {}", conn.getResponseCode());
            }
        } catch (Exception e) {
            log.error("Failed to fetch Yahoo news: {}", e.getMessage());
        }

        // If RSS fails, return mock news
        if (newsList.isEmpty()) {
            newsList = generateMockNews();
        }

        return newsList;
    }

    private List<Map<String, Object>> parseRssFeed(String xml, String ticker) {
        List<Map<String, Object>> items = new ArrayList<>();

        try {
            // Simple XML parsing for RSS items
            String[] itemBlocks = xml.split("<item>");
            int id = 1;

            for (int i = 1; i < Math.min(itemBlocks.length, 7); i++) { // Skip first (header), limit to 6
                String block = itemBlocks[i];

                String title = extractTag(block, "title");
                String link = extractTag(block, "link");
                String pubDate = extractTag(block, "pubDate");
                String description = extractTag(block, "description");

                if (title != null && !title.isEmpty()) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", id++);
                    item.put("title", cleanHtml(title));
                    item.put("link", link);
                    item.put("time", formatTime(pubDate));
                    item.put("source", "Yahoo Finance");
                    item.put("category", categorizeNews(title));
                    item.put("description", cleanHtml(description));
                    items.add(item);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse RSS: {}", e.getMessage());
        }

        return items;
    }

    private String extractTag(String xml, String tag) {
        int start = xml.indexOf("<" + tag + ">");
        int end = xml.indexOf("</" + tag + ">");
        if (start >= 0 && end > start) {
            return xml.substring(start + tag.length() + 2, end);
        }
        // Try CDATA format
        start = xml.indexOf("<" + tag + "><![CDATA[");
        end = xml.indexOf("]]></" + tag + ">");
        if (start >= 0 && end > start) {
            return xml.substring(start + tag.length() + 11, end);
        }
        return null;
    }

    private String cleanHtml(String text) {
        if (text == null)
            return "";
        return text.replaceAll("<[^>]*>", "").replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
    }

    private String formatTime(String pubDate) {
        if (pubDate == null)
            return "Just now";
        try {
            // Parse and format relative time
            return pubDate.substring(0, 16); // Return date portion
        } catch (Exception e) {
            return "Recently";
        }
    }

    private String categorizeNews(String title) {
        String lower = title.toLowerCase();
        if (lower.contains("earning") || lower.contains("profit") || lower.contains("revenue"))
            return "Earnings";
        if (lower.contains("deal") || lower.contains("acquire") || lower.contains("merger"))
            return "Deals";
        if (lower.contains("tech") || lower.contains("ai") || lower.contains("software"))
            return "Technology";
        if (lower.contains("bank") || lower.contains("fed") || lower.contains("rate"))
            return "Banking";
        if (lower.contains("partner") || lower.contains("collab"))
            return "Partnership";
        return "Market";
    }

    private List<Map<String, Object>> generateMockNews() {
        List<Map<String, Object>> news = new ArrayList<>();

        news.add(createNews(1, "Tech Giants Lead Market Rally as AI Optimism Grows", "Technology", "2 hours ago",
                "NASDAQ"));
        news.add(createNews(2, "Federal Reserve Signals Potential Rate Adjustments", "Banking", "3 hours ago",
                "Reuters"));
        news.add(createNews(3, "Apple Reports Strong iPhone Sales in Asian Markets", "Earnings", "4 hours ago",
                "Bloomberg", "AAPL"));
        news.add(createNews(4, "Microsoft Azure Revenue Surges 29% Year-over-Year", "Earnings", "5 hours ago", "CNBC",
                "MSFT"));
        news.add(createNews(5, "Tesla Announces New Gigafactory Expansion Plans", "Expansion", "6 hours ago", "Reuters",
                "TSLA"));
        news.add(createNews(6, "Amazon Partners with Major Retailers for Same-Day Delivery", "Partnership",
                "7 hours ago", "WSJ", "AMZN"));

        return news;
    }

    private Map<String, Object> createNews(int id, String title, String category, String time, String source) {
        return createNews(id, title, category, time, source, null);
    }

    private Map<String, Object> createNews(int id, String title, String category, String time, String source,
            String ticker) {
        Map<String, Object> news = new HashMap<>();
        news.put("id", id);
        news.put("title", title);
        news.put("category", category);
        news.put("time", time);
        news.put("source", source);
        if (ticker != null)
            news.put("ticker", ticker);
        return news;
    }
}
