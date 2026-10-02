package com.lawoffice.fms.infrastructure.config.tenant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.lawoffice.fms.common.tenant.TenantContext;
import com.lawoffice.fms.organization.domain.OrganizationConstants;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

class TenantTaskDecoratorTest {

    private final TenantTaskDecorator decorator = new TenantTaskDecorator();

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void decorate_shouldPropagateOrganizationIdToAsyncThread() throws Exception {
        UUID organizationId = OrganizationConstants.DEFAULT_ORGANIZATION_ID;
        TenantContext.set(organizationId);

        AtomicReference<UUID> captured = new AtomicReference<>();
        Runnable task = decorator.decorate(() -> captured.set(TenantContext.getOrganizationId().orElse(null)));

        Thread asyncThread = new Thread(task);
        asyncThread.start();
        asyncThread.join();

        assertEquals(organizationId, captured.get());
    }

    @Test
    void decorate_shouldClearTenantContextAfterTaskCompletes() {
        UUID organizationId = OrganizationConstants.DEFAULT_ORGANIZATION_ID;
        TenantContext.set(organizationId);

        AtomicReference<Boolean> contextPresentDuringTask = new AtomicReference<>(false);
        Runnable task = decorator.decorate(() ->
                contextPresentDuringTask.set(TenantContext.getOrganizationId().isPresent()));

        task.run();

        assertTrue(contextPresentDuringTask.get());
        assertTrue(TenantContext.getOrganizationId().isEmpty());
    }
}
