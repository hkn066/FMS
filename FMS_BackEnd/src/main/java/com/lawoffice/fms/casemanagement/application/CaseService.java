package com.lawoffice.fms.casemanagement.application;

import com.lawoffice.fms.audit.application.AuditService;
import com.lawoffice.fms.audit.domain.AuditAction;
import com.lawoffice.fms.casemanagement.application.dto.CaseRequest;
import com.lawoffice.fms.casemanagement.application.dto.CaseResponse;
import com.lawoffice.fms.casemanagement.domain.CaseStatus;
import com.lawoffice.fms.casemanagement.domain.LegalCase;
import com.lawoffice.fms.casemanagement.infrastructure.CaseRepository;
import com.lawoffice.fms.client.infrastructure.ClientRepository;
import com.lawoffice.fms.common.dto.PageResponse;
import com.lawoffice.fms.common.exception.BusinessException;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.common.tenant.TenantContext;
import com.lawoffice.fms.user.infrastructure.UserRepository;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CaseService {

    private final CaseRepository caseRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final CaseNumberService caseNumberService;
    private final CaseDmsFolderService caseDmsFolderService;

    public CaseService(
            CaseRepository caseRepository,
            ClientRepository clientRepository,
            UserRepository userRepository,
            AuditService auditService,
            CaseNumberService caseNumberService,
            CaseDmsFolderService caseDmsFolderService) {
        this.caseRepository = caseRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.caseNumberService = caseNumberService;
        this.caseDmsFolderService = caseDmsFolderService;
    }

    @Transactional(readOnly = true)
    public PageResponse<CaseResponse> findAll(Pageable pageable) {
        Page<LegalCase> page = caseRepository.findAll(pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public CaseResponse findById(UUID id) {
        return toResponse(getCase(id));
    }

    @Transactional(readOnly = true)
    public String getNextCaseNumber() {
        return caseNumberService.generateNextCaseNumber();
    }

    @Transactional
    public CaseResponse create(CaseRequest request) {
        TenantContext.requireOrganizationId();

        String caseNumber = request.getCaseNumber();
        if (caseNumber == null || caseNumber.trim().isEmpty()) {
            caseNumber = caseNumberService.generateNextCaseNumber();
        } else {
            caseNumber = caseNumber.trim();
        }

        if (caseRepository.existsByCaseNumber(caseNumber)) {
            throw new BusinessException("Bu dosya numarası zaten kullanılıyor: " + caseNumber);
        }

        var client = clientRepository
                .findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Müvekkil bulunamadı"));

        boolean hasVehicle = Boolean.TRUE.equals(request.getHasSubjectVehicle());
        String plate = hasVehicle && request.getVehiclePlate() != null
                ? request.getVehiclePlate().trim().toUpperCase()
                : null;

        LegalCase legalCase = LegalCase.builder()
                .caseNumber(caseNumber)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .client(client)
                .court(request.getCourt() != null ? request.getCourt().trim() : null)
                .category(request.getCategory() != null ? request.getCategory().trim() : null)
                .openedAt(request.getOpenedAt() != null ? request.getOpenedAt() : LocalDate.now())
                .nextHearing(request.getNextHearing())
                .status(request.getStatus() != null ? request.getStatus() : CaseStatus.ACTIVE)
                .courtBasisNumber(request.getCourtBasisNumber() != null ? request.getCourtBasisNumber().trim() : null)
                .decisionNumber(request.getDecisionNumber() != null ? request.getDecisionNumber().trim() : null)
                .clientRole(request.getClientRole() != null && !request.getClientRole().isBlank()
                        ? request.getClientRole().trim()
                        : "DAVACI")
                .counterpartyName(request.getCounterpartyName() != null ? request.getCounterpartyName().trim() : null)
                .counterpartyLawyer(request.getCounterpartyLawyer() != null ? request.getCounterpartyLawyer().trim() : null)
                .hasSubjectVehicle(hasVehicle)
                .vehiclePlate(plate)
                .vehicleInfo(hasVehicle && request.getVehicleInfo() != null ? request.getVehicleInfo().trim() : null)
                .claimAmount(request.getClaimAmount())
                .build();

        if (request.getLawyerId() != null) {
            userRepository.findById(request.getLawyerId()).ifPresent(legalCase::setAssignedLawyer);
        }

        LegalCase saved = caseRepository.save(legalCase);

        // DMS kök ve şablon klasörlerini oluştur
        caseDmsFolderService.provisionRootFolder(saved);

        auditService.log(AuditAction.CREATE, "Case", saved.getId(), "Case created: " + saved.getCaseNumber());
        return toResponse(saved);
    }

    @Transactional
    public CaseResponse update(UUID id, CaseRequest request) {
        LegalCase legalCase = getCase(id);
        legalCase.setTitle(request.getTitle().trim());
        legalCase.setDescription(request.getDescription());
        legalCase.setCourt(request.getCourt() != null ? request.getCourt().trim() : null);
        legalCase.setCategory(request.getCategory() != null ? request.getCategory().trim() : null);
        legalCase.setNextHearing(request.getNextHearing());

        if (request.getStatus() != null) {
            legalCase.setStatus(request.getStatus());
            if (request.getStatus() == CaseStatus.CLOSED) {
                legalCase.setClosedAt(LocalDate.now());
            }
        }

        if (request.getLawyerId() != null) {
            userRepository.findById(request.getLawyerId()).ifPresent(legalCase::setAssignedLawyer);
        }

        legalCase.setCourtBasisNumber(request.getCourtBasisNumber() != null ? request.getCourtBasisNumber().trim() : null);
        legalCase.setDecisionNumber(request.getDecisionNumber() != null ? request.getDecisionNumber().trim() : null);
        if (request.getClientRole() != null && !request.getClientRole().isBlank()) {
            legalCase.setClientRole(request.getClientRole().trim());
        }
        legalCase.setCounterpartyName(request.getCounterpartyName() != null ? request.getCounterpartyName().trim() : null);
        legalCase.setCounterpartyLawyer(request.getCounterpartyLawyer() != null ? request.getCounterpartyLawyer().trim() : null);

        if (request.getHasSubjectVehicle() != null) {
            boolean hasVehicle = request.getHasSubjectVehicle();
            legalCase.setHasSubjectVehicle(hasVehicle);
            legalCase.setVehiclePlate(hasVehicle && request.getVehiclePlate() != null ? request.getVehiclePlate().trim().toUpperCase() : null);
            legalCase.setVehicleInfo(hasVehicle && request.getVehicleInfo() != null ? request.getVehicleInfo().trim() : null);
        }

        if (request.getClaimAmount() != null) {
            legalCase.setClaimAmount(request.getClaimAmount());
        }

        LegalCase saved = caseRepository.save(legalCase);

        // DMS klasör ismini yeni esas/mahkeme/plaka durumuna göre güncelle
        caseDmsFolderService.syncRootFolder(saved);

        auditService.log(AuditAction.UPDATE, "Case", saved.getId(), "Case updated");
        return toResponse(saved);
    }

    @Transactional
    public void close(UUID id) {
        LegalCase legalCase = getCase(id);
        legalCase.setStatus(CaseStatus.CLOSED);
        legalCase.setClosedAt(LocalDate.now());
        caseRepository.save(legalCase);
        auditService.log(AuditAction.UPDATE, "Case", id, "Case closed");
    }

    private LegalCase getCase(UUID id) {
        return caseRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dava bulunamadı"));
    }

    private CaseResponse toResponse(LegalCase legalCase) {
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

    private PageResponse<CaseResponse> toPageResponse(Page<LegalCase> page) {
        return PageResponse.<CaseResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
