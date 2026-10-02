package com.lawoffice.fms.arbitration.application.dto;

import com.lawoffice.fms.arbitration.domain.ArbitrationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateArbitrationCaseRequest {

    @NotBlank
    @Size(max = 20)
    private String licensePlate;

    @NotBlank
    @Size(max = 255)
    private String clientNameSurname;

    @Size(max = 50)
    private String arbitrationFileNumber;

    @Size(max = 50)
    private String courtBasisNumber;

    private ArbitrationStatus status;
}
