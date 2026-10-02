package com.lawoffice.fms.reporting.application.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardResponse {

    private long activeCases;
    private long pendingTasks;
    private long upcomingHearings;
    private long totalClients;
    private long totalDocuments;
}
