package com.lawoffice.fms.common.entity;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.lawoffice.fms.client.domain.Client;
import com.lawoffice.fms.client.domain.ClientStatus;
import com.lawoffice.fms.client.domain.ClientType;
import org.junit.jupiter.api.Test;

class BaseEntityTest {

    @Test
    void markDeleted_shouldSetDeletedFlagAndTimestamp() {
        Client client = Client.builder()
                .name("Test Client")
                .email("test@example.com")
                .type(ClientType.INDIVIDUAL)
                .status(ClientStatus.ACTIVE)
                .build();

        client.markDeleted();

        assertTrue(client.isDeleted());
        assertNotNull(client.getDeletedAt());
    }
}
