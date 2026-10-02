package com.lawoffice.fms.arbitration.application.dto;

import com.lawoffice.fms.arbitration.domain.ArbitrationDocumentCategory;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ArbitrationDocumentsResponse {

    private String arbitrationCaseId;
    private String virtualFolderName;
    private List<ArbitrationDocumentResponse> documents;

    @Builder.Default
    private Map<ArbitrationDocumentCategory, List<ArbitrationDocumentResponse>> byCategory = new EnumMap<>(
            ArbitrationDocumentCategory.class);
}
