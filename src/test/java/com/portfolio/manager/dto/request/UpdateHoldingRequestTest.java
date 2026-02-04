package com.portfolio.manager.dto.request;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class UpdateHoldingRequestTest {

    @Test
    void testBuilder() {
        UpdateHoldingRequest request = UpdateHoldingRequest.builder()
                .quantity(new BigDecimal("15.0000"))
                .avgBuyPrice(new BigDecimal("190.00"))
                .build();

        assertEquals(new BigDecimal("15.0000"), request.getQuantity());
        assertEquals(new BigDecimal("190.00"), request.getAvgBuyPrice());
    }

    @Test
    void testNoArgsConstructor() {
        UpdateHoldingRequest request = new UpdateHoldingRequest();
        assertNull(request.getQuantity());
        assertNull(request.getAvgBuyPrice());
    }

    @Test
    void testSettersAndGetters() {
        UpdateHoldingRequest request = new UpdateHoldingRequest();
        request.setQuantity(new BigDecimal("20"));
        request.setAvgBuyPrice(new BigDecimal("200.00"));

        assertEquals(new BigDecimal("20"), request.getQuantity());
        assertEquals(new BigDecimal("200.00"), request.getAvgBuyPrice());
    }

    @Test
    void testPartialUpdate_QuantityOnly() {
        UpdateHoldingRequest request = UpdateHoldingRequest.builder()
                .quantity(new BigDecimal("25"))
                .build();

        assertEquals(new BigDecimal("25"), request.getQuantity());
        assertNull(request.getAvgBuyPrice());
    }

    @Test
    void testPartialUpdate_PriceOnly() {
        UpdateHoldingRequest request = UpdateHoldingRequest.builder()
                .avgBuyPrice(new BigDecimal("175.50"))
                .build();

        assertNull(request.getQuantity());
        assertEquals(new BigDecimal("175.50"), request.getAvgBuyPrice());
    }

    @Test
    void testToString() {
        UpdateHoldingRequest request = UpdateHoldingRequest.builder()
                .quantity(new BigDecimal("10"))
                .build();
        assertNotNull(request.toString());
    }
}
