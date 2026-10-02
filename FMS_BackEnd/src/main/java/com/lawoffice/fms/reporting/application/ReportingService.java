package com.lawoffice.fms.reporting.application;

import com.lawoffice.fms.casemanagement.domain.CaseStatus;
import com.lawoffice.fms.casemanagement.domain.LegalCase;
import com.lawoffice.fms.casemanagement.infrastructure.CaseRepository;
import com.lawoffice.fms.client.infrastructure.ClientRepository;
import com.lawoffice.fms.document.infrastructure.DocumentRepository;
import com.lawoffice.fms.hearing.infrastructure.HearingRepository;
import com.lawoffice.fms.reporting.application.dto.DashboardResponse;
import com.lawoffice.fms.reporting.application.dto.LawyerPerformanceResponse;
import com.lawoffice.fms.user.domain.User;
import com.lawoffice.fms.workflow.domain.Task;
import com.lawoffice.fms.workflow.domain.TaskStatus;
import com.lawoffice.fms.workflow.infrastructure.TaskRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportingService {

    private final CaseRepository caseRepository;
    private final TaskRepository taskRepository;
    private final HearingRepository hearingRepository;
    private final ClientRepository clientRepository;
    private final DocumentRepository documentRepository;

    public ReportingService(
            CaseRepository caseRepository,
            TaskRepository taskRepository,
            HearingRepository hearingRepository,
            ClientRepository clientRepository,
            DocumentRepository documentRepository) {
        this.caseRepository = caseRepository;
        this.taskRepository = taskRepository;
        this.hearingRepository = hearingRepository;
        this.clientRepository = clientRepository;
        this.documentRepository = documentRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate weekLater = today.plusDays(7);

        return DashboardResponse.builder()
                .activeCases(caseRepository.countByStatusNot(CaseStatus.CLOSED))
                .pendingTasks(taskRepository.countByStatusNotAndDeletedFalse(TaskStatus.COMPLETED))
                .upcomingHearings(hearingRepository.countByHearingDateBetweenAndDeletedFalse(today, weekLater))
                .totalClients(clientRepository.count())
                .totalDocuments(documentRepository.count())
                .build();
    }

    @Transactional(readOnly = true)
    public List<LawyerPerformanceResponse> getLawyerPerformance() {
        Map<UUID, LawyerStats> statsByLawyer = new HashMap<>();

        for (LegalCase legalCase : caseRepository.findByDeletedFalse()) {
            User lawyer = legalCase.getAssignedLawyer();
            if (lawyer == null) {
                continue;
            }
            LawyerStats stats = statsByLawyer.computeIfAbsent(lawyer.getId(), id -> new LawyerStats(lawyer.getFullName()));
            stats.totalCases++;
            if (legalCase.getStatus() == CaseStatus.CLOSED) {
                stats.closedCases++;
            }
        }

        for (Task task : taskRepository.findByStatusAndDeletedFalse(TaskStatus.COMPLETED)) {
            User assignee = task.getAssignee();
            if (assignee == null) {
                continue;
            }
            LawyerStats stats = statsByLawyer.computeIfAbsent(assignee.getId(), id -> new LawyerStats(assignee.getFullName()));
            stats.tasksCompleted++;
        }

        List<LawyerPerformanceResponse> result = new ArrayList<>();
        for (LawyerStats stats : statsByLawyer.values()) {
            int winRate = stats.totalCases == 0 ? 0 : (int) Math.round((stats.closedCases * 100.0) / stats.totalCases);
            result.add(LawyerPerformanceResponse.builder()
                    .name(stats.name)
                    .cases(stats.totalCases)
                    .winRate(winRate)
                    .tasksCompleted(stats.tasksCompleted)
                    .build());
        }

        result.sort(Comparator.comparingLong(LawyerPerformanceResponse::getCases).reversed());
        return result.stream().limit(5).toList();
    }

    private static final class LawyerStats {
        private final String name;
        private long totalCases;
        private long closedCases;
        private long tasksCompleted;

        private LawyerStats(String name) {
            this.name = name;
        }
    }
}
