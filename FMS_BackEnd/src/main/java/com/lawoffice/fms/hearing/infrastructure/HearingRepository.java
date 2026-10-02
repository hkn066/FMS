package com.lawoffice.fms.hearing.infrastructure;

import com.lawoffice.fms.hearing.domain.Hearing;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HearingRepository extends JpaRepository<Hearing, UUID> {

    Optional<Hearing> findByIdAndDeletedFalse(UUID id);

    List<Hearing> findByHearingDateBetweenAndDeletedFalseOrderByHearingTimeAsc(
            LocalDate start, LocalDate end);

    long countByHearingDateBetweenAndDeletedFalse(LocalDate start, LocalDate end);
}
