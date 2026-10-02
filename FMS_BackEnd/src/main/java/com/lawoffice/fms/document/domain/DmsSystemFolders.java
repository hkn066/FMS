package com.lawoffice.fms.document.domain;

import com.lawoffice.fms.arbitration.domain.ArbitrationStatus;
import java.util.Map;
import java.util.UUID;

public final class DmsSystemFolders {

    public static final UUID GENERAL_ROOT = UUID.fromString("88888888-8888-8888-8888-888888888801");
    public static final UUID ARBITRATION_ROOT = UUID.fromString("88888888-8888-8888-8888-888888888802");

    public static final UUID ARBITRATION_PRE_APPLICATION =
            UUID.fromString("88888888-8888-8888-8888-888888888821");
    public static final UUID ARBITRATION_IN_COMMISSION =
            UUID.fromString("88888888-8888-8888-8888-888888888822");
    public static final UUID ARBITRATION_EXPERT_REVIEW =
            UUID.fromString("88888888-8888-8888-8888-888888888823");
    public static final UUID ARBITRATION_DECIDED = UUID.fromString("88888888-8888-8888-8888-888888888824");
    public static final UUID ARBITRATION_CLOSED = UUID.fromString("88888888-8888-8888-8888-888888888825");

    private static final Map<ArbitrationStatus, UUID> STATUS_PARENT_FOLDERS = Map.of(
            ArbitrationStatus.PRE_APPLICATION, ARBITRATION_PRE_APPLICATION,
            ArbitrationStatus.IN_COMMISSION, ARBITRATION_IN_COMMISSION,
            ArbitrationStatus.EXPERT_REVIEW, ARBITRATION_EXPERT_REVIEW,
            ArbitrationStatus.DECIDED, ARBITRATION_DECIDED,
            ArbitrationStatus.CLOSED, ARBITRATION_CLOSED);

    private DmsSystemFolders() {}

    public static UUID statusParentFolderId(ArbitrationStatus status) {
        return STATUS_PARENT_FOLDERS.getOrDefault(status, ARBITRATION_PRE_APPLICATION);
    }
}
