package com.lawoffice.fms.client.infrastructure;

import com.lawoffice.fms.client.domain.Client;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClientRepository extends JpaRepository<Client, UUID> {

    boolean existsByEmail(String email);

    @Query("SELECT c FROM Client c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(c.email) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(c.taxNumber) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Client> searchClients(@Param("q") String q);
}
