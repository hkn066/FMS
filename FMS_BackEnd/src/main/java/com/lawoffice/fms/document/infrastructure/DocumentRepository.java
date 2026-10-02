package com.lawoffice.fms.document.infrastructure;

import com.lawoffice.fms.document.domain.Document;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocumentRepository extends JpaRepository<Document, UUID> {

    Page<Document> findByDeletedFalse(Pageable pageable);

    Optional<Document> findByIdAndDeletedFalse(UUID id);

    Page<Document> findByLegalCaseIdAndDeletedFalse(UUID caseId, Pageable pageable);

    Page<Document> findByArbitrationCaseIdAndDeletedFalse(UUID arbitrationCaseId, Pageable pageable);

    Page<Document> findByFolderIdAndDeletedFalse(UUID folderId, Pageable pageable);

    Page<Document> findByFolderIsNullAndDeletedFalse(Pageable pageable);

    @Query("SELECT DISTINCT d FROM Document d LEFT JOIN d.tags t WHERE LOWER(d.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(d.contentType) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(t.name) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Document> searchDocuments(@Param("q") String q);
}
