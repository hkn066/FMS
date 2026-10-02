package com.lawoffice.fms.arbitration.application.dto;

import com.lawoffice.fms.arbitration.domain.ArbitrationDocumentCategory;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ArbitrationDocumentResponse {

    private String id;
    private String name;
    private String contentType;
    private Long fileSize;
    private ArbitrationDocumentCategory category;
    private String uploadedBy;
    private Instant uploadedAt;
}
