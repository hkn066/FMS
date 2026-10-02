package com.lawoffice.fms.hearing.domain;

import com.lawoffice.fms.casemanagement.domain.LegalCase;
import com.lawoffice.fms.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "hearings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hearing extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private LegalCase legalCase;

    @Column(nullable = false)
    private String court;

    @Column(nullable = false)
    private LocalDate hearingDate;

    private LocalTime hearingTime;
    private String location;
    private String hearingType;
    private String notes;
    private boolean reminderSent;
}
