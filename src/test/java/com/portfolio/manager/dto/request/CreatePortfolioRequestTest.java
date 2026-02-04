package com.portfolio.manager.dto.request;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CreatePortfolioRequestTest {

    @Test
    void testBuilder() {
        CreatePortfolioRequest request = CreatePortfolioRequest.builder()
                .name("My Investment Portfolio")
                .build();

        assertEquals("My Investment Portfolio", request.getName());
    }

    @Test
    void testNoArgsConstructor() {
        CreatePortfolioRequest request = new CreatePortfolioRequest();
        assertNull(request.getName());
    }

    @Test
    void testSettersAndGetters() {
        CreatePortfolioRequest request = new CreatePortfolioRequest();
        request.setName("Tech Portfolio");

        assertEquals("Tech Portfolio", request.getName());
    }

    @Test
    void testDifferentNames() {
        CreatePortfolioRequest request1 = CreatePortfolioRequest.builder().name("Portfolio 1").build();
        CreatePortfolioRequest request2 = CreatePortfolioRequest.builder().name("Portfolio 2").build();

        assertNotEquals(request1.getName(), request2.getName());
    }

    @Test
    void testToString() {
        CreatePortfolioRequest request = CreatePortfolioRequest.builder().name("Test").build();
        assertNotNull(request.toString());
        assertTrue(request.toString().contains("Test"));
    }
}
