package com.lawoffice.fms.audit.infrastructure;

import com.lawoffice.fms.audit.domain.AuditLog;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findByDeletedFalseOrderByCreatedAtDesc(Pageable pageable);
}
