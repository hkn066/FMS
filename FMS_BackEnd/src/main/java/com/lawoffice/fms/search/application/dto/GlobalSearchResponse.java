package com.lawoffice.fms.search.application.dto;

import com.lawoffice.fms.client.application.dto.ClientResponse;
import com.lawoffice.fms.casemanagement.application.dto.CaseResponse;
import com.lawoffice.fms.arbitration.application.dto.ArbitrationCaseResponse;
import com.lawoffice.fms.document.application.dto.DocumentResponse;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GlobalSearchResponse {
    private List<ClientResponse> clients;
    private List<CaseResponse> cases;
    private List<ArbitrationCaseResponse> arbitrations;
    private List<DocumentResponse> documents;
}
