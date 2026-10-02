package com.lawoffice.fms.document.application.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class MoveDocumentRequest {

    private UUID folderId;
}
