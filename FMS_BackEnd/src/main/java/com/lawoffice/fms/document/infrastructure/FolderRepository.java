package com.lawoffice.fms.document.infrastructure;

import com.lawoffice.fms.document.domain.Folder;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FolderRepository extends JpaRepository<Folder, UUID> {

    List<Folder> findByOrganizationIdAndDeletedFalse(UUID organizationId);

    List<Folder> findByParentIdAndOrganizationIdAndDeletedFalse(UUID parentId, UUID organizationId);

    List<Folder> findByParentIsNullAndOrganizationIdAndDeletedFalse(UUID organizationId);

    Optional<Folder> findByIdAndDeletedFalse(UUID id);

    Optional<Folder> findByOrganizationIdAndNameAndParentIsNullAndDeletedFalse(
            UUID organizationId, String name);

    Optional<Folder> findByOrganizationIdAndNameAndParentIdAndDeletedFalse(
            UUID organizationId, String name, UUID parentId);

    long countByParentIdAndDeletedFalse(UUID parentId);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.folder.id = :folderId AND d.deleted = false")
    long countDocumentsInFolder(@Param("folderId") UUID folderId);
}
