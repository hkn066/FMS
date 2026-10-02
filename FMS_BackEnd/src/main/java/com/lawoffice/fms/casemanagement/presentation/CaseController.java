package com.lawoffice.fms.casemanagement.presentation;

import com.lawoffice.fms.casemanagement.application.CaseService;
import com.lawoffice.fms.casemanagement.application.dto.CaseRequest;
import com.lawoffice.fms.casemanagement.application.dto.CaseResponse;
import com.lawoffice.fms.common.dto.ApiResponse;
import com.lawoffice.fms.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cases")
@Tag(name = "Cases", description = "Dava yönetimi")
public class CaseController {

    private final CaseService caseService;

    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Dava listesi")
    public ResponseEntity<ApiResponse<PageResponse<CaseResponse>>> findAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(caseService.findAll(pageable)));
    }

    @GetMapping("/next-number")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Sıradaki otomatik dava dosya numarası")
    public ResponseEntity<ApiResponse<String>> getNextCaseNumber() {
        return ResponseEntity.ok(ApiResponse.success(caseService.getNextCaseNumber()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Dava detayı")
    public ResponseEntity<ApiResponse<CaseResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(caseService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Dava oluştur")
    public ResponseEntity<ApiResponse<CaseResponse>> create(@Valid @RequestBody CaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Dava oluşturuldu", caseService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Dava güncelle")
    public ResponseEntity<ApiResponse<CaseResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody CaseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Dava güncellendi", caseService.update(id, request)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Dava kapat")
    public ResponseEntity<ApiResponse<Void>> close(@PathVariable UUID id) {
        caseService.close(id);
        return ResponseEntity.ok(ApiResponse.success("Dava kapatıldı", null));
    }
}
