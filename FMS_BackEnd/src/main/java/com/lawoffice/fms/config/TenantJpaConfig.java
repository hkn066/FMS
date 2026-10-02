package com.lawoffice.fms.config;

import com.lawoffice.fms.common.tenant.TenantFilterEnabler;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.TransactionDefinition;

@Configuration
public class TenantJpaConfig {

    @Bean
    @Primary
    public JpaTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new TenantAwareJpaTransactionManager(entityManagerFactory);
    }

    private static final class TenantAwareJpaTransactionManager extends JpaTransactionManager {

        TenantAwareJpaTransactionManager(EntityManagerFactory entityManagerFactory) {
            setEntityManagerFactory(entityManagerFactory);
        }

        @Override
        protected void doBegin(Object transaction, TransactionDefinition definition) {
            super.doBegin(transaction, definition);
            TenantFilterEnabler.enableFromTransaction(getEntityManagerFactory());
        }
    }
}
