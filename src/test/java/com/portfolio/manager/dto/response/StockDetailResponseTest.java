package com.portfolio.manager.dto.response;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class StockDetailResponseTest {

    @Test
    void testBuilder() {
        StockDetailResponse response = StockDetailResponse.builder()
                .ticker("AAPL")
                .companyName("Apple Inc.")
                .currentPrice(new BigDecimal("182.50"))
                .change(new BigDecimal("2.50"))
                .changePercent(new BigDecimal("1.39"))
                .marketCap("2.8T")
                .peRatio(new BigDecimal("28.5"))
                .week52High(new BigDecimal("200.00"))
                .week52Low(new BigDecimal("150.00"))
                .volume(50000000L)
                .avgVolume(45000000L)
                .exchange("NASDAQ")
                .sector("Technology")
                .industry("Consumer Electronics")
                .build();

        assertEquals("AAPL", response.getTicker());
        assertEquals("Apple Inc.", response.getCompanyName());
        assertEquals(new BigDecimal("182.50"), response.getCurrentPrice());
        assertEquals("2.8T", response.getMarketCap());
        assertEquals(50000000L, response.getVolume());
        assertEquals("NASDAQ", response.getExchange());
        assertEquals("Technology", response.getSector());
    }

    @Test
    void testNoArgsConstructor() {
        StockDetailResponse response = new StockDetailResponse();
        assertNull(response.getTicker());
        assertNull(response.getCompanyName());
    }

    @Test
    void testSettersAndGetters() {
        StockDetailResponse response = new StockDetailResponse();
        response.setTicker("MSFT");
        response.setCompanyName("Microsoft Corporation");
        response.setCurrentPrice(new BigDecimal("400.00"));
        response.setChange(new BigDecimal("-5.00"));
        response.setChangePercent(new BigDecimal("-1.25"));
        response.setMarketCap("3.0T");
        response.setPeRatio(new BigDecimal("35.0"));
        response.setWeek52High(new BigDecimal("420.00"));
        response.setWeek52Low(new BigDecimal("300.00"));
        response.setVolume(30000000L);
        response.setAvgVolume(25000000L);
        response.setExchange("NASDAQ");
        response.setSector("Technology");
        response.setIndustry("Software");

        assertEquals("MSFT", response.getTicker());
        assertEquals("Microsoft Corporation", response.getCompanyName());
        assertEquals(new BigDecimal("400.00"), response.getCurrentPrice());
    }

    @Test
    void testNegativeChange() {
        StockDetailResponse response = StockDetailResponse.builder()
                .ticker("TSLA")
                .change(new BigDecimal("-10.00"))
                .changePercent(new BigDecimal("-5.00"))
                .build();

        assertEquals(new BigDecimal("-10.00"), response.getChange());
        assertEquals(new BigDecimal("-5.00"), response.getChangePercent());
    }

    @Test
    void testToString() {
        StockDetailResponse response = StockDetailResponse.builder().ticker("AAPL").build();
        assertNotNull(response.toString());
        assertTrue(response.toString().contains("AAPL"));
    }
}
