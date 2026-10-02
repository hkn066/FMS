package com.lawoffice.fms.document.presentation;

import com.lawoffice.fms.common.dto.ApiResponse;
import com.lawoffice.fms.common.dto.PageResponse;
import com.lawoffice.fms.document.application.DocumentService;
import com.lawoffice.fms.document.application.dto.DocumentResponse;
import com.lawoffice.fms.document.application.dto.MoveDocumentRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
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
@RequestMapping("/api/v1/documents")
@Tag(name = "Documents", description = "Belge yönetimi")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Belge listesi")
    public ResponseEntity<ApiResponse<PageResponse<DocumentResponse>>> findAll(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestParam(value = "folderId", required = false) UUID folderId,
            @RequestParam(value = "caseId", required = false) UUID caseId,
            @RequestParam(value = "arbitrationCaseId", required = false) UUID arbitrationCaseId) {
        return ResponseEntity.ok(
                ApiResponse.success(documentService.findAll(pageable, folderId, caseId, arbitrationCaseId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Belge detayı")
    public ResponseEntity<ApiResponse<DocumentResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(documentService.findById(id)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Belge yükle")
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caseId", required = false) UUID caseId,
            @RequestParam(value = "arbitrationCaseId", required = false) UUID arbitrationCaseId,
            @RequestParam(value = "folderPath", required = false) String folderPath,
            @RequestParam(value = "folderId", required = false) UUID folderId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Belge yüklendi",
                        documentService.upload(file, caseId, arbitrationCaseId, folderPath, folderId)));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Belge indir")
    public ResponseEntity<InputStreamResource> download(@PathVariable UUID id) {
        InputStreamResource resource = documentService.download(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @PutMapping("/{id}/move")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Belgeyi klasöre taşı")
    public ResponseEntity<ApiResponse<DocumentResponse>> move(
            @PathVariable UUID id, @RequestBody MoveDocumentRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Belge taşındı", documentService.moveDocument(id, request.getFolderId())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Belge sil")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        documentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Belge silindi", null));
    }
}
