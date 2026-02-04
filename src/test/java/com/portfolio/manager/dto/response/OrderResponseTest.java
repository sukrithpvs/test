package com.portfolio.manager.dto.response;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class OrderResponseTest {

    @Test
    void testBuilder() {
        LocalDateTime now = LocalDateTime.now();
        OrderResponse response = OrderResponse.builder()
                .id(1L)
                .ticker("AAPL")
                .orderType("BUY")
                .status("COMPLETED")
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("182.50"))
                .totalAmount(new BigDecimal("1825.00"))
                .createdAt(now)
                .executedAt(now)
                .build();

        assertEquals(1L, response.getId());
        assertEquals("AAPL", response.getTicker());
        assertEquals("BUY", response.getOrderType());
        assertEquals("COMPLETED", response.getStatus());
        assertEquals(new BigDecimal("10"), response.getQuantity());
        assertEquals(new BigDecimal("182.50"), response.getPrice());
        assertEquals(new BigDecimal("1825.00"), response.getTotalAmount());
        assertEquals(now, response.getCreatedAt());
        assertEquals(now, response.getExecutedAt());
    }

    @Test
    void testNoArgsConstructor() {
        OrderResponse response = new OrderResponse();
        assertNull(response.getId());
        assertNull(response.getTicker());
        assertNull(response.getOrderType());
    }

    @Test
    void testSettersAndGetters() {
        OrderResponse response = new OrderResponse();
        response.setId(1L);
        response.setTicker("MSFT");
        response.setOrderType("SELL");
        response.setStatus("PENDING");
        response.setQuantity(new BigDecimal("5"));
        response.setPrice(new BigDecimal("400"));
        response.setTotalAmount(new BigDecimal("2000"));
        response.setCreatedAt(LocalDateTime.now());
        response.setExecutedAt(null);

        assertEquals(1L, response.getId());
        assertEquals("MSFT", response.getTicker());
        assertEquals("SELL", response.getOrderType());
        assertEquals("PENDING", response.getStatus());
    }

    @Test
    void testEqualsAndHashCode() {
        OrderResponse r1 = OrderResponse.builder().id(1L).ticker("AAPL").build();
        OrderResponse r2 = OrderResponse.builder().id(1L).ticker("AAPL").build();
        assertEquals(r1, r2);
        assertEquals(r1.hashCode(), r2.hashCode());
    }

    @Test
    void testToString() {
        OrderResponse response = OrderResponse.builder().id(1L).ticker("AAPL").orderType("BUY").build();
        assertNotNull(response.toString());
        assertTrue(response.toString().contains("AAPL"));
    }
}
