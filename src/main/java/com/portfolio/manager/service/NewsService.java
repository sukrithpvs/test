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
                    newsList = parseRssFeed(content);
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

    private List<Map<String, Object>> parseRssFeed(String xml) {
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
