package com.lawoffice.fms.document.application;

import com.lawoffice.fms.audit.application.AuditService;
import com.lawoffice.fms.audit.domain.AuditAction;
import com.lawoffice.fms.arbitration.infrastructure.ArbitrationCaseRepository;
import com.lawoffice.fms.casemanagement.infrastructure.CaseRepository;
import com.lawoffice.fms.common.dto.PageResponse;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.document.application.dto.DocumentResponse;
import com.lawoffice.fms.document.domain.Document;
import com.lawoffice.fms.document.domain.DocumentVersion;
import com.lawoffice.fms.document.domain.Folder;
import com.lawoffice.fms.document.domain.OcrStatus;
import com.lawoffice.fms.document.infrastructure.DocumentRepository;
import com.lawoffice.fms.document.infrastructure.FolderRepository;
import com.lawoffice.fms.infrastructure.storage.MinioStorageService;
import com.lawoffice.fms.user.domain.User;
import com.lawoffice.fms.user.infrastructure.UserRepository;
import java.io.InputStream;
import java.util.UUID;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final FolderRepository folderRepository;
    private final CaseRepository caseRepository;
    private final ArbitrationCaseRepository arbitrationCaseRepository;
    private final UserRepository userRepository;
    private final MinioStorageService storageService;
    private final AuditService auditService;

    public DocumentService(
            DocumentRepository documentRepository,
            FolderRepository folderRepository,
            CaseRepository caseRepository,
            ArbitrationCaseRepository arbitrationCaseRepository,
            UserRepository userRepository,
            MinioStorageService storageService,
            AuditService auditService) {
        this.documentRepository = documentRepository;
        this.folderRepository = folderRepository;
        this.caseRepository = caseRepository;
        this.arbitrationCaseRepository = arbitrationCaseRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public PageResponse<DocumentResponse> findAll(
            Pageable pageable, UUID folderId, UUID caseId, UUID arbitrationCaseId) {
        Page<Document> page;
        if (folderId != null) {
            page = documentRepository.findByFolderIdAndDeletedFalse(folderId, pageable);
        } else if (arbitrationCaseId != null) {
            page = documentRepository.findByArbitrationCaseIdAndDeletedFalse(arbitrationCaseId, pageable);
        } else if (caseId != null) {
            page = documentRepository.findByLegalCaseIdAndDeletedFalse(caseId, pageable);
        } else {
            page = documentRepository.findByDeletedFalse(pageable);
        }
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public DocumentResponse findById(UUID id) {
        return toResponse(getDocument(id));
    }

    @Transactional
    public DocumentResponse upload(
            MultipartFile file,
            UUID caseId,
            UUID arbitrationCaseId,
            String folderPath,
            UUID folderId) {
        if (caseId != null && arbitrationCaseId != null) {
            throw new com.lawoffice.fms.common.exception.BusinessException(
                    "caseId ve arbitrationCaseId aynı anda kullanılamaz");
        }

        User uploader = getCurrentUser();
        String storageKey = storageService.upload(
                folderPath != null ? folderPath : "general",
                file.getOriginalFilename(),
                getInputStream(file),
                file.getSize(),
                file.getContentType());

        Document document = Document.builder()
                .name(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .folderPath(folderPath)
                .storageKey(storageKey)
                .currentVersion(1)
                .ocrStatus(OcrStatus.PENDING)
                .uploadedBy(uploader)
                .build();

        if (folderId != null) {
            Folder folder = folderRepository
                    .findByIdAndDeletedFalse(folderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Klasör bulunamadı"));
            document.setFolder(folder);
        }

        if (caseId != null) {
            caseRepository.findById(caseId).ifPresent(document::setLegalCase);
        }

        if (arbitrationCaseId != null) {
            arbitrationCaseRepository
                    .findById(arbitrationCaseId)
                    .ifPresentOrElse(
                            document::setArbitrationCase,
                            () -> {
                                throw new ResourceNotFoundException("Tahkim dosyası bulunamadı");
                            });
        }

        DocumentVersion version = DocumentVersion.builder()
                .document(document)
                .versionNumber(1)
                .storageKey(storageKey)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedBy(uploader)
                .changeNote("Initial upload")
                .build();
        document.getVersions().add(version);

        Document saved = documentRepository.save(document);
        auditService.log(AuditAction.UPLOAD, "Document", saved.getId(), "Document uploaded: " + saved.getName());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public InputStreamResource download(UUID id) {
        Document document = getDocument(id);
        auditService.log(AuditAction.DOWNLOAD, "Document", id, "Document downloaded: " + document.getName());
        return new InputStreamResource(storageService.download(document.getStorageKey()));
    }

    @Transactional
    public void delete(UUID id) {
        Document document = getDocument(id);
        document.markDeleted();
        documentRepository.save(document);
        auditService.log(AuditAction.DELETE, "Document", id, "Document soft deleted");
    }

    @Transactional
    public DocumentResponse moveDocument(UUID id, UUID folderId) {
        Document document = getDocument(id);

        if (folderId != null) {
            Folder folder = folderRepository
                    .findByIdAndDeletedFalse(folderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Klasör bulunamadı"));
            document.setFolder(folder);
        } else {
            document.setFolder(null);
        }

        Document saved = documentRepository.save(document);
        auditService.log(AuditAction.UPDATE, "Document", id, "Document moved to folder");
        return toResponse(saved);
    }

    private Document getDocument(UUID id) {
        return documentRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Belge bulunamadı"));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository
                .findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));
    }

    private InputStream getInputStream(MultipartFile file) {
        try {
            return file.getInputStream();
        } catch (Exception e) {
            throw new RuntimeException("Dosya okunamadı", e);
        }
    }

    private DocumentResponse toResponse(Document document) {
        return DocumentResponse.builder()
                .id(document.getId().toString())
                .name(document.getName())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .folderPath(document.getFolderPath())
                .folderId(document.getFolder() != null
                        ? document.getFolder().getId().toString()
                        : null)
                .currentVersion(document.getCurrentVersion())
                .ocrStatus(document.getOcrStatus())
                .caseId(document.getLegalCase() != null
                        ? document.getLegalCase().getId().toString()
                        : null)
                .arbitrationCaseId(document.getArbitrationCase() != null
                        ? document.getArbitrationCase().getId().toString()
                        : null)
                .uploadedBy(document.getUploadedBy() != null
                        ? document.getUploadedBy().getFullName()
                        : null)
                .uploadedAt(document.getCreatedAt())
                .build();
    }

    private PageResponse<DocumentResponse> toPageResponse(Page<Document> page) {
        return PageResponse.<DocumentResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
