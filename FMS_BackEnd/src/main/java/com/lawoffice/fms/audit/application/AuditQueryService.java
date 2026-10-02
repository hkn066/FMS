package com.lawoffice.fms.audit.application;

import com.lawoffice.fms.audit.application.dto.AuditLogResponse;
import com.lawoffice.fms.audit.domain.AuditLog;
import com.lawoffice.fms.audit.infrastructure.AuditLogRepository;
import com.lawoffice.fms.common.dto.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AuditQueryService {

    private final AuditLogRepository auditLogRepository;

    public AuditQueryService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public PageResponse<AuditLogResponse> findRecent(Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findByDeletedFalseOrderByCreatedAtDesc(pageable);
        return PageResponse.<AuditLogResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId().toString())
                .username(log.getUsername())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId() != null ? log.getEntityId().toString() : null)
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
