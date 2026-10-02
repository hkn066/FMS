package com.lawoffice.fms.organization.infrastructure;

import com.lawoffice.fms.organization.domain.Organization;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    Optional<Organization> findBySubDomainAndDeletedFalse(String subDomain);

    boolean existsBySubDomainAndDeletedFalse(String subDomain);

    boolean existsBySubDomainAndDeletedFalseAndIdNot(String subDomain, UUID id);
}
