package com.lawoffice.fms.common.tenant;

import jakarta.persistence.EntityManager;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Aspect
@Component
@Order(Ordered.LOWEST_PRECEDENCE)
public class TenantFilterAspect {

    private final EntityManager entityManager;

    public TenantFilterAspect(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Around(
            "(@annotation(org.springframework.transaction.annotation.Transactional) || "
                    + "@within(org.springframework.transaction.annotation.Transactional)) "
                    + "&& execution(* com.lawoffice.fms..*.*(..))")
    public Object activateOrganizationFilter(ProceedingJoinPoint joinPoint) throws Throwable {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TenantFilterEnabler.enable(entityManager);
        }
        return joinPoint.proceed();
    }
}
