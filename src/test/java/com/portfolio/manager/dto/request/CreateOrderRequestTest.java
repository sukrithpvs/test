package com.portfolio.manager.dto.request;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class CreateOrderRequestTest {

    @Test
    void testBuilder() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .ticker("AAPL")
                .orderType("BUY")
                .quantity(new BigDecimal("10"))
                .price(new BigDecimal("182.50"))
                .build();

        assertEquals("AAPL", request.getTicker());
        assertEquals("BUY", request.getOrderType());
        assertEquals(new BigDecimal("10"), request.getQuantity());
        assertEquals(new BigDecimal("182.50"), request.getPrice());
    }

    @Test
    void testNoArgsConstructor() {
        CreateOrderRequest request = new CreateOrderRequest();
        assertNull(request.getTicker());
        assertNull(request.getOrderType());
    }

    @Test
    void testSettersAndGetters() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setTicker("TSLA");
        request.setOrderType("SELL");
        request.setQuantity(new BigDecimal("5"));
        request.setPrice(new BigDecimal("250.00"));

        assertEquals("TSLA", request.getTicker());
        assertEquals("SELL", request.getOrderType());
        assertEquals(new BigDecimal("5"), request.getQuantity());
        assertEquals(new BigDecimal("250.00"), request.getPrice());
    }

    @Test
    void testBuyOrder() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .ticker("GOOGL")
                .orderType("BUY")
                .quantity(new BigDecimal("2"))
                .price(new BigDecimal("150.00"))
                .build();

        assertEquals("BUY", request.getOrderType());
    }

    @Test
    void testSellOrder() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .ticker("AMZN")
                .orderType("SELL")
                .quantity(new BigDecimal("3"))
                .price(new BigDecimal("180.00"))
                .build();

        assertEquals("SELL", request.getOrderType());
    }

    @Test
    void testToString() {
        CreateOrderRequest request = CreateOrderRequest.builder().ticker("MSFT").build();
        assertNotNull(request.toString());
        assertTrue(request.toString().contains("MSFT"));
    }
}
