package com.lawoffice.fms.infrastructure.config.tenant;

import com.lawoffice.fms.common.tenant.TenantContext;
import java.util.UUID;
import org.springframework.core.task.TaskDecorator;
import org.springframework.lang.NonNull;

public class TenantTaskDecorator implements TaskDecorator {

    @Override
    @NonNull
    public Runnable decorate(@NonNull Runnable runnable) {
        UUID organizationId = TenantContext.getOrganizationId().orElse(null);
        return () -> {
            try {
                if (organizationId != null) {
                    TenantContext.set(organizationId);
                }
                runnable.run();
            } finally {
                TenantContext.clear();
            }
        };
    }
}
