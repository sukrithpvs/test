package com.portfolio.manager.dto.response;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class PortfolioResponseTest {

    @Test
    void testBuilder() {
        List<HoldingResponse> holdings = new ArrayList<>();
        holdings.add(HoldingResponse.builder().id(1L).ticker("AAPL").build());

        PortfolioResponse response = PortfolioResponse.builder()
                .id(1L)
                .name("My Portfolio")
                .holdings(holdings)
                .build();

        assertEquals(1L, response.getId());
        assertEquals("My Portfolio", response.getName());
        assertEquals(1, response.getHoldings().size());
    }

    @Test
    void testNoArgsConstructor() {
        PortfolioResponse response = new PortfolioResponse();
        assertNull(response.getId());
        assertNull(response.getName());
    }

    @Test
    void testSettersAndGetters() {
        PortfolioResponse response = new PortfolioResponse();
        response.setId(1L);
        response.setName("Test Portfolio");
        response.setHoldings(new ArrayList<>());

        assertEquals(1L, response.getId());
        assertEquals("Test Portfolio", response.getName());
        assertNotNull(response.getHoldings());
    }

    @Test
    void testToString() {
        PortfolioResponse response = PortfolioResponse.builder().id(1L).name("Test").build();
        assertNotNull(response.toString());
        assertTrue(response.toString().contains("Test"));
    }
}
