package com.lawoffice.fms.arbitration.application.service;

import com.lawoffice.fms.arbitration.application.dto.ArbitrationDocumentResponse;
import com.lawoffice.fms.arbitration.application.dto.ArbitrationDocumentsResponse;
import com.lawoffice.fms.arbitration.domain.ArbitrationCase;
import com.lawoffice.fms.arbitration.domain.ArbitrationDocument;
import com.lawoffice.fms.arbitration.domain.ArbitrationDocumentCategory;
import com.lawoffice.fms.arbitration.infrastructure.ArbitrationCaseRepository;
import com.lawoffice.fms.arbitration.infrastructure.ArbitrationDocumentRepository;
import com.lawoffice.fms.arbitration.infrastructure.storage.ArbitrationStoragePaths;
import com.lawoffice.fms.audit.application.AuditService;
import com.lawoffice.fms.audit.domain.AuditAction;
import com.lawoffice.fms.common.exception.BusinessException;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.common.tenant.TenantContext;
import com.lawoffice.fms.infrastructure.storage.MinioStorageService;
import com.lawoffice.fms.user.domain.User;
import com.lawoffice.fms.user.infrastructure.UserRepository;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ArbitrationDocumentServiceImpl implements ArbitrationDocumentService {

    private final ArbitrationCaseRepository arbitrationCaseRepository;
    private final ArbitrationDocumentRepository arbitrationDocumentRepository;
    private final MinioStorageService storageService;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ArbitrationDocumentServiceImpl(
            ArbitrationCaseRepository arbitrationCaseRepository,
            ArbitrationDocumentRepository arbitrationDocumentRepository,
            MinioStorageService storageService,
            UserRepository userRepository,
            AuditService auditService) {
        this.arbitrationCaseRepository = arbitrationCaseRepository;
        this.arbitrationDocumentRepository = arbitrationDocumentRepository;
        this.storageService = storageService;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Override
    @Transactional
    public ArbitrationDocumentResponse upload(
            UUID arbitrationCaseId, MultipartFile file, ArbitrationDocumentCategory category) {
        TenantContext.requireOrganizationId();

        if (file == null || file.isEmpty()) {
            throw new BusinessException("Yüklenecek dosya boş olamaz");
        }
        if (category == null) {
            throw new BusinessException("Belge kategorisi zorunludur");
        }

        ArbitrationCase arbitrationCase = getArbitrationCase(arbitrationCaseId);
        User uploader = getCurrentUser();
        UUID documentId = UUID.randomUUID();
        String storageKey = ArbitrationStoragePaths.documentObjectKey(arbitrationCaseId, category, documentId);

        storageService.uploadObject(
                storageKey, getInputStream(file), file.getSize(), file.getContentType());

        ArbitrationDocument document = ArbitrationDocument.builder()
                .arbitrationCase(arbitrationCase)
                .category(category)
                .name(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .storageKey(storageKey)
                .uploadedBy(uploader)
                .build();
        document.setId(documentId);

        ArbitrationDocument saved = arbitrationDocumentRepository.save(document);
        auditService.log(
                AuditAction.UPLOAD,
                "ArbitrationDocument",
                saved.getId(),
                "Arbitration document uploaded: "
                        + saved.getName()
                        + " ["
                        + category
                        + "] case="
                        + arbitrationCaseId);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ArbitrationDocumentsResponse listDocuments(UUID arbitrationCaseId) {
        ArbitrationCase arbitrationCase = getArbitrationCase(arbitrationCaseId);
        List<ArbitrationDocumentResponse> documents = arbitrationDocumentRepository
                .findByArbitrationCaseIdOrderByCreatedAtDesc(arbitrationCaseId)
                .stream()
                .map(this::toResponse)
                .toList();

        Map<ArbitrationDocumentCategory, List<ArbitrationDocumentResponse>> byCategory = new EnumMap<>(
                ArbitrationDocumentCategory.class);
        for (ArbitrationDocumentCategory cat : ArbitrationDocumentCategory.values()) {
            byCategory.put(cat, new ArrayList<>());
        }
        for (ArbitrationDocumentResponse doc : documents) {
            byCategory.get(doc.getCategory()).add(doc);
        }

        return ArbitrationDocumentsResponse.builder()
                .arbitrationCaseId(arbitrationCase.getId().toString())
                .virtualFolderName(arbitrationCase.getFolderName())
                .documents(documents)
                .byCategory(byCategory)
                .build();
    }

    @Override
    @Transactional
    public void deleteDocument(UUID arbitrationCaseId, UUID documentId) {
        ArbitrationDocument document = arbitrationDocumentRepository
                .findByIdAndArbitrationCaseId(documentId, arbitrationCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Tahkim belgesi bulunamadı"));

        document.markDeleted();
        arbitrationDocumentRepository.save(document);
        auditService.log(
                AuditAction.DELETE,
                "ArbitrationDocument",
                documentId,
                "Arbitration document soft deleted: " + document.getName());
    }

    private ArbitrationCase getArbitrationCase(UUID id) {
        return arbitrationCaseRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tahkim dosyası bulunamadı"));
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

    private ArbitrationDocumentResponse toResponse(ArbitrationDocument document) {
        return ArbitrationDocumentResponse.builder()
                .id(document.getId().toString())
                .name(document.getName())
                .contentType(document.getContentType())
                .fileSize(document.getFileSize())
                .category(document.getCategory())
                .uploadedBy(document.getUploadedBy() != null
                        ? document.getUploadedBy().getFullName()
                        : null)
                .uploadedAt(document.getCreatedAt())
                .build();
    }
}
