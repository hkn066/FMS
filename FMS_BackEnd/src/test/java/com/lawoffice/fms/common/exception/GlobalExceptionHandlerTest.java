package com.lawoffice.fms.common.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleTenantNotFound_shouldReturnUnauthorized() {
        var response = handler.handleTenantNotFound(new TenantNotFoundException("Organization context is required"));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("Organization context is required", response.getBody().getMessage());
    }
}
