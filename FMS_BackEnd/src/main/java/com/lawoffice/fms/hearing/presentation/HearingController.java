package com.lawoffice.fms.hearing.presentation;

import com.lawoffice.fms.common.dto.ApiResponse;
import com.lawoffice.fms.hearing.application.HearingService;
import com.lawoffice.fms.hearing.application.dto.HearingRequest;
import com.lawoffice.fms.hearing.application.dto.HearingResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/hearings")
@Tag(name = "Hearings", description = "Duruşma yönetimi")
public class HearingController {

    private final HearingService hearingService;

    public HearingController(HearingService hearingService) {
        this.hearingService = hearingService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Yaklaşan duruşmalar")
    public ResponseEntity<ApiResponse<List<HearingResponse>>> findUpcoming(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(hearingService.findUpcoming(days)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Duruşma oluştur")
    public ResponseEntity<ApiResponse<HearingResponse>> create(@Valid @RequestBody HearingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Duruşma oluşturuldu", hearingService.create(request)));
    }
}
