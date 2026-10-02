package com.lawoffice.fms.casemanagement.infrastructure;

import com.lawoffice.fms.casemanagement.domain.CaseStatus;
import com.lawoffice.fms.casemanagement.domain.LegalCase;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CaseRepository extends JpaRepository<LegalCase, UUID> {

    boolean existsByCaseNumber(String caseNumber);

    long countByStatusNot(CaseStatus status);

    java.util.List<LegalCase> findByDeletedFalse();

    @Query("SELECT c.caseNumber FROM LegalCase c WHERE c.caseNumber LIKE CONCAT(:yearPrefix, '/%')")
    List<String> findCaseNumbersByYearPrefix(@Param("yearPrefix") String yearPrefix);

    @Query("SELECT c FROM LegalCase c WHERE LOWER(c.caseNumber) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(c.title) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(c.description) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(c.court) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(c.category) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR (c.courtBasisNumber IS NOT NULL AND LOWER(c.courtBasisNumber) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "OR (c.vehiclePlate IS NOT NULL AND LOWER(c.vehiclePlate) LIKE LOWER(CONCAT('%', :q, '%'))) " +
            "OR (c.counterpartyName IS NOT NULL AND LOWER(c.counterpartyName) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<LegalCase> searchCases(@Param("q") String q);
}
