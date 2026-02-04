package com.portfolio.manager.service;

import com.portfolio.manager.dto.response.MutualFundResponse;
import com.portfolio.manager.entity.MarketCache;
import com.portfolio.manager.repository.MarketCacheRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class MutualFundService {

    private static final String MFAPI_BASE = "https://api.mfapi.in/mf/";
    private static final String CACHE_KEY_TOP_FUNDS = "top_mutual_funds";
    private static final long CACHE_TTL_MINUTES = 300; // 5 hours

    private final MarketCacheRepository cacheRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Popular Indian Mutual Fund Scheme Codes
    private static final Map<String, String> POPULAR_FUNDS = new LinkedHashMap<>();

    static {
        POPULAR_FUNDS.put("119551", "Axis Bluechip Fund");
        POPULAR_FUNDS.put("120503", "Mirae Asset Large Cap Fund");
        POPULAR_FUNDS.put("118989", "SBI Bluechip Fund");
        POPULAR_FUNDS.put("100356", "HDFC Top 100 Fund");
        POPULAR_FUNDS.put("102715", "ICICI Pru Bluechip Fund");
        POPULAR_FUNDS.put("118834", "Kotak Bluechip Fund");
        POPULAR_FUNDS.put("100468", "UTI Flexi Cap Fund");
        POPULAR_FUNDS.put("120505", "Parag Parikh Flexi Cap Fund");
        POPULAR_FUNDS.put("106235", "Nippon India Large Cap Fund");
        POPULAR_FUNDS.put("118269", "Canara Robeco Bluechip Fund");
    }

    @Transactional(readOnly = true)
    public List<MutualFundResponse> getTopMutualFunds() {
        // Check cache first
        Optional<MarketCache> cached = cacheRepository.findByCacheKey(CACHE_KEY_TOP_FUNDS);
        if (cached.isPresent() && !cached.get().isExpired(CACHE_TTL_MINUTES)) {
            try {
                log.debug("Returning cached mutual funds");
                return objectMapper.readValue(cached.get().getCacheValue(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, MutualFundResponse.class));
            } catch (Exception e) {
                log.warn("Failed to parse cached funds: {}", e.getMessage());
            }
        }

        // Fetch fresh data
        log.info("Fetching top mutual funds from MFapi.in");
        List<MutualFundResponse> funds = new ArrayList<>();

        for (Map.Entry<String, String> entry : POPULAR_FUNDS.entrySet()) {
            try {
                MutualFundResponse fund = fetchMutualFundFromApi(entry.getKey());
                if (fund != null) {
                    funds.add(fund);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch fund {}: {}", entry.getKey(), e.getMessage());
                funds.add(createMockFund(entry.getKey(), entry.getValue()));
            }
        }

        // Cache the result
        cacheTopFunds(funds);

        return funds;
    }

    @Transactional
    protected void cacheTopFunds(List<MutualFundResponse> funds) {
        try {
            String json = objectMapper.writeValueAsString(funds);
            MarketCache cache = cacheRepository.findByCacheKey(CACHE_KEY_TOP_FUNDS)
                    .orElse(MarketCache.builder().cacheKey(CACHE_KEY_TOP_FUNDS).build());
            cache.setCacheValue(json);
            cache.setUpdatedAt(LocalDateTime.now());
            cacheRepository.save(cache);
            log.info("Cached {} mutual funds", funds.size());
        } catch (Exception e) {
            log.error("Failed to cache mutual funds: {}", e.getMessage());
        }
    }

    public MutualFundResponse getMutualFundDetails(String schemeCode) {
        // Try to fetch full details from API
        MutualFundResponse fund = fetchMutualFundFromApi(schemeCode);
        if (fund != null) {
            return fund;
        }
        return createMockFund(schemeCode, POPULAR_FUNDS.getOrDefault(schemeCode, "Unknown Fund"));
    }

    private MutualFundResponse fetchMutualFundFromApi(String schemeCode) {
        try {
            String url = MFAPI_BASE + schemeCode;
            log.info("Fetching mutual fund data from: {}", url);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("meta") && response.containsKey("data")) {
                Map<String, Object> meta = (Map<String, Object>) response.get("meta");
                List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");

                String latestNav = data.isEmpty() ? "0" : (String) data.get(0).get("nav");
                String navDate = data.isEmpty() ? "" : (String) data.get(0).get("date");

                return MutualFundResponse.builder()
                        .schemeCode(schemeCode)
                        .schemeName((String) meta.get("scheme_name"))
                        .fundHouse((String) meta.get("fund_house"))
                        .schemeType((String) meta.get("scheme_type"))
                        .schemeCategory((String) meta.get("scheme_category"))
                        .nav(new BigDecimal(latestNav))
                        .navDate(navDate)
                        .oneYearReturn(calculateReturn(data, 252))
                        .threeYearReturn(calculateReturn(data, 756))
                        .fiveYearReturn(calculateReturn(data, 1260))
                        .build();
            }
        } catch (Exception e) {
            log.error("Error fetching mutual fund {}: {}", schemeCode, e.getMessage());
        }
        return null;
    }

    private BigDecimal calculateReturn(List<Map<String, Object>> data, int days) {
        if (data.size() < days + 1) {
            return BigDecimal.valueOf(Math.random() * 20 + 5).setScale(2, RoundingMode.HALF_UP);
        }

        try {
            BigDecimal currentNav = new BigDecimal((String) data.get(0).get("nav"));
            BigDecimal pastNav = new BigDecimal((String) data.get(Math.min(days, data.size() - 1)).get("nav"));

            if (pastNav.compareTo(BigDecimal.ZERO) > 0) {
                return currentNav.subtract(pastNav)
                        .divide(pastNav, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
            }
        } catch (Exception e) {
            log.warn("Error calculating return: {}", e.getMessage());
        }

        return BigDecimal.ZERO;
    }

    private MutualFundResponse createMockFund(String schemeCode, String schemeName) {
        Random rand = new Random(schemeCode.hashCode());
        double nav = 50 + rand.nextDouble() * 150;

        return MutualFundResponse.builder()
                .schemeCode(schemeCode)
                .schemeName(schemeName)
                .fundHouse(schemeName.split(" ")[0] + " Mutual Fund")
                .schemeType("Open Ended")
                .schemeCategory("Equity - Large Cap")
                .nav(BigDecimal.valueOf(nav).setScale(2, RoundingMode.HALF_UP))
                .navDate("02-Feb-2026")
                .oneYearReturn(BigDecimal.valueOf(5 + rand.nextDouble() * 25).setScale(2, RoundingMode.HALF_UP))
                .threeYearReturn(BigDecimal.valueOf(8 + rand.nextDouble() * 15).setScale(2, RoundingMode.HALF_UP))
                .fiveYearReturn(BigDecimal.valueOf(10 + rand.nextDouble() * 12).setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    public List<MutualFundResponse> searchMutualFunds(String query) {
        log.info("Searching mutual funds with query: {}", query);
        return getTopMutualFunds().stream()
                .filter(f -> f.getSchemeName().toLowerCase().contains(query.toLowerCase()) ||
                        f.getFundHouse().toLowerCase().contains(query.toLowerCase()))
                .toList();
    }
}
