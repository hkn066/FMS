package com.lawoffice.fms.audit.presentation;

import com.lawoffice.fms.audit.application.AuditQueryService;
import com.lawoffice.fms.audit.application.dto.AuditLogResponse;
import com.lawoffice.fms.common.dto.ApiResponse;
import com.lawoffice.fms.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Audit", description = "Denetim kayıtları ve aktivite akışı")
public class AuditController {

    private final AuditQueryService auditQueryService;

    public AuditController(AuditQueryService auditQueryService) {
        this.auditQueryService = auditQueryService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT','ACCOUNTING')")
    @Operation(summary = "Son aktiviteler (audit log)")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> findRecent(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(auditQueryService.findRecent(pageable)));
    }
}
