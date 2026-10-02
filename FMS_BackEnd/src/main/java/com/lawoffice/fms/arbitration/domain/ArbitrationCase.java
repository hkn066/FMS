package com.lawoffice.fms.arbitration.domain;

import com.lawoffice.fms.common.entity.BaseEntity;
import com.lawoffice.fms.document.domain.Folder;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "arbitration_cases")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArbitrationCase extends BaseEntity {

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String licensePlate;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String clientNameSurname;

    @Size(max = 50)
    @Column(length = 50)
    private String arbitrationFileNumber;

    @Size(max = 50)
    @Column(length = 50)
    private String courtBasisNumber;

    @Column(nullable = false, length = 500)
    private String folderName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ArbitrationStatus status = ArbitrationStatus.PRE_APPLICATION;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dms_root_folder_id")
    private Folder dmsRootFolder;

    @PrePersist
    @PreUpdate
    void updateFolderName() {
        String esasNo = (courtBasisNumber != null && !courtBasisNumber.trim().isEmpty())
                ? courtBasisNumber.trim()
                : "[Esas Bekleniyor]";
        this.folderName = String.format(
                "%s - %s - %s", this.licensePlate.trim(), this.clientNameSurname.trim(), esasNo);
    }
}
