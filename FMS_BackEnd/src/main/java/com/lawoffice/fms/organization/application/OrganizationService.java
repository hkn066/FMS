package com.lawoffice.fms.organization.application;

import com.lawoffice.fms.audit.application.AuditService;
import com.lawoffice.fms.audit.domain.AuditAction;
import com.lawoffice.fms.common.dto.PageResponse;
import com.lawoffice.fms.common.exception.BusinessException;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.organization.application.dto.OrganizationRequestDto;
import com.lawoffice.fms.organization.application.dto.OrganizationResponseDto;
import com.lawoffice.fms.organization.domain.Organization;
import com.lawoffice.fms.organization.domain.OrganizationConstants;
import com.lawoffice.fms.organization.domain.SubscriptionPlan;
import com.lawoffice.fms.organization.domain.SubscriptionStatus;
import com.lawoffice.fms.organization.infrastructure.OrganizationRepository;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final AuditService auditService;

    public OrganizationService(OrganizationRepository organizationRepository, AuditService auditService) {
        this.organizationRepository = organizationRepository;
        this.auditService = auditService;
    }

    public PageResponse<OrganizationResponseDto> findAll(Pageable pageable) {
        Page<Organization> page = organizationRepository.findAll(pageable);
        return toPageResponse(page);
    }

    public OrganizationResponseDto findById(UUID id) {
        return toResponse(getOrganization(id));
    }

    @Transactional
    public OrganizationResponseDto create(OrganizationRequestDto request) {
        String normalizedSubDomain = normalizeSubDomain(request.getSubDomain());

        if (organizationRepository.existsBySubDomainAndDeletedFalse(normalizedSubDomain)) {
            throw new BusinessException("Bu alt alan adı zaten kullanımda");
        }

        validateSubscriptionLicense(request);

        Organization organization = Organization.builder()
                .name(request.getName().trim())
                .subDomain(normalizedSubDomain)
                .subscriptionPlan(request.getSubscriptionPlan())
                .subscriptionStatus(request.getSubscriptionStatus())
                .maxUsers(resolveMaxUsers(request))
                .expiresAt(request.getExpiresAt())
                .build();

        Organization saved = organizationRepository.save(organization);
        auditService.log(AuditAction.CREATE, "Organization", saved.getId(), "Organization created: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public OrganizationResponseDto update(UUID id, OrganizationRequestDto request) {
        Organization organization = getOrganization(id);
        String normalizedSubDomain = normalizeSubDomain(request.getSubDomain());

        if (organizationRepository.existsBySubDomainAndDeletedFalseAndIdNot(normalizedSubDomain, id)) {
            throw new BusinessException("Bu alt alan adı zaten kullanımda");
        }

        validateSubscriptionLicense(request);
        validateSystemTenantProtection(id);

        organization.setName(request.getName().trim());
        organization.setSubDomain(normalizedSubDomain);
        organization.setSubscriptionPlan(request.getSubscriptionPlan());
        organization.setSubscriptionStatus(request.getSubscriptionStatus());
        organization.setMaxUsers(resolveMaxUsers(request));
        organization.setExpiresAt(request.getExpiresAt());

        Organization saved = organizationRepository.save(organization);
        auditService.log(AuditAction.UPDATE, "Organization", saved.getId(), "Organization updated");
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID id) {
        validateSystemTenantProtection(id);

        Organization organization = getOrganization(id);
        organization.setDeleted(true);
        organization.setDeletedAt(Instant.now());
        organizationRepository.save(organization);
        auditService.log(AuditAction.DELETE, "Organization", id, "Organization soft deleted");
    }

    private Organization getOrganization(UUID id) {
        return organizationRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kurum bulunamadı"));
    }

    private void validateSystemTenantProtection(UUID id) {
        if (OrganizationConstants.DEFAULT_ORGANIZATION_ID.equals(id)) {
            throw new BusinessException("Sistem kiracısı silinemez veya değiştirilemez");
        }
    }

    private void validateSubscriptionLicense(OrganizationRequestDto request) {
        if (request.getSubscriptionStatus() == SubscriptionStatus.EXPIRED
                && request.getExpiresAt() == null) {
            throw new BusinessException("Süresi dolmuş abonelik için bitiş tarihi belirtilmelidir");
        }

        if (request.getExpiresAt() != null && request.getExpiresAt().isBefore(Instant.now())
                && request.getSubscriptionStatus() == SubscriptionStatus.ACTIVE) {
            throw new BusinessException("Abonelik bitiş tarihi geçmiş; durum ACTIVE olamaz");
        }

        int planLimit = planUserLimit(request.getSubscriptionPlan());
        if (request.getMaxUsers() > planLimit) {
            throw new BusinessException(
                    "Seçilen plan için maksimum kullanıcı limiti aşıldı (plan limiti: " + planLimit + ")");
        }
    }

    private int planUserLimit(SubscriptionPlan plan) {
        return switch (plan) {
            case FREE -> 5;
            case PROFESSIONAL -> 25;
            case ENTERPRISE -> 999;
        };
    }

    private int resolveMaxUsers(OrganizationRequestDto request) {
        int planLimit = planUserLimit(request.getSubscriptionPlan());
        return Math.min(request.getMaxUsers(), planLimit);
    }

    private String normalizeSubDomain(String subDomain) {
        return subDomain.trim().toLowerCase(Locale.ROOT);
    }

    private OrganizationResponseDto toResponse(Organization organization) {
        return OrganizationResponseDto.builder()
                .id(organization.getId().toString())
                .name(organization.getName())
                .subDomain(organization.getSubDomain())
                .subscriptionPlan(organization.getSubscriptionPlan())
                .subscriptionStatus(organization.getSubscriptionStatus())
                .maxUsers(organization.getMaxUsers())
                .expiresAt(organization.getExpiresAt())
                .createdAt(organization.getCreatedAt())
                .updatedAt(organization.getUpdatedAt())
                .build();
    }

    private PageResponse<OrganizationResponseDto> toPageResponse(Page<Organization> page) {
        return PageResponse.<OrganizationResponseDto>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
