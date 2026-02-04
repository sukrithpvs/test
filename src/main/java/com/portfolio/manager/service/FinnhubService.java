package com.portfolio.manager.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.manager.dto.response.StockDetailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.HttpURLConnection;
import java.net.URI;
import java.time.LocalDateTime;

/**
 * Finnhub API service as fallback for Yahoo Finance
 */
@Service
@Slf4j
public class FinnhubService {

    @Value("${finnhub.api-key:d612sv1r01qjrrugoe70d612sv1r01qjrrugoe7g}")
    private String apiKey;

    private static final String BASE_URL = "https://finnhub.io/api/v1";
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Get stock quote from Finnhub API
     */
    public StockDetailResponse getStockQuote(String ticker) {
        try {
            String urlStr = BASE_URL + "/quote?symbol=" + ticker.toUpperCase() + "&token=" + apiKey;
            log.info("Fetching from Finnhub: {}", ticker);

            HttpURLConnection conn = (HttpURLConnection) URI.create(urlStr).toURL().openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);

            int responseCode = conn.getResponseCode();
            if (responseCode != 200) {
                log.warn("Finnhub returned status {}", responseCode);
                return null;
            }

            try (InputStream is = conn.getInputStream()) {
                JsonNode json = objectMapper.readTree(is);

                // Finnhub returns: c (current), d (change), dp (percent change), h (high), l
                // (low), o (open), pc (prev close)
                BigDecimal currentPrice = getBigDecimal(json, "c");
                BigDecimal change = getBigDecimal(json, "d");
                BigDecimal changePercent = getBigDecimal(json, "dp");
                BigDecimal high = getBigDecimal(json, "h");
                BigDecimal low = getBigDecimal(json, "l");
                BigDecimal open = getBigDecimal(json, "o");
                BigDecimal prevClose = getBigDecimal(json, "pc");

                if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) == 0) {
                    log.warn("Finnhub returned no price data for {}", ticker);
                    return null;
                }

                // Get company name
                String name = getCompanyName(ticker);

                return StockDetailResponse.builder()
                        .ticker(ticker.toUpperCase())
                        .name(name)
                        .exchange("US")
                        .currency("USD")
                        .price(currentPrice)
                        .open(open)
                        .high(high)
                        .low(low)
                        .previousClose(prevClose)
                        .change(change)
                        .changePercent(changePercent)
                        .volume(0L)
                        .timestamp(LocalDateTime.now().toString())
                        .build();
            }
        } catch (Exception e) {
            log.error("Finnhub API error for {}: {}", ticker, e.getMessage());
            return null;
        }
    }

    /**
     * Get company profile from Finnhub
     */
    public String getCompanyName(String ticker) {
        try {
            String urlStr = BASE_URL + "/stock/profile2?symbol=" + ticker.toUpperCase() + "&token=" + apiKey;
            HttpURLConnection conn = (HttpURLConnection) URI.create(urlStr).toURL().openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);

            if (conn.getResponseCode() == 200) {
                try (InputStream is = conn.getInputStream()) {
                    JsonNode json = objectMapper.readTree(is);
                    return json.has("name") ? json.get("name").asText() : ticker;
                }
            }
        } catch (Exception e) {
            log.debug("Could not fetch company name for {}", ticker);
        }
        return ticker;
    }

    private BigDecimal getBigDecimal(JsonNode json, String field) {
        if (json.has(field) && !json.get(field).isNull()) {
            return BigDecimal.valueOf(json.get(field).asDouble()).setScale(2, RoundingMode.HALF_UP);
        }
        return null;
    }
}
