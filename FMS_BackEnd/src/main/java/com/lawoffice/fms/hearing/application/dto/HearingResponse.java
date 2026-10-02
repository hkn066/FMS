package com.lawoffice.fms.hearing.application.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HearingResponse {

    private String id;
    private String caseId;
    private String caseTitle;
    private String court;
    private LocalDate hearingDate;
    private LocalTime hearingTime;
    private String location;
    private String hearingType;
    private String notes;
}
