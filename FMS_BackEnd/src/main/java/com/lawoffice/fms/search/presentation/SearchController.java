package com.lawoffice.fms.search.presentation;

import com.lawoffice.fms.common.dto.ApiResponse;
import com.lawoffice.fms.common.exception.BusinessException;
import com.lawoffice.fms.search.application.SearchService;
import com.lawoffice.fms.search.application.dto.GlobalSearchResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
@Tag(name = "Search", description = "Global arama işlemleri")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PARTNER', 'LAWYER', 'ASSISTANT')")
    @Operation(summary = "Global arama", description = "Tüm sistem genelinde (Müvekkil, Dava, Tahkim ve Doküman) arama yapar.")
    public ResponseEntity<ApiResponse<GlobalSearchResponse>> search(
            @Parameter(description = "Arama sorgusu (en az 2 karakter)", required = true)
            @RequestParam("q") String q) {
        
        if (q == null || q.trim().length() < 2) {
            throw new BusinessException("Arama sorgusu en az 2 karakter olmalıdır");
        }

        GlobalSearchResponse response = searchService.search(q);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
