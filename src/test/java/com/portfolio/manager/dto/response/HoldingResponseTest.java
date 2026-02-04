package com.portfolio.manager.dto.response;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class HoldingResponseTest {

    @Test
    void testBuilder() {
        HoldingResponse response = HoldingResponse.builder()
                .id(1L)
                .ticker("AAPL")
                .companyName("Apple Inc.")
                .quantity(new BigDecimal("10.0000"))
                .avgBuyPrice(new BigDecimal("182.50"))
                .currentPrice(new BigDecimal("190.00"))
                .build();

        assertEquals(1L, response.getId());
        assertEquals("AAPL", response.getTicker());
        assertEquals("Apple Inc.", response.getCompanyName());
        assertEquals(new BigDecimal("10.0000"), response.getQuantity());
        assertEquals(new BigDecimal("182.50"), response.getAvgBuyPrice());
        assertEquals(new BigDecimal("190.00"), response.getCurrentPrice());
    }

    @Test
    void testNoArgsConstructor() {
        HoldingResponse response = new HoldingResponse();
        assertNull(response.getId());
        assertNull(response.getTicker());
    }

    @Test
    void testAllArgsConstructor() {
        HoldingResponse response = new HoldingResponse(1L, "AAPL", "Apple",
                new BigDecimal("10"), new BigDecimal("180"), new BigDecimal("190"));
        assertEquals(1L, response.getId());
    }

    @Test
    void testSettersAndGetters() {
        HoldingResponse response = new HoldingResponse();
        response.setId(1L);
        response.setTicker("TSLA");
        response.setCompanyName("Tesla");
        response.setQuantity(new BigDecimal("5"));
        response.setAvgBuyPrice(new BigDecimal("200"));
        response.setCurrentPrice(new BigDecimal("250"));

        assertEquals(1L, response.getId());
        assertEquals("TSLA", response.getTicker());
        assertEquals("Tesla", response.getCompanyName());
    }

    @Test
    void testEqualsAndHashCode() {
        HoldingResponse r1 = HoldingResponse.builder().id(1L).ticker("AAPL").build();
        HoldingResponse r2 = HoldingResponse.builder().id(1L).ticker("AAPL").build();
        assertEquals(r1, r2);
        assertEquals(r1.hashCode(), r2.hashCode());
    }

    @Test
    void testToString() {
        HoldingResponse response = HoldingResponse.builder().id(1L).ticker("AAPL").build();
        assertNotNull(response.toString());
        assertTrue(response.toString().contains("AAPL"));
    }
}
