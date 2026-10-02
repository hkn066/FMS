package com.lawoffice.fms.organization.infrastructure;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.lawoffice.fms.organization.domain.OrganizationConstants;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

class DefaultOrganizationMigrationTest {

    @Test
    void migrations_shouldCreateSystemOrganizationTenant() throws Exception {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:h2:mem:flyway_migration_test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1");
        config.setUsername("sa");
        config.setPassword("");
        config.setDriverClassName("org.h2.Driver");

        try (HikariDataSource dataSource = new HikariDataSource(config)) {
            Flyway flyway = Flyway.configure()
                    .dataSource(dataSource)
                    .locations("classpath:db/migration")
                    .target("7")
                    .load();
            flyway.migrate();

            try (Connection connection = dataSource.getConnection();
                    Statement statement = connection.createStatement();
                    ResultSet resultSet = statement.executeQuery(
                            "SELECT name, sub_domain, subscription_plan, subscription_status, deleted "
                                    + "FROM organizations WHERE id = '"
                                    + OrganizationConstants.DEFAULT_ORGANIZATION_ID + "'")) {

                assertTrue(resultSet.next());
                assertEquals("Sistem Yönetimi / Default Tenant", resultSet.getString("name"));
                assertEquals("system", resultSet.getString("sub_domain"));
                assertEquals("ENTERPRISE", resultSet.getString("subscription_plan"));
                assertEquals("ACTIVE", resultSet.getString("subscription_status"));
                assertEquals(false, resultSet.getBoolean("deleted"));
            }
        }
    }
}
