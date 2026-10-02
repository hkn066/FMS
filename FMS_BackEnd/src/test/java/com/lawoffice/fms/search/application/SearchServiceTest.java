package com.lawoffice.fms.search.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.lawoffice.fms.arbitration.domain.ArbitrationCase;
import com.lawoffice.fms.arbitration.domain.ArbitrationStatus;
import com.lawoffice.fms.arbitration.infrastructure.ArbitrationCaseRepository;
import com.lawoffice.fms.casemanagement.domain.CaseStatus;
import com.lawoffice.fms.casemanagement.domain.LegalCase;
import com.lawoffice.fms.casemanagement.infrastructure.CaseRepository;
import com.lawoffice.fms.client.domain.Client;
import com.lawoffice.fms.client.domain.ClientStatus;
import com.lawoffice.fms.client.domain.ClientType;
import com.lawoffice.fms.client.infrastructure.ClientRepository;
import com.lawoffice.fms.common.exception.TenantNotFoundException;
import com.lawoffice.fms.common.tenant.TenantContext;
import com.lawoffice.fms.document.domain.Document;
import com.lawoffice.fms.document.domain.OcrStatus;
import com.lawoffice.fms.document.infrastructure.DocumentRepository;
import com.lawoffice.fms.search.application.dto.GlobalSearchResponse;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private CaseRepository caseRepository;

    @Mock
    private ArbitrationCaseRepository arbitrationCaseRepository;

    @Mock
    private DocumentRepository documentRepository;

    @InjectMocks
    private SearchService searchService;

    private UUID orgId;

    @BeforeEach
    void setUp() {
        orgId = UUID.randomUUID();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void search_shouldThrowTenantNotFoundException_whenNoTenantInContext() {
        assertThrows(TenantNotFoundException.class, () -> searchService.search("test"));
    }

    @Test
    void search_shouldReturnResults_whenTenantInContext() {
        TenantContext.set(orgId);
        String query = "test";

        Client client = Client.builder()
                .name("Test Client")
                .email("test@client.com")
                .type(ClientType.INDIVIDUAL)
                .status(ClientStatus.ACTIVE)
                .build();
        client.setId(UUID.randomUUID());

        LegalCase legalCase = LegalCase.builder()
                .caseNumber("2026/123")
                .title("Test Case")
                .client(client)
                .status(CaseStatus.ACTIVE)
                .build();
        legalCase.setId(UUID.randomUUID());

        ArbitrationCase arbitrationCase = ArbitrationCase.builder()
                .licensePlate("34ABC123")
                .clientNameSurname("Test Client")
                .arbitrationFileNumber("12345")
                .status(ArbitrationStatus.PRE_APPLICATION)
                .build();
        arbitrationCase.setId(UUID.randomUUID());

        Document document = Document.builder()
                .name("test_doc.pdf")
                .contentType("application/pdf")
                .fileSize(1024L)
                .storageKey("key")
                .ocrStatus(OcrStatus.PENDING)
                .build();
        document.setId(UUID.randomUUID());

        when(clientRepository.searchClients(query)).thenReturn(List.of(client));
        when(caseRepository.searchCases(query)).thenReturn(List.of(legalCase));
        when(arbitrationCaseRepository.searchArbitrationCases(query)).thenReturn(List.of(arbitrationCase));
        when(documentRepository.searchDocuments(query)).thenReturn(List.of(document));

        GlobalSearchResponse response = searchService.search(query);

        assertNotNull(response);
        assertEquals(1, response.getClients().size());
        assertEquals("Test Client", response.getClients().get(0).getName());

        assertEquals(1, response.getCases().size());
        assertEquals("2026/123", response.getCases().get(0).getCaseNumber());

        assertEquals(1, response.getArbitrations().size());
        assertEquals("34ABC123", response.getArbitrations().get(0).getLicensePlate());

        assertEquals(1, response.getDocuments().size());
        assertEquals("test_doc.pdf", response.getDocuments().get(0).getName());

        verify(clientRepository).searchClients(query);
        verify(caseRepository).searchCases(query);
        verify(arbitrationCaseRepository).searchArbitrationCases(query);
        verify(documentRepository).searchDocuments(query);
    }
}
