package com.lawoffice.fms.casemanagement.application.dto;

import com.lawoffice.fms.casemanagement.domain.CaseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Data;

@Data
public class CaseRequest {

    private String caseNumber;

    @NotBlank(message = "Dava başlığı zorunludur")
    private String title;

    private String description;

    @NotNull(message = "Müvekkil seçimi zorunludur")
    private UUID clientId;

    private UUID lawyerId;
    private String court;
    private String category;
    private LocalDate openedAt;
    private LocalDate nextHearing;
    private CaseStatus status;

    private String courtBasisNumber;
    private String decisionNumber;
    private String clientRole;
    private String counterpartyName;
    private String counterpartyLawyer;
    private Boolean hasSubjectVehicle;
    private String vehiclePlate;
    private String vehicleInfo;
    private BigDecimal claimAmount;
}
