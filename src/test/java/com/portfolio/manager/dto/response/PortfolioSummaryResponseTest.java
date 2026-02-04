package com.portfolio.manager.dto.response;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class PortfolioSummaryResponseTest {

    @Test
    void testBuilder() {
        PortfolioSummaryResponse response = PortfolioSummaryResponse.builder()
                .cashBalance(new BigDecimal("100000.00"))
                .totalInvested(new BigDecimal("5000.00"))
                .currentValue(new BigDecimal("5500.00"))
                .profitLoss(new BigDecimal("500.00"))
                .returnPercent(new BigDecimal("10.00"))
                .build();

        assertEquals(new BigDecimal("100000.00"), response.getCashBalance());
        assertEquals(new BigDecimal("5000.00"), response.getTotalInvested());
        assertEquals(new BigDecimal("5500.00"), response.getCurrentValue());
        assertEquals(new BigDecimal("500.00"), response.getProfitLoss());
        assertEquals(new BigDecimal("10.00"), response.getReturnPercent());
    }

    @Test
    void testNoArgsConstructor() {
        PortfolioSummaryResponse response = new PortfolioSummaryResponse();
        assertNull(response.getCashBalance());
        assertNull(response.getTotalInvested());
    }

    @Test
    void testSettersAndGetters() {
        PortfolioSummaryResponse response = new PortfolioSummaryResponse();
        response.setCashBalance(new BigDecimal("50000"));
        response.setTotalInvested(new BigDecimal("10000"));
        response.setCurrentValue(new BigDecimal("12000"));
        response.setProfitLoss(new BigDecimal("2000"));
        response.setReturnPercent(new BigDecimal("20"));

        assertEquals(new BigDecimal("50000"), response.getCashBalance());
        assertEquals(new BigDecimal("10000"), response.getTotalInvested());
        assertEquals(new BigDecimal("12000"), response.getCurrentValue());
        assertEquals(new BigDecimal("2000"), response.getProfitLoss());
        assertEquals(new BigDecimal("20"), response.getReturnPercent());
    }

    @Test
    void testNegativeProfitLoss() {
        PortfolioSummaryResponse response = PortfolioSummaryResponse.builder()
                .profitLoss(new BigDecimal("-500.00"))
                .returnPercent(new BigDecimal("-10.00"))
                .build();

        assertEquals(new BigDecimal("-500.00"), response.getProfitLoss());
        assertEquals(new BigDecimal("-10.00"), response.getReturnPercent());
    }

    @Test
    void testToString() {
        PortfolioSummaryResponse response = PortfolioSummaryResponse.builder()
                .cashBalance(new BigDecimal("100000"))
                .build();
        assertNotNull(response.toString());
    }
}
