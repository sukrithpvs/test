package com.portfolio.manager.dto.request;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class AddHoldingRequestTest {

    @Test
    void testBuilder() {
        AddHoldingRequest request = AddHoldingRequest.builder()
                .ticker("AAPL")
                .quantity(new BigDecimal("10.0000"))
                .avgBuyPrice(new BigDecimal("182.50"))
                .build();

        assertEquals("AAPL", request.getTicker());
        assertEquals(new BigDecimal("10.0000"), request.getQuantity());
        assertEquals(new BigDecimal("182.50"), request.getAvgBuyPrice());
    }

    @Test
    void testNoArgsConstructor() {
        AddHoldingRequest request = new AddHoldingRequest();
        assertNull(request.getTicker());
        assertNull(request.getQuantity());
    }

    @Test
    void testSettersAndGetters() {
        AddHoldingRequest request = new AddHoldingRequest();
        request.setTicker("MSFT");
        request.setQuantity(new BigDecimal("5"));
        request.setAvgBuyPrice(new BigDecimal("400.00"));

        assertEquals("MSFT", request.getTicker());
        assertEquals(new BigDecimal("5"), request.getQuantity());
        assertEquals(new BigDecimal("400.00"), request.getAvgBuyPrice());
    }

    @Test
    void testToString() {
        AddHoldingRequest request = AddHoldingRequest.builder().ticker("NVDA").build();
        assertNotNull(request.toString());
        assertTrue(request.toString().contains("NVDA"));
    }
}
