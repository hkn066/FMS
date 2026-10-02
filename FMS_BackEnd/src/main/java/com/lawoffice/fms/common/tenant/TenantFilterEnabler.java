package com.lawoffice.fms.common.tenant;

import com.lawoffice.fms.common.entity.BaseEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import java.util.UUID;
import org.hibernate.Session;
import org.springframework.orm.jpa.EntityManagerFactoryUtils;

public final class TenantFilterEnabler {

    private TenantFilterEnabler() {}

    public static void enable(EntityManager entityManager) {
        TenantContext.getOrganizationId().ifPresent(orgId -> enableOnSession(entityManager.unwrap(Session.class), orgId));
    }

    public static void enableFromTransaction(EntityManagerFactory entityManagerFactory) {
        TenantContext.getOrganizationId().ifPresent(orgId -> {
            EntityManager entityManager =
                    EntityManagerFactoryUtils.getTransactionalEntityManager(entityManagerFactory);
            if (entityManager != null) {
                enableOnSession(entityManager.unwrap(Session.class), orgId);
            }
        });
    }

    private static void enableOnSession(Session session, UUID organizationId) {
        org.hibernate.Filter filter = session.getEnabledFilter(BaseEntity.ORGANIZATION_FILTER_NAME);
        if (filter == null) {
            session.enableFilter(BaseEntity.ORGANIZATION_FILTER_NAME)
                    .setParameter(BaseEntity.ORGANIZATION_FILTER_PARAM, organizationId);
        } else {
            filter.setParameter(BaseEntity.ORGANIZATION_FILTER_PARAM, organizationId);
        }
    }
}
