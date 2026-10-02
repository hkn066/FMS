package com.lawoffice.fms.document.application;

import com.lawoffice.fms.document.domain.DmsSystemFolders;
import com.lawoffice.fms.document.domain.Folder;
import com.lawoffice.fms.document.infrastructure.FolderRepository;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DmsFolderHierarchyService {

    private static final String GENERAL_ROOT_NAME = "Genel Davalar";
    private static final String ARBITRATION_ROOT_NAME = "Sigorta Tahkim";

    private static final List<String> GENERAL_ROOT_ALIASES =
            List.of(GENERAL_ROOT_NAME, "Genel Dosyalar");
    private static final List<String> ARBITRATION_ROOT_ALIASES =
            List.of(ARBITRATION_ROOT_NAME, "Tahkim Dosyaları");

    private static final List<String> ARBITRATION_STATUS_FOLDERS = List.of(
            "Ön Başvuru",
            "Yeni Başvuru",
            "Komisyonda",
            "Eksper İncelemesi",
            "Karar",
            "Kapalı");

    private static final Set<UUID> SEED_GENERAL_FOLDER_IDS = Set.of(
            UUID.fromString("88888888-8888-8888-8888-888888888811"),
            UUID.fromString("88888888-8888-8888-8888-888888888812"),
            UUID.fromString("88888888-8888-8888-8888-888888888813"),
            UUID.fromString("88888888-8888-8888-8888-888888888814"),
            UUID.fromString("88888888-8888-8888-8888-888888888817"));

    private final FolderRepository folderRepository;

    public DmsFolderHierarchyService(FolderRepository folderRepository) {
        this.folderRepository = folderRepository;
    }

    @Transactional
    public void ensureOrganizationHierarchy(UUID organizationId) {
        Folder generalRoot = ensureSystemRoot(
                organizationId, DmsSystemFolders.GENERAL_ROOT, GENERAL_ROOT_ALIASES, GENERAL_ROOT_NAME);
        Folder arbitrationRoot = ensureSystemRoot(
                organizationId,
                DmsSystemFolders.ARBITRATION_ROOT,
                ARBITRATION_ROOT_ALIASES,
                ARBITRATION_ROOT_NAME);

        ensureArbitrationStatusFolders(organizationId, arbitrationRoot);
        reparentSeedGeneralFolders(organizationId, generalRoot);
        reparentOrphanRootFolders(organizationId, generalRoot, arbitrationRoot);
    }

    private Folder ensureSystemRoot(
            UUID organizationId,
            UUID defaultOrgSeedId,
            List<String> aliases,
            String canonicalName) {
        Optional<Folder> existing = folderRepository.findByIdAndDeletedFalse(defaultOrgSeedId);
        if (existing.isPresent() && Objects.equals(existing.get().getOrganizationId(), organizationId)) {
            Folder folder = existing.get();
            if (!canonicalName.equals(folder.getName())) {
                folder.setName(canonicalName);
                folderRepository.save(folder);
            }
            return folder;
        }

        for (String alias : aliases) {
            Optional<Folder> byName = folderRepository
                    .findByOrganizationIdAndNameAndParentIsNullAndDeletedFalse(organizationId, alias);
            if (byName.isPresent()) {
                Folder folder = byName.get();
                if (!canonicalName.equals(folder.getName())) {
                    folder.setName(canonicalName);
                    folder.setSystem(true);
                    folderRepository.save(folder);
                }
                return folder;
            }
        }

        Folder created = Folder.builder().name(canonicalName).system(true).build();
        created.setOrganizationId(organizationId);
        return folderRepository.save(created);
    }

    private void ensureArbitrationStatusFolders(UUID organizationId, Folder arbitrationRoot) {
        for (String statusName : ARBITRATION_STATUS_FOLDERS) {
            Optional<Folder> existing = folderRepository.findByOrganizationIdAndNameAndParentIdAndDeletedFalse(
                    organizationId, statusName, arbitrationRoot.getId());
            if (existing.isPresent()) {
                Folder folder = existing.get();
                if (!folder.isSystem()) {
                    folder.setSystem(true);
                    folderRepository.save(folder);
                }
                continue;
            }

            Folder statusFolder = Folder.builder()
                    .name(statusName)
                    .parent(arbitrationRoot)
                    .system(true)
                    .build();
            statusFolder.setOrganizationId(organizationId);
            folderRepository.save(statusFolder);
        }
    }

    private void reparentSeedGeneralFolders(UUID organizationId, Folder generalRoot) {
        for (UUID folderId : SEED_GENERAL_FOLDER_IDS) {
            folderRepository.findByIdAndDeletedFalse(folderId).ifPresent(folder -> {
                if (!Objects.equals(folder.getOrganizationId(), organizationId)) {
                    return;
                }
                UUID currentParentId =
                        folder.getParent() != null ? folder.getParent().getId() : null;
                if (!Objects.equals(currentParentId, generalRoot.getId())) {
                    folder.setParent(generalRoot);
                    folderRepository.save(folder);
                }
            });
        }
    }

    private void reparentOrphanRootFolders(UUID organizationId, Folder generalRoot, Folder arbitrationRoot) {
        List<Folder> roots = folderRepository.findByParentIsNullAndOrganizationIdAndDeletedFalse(organizationId);
        for (Folder folder : roots) {
            if (folder.isSystem()) {
                continue;
            }
            if (folder.getId().equals(generalRoot.getId()) || folder.getId().equals(arbitrationRoot.getId())) {
                continue;
            }
            folder.setParent(generalRoot);
            folderRepository.save(folder);
        }
    }
}
