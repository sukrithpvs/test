package com.portfolio.manager.dto.response;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class MutualFundResponseTest {

    @Test
    void testBuilder() {
        MutualFundResponse response = MutualFundResponse.builder()
                .schemeCode("119551")
                .schemeName("Axis Bluechip Fund")
                .nav(new BigDecimal("45.50"))
                .date("2024-01-15")
                .category("Equity")
                .fundHouse("Axis Mutual Fund")
                .build();

        assertEquals("119551", response.getSchemeCode());
        assertEquals("Axis Bluechip Fund", response.getSchemeName());
        assertEquals(new BigDecimal("45.50"), response.getNav());
        assertEquals("2024-01-15", response.getDate());
        assertEquals("Equity", response.getCategory());
        assertEquals("Axis Mutual Fund", response.getFundHouse());
    }

    @Test
    void testNoArgsConstructor() {
        MutualFundResponse response = new MutualFundResponse();
        assertNull(response.getSchemeCode());
        assertNull(response.getSchemeName());
    }

    @Test
    void testSettersAndGetters() {
        MutualFundResponse response = new MutualFundResponse();
        response.setSchemeCode("120503");
        response.setSchemeName("SBI Blue Chip Fund");
        response.setNav(new BigDecimal("75.25"));
        response.setDate("2024-02-01");
        response.setCategory("Large Cap");
        response.setFundHouse("SBI Mutual Fund");

        assertEquals("120503", response.getSchemeCode());
        assertEquals("SBI Blue Chip Fund", response.getSchemeName());
        assertEquals(new BigDecimal("75.25"), response.getNav());
    }

    @Test
    void testToString() {
        MutualFundResponse response = MutualFundResponse.builder()
                .schemeCode("100")
                .schemeName("Test Fund")
                .build();
        assertNotNull(response.toString());
        assertTrue(response.toString().contains("Test Fund"));
    }
}
