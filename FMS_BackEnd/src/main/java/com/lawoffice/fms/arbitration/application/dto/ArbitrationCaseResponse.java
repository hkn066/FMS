package com.lawoffice.fms.arbitration.application.dto;

import com.lawoffice.fms.arbitration.domain.ArbitrationStatus;
import java.time.Instant;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ArbitrationCaseResponse {

    private String id;
    private String licensePlate;
    private String clientNameSurname;
    private String arbitrationFileNumber;
    private String courtBasisNumber;
    private String folderName;
    private String dmsRootFolderId;
    private ArbitrationStatus status;
    private Instant createdAt;
}
