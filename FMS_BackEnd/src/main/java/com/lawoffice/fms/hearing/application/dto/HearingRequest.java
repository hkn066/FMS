package com.lawoffice.fms.hearing.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import lombok.Data;

@Data
public class HearingRequest {

    @NotNull
    private UUID caseId;

    @NotBlank
    private String court;

    @NotNull
    private LocalDate hearingDate;

    private LocalTime hearingTime;
    private String location;
    private String hearingType;
    private String notes;
}
