package com.lawoffice.fms.organization.presentation;

import com.lawoffice.fms.common.dto.ApiResponse;
import com.lawoffice.fms.common.dto.PageResponse;
import com.lawoffice.fms.organization.application.OrganizationService;
import com.lawoffice.fms.organization.application.dto.OrganizationRequestDto;
import com.lawoffice.fms.organization.application.dto.OrganizationResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/organizations")
@Tag(name = "Organizations", description = "Kurum ve abonelik yönetimi (sistem yöneticisi)")
@PreAuthorize("hasRole('ADMIN')")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping
    @Operation(summary = "Kurum listesi")
    public ResponseEntity<ApiResponse<PageResponse<OrganizationResponseDto>>> findAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(organizationService.findAll(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Kurum detayı")
    public ResponseEntity<ApiResponse<OrganizationResponseDto>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(organizationService.findById(id)));
    }

    @PostMapping
    @Operation(summary = "Kurum oluştur")
    public ResponseEntity<ApiResponse<OrganizationResponseDto>> create(
            @Valid @RequestBody OrganizationRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Kurum oluşturuldu", organizationService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Kurum güncelle")
    public ResponseEntity<ApiResponse<OrganizationResponseDto>> update(
            @PathVariable UUID id, @Valid @RequestBody OrganizationRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success("Kurum güncellendi", organizationService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Kurum sil")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        organizationService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Kurum silindi", null));
    }
}
