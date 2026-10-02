package com.lawoffice.fms.arbitration.infrastructure.storage;

import com.lawoffice.fms.arbitration.domain.ArbitrationDocumentCategory;
import java.util.UUID;

public final class ArbitrationStoragePaths {

    private static final String PREFIX = "arbitration";

    private ArbitrationStoragePaths() {}

    /**
     * MinIO object key: arbitration/{caseId}/{category}/{documentId}
     * folderName değişse bile fiziksel yol sabit kalır; sanal klasör UI'da case.folderName ile gösterilir.
     */
    public static String documentObjectKey(
            UUID arbitrationCaseId, ArbitrationDocumentCategory category, UUID documentId) {
        return PREFIX + "/" + arbitrationCaseId + "/" + category.name() + "/" + documentId;
    }
}
