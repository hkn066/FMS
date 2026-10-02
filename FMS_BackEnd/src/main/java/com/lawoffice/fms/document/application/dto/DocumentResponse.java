package com.lawoffice.fms.document.application.dto;

import com.lawoffice.fms.document.domain.OcrStatus;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentResponse {

    private String id;
    private String name;
    private String contentType;
    private Long fileSize;
    private String folderPath;
    private String folderId;
    private int currentVersion;
    private OcrStatus ocrStatus;
    private String caseId;
    private String arbitrationCaseId;
    private String uploadedBy;
    private Instant uploadedAt;
}
