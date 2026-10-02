package com.lawoffice.fms.document.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.lawoffice.fms.arbitration.infrastructure.ArbitrationCaseRepository;
import com.lawoffice.fms.audit.application.AuditService;
import com.lawoffice.fms.casemanagement.infrastructure.CaseRepository;
import com.lawoffice.fms.common.exception.BusinessException;
import com.lawoffice.fms.common.tenant.TenantContext;
import com.lawoffice.fms.document.application.dto.FolderRequest;
import com.lawoffice.fms.document.domain.Folder;
import com.lawoffice.fms.document.infrastructure.FolderRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FolderServiceTest {

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private CaseRepository caseRepository;

    @Mock
    private ArbitrationCaseRepository arbitrationCaseRepository;

    @Mock
    private DmsFolderHierarchyService dmsFolderHierarchyService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private FolderService folderService;

    private UUID orgId;

    @BeforeEach
    void setUp() {
        orgId = UUID.randomUUID();
        TenantContext.set(orgId);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void moveFolder_throwsWhenTargetIsDescendant() {
        UUID parentId = UUID.randomUUID();
        UUID childId = UUID.randomUUID();

        Folder parent = folder(parentId, "Parent", null);
        Folder child = folder(childId, "Child", parent);

        when(folderRepository.findByIdAndDeletedFalse(parentId)).thenReturn(Optional.of(parent));
        when(folderRepository.findByIdAndDeletedFalse(childId)).thenReturn(Optional.of(child));
        when(folderRepository.findByParentIdAndOrganizationIdAndDeletedFalse(parentId, orgId))
                .thenReturn(List.of(child));
        when(folderRepository.findByParentIdAndOrganizationIdAndDeletedFalse(childId, orgId))
                .thenReturn(List.of());

        assertThrows(BusinessException.class, () -> folderService.moveFolder(parentId, childId));
    }

    @Test
    void deleteFolder_throwsWhenNotEmpty() {
        UUID folderId = UUID.randomUUID();
        Folder folder = folder(folderId, "Docs", null);

        when(folderRepository.findByIdAndDeletedFalse(folderId)).thenReturn(Optional.of(folder));
        when(folderRepository.countByParentIdAndDeletedFalse(folderId)).thenReturn(1L);

        assertThrows(BusinessException.class, () -> folderService.deleteFolder(folderId));
    }

    @Test
    void renameFolder_throwsForSystemFolder() {
        UUID folderId = UUID.randomUUID();
        Folder folder = folder(folderId, "Sigorta Tahkim", null);
        folder.setSystem(true);

        when(folderRepository.findByIdAndDeletedFalse(folderId)).thenReturn(Optional.of(folder));

        FolderRequest request = new FolderRequest();
        request.setName("Yeni Ad");

        assertThrows(BusinessException.class, () -> folderService.renameFolder(folderId, request));
    }

    @Test
    void createFolder_savesWithOrganization() {
        FolderRequest request = new FolderRequest();
        request.setName("Yeni Klasör");

        when(folderRepository.save(any(Folder.class))).thenAnswer(inv -> {
            Folder f = inv.getArgument(0);
            f.setId(UUID.randomUUID());
            return f;
        });

        var response = folderService.createFolder(request);

        assertEquals("Yeni Klasör", response.getName());
        verify(folderRepository).save(any(Folder.class));
    }

    private Folder folder(UUID id, String name, Folder parent) {
        Folder folder = Folder.builder().name(name).parent(parent).build();
        folder.setId(id);
        folder.setOrganizationId(orgId);
        return folder;
    }
}
