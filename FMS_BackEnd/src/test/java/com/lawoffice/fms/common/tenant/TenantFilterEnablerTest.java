package com.lawoffice.fms.common.tenant;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.lawoffice.fms.common.entity.BaseEntity;
import com.lawoffice.fms.organization.domain.OrganizationConstants;
import jakarta.persistence.EntityManager;
import java.util.UUID;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

class TenantFilterEnablerTest {

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void enable_shouldActivateFilterWhenTenantContextIsSet() {
        UUID organizationId = OrganizationConstants.DEFAULT_ORGANIZATION_ID;
        TenantContext.set(organizationId);

        EntityManager entityManager = mock(EntityManager.class);
        Session session = mock(Session.class);
        Filter filter = mock(Filter.class);

        when(entityManager.unwrap(Session.class)).thenReturn(session);
        when(session.getEnabledFilter(BaseEntity.ORGANIZATION_FILTER_NAME)).thenReturn(null);
        when(session.enableFilter(BaseEntity.ORGANIZATION_FILTER_NAME)).thenReturn(filter);

        TenantFilterEnabler.enable(entityManager);

        verify(session).enableFilter(BaseEntity.ORGANIZATION_FILTER_NAME);
        verify(filter).setParameter(BaseEntity.ORGANIZATION_FILTER_PARAM, organizationId);
    }

    @Test
    void enable_shouldSkipWhenTenantContextIsEmpty() {
        EntityManager entityManager = mock(EntityManager.class);

        TenantFilterEnabler.enable(entityManager);

        verify(entityManager, never()).unwrap(Session.class);
    }

    @Test
    void enable_shouldUpdateExistingFilterParameter() {
        UUID organizationId = OrganizationConstants.DEFAULT_ORGANIZATION_ID;
        TenantContext.set(organizationId);

        EntityManager entityManager = mock(EntityManager.class);
        Session session = mock(Session.class);
        Filter filter = mock(Filter.class);

        when(entityManager.unwrap(Session.class)).thenReturn(session);
        when(session.getEnabledFilter(BaseEntity.ORGANIZATION_FILTER_NAME)).thenReturn(filter);

        assertDoesNotThrow(() -> TenantFilterEnabler.enable(entityManager));

        verify(session, never()).enableFilter(BaseEntity.ORGANIZATION_FILTER_NAME);
        verify(filter).setParameter(BaseEntity.ORGANIZATION_FILTER_PARAM, organizationId);
    }
}
