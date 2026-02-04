package com.portfolio.manager.exception;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ResourceNotFoundExceptionTest {

    @Test
    void testConstructorWithResourceNameAndFieldValue() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Portfolio", "id", 1L);

        assertEquals("Portfolio not found with id : '1'", exception.getMessage());
        assertEquals("Portfolio", exception.getResourceName());
        assertEquals("id", exception.getFieldName());
        assertEquals(1L, exception.getFieldValue());
    }

    @Test
    void testConstructorWithStringValue() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Stock", "ticker", "AAPL");

        assertEquals("Stock not found with ticker : 'AAPL'", exception.getMessage());
        assertEquals("Stock", exception.getResourceName());
        assertEquals("ticker", exception.getFieldName());
        assertEquals("AAPL", exception.getFieldValue());
    }

    @Test
    void testGetters() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Order", "orderId", 100L);

        assertEquals("Order", exception.getResourceName());
        assertEquals("orderId", exception.getFieldName());
        assertEquals(100L, exception.getFieldValue());
    }

    @Test
    void testDifferentResources() {
        ResourceNotFoundException holdingEx = new ResourceNotFoundException("Holding", "id", 5L);
        ResourceNotFoundException watchlistEx = new ResourceNotFoundException("Watchlist", "id", 10L);

        assertNotEquals(holdingEx.getResourceName(), watchlistEx.getResourceName());
        assertNotEquals(holdingEx.getFieldValue(), watchlistEx.getFieldValue());
    }
}
