package com.lawoffice.fms.arbitration.application.service;

import com.lawoffice.fms.arbitration.domain.ArbitrationCase;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.document.domain.DmsSystemFolders;
import com.lawoffice.fms.document.domain.Folder;
import com.lawoffice.fms.document.infrastructure.FolderRepository;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ArbitrationDmsFolderService {

    private final FolderRepository folderRepository;

    public ArbitrationDmsFolderService(FolderRepository folderRepository) {
        this.folderRepository = folderRepository;
    }

    @Transactional
    public Folder provisionRootFolder(ArbitrationCase arbitrationCase) {
        if (arbitrationCase.getDmsRootFolder() != null) {
            return arbitrationCase.getDmsRootFolder();
        }

        Folder parent = getStatusFolder(arbitrationCase.getStatus());
        Folder folder = Folder.builder()
                .name(arbitrationCase.getFolderName())
                .parent(parent)
                .arbitrationCase(arbitrationCase)
                .system(false)
                .build();
        folder.setOrganizationId(arbitrationCase.getOrganizationId());

        Folder saved = folderRepository.save(folder);
        arbitrationCase.setDmsRootFolder(saved);
        return saved;
    }

    @Transactional
    public void syncRootFolder(ArbitrationCase arbitrationCase) {
        Folder root = arbitrationCase.getDmsRootFolder();
        if (root == null) {
            provisionRootFolder(arbitrationCase);
            return;
        }

        if (!Objects.equals(root.getName(), arbitrationCase.getFolderName())) {
            root.setName(arbitrationCase.getFolderName());
        }

        Folder targetParent = getStatusFolder(arbitrationCase.getStatus());
        UUID currentParentId = root.getParent() != null ? root.getParent().getId() : null;
        if (!Objects.equals(currentParentId, targetParent.getId())) {
            root.setParent(targetParent);
        }

        folderRepository.save(root);
    }

    private Folder getStatusFolder(com.lawoffice.fms.arbitration.domain.ArbitrationStatus status) {
        UUID parentId = DmsSystemFolders.statusParentFolderId(status);
        return folderRepository
                .findByIdAndDeletedFalse(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tahkim durum klasörü bulunamadı"));
    }
}
