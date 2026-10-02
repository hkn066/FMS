package com.lawoffice.fms.document.domain;

import com.lawoffice.fms.arbitration.domain.ArbitrationCase;
import com.lawoffice.fms.casemanagement.domain.LegalCase;
import com.lawoffice.fms.common.entity.BaseEntity;
import com.lawoffice.fms.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "documents")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String contentType;
    private Long fileSize;
    private String folderPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @Column(nullable = false)
    private String storageKey;

    private int currentVersion = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OcrStatus ocrStatus = OcrStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id")
    private LegalCase legalCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arbitration_case_id")
    private ArbitrationCase arbitrationCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id")
    private User uploadedBy;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DocumentVersion> versions = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "document_tag_mapping",
            joinColumns = @JoinColumn(name = "document_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @Builder.Default
    private Set<DocumentTag> tags = new HashSet<>();
}
