package com.portfolio.manager.dto.response;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class MarketMoverResponseTest {

    @Test
    void testBuilder() {
        MarketMoverResponse response = MarketMoverResponse.builder()
                .ticker("AAPL")
                .companyName("Apple Inc.")
                .price(new BigDecimal("182.50"))
                .change(new BigDecimal("5.50"))
                .changePercent(new BigDecimal("3.10"))
                .build();

        assertEquals("AAPL", response.getTicker());
        assertEquals("Apple Inc.", response.getCompanyName());
        assertEquals(new BigDecimal("182.50"), response.getPrice());
        assertEquals(new BigDecimal("5.50"), response.getChange());
        assertEquals(new BigDecimal("3.10"), response.getChangePercent());
    }

    @Test
    void testNoArgsConstructor() {
        MarketMoverResponse response = new MarketMoverResponse();
        assertNull(response.getTicker());
        assertNull(response.getPrice());
    }

    @Test
    void testSettersAndGetters() {
        MarketMoverResponse response = new MarketMoverResponse();
        response.setTicker("NVDA");
        response.setCompanyName("NVIDIA Corporation");
        response.setPrice(new BigDecimal("500.00"));
        response.setChange(new BigDecimal("-10.00"));
        response.setChangePercent(new BigDecimal("-2.00"));

        assertEquals("NVDA", response.getTicker());
        assertEquals("NVIDIA Corporation", response.getCompanyName());
        assertEquals(new BigDecimal("500.00"), response.getPrice());
        assertEquals(new BigDecimal("-10.00"), response.getChange());
    }

    @Test
    void testNegativeChange() {
        MarketMoverResponse response = MarketMoverResponse.builder()
                .ticker("META")
                .change(new BigDecimal("-15.00"))
                .changePercent(new BigDecimal("-3.50"))
                .build();

        assertTrue(response.getChange().compareTo(BigDecimal.ZERO) < 0);
        assertTrue(response.getChangePercent().compareTo(BigDecimal.ZERO) < 0);
    }

    @Test
    void testToString() {
        MarketMoverResponse response = MarketMoverResponse.builder().ticker("AMZN").build();
        assertNotNull(response.toString());
        assertTrue(response.toString().contains("AMZN"));
    }
}
