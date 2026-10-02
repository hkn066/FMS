package com.lawoffice.fms.arbitration.presentation;

import com.lawoffice.fms.arbitration.application.dto.ArbitrationCaseResponse;
import com.lawoffice.fms.arbitration.application.dto.ArbitrationDocumentResponse;
import com.lawoffice.fms.arbitration.application.dto.ArbitrationDocumentsResponse;
import com.lawoffice.fms.arbitration.application.dto.CreateArbitrationCaseRequest;
import com.lawoffice.fms.arbitration.application.dto.UpdateArbitrationCaseRequest;
import com.lawoffice.fms.arbitration.application.service.ArbitrationDocumentService;
import com.lawoffice.fms.arbitration.application.service.ArbitrationService;
import com.lawoffice.fms.arbitration.domain.ArbitrationDocumentCategory;
import com.lawoffice.fms.common.dto.ApiResponse;
import com.lawoffice.fms.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/arbitration")
@Tag(name = "Arbitration", description = "Sigorta tahkim dosya yönetimi")
public class ArbitrationController {

    private final ArbitrationService arbitrationService;
    private final ArbitrationDocumentService arbitrationDocumentService;

    public ArbitrationController(
            ArbitrationService arbitrationService, ArbitrationDocumentService arbitrationDocumentService) {
        this.arbitrationService = arbitrationService;
        this.arbitrationDocumentService = arbitrationDocumentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Tahkim dosyası listesi")
    public ResponseEntity<ApiResponse<PageResponse<ArbitrationCaseResponse>>> getAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(arbitrationService.getAll(pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Tahkim dosyası detayı")
    public ResponseEntity<ApiResponse<ArbitrationCaseResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(arbitrationService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Tahkim dosyası oluştur")
    public ResponseEntity<ApiResponse<ArbitrationCaseResponse>> create(
            @Valid @RequestBody CreateArbitrationCaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tahkim dosyası oluşturuldu", arbitrationService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Tahkim dosyası güncelle")
    public ResponseEntity<ApiResponse<ArbitrationCaseResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody UpdateArbitrationCaseRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Tahkim dosyası güncellendi", arbitrationService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Tahkim dosyası sil")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        arbitrationService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Tahkim dosyası silindi", null));
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Tahkim belgesi yükle")
    public ResponseEntity<ApiResponse<ArbitrationDocumentResponse>> uploadDocument(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") ArbitrationDocumentCategory category) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Tahkim belgesi yüklendi",
                        arbitrationDocumentService.upload(id, file, category)));
    }

    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Tahkim belgelerini listele")
    public ResponseEntity<ApiResponse<ArbitrationDocumentsResponse>> listDocuments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(arbitrationDocumentService.listDocuments(id)));
    }

    @DeleteMapping("/{id}/documents/{documentId}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Tahkim belgesi sil")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable UUID id, @PathVariable UUID documentId) {
        arbitrationDocumentService.deleteDocument(id, documentId);
        return ResponseEntity.ok(ApiResponse.success("Tahkim belgesi silindi", null));
    }
}
