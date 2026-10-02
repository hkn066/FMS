package com.lawoffice.fms.casemanagement.domain;

import com.lawoffice.fms.client.domain.Client;
import com.lawoffice.fms.common.entity.BaseEntity;
import com.lawoffice.fms.document.domain.Folder;
import com.lawoffice.fms.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cases")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LegalCase extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String caseNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CaseStatus status = CaseStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lawyer_id")
    private User assignedLawyer;

    private String court;
    private String category;
    private LocalDate openedAt;
    private LocalDate closedAt;
    private LocalDate nextHearing;

    @Column(length = 50)
    private String courtBasisNumber;

    @Column(length = 50)
    private String decisionNumber;

    @Column(length = 30)
    @Builder.Default
    private String clientRole = "DAVACI";

    @Column(length = 255)
    private String counterpartyName;

    @Column(length = 255)
    private String counterpartyLawyer;

    @Column(name = "has_subject_vehicle", nullable = false)
    @Builder.Default
    private boolean hasSubjectVehicle = false;

    @Column(length = 20)
    private String vehiclePlate;

    @Column(length = 255)
    private String vehicleInfo;

    @Column(precision = 15, scale = 2)
    private BigDecimal claimAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dms_root_folder_id")
    private Folder dmsRootFolder;

    @OneToMany(mappedBy = "legalCase", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CaseNote> notes = new ArrayList<>();

    public String computeFolderName() {
        StringBuilder sb = new StringBuilder();
        sb.append(caseNumber != null ? caseNumber.trim() : "");

        if (hasSubjectVehicle && vehiclePlate != null && !vehiclePlate.trim().isEmpty()) {
            sb.append(" - ").append(vehiclePlate.trim().toUpperCase());
        }

        String clientName = (client != null && client.getName() != null)
                ? client.getName().trim()
                : "Müvekkil";
        sb.append(" - ").append(clientName);

        String courtInfo;
        boolean hasBasis = courtBasisNumber != null && !courtBasisNumber.trim().isEmpty();
        boolean hasCourt = court != null && !court.trim().isEmpty();

        if (hasCourt && hasBasis) {
            courtInfo = court.trim() + " " + courtBasisNumber.trim();
        } else if (hasBasis) {
            courtInfo = courtBasisNumber.trim();
        } else if (hasCourt) {
            courtInfo = court.trim() + " [Esas Bekleniyor]";
        } else {
            courtInfo = "[Esas Bekleniyor]";
        }
        sb.append(" - ").append(courtInfo);

        if (decisionNumber != null && !decisionNumber.trim().isEmpty()) {
            sb.append(" (K: ").append(decisionNumber.trim()).append(")");
        }

        return sb.toString();
    }
}
