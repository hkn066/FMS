package com.lawoffice.fms.arbitration.application.service;

import com.lawoffice.fms.arbitration.application.dto.ArbitrationCaseResponse;
import com.lawoffice.fms.arbitration.application.dto.CreateArbitrationCaseRequest;
import com.lawoffice.fms.arbitration.application.dto.UpdateArbitrationCaseRequest;
import com.lawoffice.fms.common.dto.PageResponse;
import java.util.UUID;
import org.springframework.data.domain.Pageable;

public interface ArbitrationService {

    ArbitrationCaseResponse create(CreateArbitrationCaseRequest request);

    ArbitrationCaseResponse update(UUID id, UpdateArbitrationCaseRequest request);

    ArbitrationCaseResponse getById(UUID id);

    PageResponse<ArbitrationCaseResponse> getAll(Pageable pageable);

    void delete(UUID id);
}
