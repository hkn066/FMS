package com.lawoffice.fms.arbitration.application.dto;

import com.lawoffice.fms.arbitration.domain.ArbitrationStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateArbitrationCaseRequest {

    @Size(max = 20)
    private String licensePlate;

    @Size(max = 255)
    private String clientNameSurname;

    @Size(max = 50)
    private String arbitrationFileNumber;

    @Size(max = 50)
    private String courtBasisNumber;

    private ArbitrationStatus status;
}
