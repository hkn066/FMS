package com.lawoffice.fms.casemanagement.application;

import com.lawoffice.fms.casemanagement.domain.LegalCase;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.document.domain.DmsSystemFolders;
import com.lawoffice.fms.document.domain.Folder;
import com.lawoffice.fms.document.infrastructure.FolderRepository;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CaseDmsFolderService {

    private static final List<String> DEFAULT_SUBFOLDERS = List.of(
            "01. Dava Dilekçeleri & Layihalar",
            "02. Duruşma & Tensip Tutanakları",
            "03. Deliller & Belgeler",
            "04. Bilirkişi & Uzman Raporları",
            "05. Karar & İlam"
    );

    private final FolderRepository folderRepository;

    public CaseDmsFolderService(FolderRepository folderRepository) {
        this.folderRepository = folderRepository;
    }

    @Transactional
    public Folder provisionRootFolder(LegalCase legalCase) {
        if (legalCase.getDmsRootFolder() != null) {
            return legalCase.getDmsRootFolder();
        }

        Folder generalRoot = getGeneralRootFolder(legalCase.getOrganizationId());

        String folderName = legalCase.computeFolderName();
        Folder root = Folder.builder()
                .name(folderName)
                .parent(generalRoot)
                .legalCase(legalCase)
                .system(false)
                .build();
        root.setOrganizationId(legalCase.getOrganizationId());

        Folder savedRoot = folderRepository.save(root);
        legalCase.setDmsRootFolder(savedRoot);

        for (String subName : DEFAULT_SUBFOLDERS) {
            Folder sub = Folder.builder()
                    .name(subName)
                    .parent(savedRoot)
                    .legalCase(legalCase)
                    .system(false)
                    .build();
            sub.setOrganizationId(legalCase.getOrganizationId());
            folderRepository.save(sub);
        }

        return savedRoot;
    }

    @Transactional
    public void syncRootFolder(LegalCase legalCase) {
        Folder root = legalCase.getDmsRootFolder();
        if (root == null) {
            provisionRootFolder(legalCase);
            return;
        }

        String expectedName = legalCase.computeFolderName();
        if (!Objects.equals(root.getName(), expectedName)) {
            root.setName(expectedName);
            folderRepository.save(root);
        }
    }

    private Folder getGeneralRootFolder(UUID organizationId) {
        return folderRepository
                .findByIdAndDeletedFalse(DmsSystemFolders.GENERAL_ROOT)
                .orElseGet(() -> folderRepository
                        .findByOrganizationIdAndNameAndParentIsNullAndDeletedFalse(organizationId, "Genel Davalar")
                        .orElseThrow(() -> new ResourceNotFoundException("Genel Davalar kök klasörü bulunamadı")));
    }
}
