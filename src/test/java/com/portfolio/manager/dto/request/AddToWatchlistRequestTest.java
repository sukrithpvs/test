package com.portfolio.manager.dto.request;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class AddToWatchlistRequestTest {

    @Test
    void testBuilder() {
        AddToWatchlistRequest request = AddToWatchlistRequest.builder()
                .ticker("AAPL")
                .notes("Great company to watch")
                .build();

        assertEquals("AAPL", request.getTicker());
        assertEquals("Great company to watch", request.getNotes());
    }

    @Test
    void testNoArgsConstructor() {
        AddToWatchlistRequest request = new AddToWatchlistRequest();
        assertNull(request.getTicker());
        assertNull(request.getNotes());
    }

    @Test
    void testSettersAndGetters() {
        AddToWatchlistRequest request = new AddToWatchlistRequest();
        request.setTicker("TSLA");
        request.setNotes("EV leader");

        assertEquals("TSLA", request.getTicker());
        assertEquals("EV leader", request.getNotes());
    }

    @Test
    void testWithoutNotes() {
        AddToWatchlistRequest request = AddToWatchlistRequest.builder()
                .ticker("GOOGL")
                .build();

        assertEquals("GOOGL", request.getTicker());
        assertNull(request.getNotes());
    }

    @Test
    void testToString() {
        AddToWatchlistRequest request = AddToWatchlistRequest.builder().ticker("META").build();
        assertNotNull(request.toString());
        assertTrue(request.toString().contains("META"));
    }
}
