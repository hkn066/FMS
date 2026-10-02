package com.lawoffice.fms.document.application.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;
import lombok.Data;

@Data
public class FolderRequest {

    @NotBlank
    private String name;

    private UUID parentId;
    private UUID caseId;
    private UUID arbitrationCaseId;
}
