package com.lawoffice.fms.arbitration.infrastructure;

import com.lawoffice.fms.arbitration.domain.ArbitrationDocument;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArbitrationDocumentRepository extends JpaRepository<ArbitrationDocument, UUID> {

    List<ArbitrationDocument> findByArbitrationCaseIdOrderByCreatedAtDesc(UUID arbitrationCaseId);

    Optional<ArbitrationDocument> findByIdAndArbitrationCaseId(UUID id, UUID arbitrationCaseId);
}
