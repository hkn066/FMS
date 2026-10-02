package com.lawoffice.fms.document.application.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FolderResponse {

    private String id;
    private String name;
    private String parentId;
    private String caseId;
    private String arbitrationCaseId;
    private boolean system;
    private long documentCount;

    @Builder.Default
    private List<FolderResponse> children = new ArrayList<>();
}
