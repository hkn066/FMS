package com.lawoffice.fms.reporting.presentation;

import com.lawoffice.fms.common.dto.ApiResponse;
import com.lawoffice.fms.reporting.application.ReportingService;
import com.lawoffice.fms.reporting.application.dto.DashboardResponse;
import com.lawoffice.fms.reporting.application.dto.LawyerPerformanceResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports", description = "Raporlama ve analytics")
public class ReportingController {

    private final ReportingService reportingService;

    public ReportingController(ReportingService reportingService) {
        this.reportingService = reportingService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ACCOUNTING')")
    @Operation(summary = "Dashboard KPI verileri")
    public ResponseEntity<ApiResponse<DashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getDashboard()));
    }

    @GetMapping("/lawyer-performance")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ACCOUNTING')")
    @Operation(summary = "Avukat performans özeti")
    public ResponseEntity<ApiResponse<List<LawyerPerformanceResponse>>> lawyerPerformance() {
        return ResponseEntity.ok(ApiResponse.success(reportingService.getLawyerPerformance()));
    }
}
