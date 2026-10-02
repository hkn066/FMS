package com.lawoffice.fms.casemanagement.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.lawoffice.fms.audit.application.AuditService;
import com.lawoffice.fms.casemanagement.application.dto.CaseRequest;
import com.lawoffice.fms.casemanagement.application.dto.CaseResponse;
import com.lawoffice.fms.casemanagement.domain.CaseStatus;
import com.lawoffice.fms.casemanagement.domain.LegalCase;
import com.lawoffice.fms.casemanagement.infrastructure.CaseRepository;
import com.lawoffice.fms.client.domain.Client;
import com.lawoffice.fms.client.infrastructure.ClientRepository;
import com.lawoffice.fms.common.tenant.TenantContext;
import com.lawoffice.fms.document.domain.Folder;
import com.lawoffice.fms.user.infrastructure.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CaseServiceTest {

    @Mock
    private CaseRepository caseRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private CaseNumberService caseNumberService;

    @Mock
    private CaseDmsFolderService caseDmsFolderService;

    private CaseService caseService;
    private UUID orgId;

    @BeforeEach
    void setUp() {
        orgId = UUID.randomUUID();
        caseService = new CaseService(
                caseRepository,
                clientRepository,
                userRepository,
                auditService,
                caseNumberService,
                caseDmsFolderService
        );
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void create_shouldAutoGenerateCaseNumber_whenCaseNumberIsBlank() {
        TenantContext.set(orgId);

        UUID clientId = UUID.randomUUID();
        Client client = Client.builder().name("Ahmet Yılmaz").build();
        client.setId(clientId);

        when(caseNumberService.generateNextCaseNumber()).thenReturn("2026/001");
        when(caseRepository.existsByCaseNumber("2026/001")).thenReturn(false);
        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));

        Folder rootFolder = Folder.builder().name("2026/001 - 34 ABC 123 - Ahmet Yılmaz - [Esas Bekleniyor]").build();
        rootFolder.setId(UUID.randomUUID());

        when(caseRepository.save(any(LegalCase.class))).thenAnswer(invocation -> {
            LegalCase lc = invocation.getArgument(0);
            lc.setId(UUID.randomUUID());
            lc.setDmsRootFolder(rootFolder);
            return lc;
        });

        CaseRequest request = new CaseRequest();
        request.setTitle("Araç Değer Kaybı Davası");
        request.setClientId(clientId);
        request.setCourt("İstanbul 1. Asliye Ticaret Mahkemesi");
        request.setHasSubjectVehicle(true);
        request.setVehiclePlate("34 ABC 123");
        request.setVehicleInfo("2022 Renault Megane");
        request.setClaimAmount(new BigDecimal("75000.00"));

        CaseResponse response = caseService.create(request);

        assertNotNull(response);
        assertEquals("2026/001", response.getCaseNumber());
        assertEquals("Araç Değer Kaybı Davası", response.getTitle());
        assertTrue(response.isHasSubjectVehicle());
        assertEquals("34 ABC 123", response.getVehiclePlate());
        assertEquals(new BigDecimal("75000.00"), response.getClaimAmount());

        verify(caseDmsFolderService).provisionRootFolder(any(LegalCase.class));
    }

    @Test
    void computeFolderName_shouldGenerateProperStandardFormat() {
        Client client = Client.builder().name("Ahmet Yılmaz").build();

        LegalCase legalCase = LegalCase.builder()
                .caseNumber("2026/001")
                .client(client)
                .court("İstanbul 1. Asliye Ticaret")
                .courtBasisNumber("2026/145 E.")
                .hasSubjectVehicle(true)
                .vehiclePlate("34 ABC 123")
                .build();

        String folderName = legalCase.computeFolderName();
        assertEquals("2026/001 - 34 ABC 123 - Ahmet Yılmaz - İstanbul 1. Asliye Ticaret 2026/145 E.", folderName);
    }
}
