package com.lawoffice.fms.arbitration.application.service;

import com.lawoffice.fms.arbitration.application.dto.ArbitrationCaseResponse;
import com.lawoffice.fms.arbitration.application.dto.CreateArbitrationCaseRequest;
import com.lawoffice.fms.arbitration.application.dto.UpdateArbitrationCaseRequest;
import com.lawoffice.fms.arbitration.domain.ArbitrationCase;
import com.lawoffice.fms.arbitration.domain.ArbitrationStatus;
import com.lawoffice.fms.arbitration.infrastructure.ArbitrationCaseRepository;
import com.lawoffice.fms.audit.application.AuditService;
import com.lawoffice.fms.audit.domain.AuditAction;
import com.lawoffice.fms.common.dto.PageResponse;
import com.lawoffice.fms.common.exception.BusinessException;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.common.tenant.TenantContext;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ArbitrationServiceImpl implements ArbitrationService {

    private final ArbitrationCaseRepository arbitrationCaseRepository;
    private final ArbitrationDmsFolderService arbitrationDmsFolderService;
    private final AuditService auditService;

    public ArbitrationServiceImpl(
            ArbitrationCaseRepository arbitrationCaseRepository,
            ArbitrationDmsFolderService arbitrationDmsFolderService,
            AuditService auditService) {
        this.arbitrationCaseRepository = arbitrationCaseRepository;
        this.arbitrationDmsFolderService = arbitrationDmsFolderService;
        this.auditService = auditService;
    }

    @Override
    @Transactional
    public ArbitrationCaseResponse create(CreateArbitrationCaseRequest request) {
        TenantContext.requireOrganizationId();

        String arbitrationFileNumber = normalizeOptional(request.getArbitrationFileNumber());
        if (arbitrationFileNumber != null
                && arbitrationCaseRepository.existsByArbitrationFileNumber(arbitrationFileNumber)) {
            throw new BusinessException("Bu tahkim dosya numarası zaten kullanılıyor");
        }

        ArbitrationCase arbitrationCase = ArbitrationCase.builder()
                .licensePlate(request.getLicensePlate().trim())
                .clientNameSurname(request.getClientNameSurname().trim())
                .arbitrationFileNumber(arbitrationFileNumber)
                .courtBasisNumber(normalizeOptional(request.getCourtBasisNumber()))
                .status(request.getStatus() != null ? request.getStatus() : ArbitrationStatus.PRE_APPLICATION)
                .build();

        ArbitrationCase saved = arbitrationCaseRepository.save(arbitrationCase);
        arbitrationDmsFolderService.provisionRootFolder(saved);
        saved = arbitrationCaseRepository.save(saved);
        auditService.log(
                AuditAction.CREATE,
                "ArbitrationCase",
                saved.getId(),
                "Arbitration case created: " + saved.getFolderName());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ArbitrationCaseResponse update(UUID id, UpdateArbitrationCaseRequest request) {
        ArbitrationCase arbitrationCase = getArbitrationCase(id);

        if (request.getLicensePlate() != null) {
            if (request.getLicensePlate().isBlank()) {
                throw new BusinessException("Araç plakası boş olamaz");
            }
            arbitrationCase.setLicensePlate(request.getLicensePlate().trim());
        }
        if (request.getClientNameSurname() != null) {
            if (request.getClientNameSurname().isBlank()) {
                throw new BusinessException("Müvekkil ad soyad boş olamaz");
            }
            arbitrationCase.setClientNameSurname(request.getClientNameSurname().trim());
        }
        if (request.getArbitrationFileNumber() != null) {
            String arbitrationFileNumber = normalizeOptional(request.getArbitrationFileNumber());
            if (arbitrationFileNumber != null
                    && !arbitrationFileNumber.equals(arbitrationCase.getArbitrationFileNumber())
                    && arbitrationCaseRepository.existsByArbitrationFileNumber(arbitrationFileNumber)) {
                throw new BusinessException("Bu tahkim dosya numarası zaten kullanılıyor");
            }
            arbitrationCase.setArbitrationFileNumber(arbitrationFileNumber);
        }
        if (request.getCourtBasisNumber() != null) {
            arbitrationCase.setCourtBasisNumber(normalizeOptional(request.getCourtBasisNumber()));
        }
        if (request.getStatus() != null) {
            arbitrationCase.setStatus(request.getStatus());
        }

        ArbitrationCase saved = arbitrationCaseRepository.save(arbitrationCase);
        arbitrationDmsFolderService.syncRootFolder(saved);
        saved = arbitrationCaseRepository.save(saved);
        auditService.log(AuditAction.UPDATE, "ArbitrationCase", saved.getId(), "Arbitration case updated");
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ArbitrationCaseResponse getById(UUID id) {
        return toResponse(getArbitrationCase(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ArbitrationCaseResponse> getAll(Pageable pageable) {
        Page<ArbitrationCase> page = arbitrationCaseRepository.findAll(pageable);
        return PageResponse.<ArbitrationCaseResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        ArbitrationCase arbitrationCase = getArbitrationCase(id);
        arbitrationCase.markDeleted();
        arbitrationCaseRepository.save(arbitrationCase);
        auditService.log(AuditAction.DELETE, "ArbitrationCase", id, "Arbitration case soft deleted");
    }

    private ArbitrationCase getArbitrationCase(UUID id) {
        return arbitrationCaseRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tahkim dosyası bulunamadı"));
    }

    private ArbitrationCaseResponse toResponse(ArbitrationCase arbitrationCase) {
        return ArbitrationCaseResponse.builder()
                .id(arbitrationCase.getId().toString())
                .licensePlate(arbitrationCase.getLicensePlate())
                .clientNameSurname(arbitrationCase.getClientNameSurname())
                .arbitrationFileNumber(arbitrationCase.getArbitrationFileNumber())
                .courtBasisNumber(arbitrationCase.getCourtBasisNumber())
                .folderName(arbitrationCase.getFolderName())
                .dmsRootFolderId(
                        arbitrationCase.getDmsRootFolder() != null
                                ? arbitrationCase.getDmsRootFolder().getId().toString()
                                : null)
                .status(arbitrationCase.getStatus())
                .createdAt(arbitrationCase.getCreatedAt())
                .build();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
