package com.lawoffice.fms.reporting.application.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LawyerPerformanceResponse {

    private String name;
    private long cases;
    private int winRate;
    private long tasksCompleted;
}
