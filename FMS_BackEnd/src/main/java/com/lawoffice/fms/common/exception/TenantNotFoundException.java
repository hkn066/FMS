package com.lawoffice.fms.common.exception;

public class TenantNotFoundException extends RuntimeException {

    public TenantNotFoundException() {
        super("Organization context not found");
    }

    public TenantNotFoundException(String message) {
        super(message);
    }
}
