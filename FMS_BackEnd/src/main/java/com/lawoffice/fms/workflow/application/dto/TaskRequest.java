package com.lawoffice.fms.workflow.application.dto;

import com.lawoffice.fms.workflow.domain.TaskPriority;
import com.lawoffice.fms.workflow.domain.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Data;

@Data
public class TaskRequest {

    @NotBlank
    private String title;

    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private UUID assigneeId;
    private UUID caseId;
    private LocalDate dueDate;
    private int progress;
}
