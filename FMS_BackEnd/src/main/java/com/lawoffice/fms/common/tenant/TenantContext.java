package com.lawoffice.fms.common.tenant;

import com.lawoffice.fms.common.exception.TenantNotFoundException;
import java.util.Optional;
import java.util.UUID;

public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_ORGANIZATION = new ThreadLocal<>();

    private TenantContext() {}

    public static void set(UUID organizationId) {
        CURRENT_ORGANIZATION.set(organizationId);
    }

    public static Optional<UUID> get() {
        return Optional.ofNullable(CURRENT_ORGANIZATION.get());
    }

    public static Optional<UUID> getOrganizationId() {
        return get();
    }

    public static UUID requireOrganizationId() {
        return getOrganizationId()
                .orElseThrow(() -> new TenantNotFoundException("Organization context is required for this operation"));
    }

    public static void clear() {
        CURRENT_ORGANIZATION.remove();
    }
}
