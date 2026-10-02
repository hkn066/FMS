package com.lawoffice.fms.client.presentation;

import com.lawoffice.fms.client.application.ClientService;
import com.lawoffice.fms.client.application.dto.ClientRequest;
import com.lawoffice.fms.client.application.dto.ClientResponse;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/clients")
@Tag(name = "Clients", description = "Müvekkil yönetimi")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Müvekkil listesi")
    public ResponseEntity<ApiResponse<PageResponse<ClientResponse>>> findAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(clientService.findAll(pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER','ASSISTANT')")
    @Operation(summary = "Müvekkil detayı")
    public ResponseEntity<ApiResponse<ClientResponse>> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(clientService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Müvekkil oluştur")
    public ResponseEntity<ApiResponse<ClientResponse>> create(@Valid @RequestBody ClientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Müvekkil oluşturuldu", clientService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER','LAWYER')")
    @Operation(summary = "Müvekkil güncelle")
    public ResponseEntity<ApiResponse<ClientResponse>> update(
            @PathVariable UUID id, @Valid @RequestBody ClientRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Müvekkil güncellendi", clientService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PARTNER')")
    @Operation(summary = "Müvekkil sil")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        clientService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Müvekkil silindi", null));
    }
}
