package com.lawoffice.fms.workflow.infrastructure;

import com.lawoffice.fms.workflow.domain.Task;
import com.lawoffice.fms.workflow.domain.TaskStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    Page<Task> findByDeletedFalse(Pageable pageable);

    Optional<Task> findByIdAndDeletedFalse(UUID id);

    List<Task> findByStatusNotAndDeletedFalse(TaskStatus status);

    long countByStatusNotAndDeletedFalse(TaskStatus status);

    List<Task> findByStatusAndDeletedFalse(TaskStatus status);
}
