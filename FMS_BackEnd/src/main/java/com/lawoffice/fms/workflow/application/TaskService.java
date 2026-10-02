package com.lawoffice.fms.workflow.application;

import com.lawoffice.fms.casemanagement.infrastructure.CaseRepository;
import com.lawoffice.fms.common.dto.PageResponse;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.user.infrastructure.UserRepository;
import com.lawoffice.fms.workflow.application.dto.TaskRequest;
import com.lawoffice.fms.workflow.application.dto.TaskResponse;
import com.lawoffice.fms.workflow.domain.Task;
import com.lawoffice.fms.workflow.domain.TaskPriority;
import com.lawoffice.fms.workflow.domain.TaskStatus;
import com.lawoffice.fms.workflow.infrastructure.TaskRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final CaseRepository caseRepository;

    public TaskService(
            TaskRepository taskRepository, UserRepository userRepository, CaseRepository caseRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.caseRepository = caseRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> findAll(Pageable pageable) {
        Page<Task> page = taskRepository.findByDeletedFalse(pageable);
        return toPageResponse(page);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findKanbanBoard() {
        return taskRepository.findByDeletedFalse(Pageable.unpaged()).getContent().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TaskResponse create(TaskRequest request) {
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.WAITING)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .dueDate(request.getDueDate())
                .progress(request.getProgress())
                .build();

        if (request.getAssigneeId() != null) {
            userRepository.findById(request.getAssigneeId()).ifPresent(task::setAssignee);
        }
        if (request.getCaseId() != null) {
            caseRepository.findById(request.getCaseId()).ifPresent(task::setLegalCase);
        }

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateStatus(UUID id, TaskStatus status) {
        Task task = getTask(id);
        task.setStatus(status);
        if (status == TaskStatus.COMPLETED) {
            task.setProgress(100);
        }
        return toResponse(taskRepository.save(task));
    }

    private Task getTask(UUID id) {
        return taskRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Görev bulunamadı"));
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId().toString())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .assigneeId(task.getAssignee() != null ? task.getAssignee().getId().toString() : null)
                .assigneeName(task.getAssignee() != null ? task.getAssignee().getFullName() : null)
                .caseId(task.getLegalCase() != null ? task.getLegalCase().getId().toString() : null)
                .caseTitle(task.getLegalCase() != null ? task.getLegalCase().getTitle() : null)
                .dueDate(task.getDueDate())
                .progress(task.getProgress())
                .build();
    }

    private PageResponse<TaskResponse> toPageResponse(Page<Task> page) {
        return PageResponse.<TaskResponse>builder()
                .content(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
