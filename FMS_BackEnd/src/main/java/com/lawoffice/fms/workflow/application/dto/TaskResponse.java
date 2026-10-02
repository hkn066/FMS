package com.lawoffice.fms.workflow.application.dto;

import com.lawoffice.fms.workflow.domain.TaskPriority;
import com.lawoffice.fms.workflow.domain.TaskStatus;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaskResponse {

    private String id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private String assigneeId;
    private String assigneeName;
    private String caseId;
    private String caseTitle;
    private LocalDate dueDate;
    private int progress;
}
