package com.lawoffice.fms.common.entity;

import com.lawoffice.fms.common.tenant.TenantContext;
import com.lawoffice.fms.organization.domain.OrganizationConstants;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
@FilterDef(
        name = BaseEntity.ORGANIZATION_FILTER_NAME,
        parameters = @ParamDef(name = BaseEntity.ORGANIZATION_FILTER_PARAM, type = UUID.class))
@FilterDef(name = "softDeleteFilter")
@Filter(name = BaseEntity.ORGANIZATION_FILTER_NAME, condition = "organization_id = :orgId")
@Filter(name = "softDeleteFilter", condition = "deleted = false")
@SQLRestriction("deleted = false")
public abstract class BaseEntity {

    public static final String ORGANIZATION_FILTER_NAME = "organizationFilter";
    public static final String ORGANIZATION_FILTER_PARAM = "orgId";

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String updatedBy;

    @Version
    private Long version;

    @Column(nullable = false)
    private boolean deleted = false;

    private Instant deletedAt;

    @Column(name = "organization_id")
    private UUID organizationId;

    @PrePersist
    void assignOrganizationFromContext() {
        if (organizationId == null) {
            organizationId = TenantContext.getOrganizationId()
                    .orElse(OrganizationConstants.DEFAULT_ORGANIZATION_ID);
        }
    }

    public void markDeleted() {
        this.deleted = true;
        this.deletedAt = Instant.now();
    }
}
