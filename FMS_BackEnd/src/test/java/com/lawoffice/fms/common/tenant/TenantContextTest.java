package com.lawoffice.fms.common.tenant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.lawoffice.fms.common.exception.TenantNotFoundException;

import com.lawoffice.fms.organization.domain.OrganizationConstants;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

class TenantContextTest {

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void setAndGet_shouldReturnOrganizationId() {
        UUID organizationId = OrganizationConstants.DEFAULT_ORGANIZATION_ID;

        TenantContext.set(organizationId);

        assertTrue(TenantContext.get().isPresent());
        assertEquals(organizationId, TenantContext.get().get());
        assertEquals(organizationId, TenantContext.getOrganizationId().orElseThrow());
    }

    @Test
    void clear_shouldRemoveOrganizationId() {
        TenantContext.set(OrganizationConstants.DEFAULT_ORGANIZATION_ID);

        TenantContext.clear();

        assertTrue(TenantContext.get().isEmpty());
    }

    @Test
    void requireOrganizationId_shouldReturnValueWhenSet() {
        UUID organizationId = OrganizationConstants.DEFAULT_ORGANIZATION_ID;
        TenantContext.set(organizationId);

        assertEquals(organizationId, TenantContext.requireOrganizationId());
    }

    @Test
    void requireOrganizationId_shouldThrowWhenEmpty() {
        assertThrows(TenantNotFoundException.class, TenantContext::requireOrganizationId);
    }
}
