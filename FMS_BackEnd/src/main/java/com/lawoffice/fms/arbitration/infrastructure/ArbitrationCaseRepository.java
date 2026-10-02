package com.lawoffice.fms.arbitration.infrastructure;

import com.lawoffice.fms.arbitration.domain.ArbitrationCase;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArbitrationCaseRepository extends JpaRepository<ArbitrationCase, UUID> {

    boolean existsByArbitrationFileNumber(String arbitrationFileNumber);

    @Query("SELECT a FROM ArbitrationCase a WHERE LOWER(a.arbitrationFileNumber) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.courtBasisNumber) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.licensePlate) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.clientNameSurname) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(a.folderName) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<ArbitrationCase> searchArbitrationCases(@Param("q") String q);
}
