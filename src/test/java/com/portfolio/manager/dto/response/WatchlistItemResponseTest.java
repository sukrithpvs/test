package com.portfolio.manager.dto.response;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class WatchlistItemResponseTest {

    @Test
    void testBuilder() {
        LocalDateTime now = LocalDateTime.now();
        WatchlistItemResponse response = WatchlistItemResponse.builder()
                .id(1L)
                .ticker("AAPL")
                .companyName("Apple Inc.")
                .notes("Great stock to watch")
                .addedAt(now)
                .build();

        assertEquals(1L, response.getId());
        assertEquals("AAPL", response.getTicker());
        assertEquals("Apple Inc.", response.getCompanyName());
        assertEquals("Great stock to watch", response.getNotes());
        assertEquals(now, response.getAddedAt());
    }

    @Test
    void testNoArgsConstructor() {
        WatchlistItemResponse response = new WatchlistItemResponse();
        assertNull(response.getId());
        assertNull(response.getTicker());
    }

    @Test
    void testSettersAndGetters() {
        WatchlistItemResponse response = new WatchlistItemResponse();
        response.setId(1L);
        response.setTicker("TSLA");
        response.setCompanyName("Tesla Inc.");
        response.setNotes("EV leader");
        response.setAddedAt(LocalDateTime.now());

        assertEquals(1L, response.getId());
        assertEquals("TSLA", response.getTicker());
        assertEquals("Tesla Inc.", response.getCompanyName());
        assertEquals("EV leader", response.getNotes());
        assertNotNull(response.getAddedAt());
    }

    @Test
    void testToString() {
        WatchlistItemResponse response = WatchlistItemResponse.builder()
                .ticker("GOOGL")
                .companyName("Alphabet")
                .build();
        assertNotNull(response.toString());
        assertTrue(response.toString().contains("GOOGL"));
    }
}
