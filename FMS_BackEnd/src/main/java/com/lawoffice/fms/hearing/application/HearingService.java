package com.lawoffice.fms.hearing.application;

import com.lawoffice.fms.casemanagement.infrastructure.CaseRepository;
import com.lawoffice.fms.common.exception.ResourceNotFoundException;
import com.lawoffice.fms.hearing.application.dto.HearingRequest;
import com.lawoffice.fms.hearing.application.dto.HearingResponse;
import com.lawoffice.fms.hearing.domain.Hearing;
import com.lawoffice.fms.hearing.infrastructure.HearingRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HearingService {

    private final HearingRepository hearingRepository;
    private final CaseRepository caseRepository;

    public HearingService(HearingRepository hearingRepository, CaseRepository caseRepository) {
        this.hearingRepository = hearingRepository;
        this.caseRepository = caseRepository;
    }

    @Transactional(readOnly = true)
    public List<HearingResponse> findUpcoming(int days) {
        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(days);
        return hearingRepository
                .findByHearingDateBetweenAndDeletedFalseOrderByHearingTimeAsc(today, end)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public HearingResponse create(HearingRequest request) {
        var legalCase = caseRepository
                .findById(request.getCaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Dava bulunamadı"));

        Hearing hearing = Hearing.builder()
                .legalCase(legalCase)
                .court(request.getCourt())
                .hearingDate(request.getHearingDate())
                .hearingTime(request.getHearingTime())
                .location(request.getLocation())
                .hearingType(request.getHearingType())
                .notes(request.getNotes())
                .build();

        legalCase.setNextHearing(request.getHearingDate());
        caseRepository.save(legalCase);

        return toResponse(hearingRepository.save(hearing));
    }

    private HearingResponse toResponse(Hearing hearing) {
        return HearingResponse.builder()
                .id(hearing.getId().toString())
                .caseId(hearing.getLegalCase().getId().toString())
                .caseTitle(hearing.getLegalCase().getTitle())
                .court(hearing.getCourt())
                .hearingDate(hearing.getHearingDate())
                .hearingTime(hearing.getHearingTime())
                .location(hearing.getLocation())
                .hearingType(hearing.getHearingType())
                .notes(hearing.getNotes())
                .build();
    }
}
