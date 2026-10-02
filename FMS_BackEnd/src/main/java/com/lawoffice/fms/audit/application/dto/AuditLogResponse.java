package com.lawoffice.fms.audit.application.dto;

import com.lawoffice.fms.audit.domain.AuditAction;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuditLogResponse {

    private String id;
    private String username;
    private AuditAction action;
    private String entityType;
    private String entityId;
    private String details;
    private Instant createdAt;
}
