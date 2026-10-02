package com.lawoffice.fms.document.application;

import com.lawoffice.fms.arbitration.infrastructure.ArbitrationCaseRepository;
import com.lawoffice.fms.audit.application.AuditService;
import com.lawoffice.fms.audit.domain.AuditAction;
import com.lawoffice.fms.casemanagement.infrastructure.CaseRepository;
import com.lawoffice.fms.common.exception.BusinessException;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.common.tenant.TenantContext;
import com.lawoffice.fms.document.application.dto.FolderRequest;
import com.lawoffice.fms.document.application.dto.FolderResponse;
import com.lawoffice.fms.document.domain.Folder;
import com.lawoffice.fms.document.infrastructure.FolderRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FolderService {

    private final FolderRepository folderRepository;
    private final CaseRepository caseRepository;
    private final ArbitrationCaseRepository arbitrationCaseRepository;
    private final DmsFolderHierarchyService dmsFolderHierarchyService;
    private final AuditService auditService;

    public FolderService(
            FolderRepository folderRepository,
            CaseRepository caseRepository,
            ArbitrationCaseRepository arbitrationCaseRepository,
            DmsFolderHierarchyService dmsFolderHierarchyService,
            AuditService auditService) {
        this.folderRepository = folderRepository;
        this.caseRepository = caseRepository;
        this.arbitrationCaseRepository = arbitrationCaseRepository;
        this.dmsFolderHierarchyService = dmsFolderHierarchyService;
        this.auditService = auditService;
    }

    @Transactional
    public List<FolderResponse> getTree(UUID caseId, UUID arbitrationCaseId) {
        UUID organizationId = TenantContext.requireOrganizationId();
        dmsFolderHierarchyService.ensureOrganizationHierarchy(organizationId);
        List<Folder> folders = folderRepository.findByOrganizationIdAndDeletedFalse(organizationId);

        if (caseId != null && arbitrationCaseId != null) {
            throw new BusinessException("caseId ve arbitrationCaseId aynı anda kullanılamaz");
        }

        if (arbitrationCaseId != null) {
            folders = folders.stream()
                    .filter(f -> f.getArbitrationCase() != null
                            && f.getArbitrationCase().getId().equals(arbitrationCaseId))
                    .toList();
        } else if (caseId != null) {
            folders = folders.stream()
                    .filter(f -> f.getLegalCase() != null && f.getLegalCase().getId().equals(caseId))
                    .toList();
        }

        Map<UUID, List<Folder>> childrenByParent = new HashMap<>();
        List<Folder> roots = new ArrayList<>();

        for (Folder folder : folders) {
            UUID parentId = folder.getParent() != null ? folder.getParent().getId() : null;
            boolean parentInScope =
                    parentId != null && folders.stream().anyMatch(f -> f.getId().equals(parentId));

            if (parentId == null || !parentInScope) {
                roots.add(folder);
            } else {
                childrenByParent
                        .computeIfAbsent(parentId, k -> new ArrayList<>())
                        .add(folder);
            }
        }

        return roots.stream().map(root -> toTreeNode(root, childrenByParent)).toList();
    }

    @Transactional(readOnly = true)
    public FolderResponse findById(UUID id) {
        return toResponse(getFolder(id));
    }

    @Transactional
    public FolderResponse createFolder(FolderRequest request) {
        UUID organizationId = TenantContext.requireOrganizationId();

        if (request.getCaseId() != null && request.getArbitrationCaseId() != null) {
            throw new BusinessException("caseId ve arbitrationCaseId aynı anda kullanılamaz");
        }

        Folder folder = Folder.builder().name(request.getName().trim()).build();

        if (request.getParentId() != null) {
            Folder parent = getFolder(request.getParentId());
            folder.setParent(parent);
            if (request.getCaseId() == null && parent.getLegalCase() != null) {
                folder.setLegalCase(parent.getLegalCase());
            }
            if (request.getArbitrationCaseId() == null && parent.getArbitrationCase() != null) {
                folder.setArbitrationCase(parent.getArbitrationCase());
            }
        }

        if (request.getCaseId() != null) {
            caseRepository
                    .findById(request.getCaseId())
                    .ifPresentOrElse(
                            folder::setLegalCase,
                            () -> {
                                throw new ResourceNotFoundException("Dava bulunamadı");
                            });
        }

        if (request.getArbitrationCaseId() != null) {
            arbitrationCaseRepository
                    .findById(request.getArbitrationCaseId())
                    .ifPresentOrElse(
                            folder::setArbitrationCase,
                            () -> {
                                throw new ResourceNotFoundException("Tahkim dosyası bulunamadı");
                            });
        }

        folder.setOrganizationId(organizationId);
        Folder saved = folderRepository.save(folder);
        auditService.log(AuditAction.CREATE, "Folder", saved.getId(), "Folder created: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public FolderResponse renameFolder(UUID id, FolderRequest request) {
        Folder folder = getFolder(id);
        if (folder.isSystem()) {
            throw new BusinessException("Sistem klasörlerinin adı değiştirilemez");
        }
        folder.setName(request.getName().trim());
        Folder saved = folderRepository.save(folder);
        auditService.log(AuditAction.UPDATE, "Folder", saved.getId(), "Folder renamed: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional
    public FolderResponse moveFolder(UUID folderId, UUID targetParentId) {
        Folder folder = getFolder(folderId);

        if (targetParentId != null) {
            if (targetParentId.equals(folderId)) {
                throw new BusinessException("Klasör kendi içine taşınamaz");
            }
            Folder targetParent = getFolder(targetParentId);
            if (isDescendant(targetParentId, folderId)) {
                throw new BusinessException("Klasör kendi alt klasörünün içine taşınamaz");
            }
            folder.setParent(targetParent);
            if (targetParent.getArbitrationCase() != null) {
                folder.setArbitrationCase(targetParent.getArbitrationCase());
            }
            if (targetParent.getLegalCase() != null) {
                folder.setLegalCase(targetParent.getLegalCase());
            }
        } else {
            folder.setParent(null);
        }

        Folder saved = folderRepository.save(folder);
        auditService.log(AuditAction.UPDATE, "Folder", saved.getId(), "Folder moved");
        return toResponse(saved);
    }

    @Transactional
    public void deleteFolder(UUID id) {
        Folder folder = getFolder(id);

        if (folder.isSystem()) {
            throw new BusinessException("Sistem klasörleri silinemez");
        }

        long childCount = folderRepository.countByParentIdAndDeletedFalse(id);
        if (childCount > 0) {
            throw new BusinessException("Klasör boş değil: önce alt klasörleri silin");
        }

        long documentCount = folderRepository.countDocumentsInFolder(id);
        if (documentCount > 0) {
            throw new BusinessException("Klasör boş değil: önce içindeki belgeleri taşıyın veya silin");
        }

        folder.markDeleted();
        folderRepository.save(folder);
        auditService.log(AuditAction.DELETE, "Folder", id, "Folder deleted: " + folder.getName());
    }

    private boolean isDescendant(UUID candidateId, UUID ancestorId) {
        Set<UUID> descendants = collectDescendantIds(ancestorId);
        return descendants.contains(candidateId);
    }

    private Set<UUID> collectDescendantIds(UUID folderId) {
        Set<UUID> descendants = new HashSet<>();
        collectDescendantsRecursive(folderId, descendants);
        return descendants;
    }

    private void collectDescendantsRecursive(UUID folderId, Set<UUID> descendants) {
        UUID organizationId = TenantContext.requireOrganizationId();
        List<Folder> children = folderRepository.findByParentIdAndOrganizationIdAndDeletedFalse(folderId, organizationId);
        for (Folder child : children) {
            descendants.add(child.getId());
            collectDescendantsRecursive(child.getId(), descendants);
        }
    }

    private FolderResponse toTreeNode(Folder folder, Map<UUID, List<Folder>> childrenByParent) {
        List<Folder> children = childrenByParent.getOrDefault(folder.getId(), List.of());
        return FolderResponse.builder()
                .id(folder.getId().toString())
                .name(folder.getName())
                .parentId(folder.getParent() != null ? folder.getParent().getId().toString() : null)
                .caseId(folder.getLegalCase() != null ? folder.getLegalCase().getId().toString() : null)
                .arbitrationCaseId(folder.getArbitrationCase() != null
                        ? folder.getArbitrationCase().getId().toString()
                        : null)
                .system(folder.isSystem())
                .documentCount(folderRepository.countDocumentsInFolder(folder.getId()))
                .children(children.stream().map(c -> toTreeNode(c, childrenByParent)).toList())
                .build();
    }

    private FolderResponse toResponse(Folder folder) {
        return FolderResponse.builder()
                .id(folder.getId().toString())
                .name(folder.getName())
                .parentId(folder.getParent() != null ? folder.getParent().getId().toString() : null)
                .caseId(folder.getLegalCase() != null ? folder.getLegalCase().getId().toString() : null)
                .arbitrationCaseId(folder.getArbitrationCase() != null
                        ? folder.getArbitrationCase().getId().toString()
                        : null)
                .system(folder.isSystem())
                .documentCount(folderRepository.countDocumentsInFolder(folder.getId()))
                .build();
    }

    private Folder getFolder(UUID id) {
        return folderRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Klasör bulunamadı"));
    }
}
