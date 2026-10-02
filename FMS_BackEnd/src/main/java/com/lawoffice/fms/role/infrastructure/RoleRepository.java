package com.lawoffice.fms.role.infrastructure;

import com.lawoffice.fms.role.domain.Role;
import com.lawoffice.fms.role.domain.RoleName;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, UUID> {

    Optional<Role> findByName(RoleName name);
}
