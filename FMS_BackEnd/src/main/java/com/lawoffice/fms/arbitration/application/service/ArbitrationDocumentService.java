package com.lawoffice.fms.arbitration.application.service;

import com.lawoffice.fms.arbitration.application.dto.ArbitrationDocumentResponse;
import com.lawoffice.fms.arbitration.application.dto.ArbitrationDocumentsResponse;
import com.lawoffice.fms.arbitration.domain.ArbitrationDocumentCategory;
import java.util.UUID;
import org.springframework.web.multipart.MultipartFile;

public interface ArbitrationDocumentService {

    ArbitrationDocumentResponse upload(UUID arbitrationCaseId, MultipartFile file, ArbitrationDocumentCategory category);

    ArbitrationDocumentsResponse listDocuments(UUID arbitrationCaseId);

    void deleteDocument(UUID arbitrationCaseId, UUID documentId);
}
