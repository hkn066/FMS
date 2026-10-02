package com.lawoffice.fms.document.presentation;

import com.lawoffice.fms.common.dto.ApiResponse;
import com.lawoffice.fms.document.application.FolderService;
import com.lawoffice.fms.document.application.dto.FolderRequest;
import com.lawoffice.fms.document.application.dto.FolderResponse;
import com.lawoffice.fms.document.application.dto.MoveFolderRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/folders")
@Tag(name = "Folders", description = "Mantıksal klasör hiyerarşisi yönetimi")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Klasör ağacı")
    public ResponseEntity<ApiResponse<List<FolderResponse>>> getTree(
            @RequestParam(value = "caseId", required = false) UUID caseId,
            @RequestParam(value = "arbitrationCaseId", required = false) UUID arbitrationCaseId) {
        return ResponseEntity.ok(ApiResponse.success(folderService.getTree(caseId, arbitrationCaseId)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Klasör detayı")
    public ResponseEntity<ApiResponse<FolderResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(folderService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Klasör oluştur")
    public ResponseEntity<ApiResponse<FolderResponse>> create(@Valid @RequestBody FolderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Klasör oluşturuldu", folderService.createFolder(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Klasör adını değiştir")
    public ResponseEntity<ApiResponse<FolderResponse>> rename(
            @PathVariable UUID id, @Valid @RequestBody FolderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Klasör güncellendi", folderService.renameFolder(id, request)));
    }

    @PutMapping("/{id}/move")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Klasör taşı")
    public ResponseEntity<ApiResponse<FolderResponse>> move(
            @PathVariable UUID id, @RequestBody MoveFolderRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Klasör taşındı", folderService.moveFolder(id, request.getTargetParentId())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Klasör sil")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        folderService.deleteFolder(id);
        return ResponseEntity.ok(ApiResponse.success("Klasör silindi", null));
    }
}
