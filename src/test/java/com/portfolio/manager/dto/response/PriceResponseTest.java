package com.portfolio.manager.dto.response;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class PriceResponseTest {

    @Test
    void testBuilder() {
        LocalDateTime now = LocalDateTime.now();
        PriceResponse response = PriceResponse.builder()
                .ticker("AAPL")
                .price(new BigDecimal("182.50"))
                .currency("USD")
                .timestamp(now)
                .build();

        assertEquals("AAPL", response.getTicker());
        assertEquals(new BigDecimal("182.50"), response.getPrice());
        assertEquals("USD", response.getCurrency());
        assertEquals(now, response.getTimestamp());
    }

    @Test
    void testNoArgsConstructor() {
        PriceResponse response = new PriceResponse();
        assertNull(response.getTicker());
        assertNull(response.getPrice());
    }

    @Test
    void testSettersAndGetters() {
        PriceResponse response = new PriceResponse();
        response.setTicker("TSLA");
        response.setPrice(new BigDecimal("250.00"));
        response.setCurrency("USD");
        response.setTimestamp(LocalDateTime.now());

        assertEquals("TSLA", response.getTicker());
        assertEquals(new BigDecimal("250.00"), response.getPrice());
        assertEquals("USD", response.getCurrency());
        assertNotNull(response.getTimestamp());
    }

    @Test
    void testEqualsAndHashCode() {
        PriceResponse r1 = PriceResponse.builder().ticker("AAPL").price(new BigDecimal("100")).build();
        PriceResponse r2 = PriceResponse.builder().ticker("AAPL").price(new BigDecimal("100")).build();
        assertEquals(r1, r2);
        assertEquals(r1.hashCode(), r2.hashCode());
    }

    @Test
    void testToString() {
        PriceResponse response = PriceResponse.builder().ticker("AAPL").price(new BigDecimal("182")).build();
        assertNotNull(response.toString());
        assertTrue(response.toString().contains("AAPL"));
    }
}
