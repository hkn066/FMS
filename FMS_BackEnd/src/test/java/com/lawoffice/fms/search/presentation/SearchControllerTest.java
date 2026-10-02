package com.lawoffice.fms.search.presentation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.lawoffice.fms.common.dto.ApiResponse;
import com.lawoffice.fms.common.exception.BusinessException;
import com.lawoffice.fms.search.application.SearchService;
import com.lawoffice.fms.search.application.dto.GlobalSearchResponse;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class SearchControllerTest {

    @Mock
    private SearchService searchService;

    @InjectMocks
    private SearchController searchController;

    @Test
    void search_shouldThrowBusinessException_whenQueryIsLessThanTwoCharacters() {
        assertThrows(BusinessException.class, () -> searchController.search("a"));
        assertThrows(BusinessException.class, () -> searchController.search(" "));
        assertThrows(BusinessException.class, () -> searchController.search(null));
    }

    @Test
    void search_shouldReturnSuccessResponse_whenQueryIsValid() {
        String query = "test";
        GlobalSearchResponse expectedResponse = GlobalSearchResponse.builder()
                .clients(Collections.emptyList())
                .cases(Collections.emptyList())
                .arbitrations(Collections.emptyList())
                .documents(Collections.emptyList())
                .build();

        when(searchService.search(query)).thenReturn(expectedResponse);

        ResponseEntity<ApiResponse<GlobalSearchResponse>> responseEntity = searchController.search(query);

        assertNotNull(responseEntity);
        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals(expectedResponse, responseEntity.getBody().getData());

        verify(searchService).search(query);
    }
}
