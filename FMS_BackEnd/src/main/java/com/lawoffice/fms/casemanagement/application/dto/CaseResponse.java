package com.lawoffice.fms.casemanagement.application.dto;

import com.lawoffice.fms.casemanagement.domain.CaseStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CaseResponse {

    private String id;
    private String caseNumber;
    private String title;
    private String description;
    private CaseStatus status;
    private String clientId;
    private String clientName;
    private String lawyerId;
    private String lawyerName;
    private String court;
    private String category;
    private LocalDate openedAt;
    private LocalDate closedAt;
    private LocalDate nextHearing;

    private String courtBasisNumber;
    private String decisionNumber;
    private String clientRole;
    private String counterpartyName;
    private String counterpartyLawyer;
    private boolean hasSubjectVehicle;
    private String vehiclePlate;
    private String vehicleInfo;
    private BigDecimal claimAmount;
    private String dmsRootFolderId;
}
