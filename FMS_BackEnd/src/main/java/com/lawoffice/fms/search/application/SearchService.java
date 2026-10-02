package com.lawoffice.fms.search.application;

import com.lawoffice.fms.arbitration.application.dto.ArbitrationCaseResponse;
import com.lawoffice.fms.arbitration.domain.ArbitrationCase;
import com.lawoffice.fms.arbitration.infrastructure.ArbitrationCaseRepository;
import com.lawoffice.fms.casemanagement.application.dto.CaseResponse;
import com.lawoffice.fms.casemanagement.domain.LegalCase;
import com.lawoffice.fms.casemanagement.infrastructure.CaseRepository;
import com.lawoffice.fms.client.application.dto.ClientResponse;
import com.lawoffice.fms.client.domain.Client;
import com.lawoffice.fms.client.infrastructure.ClientRepository;
import com.lawoffice.fms.common.tenant.TenantContext;
import com.lawoffice.fms.document.application.dto.DocumentResponse;
import com.lawoffice.fms.document.domain.Document;
import com.lawoffice.fms.document.infrastructure.DocumentRepository;
import com.lawoffice.fms.search.application.dto.GlobalSearchResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class SearchService {

    private static final int MAX_RESULTS_PER_CATEGORY = 10;

    private final ClientRepository clientRepository;
    private final CaseRepository caseRepository;
    private final ArbitrationCaseRepository arbitrationCaseRepository;
    private final DocumentRepository documentRepository;

    public SearchService(
            ClientRepository clientRepository,
            CaseRepository caseRepository,
            ArbitrationCaseRepository arbitrationCaseRepository,
            DocumentRepository documentRepository) {
        this.clientRepository = clientRepository;
        this.caseRepository = caseRepository;
        this.arbitrationCaseRepository = arbitrationCaseRepository;
        this.documentRepository = documentRepository;
    }

    public GlobalSearchResponse search(String query) {
        // Multi-tenancy isolation: enforce organization_id is present
        TenantContext.requireOrganizationId();

        String trimmedQuery = query.trim();

        List<ClientResponse> clients = clientRepository.searchClients(trimmedQuery).stream()
                .limit(MAX_RESULTS_PER_CATEGORY)
                .map(this::toClientResponse)
                .toList();

        List<CaseResponse> cases = caseRepository.searchCases(trimmedQuery).stream()
                .limit(MAX_RESULTS_PER_CATEGORY)
                .map(this::toCaseResponse)
                .toList();

        List<ArbitrationCaseResponse> arbitrations = arbitrationCaseRepository.searchArbitrationCases(trimmedQuery).stream()
                .limit(MAX_RESULTS_PER_CATEGORY)
                .map(this::toArbitrationResponse)
                .toList();

        List<DocumentResponse> documents = documentRepository.searchDocuments(trimmedQuery).stream()
                .limit(MAX_RESULTS_PER_CATEGORY)
                .map(this::toDocumentResponse)
                .toList();

        return GlobalSearchResponse.builder()
                .clients(clients)
                .cases(cases)
                .arbitrations(arbitrations)
                .documents(documents)
                .build();
    }

    private ClientResponse toClientResponse(Client client) {
        return ClientResponse.builder()
                .id(client.getId().toString())
                .name(client.getName())
                .email(client.getEmail())
                .phone(client.getPhone())
                .taxNumber(client.getTaxNumber())
                .address(client.getAddress())
                .type(client.getType())
                .status(client.getStatus())
                .build();
    }

    private CaseResponse toCaseResponse(LegalCase legalCase) {
        return CaseResponse.builder()
                .id(legalCase.getId().toString())
                .caseNumber(legalCase.getCaseNumber())
                .title(legalCase.getTitle())
                .description(legalCase.getDescription())
                .status(legalCase.getStatus())
                .clientId(legalCase.getClient().getId().toString())
                .clientName(legalCase.getClient().getName())
                .lawyerId(legalCase.getAssignedLawyer() != null
                        ? legalCase.getAssignedLawyer().getId().toString()
                        : null)
                .lawyerName(legalCase.getAssignedLawyer() != null
                        ? legalCase.getAssignedLawyer().getFullName()
                        : null)
                .court(legalCase.getCourt())
                .category(legalCase.getCategory())
                .openedAt(legalCase.getOpenedAt())
                .closedAt(legalCase.getClosedAt())
                .nextHearing(legalCase.getNextHearing())
                .courtBasisNumber(legalCase.getCourtBasisNumber())
                .decisionNumber(legalCase.getDecisionNumber())
                .clientRole(legalCase.getClientRole())
                .counterpartyName(legalCase.getCounterpartyName())
                .counterpartyLawyer(legalCase.getCounterpartyLawyer())
                .hasSubjectVehicle(legalCase.isHasSubjectVehicle())
                .vehiclePlate(legalCase.getVehiclePlate())
                .vehicleInfo(legalCase.getVehicleInfo())
                .claimAmount(legalCase.getClaimAmount())
                .dmsRootFolderId(legalCase.getDmsRootFolder() != null
                        ? legalCase.getDmsRootFolder().getId().toString()
                        : null)
                .build();
    }

    private ArbitrationCaseResponse toArbitrationResponse(ArbitrationCase arbitrationCase) {
        return ArbitrationCaseResponse.builder()
                .id(arbitrationCase.getId().toString())
                .licensePlate(arbitrationCase.getLicensePlate())
                .clientNameSurname(arbitrationCase.getClientNameSurname())
                .arbitrationFileNumber(arbitrationCase.getArbitrationFileNumber())
                .courtBasisNumber(arbitrationCase.getCourtBasisNumber())
                .folderName(arbitrationCase.getFolderName())
                .status(arbitrationCase.getStatus())
                .createdAt(arbitrationCase.getCreatedAt())
                .build();
    }

    private DocumentResponse toDocumentResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId().toString())
                .name(document.getName())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .folderPath(document.getFolderPath())
                .currentVersion(document.getCurrentVersion())
                .ocrStatus(document.getOcrStatus())
                .caseId(document.getLegalCase() != null
                        ? document.getLegalCase().getId().toString()
                        : null)
                .arbitrationCaseId(document.getArbitrationCase() != null
                        ? document.getArbitrationCase().getId().toString()
                        : null)
                .uploadedBy(document.getUploadedBy() != null
                        ? document.getUploadedBy().getFullName()
                        : null)
                .uploadedAt(document.getCreatedAt())
                .build();
    }
}
