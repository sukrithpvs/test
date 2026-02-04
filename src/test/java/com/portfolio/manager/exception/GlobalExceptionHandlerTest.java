package com.portfolio.manager.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.WebRequest;
import org.mockito.Mockito;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void testHandleResourceNotFoundException() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Portfolio", "id", 1L);
        WebRequest webRequest = mock(WebRequest.class);
        when(webRequest.getDescription(false)).thenReturn("uri=/api/portfolio/1");

        ResponseEntity<Object> response = handler.handleResourceNotFoundException(exception, webRequest);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testHandleBadRequestException() {
        BadRequestException exception = new BadRequestException("Invalid request");
        WebRequest webRequest = mock(WebRequest.class);
        when(webRequest.getDescription(false)).thenReturn("uri=/api/orders");

        ResponseEntity<Object> response = handler.handleBadRequestException(exception, webRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testHandleGlobalException() {
        Exception exception = new RuntimeException("Something went wrong");
        WebRequest webRequest = mock(WebRequest.class);
        when(webRequest.getDescription(false)).thenReturn("uri=/api/test");

        ResponseEntity<Object> response = handler.handleGlobalException(exception, webRequest);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}
